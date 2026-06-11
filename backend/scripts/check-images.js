import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const uri = process.env.MONGODB_URI;
console.log("Connecting to:", uri ? uri.replace(/:[^@]+@/, ":****@") : "undefined");

try {
    await mongoose.connect(uri);
    console.log("✅ Connected to database");

    const products = await mongoose.connection.db.collection("products").find({}).toArray();
    console.log(`Found ${products.length} products:`);
    for (const p of products) {
        console.log(`- Product: ${p.name}`);
        console.log(`  Images:`, p.images);
    }
    
    const banners = await mongoose.connection.db.collection("banners").find({}).toArray();
    console.log(`\nFound ${banners.length} banners:`);
    for (const b of banners) {
        console.log(`- Banner: ${b.title}`);
        console.log(`  ImageUrl:`, b.imageUrl);
    }
    
    const gallery = await mongoose.connection.db.collection("galleries").find({}).toArray();
    console.log(`\nFound ${gallery.length} gallery items:`);
    for (const g of gallery) {
        console.log(`- Gallery Item: ${g.caption}`);
        console.log(`  ImageUrl:`, g.imageUrl);
    }

} catch (err) {
    console.error("❌ Error running check script:", err.message);
} finally {
    await mongoose.disconnect();
}
