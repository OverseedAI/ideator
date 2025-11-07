import { config } from "@/config";
import { authStorage } from "@/lib/authStorage";
import { ChatMessage, ChatContext } from "@/types";

export interface StreamChatParams {
  ideaId: string;
  message: string;
  conversationHistory?: ChatMessage[];
  onToken: (text: string, fullText: string) => void;
  onComplete: (fullText: string, usage?: any) => void;
  onError: (error: any) => void;
  signal?: AbortSignal;
}

/**
 * Stream chat response using SSE
 */
export const streamChat = async ({
  ideaId,
  message,
  conversationHistory = [],
  onToken,
  onComplete,
  onError,
  signal,
}: StreamChatParams): Promise<void> => {
  const token = authStorage.getToken();

  if (!token) {
    onError({ message: "Not authenticated", code: 401 });
    return;
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/ideas/${ideaId}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      onError({
        message: errorData.error || "Failed to stream chat",
        code: response.status,
      });
      return;
    }

    if (!response.body) {
      onError({ message: "No response body", code: 500 });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim() || line.startsWith(":")) {
          continue; // Skip empty lines and comments (heartbeat)
        }

        if (line.startsWith("event:")) {
          continue; // Skip event type line
        }

        if (line.startsWith("data:")) {
          const dataStr = line.substring(5).trim();

          try {
            const data = JSON.parse(dataStr);

            // Determine event type from data or previous event line
            if (data.text !== undefined) {
              // Token event
              onToken(data.text, data.fullText);
            } else if (data.fullText !== undefined && data.usage !== undefined) {
              // Done event
              onComplete(data.fullText, data.usage);
            } else if (data.message && data.code) {
              // Error event
              onError(data);
              return;
            }
          } catch (parseError) {
            console.error("Failed to parse SSE data:", dataStr, parseError);
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      // Request was cancelled - this is expected
      return;
    }

    onError({
      message: error.message || "Network error",
      code: 0,
    });
  }
};

/**
 * Get chat context for an idea
 */
export const getChatContext = async (ideaId: string): Promise<ChatContext> => {
  const token = authStorage.getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${config.apiBaseUrl}/api/v1/ideas/${ideaId}/chat/context`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch chat context");
  }

  return response.json();
};

export const chatService = {
  streamChat,
  getChatContext,
};
