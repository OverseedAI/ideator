import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { cn } from "@/utils/cn";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = "Ask a question about your idea...",
  maxLength = 5000,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = message.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;
  const canSend = message.trim().length > 0 && !isOverLimit && !disabled;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!canSend) return;

    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSend(trimmedMessage);
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="border-t border-border bg-surface p-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12",
            "text-text-primary placeholder:text-text-secondary",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all"
          )}
          aria-label="Chat message input"
          aria-describedby="chat-input-help"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "absolute right-2 bottom-2 p-2 rounded-md transition-colors",
            canSend
              ? "bg-primary text-white hover:bg-primary-dark"
              : "bg-surface text-text-secondary cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

      {/* Helper text */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span id="chat-input-help" className="text-text-secondary">
          Press <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">Enter</kbd> to
          send,{" "}
          <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">Shift+Enter</kbd>{" "}
          for new line
        </span>
        {isNearLimit && (
          <span className={cn("font-medium", isOverLimit ? "text-red-600" : "text-yellow-600")}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
