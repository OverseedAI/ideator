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

export const analyzeIdeaStream = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in nginx

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    try {
      // Start analysis with progress callback
      await analysisService.analyzeIdea(id, userId, (analysis) => {
        // Send each completed analysis section as SSE event
        res.write(
          `data: ${JSON.stringify({
            type: "analysis",
            data: analysis,
          })}\n\n`
        );
      });

      // Send completion message
      res.write(`data: ${JSON.stringify({ type: "completed" })}\n\n`);
      res.end();
    } catch (error) {
      // Send error message
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Analysis failed",
        })}\n\n`
      );
      res.end();
    }
  }
);

export const getAnalyses = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const analyses = await analysisService.getAnalyses(id, userId);

  res.status(200).json(analyses);
});

export { ideaIdSchema };
