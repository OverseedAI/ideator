import api from './api';
import { Idea, Analysis } from '@/types';

export const createIdea = async (data: {
  title: string;
  description: string;
}): Promise<Idea> => {
  const response = await api.post<Idea>('/ideas', data);
  return response.data;
};

export const getUserIdeas = async (): Promise<Idea[]> => {
  const response = await api.get<Idea[]>('/ideas');
  return response.data;
};

export const getIdeaById = async (id: string): Promise<Idea> => {
  const response = await api.get<Idea>(`/ideas/${id}`);
  return response.data;
};

export const updateIdea = async (
  id: string,
  data: Partial<{ title: string; description: string; status: string }>
): Promise<Idea> => {
  const response = await api.put<Idea>(`/ideas/${id}`, data);
  return response.data;
};

export const deleteIdea = async (id: string): Promise<void> => {
  await api.delete(`/ideas/${id}`);
};

export const analyzeIdea = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/ideas/${id}/analyze`
  );
  return response.data;
};

export const getIdeaAnalyses = async (id: string): Promise<Analysis[]> => {
  const response = await api.get<Analysis[]>(`/ideas/${id}/analyses`);
  return response.data;
};
