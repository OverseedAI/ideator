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

  // Ensure the idea exists and belongs to the requester before establishing the stream
  await ideaService.getIdeaById(id, userId);

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

  let initialSnapshotSent = false;
  const analysisBuffer: AnalysisSectionEvent[] = [];
  const statusBuffer: AnalysisStatusEvent[] = [];

  const onAnalysis = (event: AnalysisSectionEvent) => {
    if (event.ideaId !== id) {
      return;
    }

    if (!initialSnapshotSent) {
      analysisBuffer.push(event);
      return;
    }

    sendEvent("analysis", event.analysis);
  };

  const onStatus = (event: AnalysisStatusEvent) => {
    if (event.ideaId !== id) {
      return;
    }

    if (!initialSnapshotSent) {
      statusBuffer.push(event);
      return;
    }

    sendEvent("ideaStatus", { status: event.status });
  };

  analysisEvents.on("analysis-section", onAnalysis);
  analysisEvents.on("analysis-status", onStatus);

  const snapshot = await ideaService.getIdeaById(id, userId);
  sendEvent("ideaStatus", { status: snapshot.status });

  const snapshotAnalysisIds = new Set((snapshot.analyses ?? []).map((analysis) => analysis.id));
  snapshot.analyses?.forEach((analysis) => {
    sendEvent("analysis", analysis);
  });

  initialSnapshotSent = true;

  if (analysisBuffer.length > 0) {
    const bufferedAnalyses = analysisBuffer.splice(0);
    bufferedAnalyses.forEach(({ analysis }) => {
      if (!snapshotAnalysisIds.has(analysis.id)) {
        sendEvent("analysis", analysis);
      }
    });
  }

  if (statusBuffer.length > 0) {
    const bufferedStatuses = statusBuffer.splice(0);
    bufferedStatuses.forEach(({ status }) => {
      sendEvent("ideaStatus", { status });
    });
  }

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
