import { useState, useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType, ChatContext, ChatError } from "@/types";
import { chatService } from "@/services/chat";
import { cn } from "@/utils/cn";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatContextPill } from "./ChatContextPill";
import { ChatErrorBanner } from "./ChatErrorBanner";
import { ChatEmptyState } from "./ChatEmptyState";

interface ChatDrawerProps {
  ideaId: string;
  isOpen: boolean;
  onClose: () => void;
  onAnalyticsEvent?: (event: string, data?: any) => void;
}

export const ChatDrawer = ({ ideaId, isOpen, onClose, onAnalyticsEvent }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [context, setContext] = useState<ChatContext | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [streamingContent, setStreamingContent] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Load context when drawer opens or ideaId changes
  useEffect(() => {
    if (isOpen && ideaId) {
      loadContext();
    }
  }, [isOpen, ideaId]);

  // Analytics: drawer opened/closed
  useEffect(() => {
    if (onAnalyticsEvent) {
      onAnalyticsEvent(isOpen ? "chat_drawer_opened" : "chat_drawer_closed", {
        ideaId,
        messageCount: messages.length,
      });
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Focus trap when drawer is open
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }

        if (e.key === "Escape") {
          handleClose();
        }
      };

      document.addEventListener("keydown", handleTabKey);
      return () => document.removeEventListener("keydown", handleTabKey);
    }
  }, [isOpen]);

  const loadContext = async () => {
    setIsLoadingContext(true);
    setError(null);
    try {
      const ctx = await chatService.getChatContext(ideaId);
      setContext(ctx);

      onAnalyticsEvent?.("chat_context_loaded", {
        ideaId,
        analysisCount: ctx.analyses.length,
      });
    } catch (err: any) {
      setError({
        message: err.message || "Failed to load context",
        code: err.statusCode || 500,
      });
    } finally {
      setIsLoadingContext(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (message: string) => {
    if (isStreaming) {
      // Show toast warning
      setError({
        message: "Generation in progress. Please stop the current generation first.",
        code: 409,
      });
      return;
    }

    setLastUserMessage(message);
    setError(null);

    // Add user message
    const userMessage: ChatMessageType = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Start streaming
    startStreaming(message);
  };

  const startStreaming = async (message: string) => {
    setIsStreaming(true);
    setStreamingContent("");
    const startTime = Date.now();

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    onAnalyticsEvent?.("chat_message_sent", { ideaId, messageLength: message.length });

    await chatService.streamChat({
      ideaId,
      message,
      conversationHistory: messages,
      onToken: (_text: string, fullText: string) => {
        setStreamingContent(fullText);
      },
      onComplete: (fullText: string, usage?: any) => {
        // Add assistant message
        const assistantMessage: ChatMessageType = {
          role: "assistant",
          content: fullText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");
        setIsStreaming(false);
        abortControllerRef.current = null;

        const latency = Date.now() - startTime;
        onAnalyticsEvent?.("chat_message_completed", {
          ideaId,
          latency,
          tokenCount: usage?.totalTokens,
        });
      },
      onError: (err: ChatError) => {
        setError(err);
        setStreamingContent("");
        setIsStreaming(false);
        abortControllerRef.current = null;

        onAnalyticsEvent?.("chat_error", {
          ideaId,
          errorCode: err.code,
          errorMessage: err.message,
        });
      },
      signal: abortController.signal,
    });
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();

      // Keep partial content
      if (streamingContent) {
        const partialMessage: ChatMessageType = {
          role: "assistant",
          content: streamingContent + " [Stopped]",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, partialMessage]);
      }

      setStreamingContent("");
      setIsStreaming(false);
      abortControllerRef.current = null;

      onAnalyticsEvent?.("chat_stopped", { ideaId });
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      setError(null);
      startStreaming(lastUserMessage);
      onAnalyticsEvent?.("chat_retry", { ideaId });
    }
  };

  const handleResume = () => {
    if (lastUserMessage) {
      startStreaming(lastUserMessage);
      onAnalyticsEvent?.("chat_resume", { ideaId });
    }
  };

  const handleClose = () => {
    // Stop streaming if active
    if (isStreaming) {
      handleStop();
    }
    onClose();
  };

  // Check for missing context fields
  const missingFields: string[] = [];
  if (context) {
    if (!context.ideaName) missingFields.push("ideaName");
    if (!context.ideaDescription) missingFields.push("ideaDescription");
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[480px] bg-background shadow-2xl z-50",
          "transform transition-transform duration-300 ease-in-out",
          "flex flex-col border-l border-border",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
                clipRule="evenodd"
              />
            </svg>
            <h2 id="chat-drawer-title" className="text-lg font-semibold text-text-primary">
              AI Assistant
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-background transition-colors"
            aria-label="Close chat drawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Context Pill */}
        {!isLoadingContext && context && (
          <ChatContextPill context={context} missingFields={missingFields} />
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto" role="log" aria-live="polite" aria-atomic="false">
          {isLoadingContext ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 text-primary mx-auto mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm text-text-secondary">Loading context...</p>
              </div>
            </div>
          ) : messages.length === 0 && !streamingContent ? (
            <ChatEmptyState />
          ) : (
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}

              {/* Streaming message */}
              {streamingContent && (
                <ChatMessage
                  message={{
                    role: "assistant",
                    content: streamingContent,
                    timestamp: new Date(),
                  }}
                  isStreaming={true}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <ChatErrorBanner
            error={error}
            onRetry={handleRetry}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Streaming Controls */}
        {isStreaming && (
          <div className="px-4 py-2 bg-accent/20 border-t border-border flex items-center justify-between">
            <span className="text-sm text-text-secondary flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating response...
            </span>
            <button
              onClick={handleStop}
              className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {/* Show Resume button if we have a last message and not streaming */}
        {!isStreaming && lastUserMessage && streamingContent === "" && messages.length > 0 && (
          <div className="px-4 py-2 bg-accent/20 border-t border-border flex items-center justify-center gap-2">
            <button
              onClick={handleResume}
              className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
            >
              Resume
            </button>
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isStreaming || isLoadingContext} />
      </div>
    </>
  );
};
