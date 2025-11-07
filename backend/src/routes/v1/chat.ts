import { Router } from "express";
import * as chatController from "../../controllers/chatController";
import { authenticate } from "../../middleware/auth";

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// POST /api/v1/ideas/:id/chat/stream - Stream chat response
router.post("/:id/chat/stream", chatController.streamChat);

// GET /api/v1/ideas/:id/chat/context - Get chat context
router.get("/:id/chat/context", chatController.getChatContext);

export default router;
