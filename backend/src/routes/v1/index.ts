import { Router, type Router as RouterType } from "express";
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
import ideaRoutes from "./ideaRoutes";
import analysisRoutes from "./analysisRoutes";
import taskRoutes from "./taskRoutes";
import chatRoutes from "./chat";

const router: RouterType = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/ideas", ideaRoutes);
router.use("/ideas", analysisRoutes); // Analysis routes are nested under ideas
router.use("/ideas/:ideaId/tasks", taskRoutes); // Task routes are nested under ideas
router.use("/ideas", chatRoutes); // Chat routes are nested under ideas

export default router;
