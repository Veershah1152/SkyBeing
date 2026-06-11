import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let isCloudinaryConfigured = false;
const configureCloudinary = () => {
    if (!isCloudinaryConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true  // always return https:// URLs
        });
        isCloudinaryConfigured = true;
    }
};

const uploadOnCloudinary = async (fileOrPath) => {
    if (!fileOrPath) return null;
    configureCloudinary();
    try {
        let uploadContent;
        let isLocalFile = false;

        if (typeof fileOrPath === "string") {
            uploadContent = fileOrPath;
            isLocalFile = true;
        } else if (fileOrPath && fileOrPath.buffer) {
            // Convert buffer to data URI for Cloudinary upload
            const base64Data = fileOrPath.buffer.toString("base64");
            const mimeType = fileOrPath.mimetype || "image/jpeg";
            uploadContent = `data:${mimeType};base64,${base64Data}`;
        } else if (fileOrPath && fileOrPath.path) {
            uploadContent = fileOrPath.path;
            isLocalFile = true;
        } else {
            console.error("Unsupported file format passed to uploadOnCloudinary:", fileOrPath);
            return null;
        }

        const response = await cloudinary.uploader.upload(uploadContent, {
            resource_type: "auto",
            secure: true  // force https:// in returned URL
        });

        // Clean up the local temp file if it was a local file on disk
        if (isLocalFile) {
            const filePath = typeof fileOrPath === "string" ? fileOrPath : fileOrPath.path;
            try { fs.unlinkSync(filePath); } catch (e) {}
        }

        return response;
    } catch (error) {
        console.error("Cloudinary upload error: ", error);
        if (typeof fileOrPath === "string") {
            try { fs.unlinkSync(fileOrPath); } catch (e) {}
        } else if (fileOrPath && fileOrPath.path) {
            try { fs.unlinkSync(fileOrPath.path); } catch (e) {}
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return null;
    configureCloudinary();
    try {
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.error("Cloudinary delete error: ", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
