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
    const response = await fetch(`${config.apiBaseUrl}/ideas/${ideaId}/chat`, {
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
      console.error("[Chat Service] Request failed:", errorData);
      onError({
        message: errorData.error || "Failed to stream chat",
        code: response.status,
      });
      return;
    }

    if (!response.body) {
      console.error("[Chat Service] No response body");
      onError({ message: "No response body", code: 500 });
      return;
    }

    console.log("[Chat Service] Starting to read stream...");
    console.log("[Chat Service] response.body:", response.body);
    console.log("[Chat Service] response.body.locked:", response.body.locked);

    const reader = response.body.getReader();
    console.log("[Chat Service] Got reader, starting to read chunks...");

    const decoder = new TextDecoder();
    let buffer = "";
    let currentEventType = "";
    let chunkCount = 0;
    let eventCount = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("[Chat Service] Stream ended", { chunkCount, eventCount });
        break;
      }

      chunkCount++;
      const chunk = decoder.decode(value, { stream: true });

      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim() || line.startsWith(":")) {
          continue; // Skip empty lines and comments (heartbeat)
        }

        if (line.startsWith("event:")) {
          currentEventType = line.substring(6).trim();
          continue;
        }

        if (line.startsWith("data:")) {
          const dataStr = line.substring(5).trim();

          try {
            const data = JSON.parse(dataStr);
            eventCount++;

            // Handle based on event type
            if (currentEventType === "token") {
              onToken(data.text, data.fullText);
            } else if (currentEventType === "done") {
              onComplete(data.fullText, data.usage);
            } else if (currentEventType === "error") {
              console.error("[Chat Service] Error event:", data);
              onError(data);
              return;
            } else if (currentEventType === "start") {
              // Start event - can be used for initialization if needed
            } else {
              console.warn("[Chat Service] Unknown event type:", currentEventType, data);
            }

            // Reset event type after processing
            currentEventType = "";
          } catch (parseError) {
            console.error("[Chat Service] Failed to parse SSE data:", dataStr, parseError);
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

  const response = await fetch(`${config.apiBaseUrl}/ideas/${ideaId}/chat/context`, {
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
