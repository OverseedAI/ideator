import { useState } from "react";
import { ChatContext } from "@/types";
import { cn } from "@/utils/cn";

interface ChatContextPillProps {
  context: ChatContext | null;
  missingFields?: string[];
}

export const ChatContextPill = ({ context, missingFields = [] }: ChatContextPillProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!context) {
    return null;
  }

  const hasMissingFields = missingFields.length > 0;

  return (
    <div className="border-b border-border bg-accent/30 p-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 text-left hover:opacity-80 transition-opacity"
        aria-expanded={isExpanded}
        aria-controls="chat-context-details"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-primary flex-shrink-0"
          >
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-text-primary truncate block">
              {context.ideaName}
            </span>
            {hasMissingFields && (
              <span className="text-xs text-yellow-600">
                ⚠️ Some context fields missing
              </span>
            )}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn(
            "w-5 h-5 text-text-secondary transition-transform flex-shrink-0",
            isExpanded && "rotate-180"
          )}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isExpanded && (
        <div
          id="chat-context-details"
          className="mt-3 pt-3 border-t border-border space-y-2 text-sm"
        >
          <div>
            <span className="font-medium text-text-primary">Description:</span>
            <p className="text-text-secondary mt-1">{context.ideaDescription}</p>
          </div>

          {context.analyses && context.analyses.length > 0 && (
            <div>
              <span className="font-medium text-text-primary">
                Available Analyses ({context.analyses.length}):
              </span>
              <ul className="mt-1 space-y-1">
                {context.analyses.map((analysis) => (
                  <li key={analysis.id} className="text-text-secondary text-xs">
                    • {analysis.title}: {analysis.summary}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasMissingFields && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <span className="text-xs font-medium text-yellow-800">
                Missing fields: {missingFields.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
