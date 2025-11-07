import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as oauthService from "../services/oauthService";
import { AppError } from "../middleware/errorHandler";

// In-memory store for OAuth states (in production, use Redis or database)
const stateStore = new Map<string, { createdAt: number }>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > fifteenMinutes) {
      stateStore.delete(state);
    }
  }
}, 10 * 60 * 1000);

/**
 * Initiate Google OAuth flow
 */
export const initiateGoogleAuth = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Generate and store state for CSRF protection
    const state = oauthService.generateOAuthState();
    stateStore.set(state, { createdAt: Date.now() });

    // Generate Google auth URL
    const authUrl = oauthService.generateGoogleAuthUrl(state);

    res.status(200).json({ authUrl, state });
  }
);

/**
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      throw new AppError(400, "Missing authorization code");
    }

    if (!state || typeof state !== "string") {
      throw new AppError(400, "Missing state parameter");
    }

    // Verify state to prevent CSRF attacks
    const storedState = stateStore.get(state);
    if (!storedState) {
      throw new AppError(400, "Invalid or expired state");
    }

    // Clean up used state
    stateStore.delete(state);

    // Handle OAuth callback
    const result = await oauthService.handleGoogleCallback(code);

    res.status(200).json(result);
  }
);

/**
 * Get linked provider accounts
 */
export const getLinkedProviders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;

    const providers = await oauthService.getLinkedProviders(userId);

    res.status(200).json({ providers });
  }
);

/**
 * Unlink a provider account
 */
export const unlinkProvider = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId;
    const { provider } = req.params;

    if (!provider) {
      throw new AppError(400, "Provider is required");
    }

    const result = await oauthService.unlinkProvider(userId, provider);

    res.status(200).json(result);
  }
);
