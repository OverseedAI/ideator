export const ChatEmptyState = () => {
  const suggestions = [
    "What are the biggest risks for this idea?",
    "How can I validate this idea quickly?",
    "What should my first steps be?",
    "Who are my competitors?",
    "What pricing model would work best?",
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-primary"
          >
            <path
              fillRule="evenodd"
              d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Ask me anything about your idea
          </h3>
          <p className="text-sm text-text-secondary">
            I have access to your idea details and all the analyses. Ask questions, get insights, and
            explore next steps.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Try asking:
          </p>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="text-sm text-text-secondary bg-surface border border-border rounded-lg px-3 py-2 text-left"
              >
                "{suggestion}"
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
