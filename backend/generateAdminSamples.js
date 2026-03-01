import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "./src/models/user.model.js";
import { Product } from "./src/models/product.model.js";
import { Order } from "./src/models/order.model.js";

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB connected!`);
    } catch (error) {
        console.log("❌ MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

const seedAdminData = async () => {
    await connectDB();

    console.log("Starting to generate sample data for Admin Dashboard...");

    // 1. GENERATE SAMPLE PRODUCTS
    // Ensure we have some products to attach to orders.
    let products = await Product.find({});
    if (products.length === 0) {
        console.log("No products found. Creating sample products...");
        const sampleProducts = [
            { name: "Eco-Friendly Bird Feeder", description: "Made from recycled plastics.", price: 499, category: "Feeder", stock: 120, images: ["https://images.unsplash.com/photo-1563725547905-19a9ecf61ba3?q=80&w=600"] },
            { name: "Premium Sunflower Seeds", description: "5kg pack of premium seeds.", price: 299, category: "Food", stock: 200, images: ["https://images.unsplash.com/photo-1550937402-23c2dedf4ca0?q=80&w=600"] },
            { name: "Wooden Birdhouse", description: "Handcrafted wooden shelter.", price: 899, category: "Shelter", stock: 45, images: ["https://images.unsplash.com/photo-1592534571871-3ad510688dcd?q=80&w=600"] },
            { name: "Ceramic Water Bath", description: "Beautiful ceramic bird bath.", price: 1299, category: "Accessories", stock: 15, images: ["https://images.unsplash.com/photo-1506540131435-01e40a0279e8?q=80&w=600"] }
        ];
        await Product.insertMany(sampleProducts);
        products = await Product.find({});
        console.log(`✅ Created ${products.length} sample products.`);
    }

    // 2. GENERATE SAMPLE CUSTOMER USERS
    console.log("Creating sample customer users...");
    const plainPassword = "password123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Check how many users exist
    const userCount = await User.countDocuments({ role: "user" });
    const newUsers = [];
    if (userCount < 5) {
        const dummyNames = ["Alice Smith", "Bob Johnson", "Charlie Davis", "Diana Prince", "Evan Wright"];
        for (let i = 0; i < dummyNames.length; i++) {
            newUsers.push({
                name: dummyNames[i],
                email: `customer${i + 1}@example.com`,
                password: hashedPassword,
                role: "user",
                isBlocked: false
            });
        }
        await User.insertMany(newUsers);
        console.log(`✅ Created ${newUsers.length} sample customers.`);
    }

    // Fetch newly created users so we can assign orders to them
    const customers = await User.find({ role: "user" }).limit(10);

    // 3. GENERATE SAMPLE ORDERS (Past 6 months to populate revenue chart)
    console.log("Creating sample orders for revenue charts...");
    await Order.deleteMany({}); // Warning: This clears existing orders!

    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    const sampleOrders = [];

    // Generate 25 random orders spread across the last 4 months
    for (let i = 0; i < 25; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];

        const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
        const totalAmount = product.price * quantity;

        // Randomize order date between 0 to 120 days ago so the 'Monthly Revenue' chart looks good
        const randomDaysAgo = Math.floor(Math.random() * 120);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - randomDaysAgo);

        // Make mostly 'delivered' so revenue counts, but mix in others
        const randomStatusWeights = ["delivered", "delivered", "delivered", "processing", "shipped", "pending", "cancelled"];
        const orderStatus = randomStatusWeights[Math.floor(Math.random() * randomStatusWeights.length)];

        sampleOrders.push({
            userId: customer._id,
            products: [{ productId: product._id, quantity }],
            totalAmount,
            paymentStatus: orderStatus === "cancelled" ? "failed" : "completed",
            orderStatus: orderStatus,
            shippingAddress: {
                street: `${Math.floor(Math.random() * 1000)} Main St`,
                city: "Sample City",
                state: "CA",
                country: "USA",
                zipCode: "90001"
            },
            createdAt: orderDate,
            updatedAt: orderDate
        });
    }

    if (sampleOrders.length > 0) {
        await Order.insertMany(sampleOrders);
        console.log(`✅ Created ${sampleOrders.length} historical sample orders.`);
    }

    console.log("\n🎉 Sample Admin Data Generation Complete! Go check your dashboard at http://localhost:5173/admin");
    process.exit(0);
};

seedAdminData();
