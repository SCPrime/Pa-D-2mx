/**
 * ErrorDisplay Component
 * Standardized error UI for API errors and other failures
 */

import React from "react";
import EnhancedCard from "./EnhancedCard";
import StatusIndicator from "./StatusIndicator";

interface ErrorDisplayProps {
  /** Error message to display */
  error: string | Error | null;
  /** Optional title */
  title?: string;
  /** Optional retry function */
  onRetry?: () => void;
  /** Optional dismiss function */
  onDismiss?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = "Error",
  onRetry,
  onDismiss,
  size = "md",
  className = "",
}) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;
  const sizeClasses = {
    sm: "p-3 text-sm",
    md: "p-4 text-base",
    lg: "p-6 text-lg",
  };

  return (
    <EnhancedCard variant="error" className={`${sizeClasses[size]} ${className}`}>
      <div className="flex items-start gap-3">
        <StatusIndicator status="error" size={size} />
        <div className="flex-1">
          <h3 className="text-white font-bold mb-1">{title}</h3>
          <p className="text-slate-300">{errorMessage}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
};

export default ErrorDisplay;

