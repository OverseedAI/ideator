import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";

interface CreateTaskData {
  title: string;
  description?: string;
  order?: number;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  order?: number;
}

/**
 * Get all tasks for an idea
 */
export const getIdeaTasks = async (ideaId: string) => {
  const tasks = await prisma.task.findMany({
    where: { ideaId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return tasks;
};

/**
 * Create a new task for an idea
 */
export const createTask = async (ideaId: string, data: CreateTaskData) => {
  // Verify the idea exists
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  const task = await prisma.task.create({
    data: {
      ideaId,
      title: data.title,
      description: data.description,
      order: data.order ?? 0,
    },
  });

  return task;
};

/**
 * Update a task
 */
export const updateTask = async (taskId: string, data: UpdateTaskData) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.completed !== undefined && { completed: data.completed }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });

  return updatedTask;
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });
};

/**
 * Bulk create tasks (useful for initializing from analysis)
 */
export const bulkCreateTasks = async (ideaId: string, tasks: CreateTaskData[]) => {
  // Verify the idea exists
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  const createdTasks = await prisma.task.createMany({
    data: tasks.map((task, index) => ({
      ideaId,
      title: task.title,
      description: task.description,
      order: task.order ?? index,
    })),
  });

  // Fetch the created tasks to return them
  const allTasks = await getIdeaTasks(ideaId);

  return allTasks;
};
