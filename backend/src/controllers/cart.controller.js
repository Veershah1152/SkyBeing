import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ── Add to Cart ─────────────────────────────────────────────────────────────
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.cart) {
        user.cart = [];
    }

    const existingIndex = user.cart.findIndex(
        (item) => item.product?.toString() === productId
    );

    if (existingIndex >= 0) {
        user.cart[existingIndex].quantity += quantity || 1;
    } else {
        user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, user.cart, "Item added to cart successfully"));
});

// ── Update Cart Quantity ────────────────────────────────────────────────────
const updateCartQuantity = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity === undefined) {
        throw new ApiError(400, "Product ID and quantity are required");
    }

    if (quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.cart) {
        user.cart = [];
    }

    const cartItem = user.cart.find(
        (item) => item.product?.toString() === productId
    );

    if (!cartItem) {
        throw new ApiError(404, "Product not found in cart");
    }

    cartItem.quantity = quantity;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, user.cart, "Cart quantity updated successfully"));
});

// ── Remove From Cart ────────────────────────────────────────────────────────
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.cart) {
        user.cart = [];
    }

    user.cart = user.cart.filter(
        (item) => item.product?.toString() !== productId
    );

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, user.cart, "Item removed from cart successfully"));
});

// ── Get Cart ────────────────────────────────────────────────────────────────
const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
        "cart.product",
        "name price images stock discount discountType"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user.cart || [], "Cart fetched successfully"));
});

export { addToCart, updateCartQuantity, removeFromCart, getCart };
