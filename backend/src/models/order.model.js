import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        products: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["cod", "online"],
            default: "cod"
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending"
        },
        orderStatus: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "processing"
        },
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        // Customer contact details saved at time of order
        customerName: { type: String, default: "" },
        customerEmail: { type: String, default: "" },
        customerPhone: { type: String, default: "" },
        orderNotes: { type: String, default: "" },
        // Whether the order is confirmed (COD = instantly, online = after payment verification)
        isConfirmed: { type: Boolean, default: false },

        // Shiprocket integration fields
        shiprocketOrderId: { type: String, default: null },
        shiprocketShipmentId: { type: Number, default: null },
        awbCode: { type: String, default: null },
        courierName: { type: String, default: null },

        // Self shipping
        isSelfShipped: { type: Boolean, default: false },

        // Razorpay fields
        razorpayOrderId: { type: String, default: null },
        razorpayPaymentId: { type: String, default: null },
    },
    {
        timestamps: true
    }
);

export const Order = mongoose.model("Order", orderSchema);
