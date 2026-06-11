import mongoose from "mongoose/lib/index.js";
const { Schema } = mongoose;

const bannerSchema = new Schema(
    {
        title: { type: String, default: "", trim: true },
        subtitle: { type: String, default: "" },
        buttonText: { type: String, default: "Shop Now" },
        buttonLink: { type: String, default: "/shop" },
        imageUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        // Which page(s) this banner should appear on
        pages: {
            type: [String],
            enum: ["home", "shop", "about", "about-content", "contact", "gallery", "blog", "cart", "checkout", "wishlist", "all"],
            default: ["home"],
        },
    },
    { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema);
