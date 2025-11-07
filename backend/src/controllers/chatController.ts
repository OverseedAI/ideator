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
    console.error("[Chat Controller] Validation failed:", validation.error.errors);
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

  // Set up SSE headers - use writeHead to send all at once
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
    // CORS headers for SSE
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
  });

  // Send initial comment to establish connection
  res.write(": heartbeat\n\n");

  const sendEvent = (event: string, data: unknown) => {
    const eventStr = `event: ${event}\n`;
    const dataStr = `data: ${JSON.stringify(data)}\n\n`;
    console.log(`[Chat Controller] Sending event: ${event}`, data);
    const written1 = res.write(eventStr);
    const written2 = res.write(dataStr);
    console.log(`[Chat Controller] Write status: ${written1}, ${written2}`);
  };

  const aborted = false;

  // Handle client disconnect
  // TODO: This seems to be called for no reason from the frontend, bring back later
  // Check https://nodejs.org/api/http.html#class-httpclientrequest for potential solution
  // req.on("close", (event) => {
  //   console.log("[Chat Controller] Client disconnected:", event);
  //   aborted = true;
  // });

  try {
    // Send start event IMMEDIATELY to keep connection alive
    sendEvent("start", { timestamp: new Date().toISOString() });

    // Get streaming response
    const result = await chatService.streamChatResponse({
      ideaId,
      userId,
      message,
      conversationHistory: parsedHistory,
    });

    let fullText = "";
    let tokenCount = 0;

    // Stream tokens - THIS MUST COMPLETE BEFORE FUNCTION RETURNS
    for await (const textPart of result.textStream) {
      if (aborted) {
        console.log("[Chat Controller] Stream aborted by client");
        break;
      }

      fullText += textPart;
      tokenCount++;

      if (tokenCount % 10 === 0) {
        console.log(`[Chat Controller] Token ${tokenCount}, fullText length: ${fullText.length}`);
      }

      sendEvent("token", {
        text: textPart,
        fullText,
        tokenCount,
      });
    }

    if (!aborted) {
      // Send completion event
      sendEvent("done", {
        fullText,
        tokenCount,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error("[Chat Controller] Error during streaming:", error);
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
