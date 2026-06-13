import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Visit } from "../models/visit.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

// ── Helpers ────────────────────────────────────────────────────────────────
const toDateStr = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD

// ── POST /api/v1/stats/visit (PUBLIC — called by frontend on each page load) ─
export const recordVisit = asyncHandler(async (req, res) => {
    const { page = "/", sessionId = "" } = req.body;

    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown";

    const now = new Date();
    const date = toDateStr(now);
    const hour = now.getHours();

    await Visit.create({
        ip,
        userAgent: req.headers["user-agent"] || "",
        page: String(page).slice(0, 100),
        date,
        hour,
        sessionId: String(sessionId).slice(0, 64),
    });

    return res.status(201).json(new ApiResponse(201, {}, "Visit recorded"));
});

// ── GET /api/v1/admin/site-stats (ADMIN — aggregated analytics) ────────────
export const getSiteStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const todayStr = toDateStr(now);

    // Date strings for window calculations
    const days = (n) => {
        const d = new Date(now);
        d.setDate(d.getDate() - n);
        return toDateStr(d);
    };

    const yesterdayStr = days(1);
    const last7Start = days(6);
    const last30Start = days(29);

    // ── Visit counts (raw page views) ─────────────────────────────────────────
    const todayVisits = await Visit.countDocuments({ date: todayStr });
    const yesterdayVisits = await Visit.countDocuments({ date: yesterdayStr });

    // ── Unique PERSONS (deduplicated by sessionId — one person = one session) ──
    // sessionId is set once per browser session in sessionStorage, so it stays
    // constant as the same person navigates. This is the "real" unique visitor count.
    const uniqueSessionsToday = await Visit.distinct("sessionId", {
        date: todayStr,
        sessionId: { $ne: "" },
    });
    const uniquePersonsToday = Math.max(
        uniqueSessionsToday.length,
        // Fallback to unique IPs if no session IDs recorded yet
        (await Visit.distinct("ip", { date: todayStr })).length
    );

    // Legacy field kept for backward compat — same as uniquePersonsToday
    const uniqueVisitorsToday = uniquePersonsToday;

    // Unique persons — 7 days
    const uniqueSessions7d = await Visit.distinct("sessionId", {
        date: { $gte: last7Start },
        sessionId: { $ne: "" },
    });
    const uniquePersons7d = uniqueSessions7d.length;

    // Unique persons — 30 days
    const uniqueSessions30d = await Visit.distinct("sessionId", {
        date: { $gte: last30Start },
        sessionId: { $ne: "" },
    });
    const uniquePersons30d = uniqueSessions30d.length;

    // Last 7 / 30 days raw page views
    const last7Visits = await Visit.countDocuments({ date: { $gte: last7Start } });
    const last30Visits = await Visit.countDocuments({ date: { $gte: last30Start } });

    // ── Hourly breakdown for today (for chart) ────────────────────────────────
    const hourlyRaw = await Visit.aggregate([
        { $match: { date: todayStr } },
        { $group: { _id: "$hour", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);
    const hourly = Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        label: `${String(h).padStart(2, "0")}:00`,
        visits: hourlyRaw.find((r) => r._id === h)?.count ?? 0,
    }));

    // ── Daily breakdown for last 7 days ───────────────────────────────────────
    const dailyRaw = await Visit.aggregate([
        { $match: { date: { $gte: last7Start } } },
        { $group: { _id: "$date", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);
    // Build full 7-day array (fill zeros for missing days)
    const daily = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = toDateStr(d);
        const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return {
            date: dateStr,
            label: DAY_NAMES[d.getDay()],
            visits: dailyRaw.find((r) => r._id === dateStr)?.count ?? 0,
        };
    });

    // ── Top pages today ───────────────────────────────────────────────────────
    const topPages = await Visit.aggregate([
        { $match: { date: todayStr } },
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { page: "$_id", count: 1, _id: 0 } },
    ]);

    // ── Revenue & Orders (today) ──────────────────────────────────────────────
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrdersAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
    ]);
    const todayOrders = todayOrdersAgg[0]?.count ?? 0;
    const todayRevenue = todayOrdersAgg[0]?.revenue ?? 0;

    // ── New users today ───────────────────────────────────────────────────────
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });

    // ── View-to-order conversion rate ─────────────────────────────────────────
    const conversionRate =
        todayVisits > 0 ? ((todayOrders / todayVisits) * 100).toFixed(2) : "0.00";

    // ── Bounce rate estimate (sessions with only 1 page view) ────────────────
    const bounceAgg = await Visit.aggregate([
        { $match: { date: todayStr } },
        { $group: { _id: "$sessionId", pages: { $sum: 1 } } },
        { $group: { _id: null, total: { $sum: 1 }, bounced: { $sum: { $cond: [{ $lte: ["$pages", 1] }, 1, 0] } } } },
    ]);
    const bounceRate =
        bounceAgg[0]?.total > 0
            ? ((bounceAgg[0].bounced / bounceAgg[0].total) * 100).toFixed(1)
            : null;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                todayVisits,
                yesterdayVisits,
                uniqueVisitorsToday,
                uniquePersonsToday,
                uniquePersons7d,
                uniquePersons30d,
                last7Visits,
                last30Visits,
                todayOrders,
                todayRevenue,
                newUsersToday,
                conversionRate,
                bounceRate,
                hourly,
                daily,
                topPages,
            },
            "Site stats fetched successfully"
        )
    );
});
