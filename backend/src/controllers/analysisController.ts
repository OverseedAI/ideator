import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import * as analysisService from "../services/analysisService";

const ideaIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const analyzeIdea = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const result = await analysisService.analyzeIdea(id, userId);

  res.status(200).json(result);
});

export const getAnalyses = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const analyses = await analysisService.getAnalyses(id, userId);

  res.status(200).json(analyses);
});

export { ideaIdSchema };
