import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    addReview
} from "../controllers/product.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/:id/reviews").post(verifyJWT, addReview);

// Admin / Secured routes
router.route("/").post(
    verifyJWT,
    verifyAdmin,
    upload.array("images", 5), // Accept up to 5 images
    createProduct
);

router.route("/:id").put(verifyJWT, verifyAdmin, updateProduct);
router.route("/:id").delete(verifyJWT, verifyAdmin, deleteProduct);

export default router;
