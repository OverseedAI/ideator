import { Router, type Router as RouterType } from "express";
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
import ideaRoutes from "./ideaRoutes";
import analysisRoutes from "./analysisRoutes";

const router: RouterType = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/ideas", ideaRoutes);
router.use("/ideas", analysisRoutes); // Analysis routes are nested under ideas

export default router;
