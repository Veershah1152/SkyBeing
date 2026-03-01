import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    createOrder,
    getAllOrders,
    getMyOrders,
    updateOrderStatus,
    getGSTReport
} from "../controllers/order.controller.js";


const router = Router();

// Guest Checkout Route (No Auth)
router.route("/guest").post(createOrder);

router.use(verifyJWT);

router.route("/").post(createOrder);
router.route("/my").get(getMyOrders);

// Admin Routes
router.route("/").get(getAllOrders);
router.route("/gst-report").get(verifyAdmin, getGSTReport);
router.route("/:id").put(updateOrderStatus);

export default router;
