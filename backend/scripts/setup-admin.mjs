/**
 * One-time admin script:
 * 1. Delete ALL products from the database
 * 2. Grant admin role to talkwithaman22@gmail.com
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

await mongoose.connect(MONGODB_URI);
console.log("✅ Connected to MongoDB");

// --- 1. Delete all products ---
const productResult = await mongoose.connection.db
    .collection("products")
    .deleteMany({});
console.log(`🗑️  Deleted ${productResult.deletedCount} product(s)`);

// --- 2. Grant admin to talkwithaman22@gmail.com ---
const userResult = await mongoose.connection.db
    .collection("users")
    .updateOne(
        { email: "talkwithaman22@gmail.com" },
        { $set: { role: "admin" } }
    );

if (userResult.matchedCount === 0) {
    console.log("⚠️  User talkwithaman22@gmail.com NOT FOUND in database.");
    console.log("   → They need to register/login first, then re-run this script.");
} else {
    console.log("👑 Admin role granted to talkwithaman22@gmail.com");
}

await mongoose.disconnect();
console.log("✅ Done. Connection closed.");
