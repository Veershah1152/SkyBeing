import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/order.model.js";
import { SiteSettings } from "../models/settings.model.js";

const getRazorpayInstance = async () => {
    const settings = await SiteSettings.findOne();

    const keyId = settings?.razorpayKey || process.env.RAZORPAY_KEY_ID;
    const keySecret = settings?.razorpaySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new ApiError(500, "Razorpay credentials not configured. Set them in Admin Settings or .env (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
    }

    return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

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

    const rzp = await getRazorpayInstance();
    const rzpOrder = await rzp.orders.create(options);

    if (!rzpOrder) {
        throw new ApiError(500, "Failed to create Razorpay order");
    }

    // Save razorpayOrderId to keep track
    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    const settings = await SiteSettings.findOne();
    const keyId = settings?.razorpayKey || process.env.RAZORPAY_KEY_ID;

    return res.status(200).json(
        new ApiResponse(200, {
            id: rzpOrder.id,
            currency: rzpOrder.currency,
            amount: rzpOrder.amount,
            key_id: keyId
        }, "Razorpay order created successfully")
    );
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const settings = await SiteSettings.findOne();
    const razorpaySecret = settings?.razorpaySecret || process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
        throw new ApiError(500, "Razorpay secret not configured");
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", razorpaySecret)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        const order = await Order.findById(orderId);
        if (order) {
            order.paymentStatus = 'completed';
            order.isConfirmed = true;
            order.razorpayPaymentId = razorpay_payment_id;
            await order.save();
        }

        return res.status(200).json(new ApiResponse(200, {}, "Payment verified successfully"));
    } else {
        throw new ApiError(400, "Invalid signature sent!");
    }
});

const razorpayWebhook = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.findOne();
    const secret = settings?.razorpayWebhookSecret;

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
                        order.isConfirmed = true;
                        if (payload.payment?.entity?.id) {
                            order.razorpayPaymentId = payload.payment.entity.id;
                        }
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

// ── Admin: Manual money check against Razorpay ────────────────────────────────
export const verifyRazorpayPaymentManually = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.paymentMethod !== 'online') {
        throw new ApiError(400, "Money check only applicable for online/Razorpay payments.");
    }

    // Get Razorpay instance (will throw 500 if credentials missing)
    const rzp = await getRazorpayInstance();

    let rzpOrderId = order.razorpayOrderId;

    // ── Step 1: If no razorpayOrderId stored yet, search Razorpay by receipt ──
    if (!rzpOrderId) {
        const receipt = `receipt_order_${orderId}`;
        console.log(`[MoneyCheck] No rzpOrderId on DB order ${orderId}, searching Razorpay by receipt: ${receipt}`);

        let rzpOrders;
        try {
            // Fetch last 100 Razorpay orders and match by receipt
            rzpOrders = await rzp.orders.all({ count: 100 });
        } catch (fetchErr) {
            console.error("[MoneyCheck] Failed to list orders from Razorpay:", fetchErr.message || fetchErr);
            return res.status(200).json(new ApiResponse(200, {
                paymentStatus: order.paymentStatus,
            }, "Could not reach Razorpay servers. Please check Razorpay API credentials in Settings."));
        }

        const matchedOrder = rzpOrders?.items?.find(o => o.receipt === receipt);

        if (!matchedOrder) {
            return res.status(200).json(new ApiResponse(200, {
                paymentStatus: order.paymentStatus,
            }, "No Razorpay order found for this DB order. Customer likely did not open the payment page yet."));
        }

        // Save found Razorpay Order ID for future lookups
        rzpOrderId = matchedOrder.id;
        order.razorpayOrderId = rzpOrderId;
        await order.save();
        console.log(`[MoneyCheck] Found & linked rzpOrderId: ${rzpOrderId} to order ${orderId}`);
    }

    // ── Step 2: Fetch all payments made against this Razorpay order ──
    let rzpPayments;
    try {
        rzpPayments = await rzp.orders.fetchPayments(rzpOrderId);
    } catch (fetchErr) {
        console.error("[MoneyCheck] Failed to fetchPayments from Razorpay:", fetchErr.message || fetchErr);
        return res.status(200).json(new ApiResponse(200, {
            paymentStatus: order.paymentStatus,
        }, `Could not fetch payments from Razorpay for Razorpay order ${rzpOrderId}. Check credentials.`));
    }

    // ── Step 3: Check for a successful (captured) payment ──
    const successfulPayment = rzpPayments?.items?.find(p => p.status === 'captured');

    if (successfulPayment) {
        order.paymentStatus = 'completed';
        order.isConfirmed = true;
        order.razorpayPaymentId = successfulPayment.id;
        await order.save();
        console.log(`[MoneyCheck] ✅ Payment verified for order ${orderId}: paymentId=${successfulPayment.id}`);

        return res.status(200).json(new ApiResponse(200, {
            paymentStatus: 'completed',
            paymentId: successfulPayment.id,
            amount: successfulPayment.amount / 100
        }, "✅ Money Verified! Payment was successful. Order is now confirmed."));
    }

    if (!rzpPayments?.items?.length) {
        return res.status(200).json(new ApiResponse(200, {
            paymentStatus: order.paymentStatus,
        }, "No payment attempts found in Razorpay for this order. Customer has not paid yet."));
    }

    const latestPayment = rzpPayments.items[0];
    console.log(`[MoneyCheck] Latest payment for ${orderId}: status=${latestPayment.status}, id=${latestPayment.id}`);
    return res.status(200).json(new ApiResponse(200, {
        paymentStatus: latestPayment.status,
        paymentId: latestPayment.id
    }, `Money Check: Latest payment status is '${latestPayment.status}'. No successful capture yet.`));
});

export {
    createRazorpayOrder,
    verifyRazorpayPayment,
    razorpayWebhook
};
