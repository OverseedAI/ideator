import { Router, type Router as RouterType } from "express";
import * as ideaController from "../../controllers/ideaController";
import { validate } from "../../middleware/validation";
import { authenticate } from "../../middleware/auth";

const router: RouterType = Router();

router.post(
  "/",
  authenticate,
  validate(ideaController.createIdeaSchema),
  ideaController.createIdea
);

router.get("/", authenticate, ideaController.getUserIdeas);

router.get("/:id", authenticate, validate(ideaController.ideaIdSchema), ideaController.getIdeaById);

router.put(
  "/:id",
  authenticate,
  validate(ideaController.ideaIdSchema),
  validate(ideaController.updateIdeaSchema),
  ideaController.updateIdea
);

router.delete(
  "/:id",
  authenticate,
  validate(ideaController.ideaIdSchema),
  ideaController.deleteIdea
);

export default router;
