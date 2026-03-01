import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, cartItems } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!shippingAddress) {
        throw new ApiError(400, "Shipping address is required");
    }

    let orderItems = [];
    let totalAmount = 0;

    // Handle Auth User (DB Cart)
    if (userId) {
        const user = await User.findById(userId).populate("cart.product");

        if (!user.cart || user.cart.length === 0) {
            throw new ApiError(400, "Cart is empty");
        }

        orderItems = user.cart.map((cartItem) => {
            totalAmount += cartItem.product.price * cartItem.quantity;
            return {
                productId: cartItem.product._id,
                quantity: cartItem.quantity
            };
        });

        // Clear user cart after calculating
        user.cart = [];
        await user.save({ validateBeforeSave: false });

    } else {
        // Handle Guest User (Local Cart provided from Frontend req.body)
        if (!cartItems || cartItems.length === 0) {
            throw new ApiError(400, "Guest cart is empty");
        }

        // We expect cartItems to be { productId, quantity, price } from frontend for simplicity 
        // OR we can query the DB. We should query DB for security so price isn't spoofed.
        const { Product } = await import("../models/product.model.js");

        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) throw new ApiError(404, `Product not found: ${item.productId}`);

            totalAmount += product.price * item.quantity;
            orderItems.push({
                productId: product._id,
                quantity: item.quantity
            });
        }
    }

    const order = await Order.create({
        userId, // Might be null for guests
        products: orderItems,
        shippingAddress,
        totalAmount,
    });

    if (!order) {
        throw new ApiError(500, "Something went wrong while creating the order");
    }

    return res.status(201).json(
        new ApiResponse(201, order, "Order created successfully")
    );
});

const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).populate("products.productId", "name price images");

    return res.status(200).json(
        new ApiResponse(200, orders, "Orders fetched successfully")
    );
});

const getAllOrders = asyncHandler(async (req, res) => {
    // Ideally protected by Admin middleware
    const orders = await Order.find().populate("userId", "name email").populate("products.productId", "name price");

    return res.status(200).json(
        new ApiResponse(200, orders, "All orders fetched successfully")
    );
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    // Ideally protected by Admin middleware
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    return res.status(200).json(
        new ApiResponse(200, order, "Order status updated successfully")
    );
});

const getGSTReport = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    const query = {};
    if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            query.createdAt.$lte = toDate;
        }
    }

    const orders = await Order.find(query)
        .populate("userId", "name email")
        .populate("products.productId", "name price tax");

    // Helper: parse GST % from tax string e.g. "GST 18%" → 18
    const parseGSTRate = (taxLabel) => {
        if (!taxLabel || taxLabel === 'None') return 0;
        const m = taxLabel.match(/\d+/);
        return m ? Number(m[0]) : 0;
    };

    const rows = orders.map((order, idx) => {
        const invoiceNumber = `INV-${String(order._id).slice(-6).toUpperCase()}`;
        const invoiceDate = order.createdAt.toLocaleDateString('en-IN');
        const shipToState = order.shippingAddress?.state || 'N/A';
        const transactionType = shipToState.toLowerCase() !== 'rajasthan' ? 'Inter-State' : 'Intra-State';

        // Sum up tax-exclusive gross and taxes across all items
        let taxExclusiveGross = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;
        let cgstRate = 0;
        let sgstRate = 0;
        let igstRate = 0;

        order.products.forEach(({ productId: prod, quantity }) => {
            if (!prod) return;
            const gstRate = parseGSTRate(prod.tax);
            const basePrice = prod.price / (1 + gstRate / 100); // back-calculate pre-tax price
            const lineBase = basePrice * quantity;
            const lineGST = (prod.price - basePrice) * quantity;

            taxExclusiveGross += lineBase;

            if (transactionType === 'Intra-State') {
                // CGST + SGST split equally
                cgstRate = gstRate / 2;
                sgstRate = gstRate / 2;
                totalCGST += lineGST / 2;
                totalSGST += lineGST / 2;
            } else {
                // IGST
                igstRate = gstRate;
                totalIGST += lineGST;
            }
        });

        const totalTaxAmount = totalCGST + totalSGST + totalIGST;
        const invoiceAmount = taxExclusiveGross + totalTaxAmount;

        return {
            "Invoice Date": invoiceDate,
            "Invoice Number": invoiceNumber,
            "Transaction Type": transactionType,
            "Ship To State": shipToState,
            "Invoice Amount (₹)": +invoiceAmount.toFixed(2),
            "Tax Exclusive Gross (₹)": +taxExclusiveGross.toFixed(2),
            "Total Tax Amount (₹)": +totalTaxAmount.toFixed(2),
            "CGST Rate (%)": cgstRate || '',
            "SGST Rate (%)": sgstRate || '',
            "IGST Rate (%)": igstRate || '',
            "CGST Tax (₹)": totalCGST ? +totalCGST.toFixed(2) : '',
            "SGST Tax (₹)": totalSGST ? +totalSGST.toFixed(2) : '',
            "IGST Tax (₹)": totalIGST ? +totalIGST.toFixed(2) : '',
        };
    });

    return res.status(200).json(new ApiResponse(200, rows, "GST report generated"));
});

export {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getGSTReport
};
