import mongoose from "mongoose/lib/index.js";
const { Schema } = mongoose;

const settingsSchema = new Schema(
    {
        isMaintenanceMode: {
            type: Boolean,
            default: false
        },
        maintenanceMessage: {
            type: String,
            default: "We are currently upgrading our store. We will be back soon!"
        },
        razorpayKey: {
            type: String,
            default: ""
        },
        razorpaySecret: {
            type: String,
            default: ""
        },
        razorpayWebhookSecret: {
            type: String,
            default: ""
        },
        // ── Catalog config ─────────────────────────────────────────────────────
        categories: {
            type: [String],
            default: []
        },
        subcategories: {
            type: [
                {
                    name: { type: String, required: true },
                    parentCategory: { type: String, default: "" }
                }
            ],
            default: []
        },
        // ── Tax config ─────────────────────────────────────────────────────────
        taxRates: {
            type: [
                {
                    name: { type: String, required: true },
                    rate: { type: Number, required: true },
                    appliedTo: { type: String, default: "All Categories" }
                }
            ],
            default: []
        },
        // ── Shipping config ─────────────────────────────────────────────────────
        shippingCharges: {
            type: [
                {
                    name: { type: String, required: true },
                    cost: { type: Number, required: true },
                    minDays: { type: String, default: "" },
                    maxDays: { type: String, default: "" },
                    active: { type: Boolean, default: true }
                }
            ],
            default: []
        },
        shippingCompanies: {
            type: [
                {
                    name: { type: String, required: true },
                    trackingUrl: { type: String, default: "" },
                    active: { type: Boolean, default: true }
                }
            ],
            default: []
        },
        // ── Testimonials ────────────────────────────────────────────────────────
        testimonials: {
            type: [
                {
                    name: { type: String, required: true },
                    rating: { type: Number, default: 5, min: 1, max: 5 },
                    text: { type: String, default: "" },
                    active: { type: Boolean, default: true }
                }
            ],
            default: []
        }
    },
    {
        timestamps: true
    }
);

export const SiteSettings = mongoose.model("SiteSettings", settingsSchema);
