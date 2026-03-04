import { Router } from "express";

import { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, verifyRazorpayPaymentManually } from "../controllers/payment.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Manual verify for Admin
router.route("/verify-money/:orderId").get(verifyJWT, verifyAdmin, verifyRazorpayPaymentManually);

// We allow guests to checkout, so no mandatory verifyJWT middleware here
router.route("/create-order").post(createRazorpayOrder);
router.route("/verify").post(verifyRazorpayPayment);
router.route("/webhook").post(razorpayWebhook);

export default router;
