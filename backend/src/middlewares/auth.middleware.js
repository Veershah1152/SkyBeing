import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided")
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        throw new ApiError(401, "Unauthorized: Token is invalid or expired")
    }

    const user = await User.findById(decodedToken?._id).select("-password")

    if (!user) {
        throw new ApiError(401, "Unauthorized: User not found")
    }

    req.user = user;
    next()
})

// Optional Auth Middleware for endpoints like /me where we just want to check status without 401 console logging
export const checkAuthStatus = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password")
        req.user = user || null;
    } catch (error) {
        req.user = null;
    }

    next()
})

export const verifyAdmin = asyncHandler(async (req, _, next) => {
    // This middleware assumes verifyJWT has already run and populated req.user
    if (!req.user) {
        throw new ApiError(401, "Unauthorized: User not authenticated")
    }

    if (req.user.role !== "admin") {
        throw new ApiError(403, "Forbidden: Admin access required")
    }

    next()
})
