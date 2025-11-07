import { Router, type Router as RouterType } from "express";
import rateLimit from "express-rate-limit";
import * as oauthController from "../../controllers/oauthController";
import { authenticate } from "../../middleware/auth";

const router: RouterType = Router();

// Rate limiter for OAuth endpoints to prevent abuse
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many OAuth requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Initiate Google OAuth flow
router.get("/google", oauthLimiter, oauthController.initiateGoogleAuth);

// Google OAuth callback
router.get("/google/callback", oauthLimiter, oauthController.handleGoogleCallback);

// Get linked provider accounts (protected route)
router.get("/providers", authenticate, oauthController.getLinkedProviders);

// Unlink a provider account (protected route)
router.delete("/providers/:provider", authenticate, oauthController.unlinkProvider);

export default router;
