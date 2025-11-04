import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import * as profileService from "../services/profileService";

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    profileData: z
      .object({
        expertise: z.array(z.string()).optional(),
        funding: z.string().optional(),
        followers: z.number().optional(),
        linkedInUrl: z.string().url().optional(),
        company: z.string().optional(),
        experience: z.string().optional(),
        industries: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const profile = await profileService.getProfile(userId);

  res.status(200).json(profile);
});

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const data = req.body;

    const profile = await profileService.updateProfile(userId, data);

    res.status(200).json(profile);
  }
);

export { updateProfileSchema };
