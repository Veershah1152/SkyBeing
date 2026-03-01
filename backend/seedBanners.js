import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config({ path: "./.env" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Inline Banner model (avoid ES module issues with app.js imports) ──────
const bannerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        subtitle: { type: String, default: "" },
        buttonText: { type: String, default: "Shop Now" },
        buttonLink: { type: String, default: "/shop" },
        imageUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

// ── Banner data ──────────────────────────────────────────────────────────
const bannerData = [
    {
        title: "Feed the World's Feathered Friends",
        subtitle: "Discover our premium handcrafted bird feeders",
        buttonText: "Shop Feeders",
        buttonLink: "/shop",
        localImage: "banner_bird_feeder_1772281633257.png",
        order: 1,
    },
    {
        title: "Pure Refreshment for Wild Birds",
        subtitle: "Elegant water feeders & bird baths for your garden",
        buttonText: "Explore Water Feeders",
        buttonLink: "/shop",
        localImage: "banner_water_feeder_1772281704014.png",
        order: 2,
    },
    {
        title: "Give Birds a Home They'll Love",
        subtitle: "Beautifully crafted bird houses for every season",
        buttonText: "View Bird Houses",
        buttonLink: "/shop",
        localImage: "banner_bird_house_1772281725780.png",
        order: 3,
    },
];

// ── Artifact directory (where images were saved by generate_image) ────────
const ARTIFACT_DIR = "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\15476c1d-15d2-4fd2-bd9a-668200951719";

async function seedBanners() {
    console.log("🌐 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!\n");

    // Clear existing banners
    await Banner.deleteMany({});
    console.log("🗑️  Cleared existing banners\n");

    for (const b of bannerData) {
        const imagePath = path.join(ARTIFACT_DIR, b.localImage);

        if (!fs.existsSync(imagePath)) {
            console.error(`❌ Image not found: ${imagePath}`);
            continue;
        }

        console.log(`☁️  Uploading: ${b.title}...`);
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: "skybeing/banners",
            transformation: [{ width: 1920, height: 600, crop: "fill", gravity: "auto" }],
        });

        const banner = await Banner.create({
            title: b.title,
            subtitle: b.subtitle,
            buttonText: b.buttonText,
            buttonLink: b.buttonLink,
            imageUrl: result.secure_url,
            isActive: true,
            order: b.order,
        });

        console.log(`   ✅ Created: "${banner.title}"`);
        console.log(`   🔗 ${result.secure_url}\n`);
    }

    console.log("🎉 All banners seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
}

seedBanners().catch(err => {
    console.error("❌ Failed:", err.message);
    process.exit(1);
});
