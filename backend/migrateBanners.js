import dotenv from "dotenv";
import mongoose from "mongoose";
import { Banner } from "./src/models/banner.model.js";

dotenv.config({ path: "./.env" });

await mongoose.connect(process.env.MONGODB_URI);
const result = await Banner.updateMany(
    { pages: { $exists: false } },
    { $set: { pages: ["home"] } }
);
console.log(`Updated ${result.modifiedCount} banners with pages:['home']`);
await mongoose.disconnect();
