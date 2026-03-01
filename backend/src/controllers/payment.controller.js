import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/order.model.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret123',
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const amount = Math.round(order.totalAmount * 100); // Razorpay expects amount in paise

    const options = {
        amount,
        currency: "INR",
        receipt: `receipt_order_${order._id}`,
        notes: {
            orderId: order._id.toString()
        }
    };

    const rzpOrder = await razorpay.orders.create(options);

    if (!rzpOrder) {
        throw new ApiError(500, "Failed to create Razorpay order");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            id: rzpOrder.id,
            currency: rzpOrder.currency,
            amount: rzpOrder.amount,
            key_id: process.env.RAZORPAY_KEY_ID
        }, "Razorpay order created successfully")
    );
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret123')
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        // Payment is verified
        const order = await Order.findById(orderId);
        if (order) {
            order.paymentStatus = 'completed';
            await order.save();
        }

        return res.status(200).json(new ApiResponse(200, {}, "Payment verified successfully"));
    } else {
        throw new ApiError(400, "Invalid signature sent!");
    }
});

const razorpayWebhook = asyncHandler(async (req, res) => {
    // Razorpay sends webhook payload in req.body
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
        console.error("Webhook secret is not defined");
        return res.status(500).send("Webhook secret is missing");
    }

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
        const event = req.body.event;
        const payload = req.body.payload;

        try {
            // We can get the original orderId from the notes we sent during creation
            let orderId = null;

            if (payload.payment && payload.payment.entity && payload.payment.entity.notes) {
                orderId = payload.payment.entity.notes.orderId;
            } else if (payload.order && payload.order.entity && payload.order.entity.notes) {
                orderId = payload.order.entity.notes.orderId;
            }

            if (orderId) {
                const order = await Order.findById(orderId);

                if (order) {
                    if (event === "payment.captured" || event === "order.paid") {
                        order.paymentStatus = 'completed';
                        await order.save();
                    } else if (event === "payment.failed") {
                        order.paymentStatus = 'failed';
                        await order.save();
                    }
                }
            }

            return res.status(200).json({ status: "ok" });
        } catch (error) {
            console.error("Webhook processing error:", error);
            return res.status(500).json({ status: "error", message: "Failed to process webhook" });
        }
    } else {
        return res.status(400).json({ status: "error", message: "Invalid Signature" });
    }
});

export {
    createRazorpayOrder,
    verifyRazorpayPayment,
    razorpayWebhook
};
