import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Cloudflare R2 is S3-compatible, so we use the AWS SDK
// We use a lazy getter so environment variables in process.env are resolved dynamically
let r2Client = null;
const getR2Client = () => {
    if (!r2Client) {
        r2Client = new S3Client({
            region: "auto",
            endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            },
        });
    }
    return r2Client;
};

const getBucket = () => process.env.CLOUDFLARE_R2_BUCKET_NAME;
const getPublicUrl = () => process.env.CLOUDFLARE_R2_PUBLIC_URL;

/**
 * Upload a file (local path string OR multer memory file object) to Cloudflare R2.
 * Returns an object with { url, secure_url, public_id } to stay compatible with existing Cloudinary usage.
 */
const uploadOnCloudflare = async (fileOrPath) => {
    if (!fileOrPath) return null;

    try {
        let fileBuffer;
        let ext = ".jpg"; // default fallback

        if (typeof fileOrPath === "string") {
            // Local file path (e.g. from local scripts or dev environment)
            fileBuffer = fs.readFileSync(fileOrPath);
            ext = path.extname(fileOrPath).toLowerCase();
        } else if (fileOrPath && fileOrPath.buffer) {
            // Memory file from multer
            fileBuffer = fileOrPath.buffer;
            if (fileOrPath.originalname) {
                ext = path.extname(fileOrPath.originalname).toLowerCase();
            }
        } else if (fileOrPath && fileOrPath.path) {
            // Multer disk storage fallback
            fileBuffer = fs.readFileSync(fileOrPath.path);
            ext = path.extname(fileOrPath.originalname || fileOrPath.path).toLowerCase();
        } else {
            console.error("Unsupported file format passed to uploadOnCloudflare:", fileOrPath);
            return null;
        }

        // Generate a unique key (acts as public_id)
        const key = `uploads/${randomUUID()}${ext}`;

        // Determine content type
        const contentTypeMap = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".avif": "image/avif",
            ".svg": "image/svg+xml",
        };
        const ContentType = contentTypeMap[ext] || "application/octet-stream";

        const r2 = getR2Client();
        const BUCKET = getBucket();
        const PUBLIC_URL = getPublicUrl();

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType,
        }));

        // Clean up the local temp file if it was a file path
        if (typeof fileOrPath === "string") {
            try { fs.unlinkSync(fileOrPath); } catch (e) {}
        } else if (fileOrPath && fileOrPath.path) {
            try { fs.unlinkSync(fileOrPath.path); } catch (e) {}
        }

        const url = `${PUBLIC_URL}/${key}`;

        // Return shape compatible with existing Cloudinary usage
        return {
            url,
            secure_url: url,
            public_id: key,
        };

    } catch (error) {
        console.error("Cloudflare R2 upload error:", error);
        if (typeof fileOrPath === "string") {
            try { fs.unlinkSync(fileOrPath); } catch (e) {}
        } else if (fileOrPath && fileOrPath.path) {
            try { fs.unlinkSync(fileOrPath.path); } catch (e) {}
        }
        return null;
    }
};

/**
 * Delete a file from Cloudflare R2 by its key (public_id).
 */
const deleteFromCloudflare = async (key) => {
    if (!key) return;
    try {
        const r2 = getR2Client();
        const BUCKET = getBucket();
        await r2.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        }));
    } catch (error) {
        console.error("Cloudflare R2 delete error:", error);
    }
};

export { uploadOnCloudflare, deleteFromCloudflare };
