/**
 * Fix existing products: replace http:// Cloudinary URLs with https://
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected\n");

const products = await mongoose.connection.db.collection("products").find({}).toArray();

let fixedCount = 0;
for (const product of products) {
    const updatedImages = (product.images || []).map(url =>
        url.startsWith("http://") ? url.replace("http://", "https://") : url
    );

    const hasChanges = updatedImages.some((url, i) => url !== product.images[i]);

    if (hasChanges) {
        await mongoose.connection.db.collection("products").updateOne(
            { _id: product._id },
            { $set: { images: updatedImages } }
        );
        console.log(`✅ Fixed images for: ${product.name}`);
        console.log(`   Before: ${product.images}`);
        console.log(`   After:  ${updatedImages}\n`);
        fixedCount++;
    } else {
        console.log(`⏭️  No fix needed for: ${product.name} (already https or no images)`);
    }
}

console.log(`\n✅ Done. Fixed ${fixedCount} product(s).`);
await mongoose.disconnect();
