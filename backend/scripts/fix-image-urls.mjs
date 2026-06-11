import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const uri = process.env.MONGODB_URI;
console.log("Connecting to:", uri ? uri.replace(/:[^@]+@/, ":****@") : "undefined");

try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB\n");

    // ── 1. Fix Product Images ──
    const productsCollection = mongoose.connection.db.collection("products");
    const products = await productsCollection.find({}).toArray();
    let fixedProducts = 0;

    for (const product of products) {
        if (!product.images || !Array.isArray(product.images)) continue;

        const updatedImages = product.images.map(url =>
            url.startsWith("http://") ? url.replace("http://", "https://") : url
        );

        const hasChanges = updatedImages.some((url, i) => url !== product.images[i]);

        if (hasChanges) {
            await productsCollection.updateOne(
                { _id: product._id },
                { $set: { images: updatedImages } }
            );
            console.log(`✅ Fixed images for Product: ${product.name}`);
            fixedProducts++;
        }
    }
    console.log(`Finished Products. Fixed: ${fixedProducts}`);

    // ── 2. Fix Banner Images ──
    const bannersCollection = mongoose.connection.db.collection("banners");
    const banners = await bannersCollection.find({}).toArray();
    let fixedBanners = 0;

    for (const banner of banners) {
        if (!banner.imageUrl) continue;

        if (banner.imageUrl.startsWith("http://")) {
            const secureUrl = banner.imageUrl.replace("http://", "https://");
            await bannersCollection.updateOne(
                { _id: banner._id },
                { $set: { imageUrl: secureUrl } }
            );
            console.log(`✅ Fixed image for Banner: ${banner.title || "No Title"}`);
            fixedBanners++;
        }
    }
    console.log(`Finished Banners. Fixed: ${fixedBanners}`);

    // ── 3. Fix Gallery Images ──
    const galleriesCollection = mongoose.connection.db.collection("galleries");
    const galleries = await galleriesCollection.find({}).toArray();
    let fixedGalleries = 0;

    for (const galleryItem of galleries) {
        if (!galleryItem.imageUrl) continue;

        if (galleryItem.imageUrl.startsWith("http://")) {
            const secureUrl = galleryItem.imageUrl.replace("http://", "https://");
            await galleriesCollection.updateOne(
                { _id: galleryItem._id },
                { $set: { imageUrl: secureUrl } }
            );
            console.log(`✅ Fixed image for Gallery Item: ${galleryItem.caption || "No Caption"}`);
            fixedGalleries++;
        }
    }
    console.log(`Finished Gallery. Fixed: ${fixedGalleries}`);

} catch (err) {
    console.error("❌ Error fixing image URLs:", err.message);
} finally {
    await mongoose.disconnect();
    console.log("\n✅ Database disconnected.");
}
