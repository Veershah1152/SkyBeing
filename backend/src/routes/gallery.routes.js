import { Router } from "express";
import {
    getGalleryImages,
    getAllGalleryImages,
    uploadGalleryImage,
    toggleGalleryImage,
    deleteGalleryImage,
} from "../controllers/gallery.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public
router.get("/active", getGalleryImages);

// Admin-protected
router.use(verifyJWT, verifyAdmin);
router.get("/", getAllGalleryImages);
router.post("/", upload.single("image"), uploadGalleryImage);
router.put("/:id/toggle", toggleGalleryImage);
router.delete("/:id", deleteGalleryImage);

export default router;
