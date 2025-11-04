import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import * as ideaService from "../services/ideaService";

const createIdeaSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
  }),
});

const updateIdeaSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    status: z.string().optional(),
  }),
});

const ideaIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const createIdea = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const data = req.body;

  const idea = await ideaService.createIdea(userId, data);

  res.status(201).json(idea);
});

export const getUserIdeas = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const ideas = await ideaService.getUserIdeas(userId);

  res.status(200).json(ideas);
});

export const getIdeaById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const idea = await ideaService.getIdeaById(id, userId);

  res.status(200).json(idea);
});

export const updateIdea = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const data = req.body;

  const idea = await ideaService.updateIdea(id, userId, data);

  res.status(200).json(idea);
});

export const deleteIdea = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const result = await ideaService.deleteIdea(id, userId);

  res.status(200).json(result);
});

export { createIdeaSchema, updateIdeaSchema, ideaIdSchema };
