import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Configuration
const app = express();

// Security Middlewares
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
}));

let limiter;
if (typeof globalThis.WebSocketPair !== "undefined") {
    // Under Cloudflare Workers, we skip in-memory rate limiting since each isolate is short-lived
    // and global timers (setInterval) are disallowed during cold starts.
    limiter = (req, res, next) => next();
} else {
    limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === 'production' ? 200 : 2000,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
        message: "Too many requests from this IP, please try again after 15 minutes"
    });
}
app.use(limiter);

app.use(cors({
    origin: (origin, callback) => {
        // No origin = same-origin / server-to-server request – allow it
        if (!origin) return callback(null, true);

        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
            : [];

        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            // Reflect the exact origin back (NOT true/*) so it works with credentials
            return callback(null, origin);
        }
        return callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Base Route
app.get("/", (req, res) => {
    res.send("SkyBeings API is running...");
});

// Routes Import
import rootRouter from "./routes/index.routes.js";
import adminRouter from "./routes/admin.routes.js";

// Routes Declaration
app.use("/api/v1", rootRouter);
// Alias for admin accessibility
app.use("/api/admin", adminRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Invalid ID format. The resource may no longer exist.",
            errors: []
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app }
