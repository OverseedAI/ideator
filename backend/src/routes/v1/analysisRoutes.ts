import { Router } from "express";
import * as analysisController from "../../controllers/analysisController";
import { validate } from "../../middleware/validation";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post(
  "/:id/analyze",
  authenticate,
  validate(analysisController.ideaIdSchema),
  analysisController.analyzeIdea
);

router.get(
  "/:id/analyses",
  authenticate,
  validate(analysisController.ideaIdSchema),
  analysisController.getAnalyses
);

export default router;
