/**
 * LoadingSkeleton Component
 * Reusable loading skeleton for better UX during data fetching
 */

import React from "react";

interface LoadingSkeletonProps {
  /** Number of skeleton lines/bars to show */
  lines?: number;
  /** Height of each skeleton line */
  height?: string;
  /** Width of skeleton (can be percentage or pixels) */
  width?: string;
  /** Spacing between skeleton elements */
  spacing?: string;
  /** Additional CSS classes */
  className?: string;
  /** Variant: 'text', 'card', 'table', 'list' */
  variant?: "text" | "card" | "table" | "list";
  /** Show circular skeleton (for avatars) */
  circular?: boolean;
  /** Animation speed */
  speed?: "slow" | "normal" | "fast";
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  height = "1rem",
  width = "100%",
  spacing = "0.5rem",
  className = "",
  variant = "text",
  circular = false,
  speed = "normal",
}) => {
  const speedClass = {
    slow: "animate-pulse",
    normal: "animate-pulse",
    fast: "animate-pulse",
  }[speed];

  // Circular skeleton (for avatars)
  if (circular) {
    return (
      <div
        className={`rounded-full bg-slate-700 ${speedClass} ${className}`}
        style={{
          width: width,
          height: width,
          aspectRatio: "1 / 1",
        }}
      />
    );
  }

  // Card variant
  if (variant === "card") {
    return (
      <div
        className={`rounded-lg bg-slate-800 border border-slate-700 p-4 ${speedClass} ${className}`}
        style={{ width, minHeight: "200px" }}
      >
        <div
          className="bg-slate-700 rounded mb-3"
          style={{ height: "1.5rem", width: "60%" }}
        />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-700 rounded"
              style={{
                height,
                width: i === lines - 1 ? "80%" : "100%",
                marginBottom: spacing,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Table variant
  if (variant === "table") {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4"
            style={{ marginBottom: spacing }}
          >
            <div
              className="bg-slate-700 rounded"
              style={{ height, width: "20%", flexShrink: 0 }}
            />
            <div
              className="bg-slate-700 rounded"
              style={{ height, width: "30%" }}
            />
            <div
              className="bg-slate-700 rounded"
              style={{ height, width: "25%" }}
            />
            <div
              className="bg-slate-700 rounded"
              style={{ height, width: "25%" }}
            />
          </div>
        ))}
      </div>
    );
  }

  // List variant
  if (variant === "list") {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{ marginBottom: spacing }}
          >
            <div
              className="bg-slate-700 rounded-full"
              style={{ width: "2.5rem", height: "2.5rem", flexShrink: 0 }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="bg-slate-700 rounded"
                style={{ height, width: i === 0 ? "70%" : "100%" }}
              />
              {i === 0 && (
                <div
                  className="bg-slate-700 rounded"
                  style={{ height: "0.875rem", width: "50%" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default text variant
  return (
    <div className={`space-y-2 ${className}`} style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-700 rounded ${speedClass}`}
          style={{
            height,
            width: i === lines - 1 ? "60%" : "100%",
            marginBottom: spacing,
          }}
        />
      ))}
    </div>
  );
};

/**
 * CardSkeleton - Pre-configured skeleton for cards
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => <LoadingSkeleton variant="card" className={className} />;

/**
 * TableSkeleton - Pre-configured skeleton for tables
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  className?: string;
}> = ({ rows = 5, className = "" }) => (
  <LoadingSkeleton variant="table" lines={rows} className={className} />
);

/**
 * ListSkeleton - Pre-configured skeleton for lists
 */
export const ListSkeleton: React.FC<{
  items?: number;
  className?: string;
}> = ({ items = 5, className = "" }) => (
  <LoadingSkeleton variant="list" lines={items} className={className} />
);

export default LoadingSkeleton;

