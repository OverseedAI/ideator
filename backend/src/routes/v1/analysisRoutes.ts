import { Router, type Router as RouterType } from "express";
import * as analysisController from "../../controllers/analysisController";
import { validate } from "../../middleware/validation";
import { authenticate } from "../../middleware/auth";

const router: RouterType = Router();

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

router.get(
  "/:id/analyses/stream",
  authenticate,
  validate(analysisController.ideaIdSchema),
  analysisController.streamAnalyses
);

export default router;
