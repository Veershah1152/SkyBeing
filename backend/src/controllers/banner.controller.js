import { Banner } from "../models/banner.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Public: get active banners for a specific page
export const getActiveBanners = asyncHandler(async (req, res) => {
    const { page } = req.query; // e.g. ?page=shop

    const query = { isActive: true };
    if (page) {
        // Return banners that include "all" OR the specific page
        query.pages = { $in: [page, "all"] };
    }

    const banners = await Banner.find(query).sort({ order: 1 });
    return res.status(200).json(new ApiResponse(200, banners, "Banners fetched"));
});

// Admin: get ALL banners
export const getAllBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find().sort({ order: 1 });
    return res.status(200).json(new ApiResponse(200, banners, "All banners fetched"));
});

// Admin: create banner
export const createBanner = asyncHandler(async (req, res) => {
    const { title, subtitle, buttonText, buttonLink, order, pages } = req.body;
    if (!title) throw new ApiError(400, "Title is required");

    const imageLocalPath = req.file?.path;
    if (!imageLocalPath) throw new ApiError(400, "Banner image is required");

    const uploaded = await uploadOnCloudinary(imageLocalPath);
    if (!uploaded?.url) throw new ApiError(500, "Failed to upload banner image");

    // Parse pages — comes as JSON string or array
    let parsedPages = ["home"];
    if (pages) {
        try {
            parsedPages = typeof pages === "string" ? JSON.parse(pages) : pages;
        } catch {
            parsedPages = ["home"];
        }
    }

    const banner = await Banner.create({
        title,
        subtitle: subtitle || "",
        buttonText: buttonText || "Shop Now",
        buttonLink: buttonLink || "/shop",
        imageUrl: uploaded.url,
        order: Number(order) || 0,
        isActive: true,
        pages: parsedPages,
    });

    return res.status(201).json(new ApiResponse(201, banner, "Banner created"));
});

// Admin: toggle active status
export const toggleBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) throw new ApiError(404, "Banner not found");
    banner.isActive = !banner.isActive;
    await banner.save();
    return res.status(200).json(new ApiResponse(200, banner, "Banner status updated"));
});

// Admin: update banner pages assignment
export const updateBannerPages = asyncHandler(async (req, res) => {
    const { pages } = req.body;
    const banner = await Banner.findById(req.params.id);
    if (!banner) throw new ApiError(404, "Banner not found");
    if (pages) banner.pages = pages;
    await banner.save();
    return res.status(200).json(new ApiResponse(200, banner, "Banner updated"));
});

// Admin: delete banner
export const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) throw new ApiError(404, "Banner not found");
    return res.status(200).json(new ApiResponse(200, null, "Banner deleted"));
});
