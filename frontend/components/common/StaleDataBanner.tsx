import React from "react";

interface StaleDataBannerProps {
  lastUpdatedMs: number;
  thresholdMs?: number;
}

export default function StaleDataBanner({ lastUpdatedMs, thresholdMs = 30_000 }: StaleDataBannerProps) {
  const age = Date.now() - lastUpdatedMs;
  const isStale = age > thresholdMs;
  if (!isStale) return null;

  const seconds = Math.floor(age / 1000);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid #ef4444",
        color: "#ef4444",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
      }}
    >
      Data may be stale (last update {seconds}s ago). Attempting to reconnect…
    </div>
  );
}


