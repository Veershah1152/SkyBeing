import mongoose, { Schema } from "mongoose";

const bannerSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, default: "" },
        buttonText: { type: String, default: "Shop Now" },
        buttonLink: { type: String, default: "/shop" },
        imageUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        // Which page(s) this banner should appear on
        pages: {
            type: [String],
            enum: ["home", "shop", "about", "contact", "all"],
            default: ["home"],
        },
    },
    { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema);
