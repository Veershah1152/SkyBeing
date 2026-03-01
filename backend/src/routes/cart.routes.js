import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
} from "../controllers/cart.controller.js";


const router = Router();

router.use(verifyJWT); // Ensure all cart routes require login

router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/update").put(updateCartQuantity);
router.route("/remove/:productId").delete(removeFromCart);

export default router;
