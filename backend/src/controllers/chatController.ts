import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import * as chatService from "../services/chatService";

const chatRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    message: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          timestamp: z.string().datetime().optional(),
        })
      )
      .max(50, "Conversation history too long")
      .optional(),
  }),
});

/**
 * Stream chat response using Server-Sent Events (SSE)
 */
export const streamChat = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id: ideaId } = req.params;
  const { message, conversationHistory } = req.body;

  // Validate request
  const validation = chatRequestSchema.safeParse({
    params: req.params,
    body: req.body,
  });

  if (!validation.success) {
    res.status(400).json({
      error: "Validation failed",
      details: validation.error.errors,
    });
    return;
  }

  // Parse conversation history to convert timestamp strings to Dates
  const parsedHistory = conversationHistory?.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
  }));

  // Set up SSE headers
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

  // Flush headers
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

  let aborted = false;

  // Handle client disconnect
  req.on("close", () => {
    aborted = true;
    res.end();
  });

  try {
    // Get streaming response
    const result = await chatService.streamChatResponse({
      ideaId,
      userId,
      message,
      conversationHistory: parsedHistory,
    });

    // Send start event
    sendEvent("start", { timestamp: new Date().toISOString() });

    let fullText = "";
    let tokenCount = 0;

    // Stream tokens
    for await (const textPart of result.textStream) {
      if (aborted) {
        break;
      }

      fullText += textPart;
      tokenCount++;

      sendEvent("token", {
        text: textPart,
        fullText,
        tokenCount,
      });
    }

    if (!aborted) {
      // Send completion event with usage stats
      const usage = await result.usage;

      sendEvent("done", {
        fullText,
        tokenCount,
        usage: {
          promptTokens: usage?.promptTokens || 0,
          completionTokens: usage?.completionTokens || 0,
          totalTokens: usage?.totalTokens || 0,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    if (!aborted) {
      sendEvent("error", {
        message: error.message || "An error occurred during chat generation",
        code: error.statusCode || 500,
        timestamp: new Date().toISOString(),
      });
    }
  } finally {
    if (!aborted) {
      res.end();
    }
  }
});

/**
 * Get idea context for the chat
 */
export const getChatContext = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { id: ideaId } = req.params;

    const context = await chatService.getIdeaContext(ideaId, userId);

    res.status(200).json(context);
  }
);
