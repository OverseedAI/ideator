import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import * as analysisService from "../services/analysisService";
import * as ideaService from "../services/ideaService";
import {
  analysisEvents,
  AnalysisSectionEvent,
  AnalysisStatusEvent,
} from "../services/analysisService";

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

export const streamAnalyses = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const idea = await ideaService.getIdeaById(id, userId);

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const flushHeaders = (res as Response & { flushHeaders?: () => void }).flushHeaders;
  if (flushHeaders) {
    flushHeaders.call(res);
  } else {
    res.write("\n");
  }

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("ideaStatus", { status: idea.status });

  idea.analyses?.forEach((analysis) => {
    sendEvent("analysis", analysis);
  });

  const onAnalysis = ({ ideaId, analysis }: AnalysisSectionEvent) => {
    if (ideaId !== id) {
      return;
    }
    sendEvent("analysis", analysis);
  };

  const onStatus = ({ ideaId, status }: AnalysisStatusEvent) => {
    if (ideaId !== id) {
      return;
    }
    sendEvent("ideaStatus", { status });
  };

  analysisEvents.on("analysis-section", onAnalysis);
  analysisEvents.on("analysis-status", onStatus);

  const heartbeat = setInterval(() => {
    res.write(":heartbeat\n\n");
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    analysisEvents.off("analysis-section", onAnalysis);
    analysisEvents.off("analysis-status", onStatus);
    res.end();
  });
});

export { ideaIdSchema };
