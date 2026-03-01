import { Router } from "express";
import {
    getActiveBanners,
    getAllBanners,
    createBanner,
    toggleBanner,
    updateBannerPages,
    deleteBanner,
} from "../controllers/banner.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public — homepage & shop fetch active banners with ?page=home etc.
router.get("/active", getActiveBanners);

// Admin — protected
router.use(verifyJWT, verifyAdmin);
router.get("/", getAllBanners);
router.post("/", upload.single("image"), createBanner);
router.put("/:id/toggle", toggleBanner);
router.put("/:id/pages", updateBannerPages);
router.delete("/:id", deleteBanner);

export default router;
