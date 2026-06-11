import { uploadOnCloudinary, deleteFromCloudinary } from "./cloudinary.js";
import { uploadOnCloudflare, deleteFromCloudflare } from "./cloudflare.js";

// Determine provider based on UPLOAD_PROVIDER env var, default to 'cloudinary'
// Also fallback to 'cloudinary' if R2 configuration is missing/placeholder
const getProvider = () => {
    const provider = (process.env.UPLOAD_PROVIDER || "cloudinary").toLowerCase();
    
    // Check if Cloudflare R2 is configured with real credentials
    const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || "";
    const isR2Configured = r2Endpoint && 
                           !r2Endpoint.includes("<ACCOUNT_ID>") && 
                           process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
                           !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID.includes("<YOUR_");

    if (provider === "r2" && isR2Configured) {
        return "r2";
    }
    return "cloudinary";
};

export const uploadFile = async (fileOrPath) => {
    const provider = getProvider();
    if (provider === "r2") {
        console.log("Uploading file using Cloudflare R2...");
        return await uploadOnCloudflare(fileOrPath);
    } else {
        console.log("Uploading file using Cloudinary...");
        return await uploadOnCloudinary(fileOrPath);
    }
};

export const deleteFile = async (publicId) => {
    const provider = getProvider();
    if (provider === "r2") {
        console.log("Deleting file from Cloudflare R2...");
        return await deleteFromCloudflare(publicId);
    } else {
        console.log("Deleting file from Cloudinary...");
        return await deleteFromCloudinary(publicId);
    }
};
