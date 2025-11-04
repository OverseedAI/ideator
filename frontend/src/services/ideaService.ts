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

export const analyzeIdeaStream = (
  id: string,
  onSection: (analysis: Analysis) => void,
  onComplete: () => void,
  onError: (error: string) => void
): (() => void) => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const eventSource = new EventSource(
    `${baseURL}/ideas/${id}/analyze`,
    {
      withCredentials: false,
    }
  );

  // Manually set Authorization header via fetch and use that instead
  // EventSource doesn't support custom headers, so we'll use fetch with SSE
  eventSource.close();

  let controller: AbortController | null = new AbortController();

  fetch(`${baseURL}/ideas/${id}/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
    },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        let currentEvent = '';
        let currentData = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            currentData = line.slice(5).trim();
          } else if (line === '' && currentEvent && currentData) {
            // Complete event received
            try {
              const data = JSON.parse(currentData);

              if (currentEvent === 'section') {
                onSection(data);
              } else if (currentEvent === 'complete') {
                onComplete();
              } else if (currentEvent === 'error') {
                onError(data.message || 'Analysis failed');
              }
            } catch (err) {
              console.error('Failed to parse SSE data:', err);
            }

            currentEvent = '';
            currentData = '';
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        onError(error.message || 'Connection failed');
      }
    });

  // Return cleanup function
  return () => {
    if (controller) {
      controller.abort();
      controller = null;
    }
  };
};

export const getIdeaAnalyses = async (id: string): Promise<Analysis[]> => {
  const response = await api.get<Analysis[]>(`/ideas/${id}/analyses`);
  return response.data;
};
