import mongoose from "mongoose/lib/index.js";
const { Schema } = mongoose;

const dogPageSchema = new Schema(
    {
        // ── Hero Section ───────────────────────────────────────────────
        hero: {
            badge: { type: String, default: "🐕 New — Dog Collection" },
            title: { type: String, default: "The Best for" },
            titleHighlight: { type: String, default: "Your Best Friend" },
            subtitle: { type: String, default: "Premium dog essentials — food, toys, grooming, beds and more. Curated with love for happy, healthy dogs across India." },
            ctaPrimaryText: { type: String, default: "Shop Dog Products" },
            ctaPrimaryLink: { type: String, default: "/collections/dogs" },
            ctaSecondaryText: { type: String, default: "Browse All Products" },
            ctaSecondaryLink: { type: String, default: "/shop" },
            stat1: { type: String, default: "Free Shipping ₹499+" },
            stat2: { type: String, default: "Easy Returns" },
        },

        // ── Category Cards ─────────────────────────────────────────────
        categories: {
            type: [
                {
                    emoji: { type: String, default: "🐾" },
                    label: { type: String, default: "Category" },
                    desc: { type: String, default: "" },
                    slug: { type: String, default: "dogs" },
                    order: { type: Number, default: 0 },
                }
            ],
            default: [
                { emoji: "🦴", label: "Food & Treats", desc: "Nutritious & delicious", slug: "dogs", order: 0 },
                { emoji: "🎾", label: "Toys", desc: "Keep them playful", slug: "dogs", order: 1 },
                { emoji: "🛁", label: "Grooming", desc: "Clean & fresh coat", slug: "dogs", order: 2 },
                { emoji: "🎀", label: "Collars & Leashes", desc: "Style meets control", slug: "dogs", order: 3 },
                { emoji: "🏡", label: "Beds & Crates", desc: "Cozy safe haven", slug: "dogs", order: 4 },
                { emoji: "💊", label: "Health & Wellness", desc: "Stay fit & strong", slug: "dogs", order: 5 },
            ]
        },

        // ── Why Features Section ───────────────────────────────────────
        features: {
            type: [
                {
                    iconName: { type: String, default: "Shield" }, // Shield | Award | Truck | Heart | Star | Zap
                    title: { type: String, default: "Feature" },
                    desc: { type: String, default: "" },
                }
            ],
            default: [
                { iconName: "Shield", title: "Safe & Vet-Approved", desc: "All products are pet-safe, non-toxic and suitable for Indian dog breeds." },
                { iconName: "Award", title: "Premium Quality", desc: "Curated for durability, comfort and your dog's long-term happiness." },
                { iconName: "Truck", title: "Fast Delivery", desc: "Delivered across India — from Mumbai to Chennai, your dog won't wait long." },
            ]
        },

        // ── CTA Strip ─────────────────────────────────────────────────
        cta: {
            emoji: { type: String, default: "🐕" },
            title: { type: String, default: "Ready to Spoil Your Dog?" },
            subtitle: { type: String, default: "Browse our full collection of premium dog products and give your furry friend the life they deserve." },
            buttonText: { type: String, default: "Browse All Dog Products" },
            buttonLink: { type: String, default: "/collections/dogs" },
        },

        // ── Home Page Teaser Section ───────────────────────────────────
        homeSection: {
            enabled: { type: Boolean, default: true },
            badge: { type: String, default: "🐕 New — Dog Collection" },
            title: { type: String, default: "Everything Your" },
            titleHighlight: { type: String, default: "Best Friend" },
            titleSuffix: { type: String, default: "Needs" },
            subtitle: { type: String, default: "From nutritious treats to cozy beds and fun toys — premium dog essentials curated with love, delivered to your door." },
            ctaText: { type: String, default: "Shop Dog Products" },
            ctaLink: { type: String, default: "/dogs" },
            chips: { type: [String], default: ["Food & Treats", "Toys", "Grooming", "Collars & Leashes", "Beds"] },
            cards: {
                type: [
                    {
                        emoji: { type: String },
                        label: { type: String },
                        desc: { type: String },
                    }
                ],
                default: [
                    { emoji: "🦴", label: "Food & Treats", desc: "Healthy & delicious" },
                    { emoji: "🎾", label: "Toys", desc: "Keep them active" },
                    { emoji: "🛁", label: "Grooming", desc: "Clean & fresh" },
                    { emoji: "🏡", label: "Beds & Crates", desc: "Cozy comfort" },
                ]
            }
        },
    },
    { timestamps: true }
);

export const DogPage = mongoose.model("DogPage", dogPageSchema);
