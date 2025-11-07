import { Router, type Router as RouterType } from "express";
import * as chatController from "../../controllers/chatController";
import { validate } from "../../middleware/validation";
import { authenticate } from "../../middleware/auth";

const router: RouterType = Router();

router.post(
  "/:ideaId/chat",
  authenticate,
  validate(chatController.chatMessageSchema),
  chatController.chat
);

export default router;
