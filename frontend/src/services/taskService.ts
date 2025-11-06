import api from "./api";
import { Task } from "@/types";

export const getIdeaTasks = async (ideaId: string): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/ideas/${ideaId}/tasks`);
  return response.data;
};

export const createTask = async (
  ideaId: string,
  data: { title: string; description?: string; order?: number }
): Promise<Task> => {
  const response = await api.post<Task>(`/ideas/${ideaId}/tasks`, data);
  return response.data;
};

export const bulkCreateTasks = async (
  ideaId: string,
  tasks: { title: string; description?: string; order?: number }[]
): Promise<Task[]> => {
  const response = await api.post<Task[]>(`/ideas/${ideaId}/tasks/bulk`, { tasks });
  return response.data;
};

export const updateTask = async (
  ideaId: string,
  taskId: string,
  data: Partial<{ title: string; description?: string; completed: boolean; order: number }>
): Promise<Task> => {
  const response = await api.put<Task>(`/ideas/${ideaId}/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (ideaId: string, taskId: string): Promise<void> => {
  await api.delete(`/ideas/${ideaId}/tasks/${taskId}`);
};
