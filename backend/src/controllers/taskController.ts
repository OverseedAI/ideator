import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import * as taskService from "../services/taskService";
import * as ideaService from "../services/ideaService";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500),
    description: z.string().max(5000).optional(),
    order: z.number().int().optional(),
  }),
});

export const bulkCreateTasksSchema = z.object({
  body: z.object({
    tasks: z.array(
      z.object({
        title: z.string().min(1).max(500),
        description: z.string().max(5000).optional(),
        order: z.number().int().optional(),
      })
    ),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(5000).optional(),
    completed: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

export const ideaIdSchema = z.object({
  params: z.object({
    ideaId: z.string().uuid(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
  }),
});

/**
 * Get all tasks for an idea
 */
export const getIdeaTasks = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { ideaId } = req.params;

    // Verify the user owns the idea
    await ideaService.getIdeaById(ideaId, userId);

    const tasks = await taskService.getIdeaTasks(ideaId);

    res.status(200).json(tasks);
  }
);

/**
 * Create a new task for an idea
 */
export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { ideaId } = req.params;
    const data = req.body;

    // Verify the user owns the idea
    await ideaService.getIdeaById(ideaId, userId);

    const task = await taskService.createTask(ideaId, data);

    res.status(201).json(task);
  }
);

/**
 * Bulk create tasks for an idea
 */
export const bulkCreateTasks = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { ideaId } = req.params;
    const { tasks } = req.body;

    // Verify the user owns the idea
    await ideaService.getIdeaById(ideaId, userId);

    const createdTasks = await taskService.bulkCreateTasks(ideaId, tasks);

    res.status(201).json(createdTasks);
  }
);

/**
 * Update a task
 */
export const updateTask = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { ideaId, taskId } = req.params;
    const data = req.body;

    // Verify the user owns the idea
    await ideaService.getIdeaById(ideaId, userId);

    const task = await taskService.updateTask(taskId, data);

    res.status(200).json(task);
  }
);

/**
 * Delete a task
 */
export const deleteTask = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { ideaId, taskId } = req.params;

    // Verify the user owns the idea
    await ideaService.getIdeaById(ideaId, userId);

    await taskService.deleteTask(taskId);

    res.status(200).json({ message: "Task deleted successfully" });
  }
);
