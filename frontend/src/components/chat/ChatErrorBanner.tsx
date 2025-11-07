import { ChatError } from "@/types";

interface ChatErrorBannerProps {
  error: ChatError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ChatErrorBanner = ({ error, onRetry, onDismiss }: ChatErrorBannerProps) => {
  const getErrorTitle = (code?: number) => {
    if (!code) return "Network Error";
    if (code >= 500) return "Server Error";
    if (code === 429) return "Rate Limit Exceeded";
    if (code === 401) return "Authentication Failed";
    if (code >= 400) return "Request Error";
    return "Error";
  };

  const getErrorDescription = (code?: number, message?: string) => {
    if (!code) return message || "Unable to connect to the server. Please check your connection.";
    if (code >= 500) return "The server encountered an error. Please try again later.";
    if (code === 429) return "Too many requests. Please wait a moment before trying again.";
    if (code === 401) return "Your session has expired. Please log in again.";
    if (code === 403) return "Content was filtered or blocked. Please rephrase your message.";
    return message || "An error occurred while processing your request.";
  };

  return (
    <div
      className="mx-4 my-2 p-4 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-red-800">{getErrorTitle(error.code)}</h4>
          <p className="text-sm text-red-700 mt-1">{getErrorDescription(error.code, error.message)}</p>
          {error.requestId && (
            <p className="text-xs text-red-600 mt-1">Request ID: {error.requestId}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
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
          )}
        </div>
      </div>
    </div>
  );
};
