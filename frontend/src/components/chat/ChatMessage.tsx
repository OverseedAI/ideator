import { ChatMessage as ChatMessageType } from "@/types";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3 p-4 rounded-lg", isUser ? "bg-primary/5" : "bg-surface")}
      role="article"
      aria-label={`${isUser ? "User" : "Assistant"} message`}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          isUser ? "bg-primary text-white" : "bg-accent text-primary"
        )}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-sm text-text-primary">
            {isUser ? "You" : "AI Assistant"}
          </span>
          <span className="text-xs text-text-secondary">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>

        <div className="text-text-primary whitespace-pre-wrap break-words prose prose-sm max-w-none">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};
