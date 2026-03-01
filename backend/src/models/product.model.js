import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        // General
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true },
        subCategory: { type: String, default: "" },
        shortDescription: { type: String, default: "" },
        description: { type: String, default: "" },
        productType: { type: String, enum: ["simple", "variant"], default: "simple" },

        // Pricing
        price: { type: Number, required: true, default: 0 },      // MRP (sale price)
        mrp: { type: Number, default: 0 },
        manufacturingPrice: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
        discountStartDate: { type: Date },
        discountEndDate: { type: Date },
        tax: { type: String, default: "" },

        // General Details
        sku: { type: String, default: "" },
        barcode: { type: String, default: "" },
        tags: { type: [String], default: [] },

        // Inventory
        stock: { type: Number, required: true, default: 0 },
        minStock: { type: Number, default: 2 },
        stockStatus: { type: String, enum: ["in_stock", "out_of_stock", "backorder"], default: "in_stock" },
        trackStock: { type: Boolean, default: true },

        // Shipping
        shippingWeight: { type: String, default: "" },
        shippingLength: { type: String, default: "" },
        shippingWidth: { type: String, default: "" },
        shippingHeight: { type: String, default: "" },

        // Variants (for Variant Products)
        variants: [
            {
                attribute: { type: String }, // e.g., "Color", "Size"
                value: { type: String },     // e.g., "Green", "XL"
                color: { type: String },     // hex color if applicable
                stock: { type: Number, default: 0 },
                price: { type: Number },
                images: { type: [String], default: [] }
            }
        ],

        // Media
        images: { type: [String], default: [] },

        // Reviews
        ratings: { type: Number, default: 0 },
        reviews: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                name: { type: String, required: true },
                rating: { type: Number, required: true },
                comment: { type: String, required: true }
            }
        ],
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
