import { Component, ReactNode } from "react";
import { Button } from "@/components/common/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Unhandled error", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
          <h1 className="text-2xl font-semibold text-text-primary">Something went wrong</h1>
          <p className="mt-2 max-w-md text-text-secondary">
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={this.handleReset}>Reload</Button>
            <Button
              variant="ghost"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Dismiss
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
