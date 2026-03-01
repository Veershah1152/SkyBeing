import { Router } from "express";

import { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook } from "../controllers/payment.controller.js";

const router = Router();

// We allow guests to checkout, so no mandatory verifyJWT middleware here
router.route("/create-order").post(createRazorpayOrder);
router.route("/verify").post(verifyRazorpayPayment);
router.route("/webhook").post(razorpayWebhook);

export default router;
