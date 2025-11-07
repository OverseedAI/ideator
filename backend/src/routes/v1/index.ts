import { Router, type Router as RouterType } from "express";
import authRoutes from "./authRoutes";
import oauthRoutes from "./oauthRoutes";
import profileRoutes from "./profileRoutes";
import ideaRoutes from "./ideaRoutes";
import analysisRoutes from "./analysisRoutes";
import taskRoutes from "./taskRoutes";

const router: RouterType = Router();

router.use("/auth", authRoutes);
router.use("/auth", oauthRoutes); // OAuth routes under /auth
router.use("/profile", profileRoutes);
router.use("/ideas", ideaRoutes);
router.use("/ideas", analysisRoutes); // Analysis routes are nested under ideas
router.use("/ideas/:ideaId/tasks", taskRoutes); // Task routes are nested under ideas

export default router;
