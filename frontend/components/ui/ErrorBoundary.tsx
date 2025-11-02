/**
 * ErrorBoundary Component
 * Catches React errors and displays user-friendly error UI
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import EnhancedCard from "./EnhancedCard";
import StatusIndicator from "./StatusIndicator";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <EnhancedCard variant="error" className="p-6">
          <div className="flex items-start gap-4">
            <StatusIndicator status="error" size="md" />
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">Something went wrong</h3>
              <p className="text-slate-300 mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </EnhancedCard>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

