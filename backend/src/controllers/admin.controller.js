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
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Total Revenue (only delivered orders mathematically)
    const revenueAggregation = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Recent 5 orders
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name email");

    // Monthly Sales Aggregation
    const monthlySales = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalSales: { $sum: "$totalAmount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // Format monthly data for charts
    const formattedMonthlySales = monthlySales.map(item => ({
        month: item._id,
        sales: item.totalSales,
        orders: item.count
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            recentOrders,
            monthlySales: formattedMonthlySales
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

    let query = {};
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

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: { orderStatus: status.toLowerCase() } },
        { new: true }
    );

    if (!order) throw new ApiError(404, "Order not found");
    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});
