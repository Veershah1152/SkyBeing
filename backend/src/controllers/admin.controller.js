import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// =======================
// DASHBOARD & ANALYTICS
// =======================
export const getAdminDashboard = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // === Core counts ===
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfThisMonth } });

    // === Total Revenue (all completed payments) ===
    const revenueAgg = await Order.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total ?? 0;

    // === This month revenue ===
    const thisMonthRevenueAgg = await Order.aggregate([
        { $match: { paymentStatus: "completed", createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const thisMonthRevenue = thisMonthRevenueAgg[0]?.total ?? 0;

    // === Last month revenue (for % change) ===
    const lastMonthRevenueAgg = await Order.aggregate([
        { $match: { paymentStatus: "completed", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total ?? 0;
    const revenueGrowth = lastMonthRevenue > 0
        ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : null;

    // === Today's stats ===
    const todayOrdersAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }
    ]);
    const todayOrders = todayOrdersAgg[0]?.count ?? 0;
    const todayRevenue = todayOrdersAgg[0]?.revenue ?? 0;

    // === Order status breakdown ===
    const orderStatusBreakdown = await Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
    ]);
    const statusMap = {};
    orderStatusBreakdown.forEach(s => { statusMap[s._id] = s.count; });

    // === Monthly sales trend (last 6 months) ===
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlySales = await Order.aggregate([
        { $match: { paymentStatus: "completed", createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                totalSales: { $sum: "$totalAmount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = monthlySales.map(item => ({
        month: MONTH_NAMES[item._id.month - 1],
        year: item._id.year,
        sales: item.totalSales,
        orders: item.count
    }));

    // === Recent 8 orders (confirmed only) ===
    const recentOrders = await Order.find({ isConfirmed: true })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("userId", "name email");

    // === Top 5 products by order frequency ===
    const topProducts = await Order.aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products.productId", totalSold: { $sum: "$products.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $project: { _id: 1, totalSold: 1, name: "$product.name", price: "$product.price", images: "$product.images" } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            totalUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            outOfStockProducts,
            newUsersThisMonth,
            totalRevenue,
            thisMonthRevenue,
            lastMonthRevenue,
            revenueGrowth,
            todayOrders,
            todayRevenue,
            orderStatusBreakdown: statusMap,
            monthlySales: formattedMonthlySales,
            recentOrders,
            topProducts
        }, "Dashboard statistics fetched successfully")
    );
});

// =======================
// USER MANAGEMENT
// =======================
export const getAdminUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-password");

    const totalCount = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page)
        }, "Users fetched successfully")
    );
});

export const getAdminUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    // Toggle the block status
    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`));
});

export const changeUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    // Toggle role
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user, `User role changed to ${user.role}`));
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
    // Soft delete preferred? Since soft delete wasn't strictly configured in schema,
    // we'll set isBlocked true or actually delete. The prompt says "Soft delete preferred".
    // I will set isBlocked = true and maybe a deletedAt flag, or just isBlocked.
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.isBlocked = true; // Act as soft delete to avoid crashing related orders etc.
    // If they want actual deletion: await User.findByIdAndDelete(req.params.id);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "User soft-deleted / blocked successfully"));
});

// =======================
// PRODUCT MANAGEMENT
// =======================
export const adminGetProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, minPrice, maxPrice, search } = req.query;

    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalCount = await Product.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page)
        }, "Products fetched successfully")
    );
});

export const adminCreateProduct = asyncHandler(async (req, res) => {
    // Essentially the same as current logic but routed under /api/admin
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
        throw new ApiError(400, "All fields are required");
    }

    const imageLocalPaths = req.files?.map(file => file.path) || [];
    if (imageLocalPaths.length === 0) {
        throw new ApiError(400, "At least one product image is required");
    }

    const uploadedImages = [];
    for (const path of imageLocalPaths) {
        const uploaded = await uploadOnCloudinary(path);
        if (uploaded?.url) uploadedImages.push(uploaded.url);
    }

    const product = await Product.create({
        name, description, price: Number(price), category, stock: Number(stock), images: uploadedImages
    });

    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

export const adminUpdateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!product) throw new ApiError(404, "Product not found");
    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

export const adminDeleteProduct = asyncHandler(async (req, res) => {
    // Soft delete not natively in mongoose unless added. For now, hard delete as per previous controller, or implement soft delete by a flag.
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    return res.status(200).json(new ApiResponse(200, {}, "Product deleted successfully"));
});

// =======================
// ORDER MANAGEMENT
// =======================
export const adminGetOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    // Only show confirmed orders. Never show failed payment orders.
    let query = {
        isConfirmed: true,
        paymentStatus: { $ne: 'failed' }
    };
    if (status) query.orderStatus = status;
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const orders = await Order.find(query)
        .populate("userId", "name email")
        .populate("products.productId", "name price images tax")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalCount = await Order.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page)
        }, "Orders fetched successfully")
    );
});

export const adminGetOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("userId", "name email")
        .populate("products.productId", "name price images");

    if (!order) throw new ApiError(404, "Order not found");
    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status?.toLowerCase())) {
        throw new ApiError(400, "Invalid status provided. Allowed: pending, processing, shipped, delivered, cancelled");
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    const newStatus = status.toLowerCase();

    // Restore stock and cancel Shiprocket if the order is being cancelled
    if (newStatus === "cancelled" && order.orderStatus !== "cancelled") {
        const { Product } = await import("../models/product.model.js");
        for (const item of order.products) {
            const product = await Product.findById(item.productId);
            if (product && product.trackStock) {
                product.stock += item.quantity;
                if (product.stockStatus === 'out_of_stock' && product.stock > 0) {
                    product.stockStatus = 'in_stock';
                }
                await product.save({ validateBeforeSave: false });
            }
        }

        // Cancel Shiprocket Order if it was dispatched
        if (order.shiprocketOrderId) {
            try {
                const { cancelShiprocketShipment } = await import("../utils/shiprocket.service.js");
                await cancelShiprocketShipment([order.shiprocketOrderId]);
            } catch (err) {
                console.warn(`Failed to auto-cancel Shiprocket order for DB Order ${order._id}:`, err?.message);
            }
        }
    }

    order.orderStatus = newStatus;
    await order.save();

    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

export const markOrderAsSelfShipped = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.shiprocketOrderId) {
        throw new ApiError(400, "Order is already dispatched to Shiprocket.");
    }

    order.isSelfShipped = true;
    order.orderStatus = "shipped";
    await order.save();

    return res.status(200).json(new ApiResponse(200, order, "Order marked as Self Delivered successfully"));
});

export const verifySecurityPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;

    const masterKeys = ["9423320883", "7219006729", "832924579"];
    const envSecurityPassword = process.env.ADMIN_SECURITY_PASSWORD || "admin123";

    // 1. Check against master security keys or env password
    if (masterKeys.includes(password) || password === envSecurityPassword) {
        return res.status(200).json(new ApiResponse(200, { verified: true }, "Security password verified successfully"));
    }

    // 2. Check against the user's own account password
    // req.user is guaranteed here because the route is protected by verifyJWT
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User session invalid");
    }

    const isUserPassword = await user.isPasswordCorrect(password);
    if (isUserPassword) {
        return res.status(200).json(new ApiResponse(200, { verified: true }, "Security verified with account password"));
    }

    // Use 400 instead of 401 so the browser console doesn't confuse it with JWT token errors
    throw new ApiError(400, "Incorrect security password");
});
