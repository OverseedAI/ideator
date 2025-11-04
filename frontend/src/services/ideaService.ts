import api from "./api";
import { Idea, Analysis } from "@/types";

export const createIdea = async (data: { title: string; description: string }): Promise<Idea> => {
  const response = await api.post<Idea>("/ideas", data);
  return response.data;
};

export const getUserIdeas = async (): Promise<Idea[]> => {
  const response = await api.get<Idea[]>("/ideas");
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

export const analyzeIdea = async (id: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/ideas/${id}/analyze`);
  return response.data;
};

export const analyzeIdeaStream = (
  id: string,
  onSection: (analysis: Analysis) => void,
  onComplete: () => void,
  onError: (error: string) => void
): (() => void) => {
  let cancelled = false;
  let processedLength = 0;
  let buffer = '';

  const parseSSEChunk = (chunk: string) => {
    buffer += chunk;
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
  };

  api
    .post(`/ideas/${id}/analyze`, null, {
      responseType: 'text',
      headers: {
        Accept: 'text/event-stream',
      },
      onDownloadProgress: (progressEvent) => {
        if (cancelled) return;

        const xhr = progressEvent.event.target as XMLHttpRequest;
        const responseText = xhr.responseText;

        // Get only the new part since last processing
        const newChunk = responseText.slice(processedLength);
        processedLength = responseText.length;

        if (newChunk) {
          parseSSEChunk(newChunk);
        }
      },
      adapter: 'xhr', // Force XHR adapter for onDownloadProgress support
    })
    .then(() => {
      if (!cancelled) {
        // Final parse in case there's remaining data
        if (buffer) {
          parseSSEChunk('\n\n'); // Force final parse
        }
      }
    })
    .catch((error) => {
      if (!cancelled && !api.isCancel?.(error)) {
        onError(error.response?.data?.error || error.message || 'Connection failed');
      }
    });

  // Return cleanup function
  return () => {
    cancelled = true;
  };
};

export const getIdeaAnalyses = async (id: string): Promise<Analysis[]> => {
  const response = await api.get<Analysis[]>(`/ideas/${id}/analyses`);
  return response.data;
};
