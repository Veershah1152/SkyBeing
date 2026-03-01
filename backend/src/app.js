import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Security Middlewares
// Allow Google OAuth popup window to communicate via postMessage
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 200 : 2000, // generous limit in dev
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1', // skip localhost in dev
    message: "Too many requests from this IP, please try again after 15 minutes"
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Default Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// routes import
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import adminRouter from "./routes/admin.routes.js";
import bannerRouter from "./routes/banner.routes.js";
import galleryRouter from "./routes/gallery.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/v1/admin", adminRouter);   // alias — frontend uses /api/v1 base
app.use("/api/v1/banners", bannerRouter);
app.use("/api/v1/gallery", galleryRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    // Handle invalid MongoDB ObjectId (CastError) — e.g. old IDs from previous DB
    if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Invalid ID format. The resource may no longer exist.",
            errors: []
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app }
