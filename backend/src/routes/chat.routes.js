import { Router } from "express";
import { sendMessage } from "../controllers/chat.controller.js";

const router = Router();

// POST /api/v1/chat/message
router.post("/message", sendMessage);

export default router;
