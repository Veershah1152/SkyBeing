import { Gallery } from "../models/gallery.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

// ── Public: get all active gallery images ─────────────────────────────────────
export const getGalleryImages = async (req, res) => {
    try {
        const images = await Gallery.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: { images } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin: get ALL images (including hidden) ────────────────────────────────────
export const getAllGalleryImages = async (req, res) => {
    try {
        const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: { images } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin: upload new image ────────────────────────────────────────────────────
export const uploadGalleryImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No image file provided" });

        const result = await uploadOnCloudinary(req.file.path);
        if (!result) return res.status(500).json({ success: false, message: "Cloudinary upload failed" });

        const image = await Gallery.create({
            imageUrl: result.secure_url,
            publicId: result.public_id,
            caption: req.body.caption || "",
            order: Number(req.body.order) || 0,
        });

        res.status(201).json({ success: true, data: { image }, message: "Image uploaded successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin: toggle visibility ────────────────────────────────────────────────────
export const toggleGalleryImage = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: "Image not found" });

        image.isActive = !image.isActive;
        await image.save();
        res.json({ success: true, data: { image }, message: `Image ${image.isActive ? "shown" : "hidden"}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin: delete image ─────────────────────────────────────────────────────────
export const deleteGalleryImage = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: "Image not found" });

        // Delete from Cloudinary
        if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        await image.deleteOne();
        res.json({ success: true, message: "Image deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
