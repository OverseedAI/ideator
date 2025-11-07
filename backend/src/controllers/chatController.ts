import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";
import * as chatService from "../services/chatService";
import asyncHandler from "express-async-handler";

export const chatMessageSchema = z.object({
  body: z.object({
    messages: z.array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    ),
  }),
  params: z.object({
    ideaId: z.string(),
  }),
});

export const chat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { ideaId } = req.params;
  const { messages } = req.body;

  const result = await chatService.chatWithIdea(ideaId, userId, messages);

  // Set headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Pipe the stream to the response
  result.pipeDataStreamToResponse(res);
});
