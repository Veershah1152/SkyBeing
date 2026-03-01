import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
    const {
        name, description, shortDescription, price, mrp, manufacturingPrice,
        category, subCategory, stock, discount, discountType, discountStartDate,
        discountEndDate, tax, sku, barcode, tags, minStock, stockStatus, trackStock,
        shippingWeight, shippingLength, shippingWidth, shippingHeight, productType
    } = req.body;

    if (!name || !category || !price || !stock) {
        throw new ApiError(400, "Name, category, price and stock are required");
    }

    const imageLocalPaths = req.files?.map(file => file.path) || [];

    const uploadedImages = [];
    for (const path of imageLocalPaths) {
        const uploaded = await uploadOnCloudinary(path);
        if (uploaded?.url) uploadedImages.push(uploaded.url);
    }

    // Parse tags if sent as JSON string
    let parsedTags = [];
    if (tags) {
        try { parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags; } catch { parsedTags = []; }
    }

    const product = await Product.create({
        name, description: description || "", shortDescription: shortDescription || "",
        price: Number(price), mrp: Number(mrp) || 0,
        manufacturingPrice: Number(manufacturingPrice) || 0,
        category, subCategory: subCategory || "",
        stock: Number(stock), discount: Number(discount) || 0,
        discountType: discountType || "percentage",
        discountStartDate: discountStartDate || null, discountEndDate: discountEndDate || null,
        tax: tax || "", sku: sku || "", barcode: barcode || "",
        tags: parsedTags,
        minStock: Number(minStock) || 2, stockStatus: stockStatus || "in_stock",
        trackStock: trackStock === "true" || trackStock === true,
        shippingWeight: shippingWeight || "", shippingLength: shippingLength || "",
        shippingWidth: shippingWidth || "", shippingHeight: shippingHeight || "",
        productType: productType || "simple",
        images: uploadedImages
    });

    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});


const getAllProducts = asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const products = await Product.find(query);

    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched successfully")
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Guard against invalid / old-DB ObjectIds
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(404, "Product not found");
    }

    const product = await Product.findById(id).populate("reviews.user", "name email");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findByIdAndUpdate(
        id,
        {
            $set: {
                name,
                description,
                price,
                category,
                stock
            }
        },
        { new: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted successfully")
    );
});

const addReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        throw new ApiError(400, "Rating and comment are required");
    }

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        throw new ApiError(400, "You have already reviewed this product");
    }

    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id
    };

    product.reviews.push(review);

    const numReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await product.save({ validateBeforeSave: false });

    return res.status(201).json(new ApiResponse(201, {}, "Review added successfully"));
});

export {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReview
};
