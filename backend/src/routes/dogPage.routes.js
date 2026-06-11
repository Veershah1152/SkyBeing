import { Router } from "express";
import { getDogPageConfig, updateDogPageConfig } from "../controllers/dogPage.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Public — frontend fetches this to render the page
router.route("/").get(getDogPageConfig);

// Admin only — update any section
router.route("/").put(verifyJWT, verifyAdmin, updateDogPageConfig);

export default router;
