import { Router } from "express";

import userRouter from "./user.routes.js";
import productRouter from "./product.routes.js";
import cartRouter from "./cart.routes.js";
import orderRouter from "./order.routes.js";
import paymentRouter from "./payment.routes.js";
import adminRouter from "./admin.routes.js";
import bannerRouter from "./banner.routes.js";
import galleryRouter from "./gallery.routes.js";
import statsRouter from "./stats.routes.js";
import blogRouter from "./blog.routes.js";
import inquiryRouter from "./inquiry.routes.js";
import shiprocketRouter from "./shiprocket.routes.js";
import settingsRouter from "./settings.routes.js";
import chatRouter from "./chat.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use("/products", productRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);
router.use("/payments", paymentRouter);
router.use("/admin", adminRouter);
router.use("/banners", bannerRouter);
router.use("/gallery", galleryRouter);
router.use("/stats", statsRouter);
router.use("/blogs", blogRouter);
router.use("/inquiries", inquiryRouter);
router.use("/shiprocket", shiprocketRouter);
router.use("/settings", settingsRouter);
router.use("/chat", chatRouter);

export default router;
