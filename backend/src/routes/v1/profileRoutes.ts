import { Router } from "express";
import * as profileController from "../../controllers/profileController";
import { validate } from "../../middleware/validation";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, profileController.getProfile);

router.put(
  "/",
  authenticate,
  validate(profileController.updateProfileSchema),
  profileController.updateProfile
);

export default router;
