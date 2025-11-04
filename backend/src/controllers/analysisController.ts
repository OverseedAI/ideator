import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as analysisService from '../services/analysisService';

const ideaIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const analyzeIdea = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Callback to send SSE events
    const sendEvent = (eventType: string, data: any) => {
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      await analysisService.analyzeIdea(id, userId, sendEvent);

      // Send completion event
      sendEvent('complete', { message: 'Analysis completed successfully' });
      res.end();
    } catch (error) {
      // Send error event
      sendEvent('error', {
        message: error instanceof Error ? error.message : 'Analysis failed'
      });
      res.end();
    }
  }
);

export const getAnalyses = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const analyses = await analysisService.getAnalyses(id, userId);

    res.status(200).json(analyses);
  }
);

export { ideaIdSchema };
