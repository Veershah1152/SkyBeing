import { Router } from "express";
import { loginUser, logoutUser, registerUser, googleAuth, getCurrentUser } from "../controllers/user.controller.js";
import { verifyJWT, checkAuthStatus } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/google").post(googleAuth)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
// Use checkAuthStatus to not throw 401s on initial app load for guests
router.route("/me").get(checkAuthStatus, getCurrentUser)

export default router
