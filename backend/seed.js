import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./src/models/product.model.js";

dotenv.config({ path: './.env' });
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

const seedProducts = async () => {
    await connectDB();

    // Clear existing to avoid duplicates if run multiple times
    await Product.deleteMany({});
    console.log("Cleared existing products");

    const products = [
        {
            name: "Classic Wooden Bird Feeder",
            description: "A beautiful hand-crafted wooden bird feeder perfect for gardens.",
            price: 599,
            category: "Bird Feeder",
            stock: 50,
            images: ["https://images.unsplash.com/photo-1563725547905-19a9ecf61ba3?q=80&w=600&auto=format&fit=crop"] // Placeholder
        },
        {
            name: "Ceramic Water Bath",
            description: "Elegant ceramic water bath for birds to drink and bathe.",
            price: 850,
            category: "Water Feeder",
            stock: 30,
            images: ["https://images.unsplash.com/photo-1550937402-23c2dedf4ca0?q=80&w=600&auto=format&fit=crop"] // Placeholder
        },
        {
            name: "Deluxe Nesting Box",
            description: "Safe and comfortable nesting box made from cedar wood.",
            price: 1200,
            category: "Bird House",
            stock: 20,
            images: ["https://images.unsplash.com/photo-1592534571871-3ad510688dcd?q=80&w=600&auto=format&fit=crop"] // Placeholder
        },
        {
            name: "Hanging Seed Feeder",
            description: "Convenient hanging feeder with multiple feeding ports.",
            price: 350,
            category: "Bird Feeder",
            stock: 100,
            images: ["https://images.unsplash.com/photo-1506540131435-01e40a0279e8?q=80&w=600&auto=format&fit=crop"] // Placeholder
        }
    ];

    try {
        await Product.insertMany(products);
        console.log("Products seeded successfully!");
    } catch (err) {
        console.error("Error seeding products:", err);
    } finally {
        mongoose.connection.close();
    }
};

seedProducts();
