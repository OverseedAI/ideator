import { config } from "@/config";
import { authStorage } from "@/lib/authStorage";
import { ChatMessage } from "@/types";

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
 * Stream chat response using EventSource (alternative to fetch for SSE)
 * EventSource handles SSE automatically but doesn't support POST or custom headers easily
 * So we'll still use fetch but with a simpler approach
 */
export const streamChatWithEventSource = async ({
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

  console.log("[EventSource Chat] Starting stream request");

  // EventSource doesn't support POST, so we need to use fetch
  // But let's try a simpler fetch approach with better error handling

  try {
    const response = await fetch(`${config.apiBaseUrl}/ideas/${ideaId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
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

    console.log("[EventSource Chat] Response status:", response.status);
    console.log(
      "[EventSource Chat] Response headers:",
      Object.fromEntries(response.headers.entries())
    );

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

    // Use getReader with different approach
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let chunkCount = 0;

    try {
      while (true) {
        // Read chunk
        console.log("Looping again");
        const { done, value } = await reader.read();
        console.log("Reader Chunk: ", value, done);

        if (done) {
          console.log("[EventSource Chat] Stream complete after", chunkCount, "chunks");
          break;
        }

        chunkCount++;
        const text = decoder.decode(value, { stream: true });
        console.log(`[EventSource Chat] Chunk ${chunkCount} (${text.length} bytes):`, text);

        // Add to buffer
        buffer += text;

        // Process complete messages (ending with \n\n)
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // Keep incomplete message in buffer

        for (const message of messages) {
          if (!message.trim()) continue;

          const lines = message.split("\n");
          let event = "";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              event = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
              data = line.substring(5).trim();
            } else if (line.startsWith(":")) {
              // Comment/heartbeat - ignore
              continue;
            }
          }

          if (data) {
            try {
              const parsed = JSON.parse(data);
              console.log("[EventSource Chat] Event:", event, "Data:", parsed);

              if (event === "token") {
                onToken(parsed.text, parsed.fullText);
              } else if (event === "done") {
                onComplete(parsed.fullText, parsed.usage);
              } else if (event === "error") {
                onError(parsed);
                return;
              }
            } catch (e) {
              console.error("[EventSource Chat] Failed to parse data:", data, e);
            }
          }
        }
      }
    } finally {
      console.log("Releasing Lock.");
      reader.releaseLock();
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("[EventSource Chat] Request aborted");
      return;
    }

    console.error("[EventSource Chat] Error:", error);
    onError({
      message: error.message || "Network error",
      code: 0,
    });
  }
};
