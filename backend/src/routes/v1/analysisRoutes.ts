import { Router } from "express";
import * as analysisController from "../../controllers/analysisController";
import { validate } from "../../middleware/validation";
import { authenticate, authenticateSSE } from "../../middleware/auth";

const router = Router();

router.post(
  "/:id/analyze",
  authenticate,
  validate(analysisController.ideaIdSchema),
  analysisController.analyzeIdea
);

router.get(
  "/:id/analyze/stream",
  authenticateSSE,
  validate(analysisController.ideaIdSchema),
  analysisController.analyzeIdeaStream
);

router.get(
  "/:id/analyses",
  authenticate,
  validate(analysisController.ideaIdSchema),
  analysisController.getAnalyses
);

export default router;
