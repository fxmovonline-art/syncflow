"use client";

import React, { ReactNode } from "react";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ERROR_BOUNDARY]", error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4">
            <div className="max-w-md w-full space-y-6 text-center">
              <div className="flex justify-center">
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Something went wrong
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={this.resetError}
                  className="w-full"
                >
                  Try again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-zinc-500 dark:text-zinc-400">
                    Error details
                  </summary>
                  <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded text-xs overflow-auto text-red-600 dark:text-red-400">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
