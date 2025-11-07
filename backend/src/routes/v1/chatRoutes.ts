import { Router, type Router as RouterType } from "express";
import * as chatController from "../../controllers/chatController";
import { authenticate } from "../../middleware/auth";

const router: RouterType = Router();

// POST /api/v1/ideas/:id/chat - Stream chat response
router.post("/:id/chat", authenticate, chatController.streamChat);

// GET /api/v1/ideas/:id/chat/context - Get chat context
router.get("/:id/chat/context", authenticate, chatController.getChatContext);

export default router;
