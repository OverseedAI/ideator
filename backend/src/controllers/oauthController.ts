import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";

/**
 * Handle successful OAuth callback
 * This is called by passport after successful authentication
 */
export const googleCallback = (req: Request, res: Response) => {
  try {
    // User data is attached by passport strategy
    const result = req.user as any;

    if (!result || !result.token) {
      throw new AppError(401, "Authentication failed");
    }

    // Redirect to frontend with token and user data
    // The frontend will extract these from the URL and store them
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}${result.merged ? "&merged=true" : ""}`;

    res.redirect(redirectUrl);
  } catch (error) {
    // Redirect to frontend with error
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const errorMessage = error instanceof AppError ? error.message : "Authentication failed";
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`);
  }
};

/**
 * Initiate Google OAuth flow
 * This is handled by passport middleware in the routes
 */
export const googleAuth = () => {
  // This function is intentionally empty
  // The actual authentication is handled by passport middleware
};
