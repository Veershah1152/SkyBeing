import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load .env from backend root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env file!");
    process.exit(1);
}

// ─── Define all schemas (mirror of your models) ───────────────────────────────

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: [true, "Password is required"] },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isBlocked: { type: Boolean, default: false },
        cart: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product" },
                quantity: { type: Number, default: 1 },
            },
        ],
        address: [
            {
                street: String,
                city: String,
                state: String,
                country: String,
                zipCode: String,
            },
        ],
    },
    { timestamps: true }
);

const productSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true },
        subCategory: { type: String, default: "" },
        shortDescription: { type: String, default: "" },
        description: { type: String, default: "" },
        productType: { type: String, enum: ["simple", "variant"], default: "simple" },
        price: { type: Number, required: true, default: 0 },
        mrp: { type: Number, default: 0 },
        manufacturingPrice: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
        discountStartDate: { type: Date },
        discountEndDate: { type: Date },
        tax: { type: String, default: "" },
        sku: { type: String, default: "" },
        barcode: { type: String, default: "" },
        tags: { type: [String], default: [] },
        stock: { type: Number, required: true, default: 0 },
        minStock: { type: Number, default: 2 },
        stockStatus: { type: String, enum: ["in_stock", "out_of_stock", "backorder"], default: "in_stock" },
        trackStock: { type: Boolean, default: true },
        shippingWeight: { type: String, default: "" },
        shippingLength: { type: String, default: "" },
        shippingWidth: { type: String, default: "" },
        shippingHeight: { type: String, default: "" },
        variants: [
            {
                attribute: { type: String },
                value: { type: String },
                color: { type: String },
                stock: { type: Number, default: 0 },
                price: { type: Number },
                images: { type: [String], default: [] },
            },
        ],
        images: { type: [String], default: [] },
        ratings: { type: Number, default: 0 },
        reviews: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                name: { type: String, required: true },
                rating: { type: Number, required: true },
                comment: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

const orderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        products: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, default: 1 },
            },
        ],
        totalAmount: { type: Number, required: true },
        paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
        orderStatus: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "processing",
        },
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
        },
    },
    { timestamps: true }
);

const bannerSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, default: "" },
        buttonText: { type: String, default: "Shop Now" },
        buttonLink: { type: String, default: "/shop" },
        imageUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        pages: {
            type: [String],
            enum: ["home", "shop", "about", "contact", "all"],
            default: ["home"],
        },
    },
    { timestamps: true }
);

const gallerySchema = new Schema(
    {
        imageUrl: { type: String, required: true },
        publicId: { type: String, default: "" },
        caption: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// ─── Register Models ──────────────────────────────────────────────────────────
const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Banner = mongoose.model("Banner", bannerSchema);
const Gallery = mongoose.model("Gallery", gallerySchema);

// ─── Main Init Function ───────────────────────────────────────────────────────
async function initDatabase() {
    console.log("\n🚀 Connecting to new MongoDB database...");
    console.log(`   URI: ${MONGODB_URI.replace(/:([^@]+)@/, ":****@")}\n`); // hide password

    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected! Host: ${mongoose.connection.host}\n`);

    const collections = [
        { name: "users", model: User },
        { name: "products", model: Product },
        { name: "orders", model: Order },
        { name: "banners", model: Banner },
        { name: "galleries", model: Gallery },
    ];

    console.log("📦 Creating collections from models...\n");

    for (const { name, model } of collections) {
        try {
            // createCollection() creates the collection + indexes (no-op if it exists)
            await model.createCollection();
            // Sync indexes defined in schema
            await model.syncIndexes();
            console.log(`   ✅ Collection created: ${name}`);
        } catch (err) {
            if (err.codeName === "NamespaceExists") {
                console.log(`   ⚠️  Collection already exists: ${name} (skipped)`);
            } else {
                console.error(`   ❌ Failed to create ${name}:`, err.message);
            }
        }
    }

    console.log("\n🎉 Database initialization complete!");
    console.log("   All collections and indexes are ready in your new database.\n");

    await mongoose.disconnect();
    process.exit(0);
}

initDatabase().catch((err) => {
    console.error("❌ Initialization failed:", err.message);
    process.exit(1);
});
