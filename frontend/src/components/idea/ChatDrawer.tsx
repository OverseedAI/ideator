import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare, StopCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";
import { streamChatResponse, ChatMessage } from "@/services/chatService";

interface ChatDrawerProps {
  ideaId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DisplayMessage extends ChatMessage {
  id: string;
  isStreaming?: boolean;
}

export const ChatDrawer = ({ ideaId, isOpen, onClose }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);

      // Mark last message as complete
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: DisplayMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Prepare conversation history
    const conversationHistory: ChatMessage[] = [
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: userMessage.content,
      },
    ];

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      await streamChatResponse(ideaId, conversationHistory, {
        signal: abortControllerRef.current.signal,
        onMessage: (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        onError: (err: Error) => {
          setError(err.message || "An error occurred while streaming the response");
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
            )
          );
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        onComplete: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
            )
          );
          setIsLoading(false);
          abortControllerRef.current = null;
        },
      });
    } catch (err) {
      // Error already handled in onError callback
      console.error("Chat error:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 transition-opacity duration-300 z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-in-out z-50",
          "w-full sm:w-[480px] md:w-[560px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">AI Chat Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-background"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <MessageSquare size={48} className="text-text-secondary opacity-50 mb-4" />
              <p className="text-text-secondary text-lg mb-2">Start a conversation</p>
              <p className="text-text-secondary text-sm">
                Ask me anything about your business idea. I have access to all your analysis data.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-2.5 break-words",
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-background text-text-primary border border-border"
                )}
              >
                <p className="whitespace-pre-wrap">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          ))}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your idea..."
              disabled={isLoading}
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary transition-colors",
                "placeholder:text-text-secondary",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "max-h-32 overflow-y-auto"
              )}
            />
            {isLoading ? (
              <Button
                type="button"
                onClick={handleCancel}
                variant="danger"
                className="self-end"
                title="Cancel"
              >
                <StopCircle size={20} />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="self-end"
                title="Send message"
              >
                <Send size={20} />
              </Button>
            )}
          </form>
          <p className="text-xs text-text-secondary mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};
