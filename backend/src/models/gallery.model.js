import mongoose from "mongoose/lib/index.js";

const gallerySchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: "" },
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Gallery = mongoose.model("Gallery", gallerySchema);
