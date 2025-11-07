import { config } from "@/config";
import { authStorage } from "@/lib/authStorage";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamOptions {
  onMessage: (chunk: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
  signal?: AbortSignal;
}

export const streamChatResponse = async (
  ideaId: string,
  messages: ChatMessage[],
  options: StreamOptions
): Promise<void> => {
  const { onMessage, onError, onComplete, signal } = options;
  const token = authStorage.getToken();

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/ideas/${ideaId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;

        // Handle data stream format from Vercel AI SDK
        if (line.startsWith("0:")) {
          // Text chunk
          const textData = line.substring(2).trim();
          if (textData) {
            try {
              const parsed = JSON.parse(textData);
              if (parsed) {
                onMessage(parsed);
              }
            } catch {
              // If not JSON, treat as plain text
              onMessage(textData);
            }
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        // Request was cancelled, don't treat as error
        onComplete();
        return;
      }
      onError(error);
    } else {
      onError(new Error("Unknown error occurred"));
    }
  }
};
