import React from "react";

type LiveStatus = "live" | "reconnecting" | "stale";

interface LiveStatusChipProps {
  status: LiveStatus;
  lastUpdatedMs?: number;
}

function colorFor(status: LiveStatus): string {
  switch (status) {
    case "live":
      return "#10b981"; // green
    case "reconnecting":
      return "#f59e0b"; // amber
    case "stale":
      return "#ef4444"; // red
    default:
      return "#9ca3af";
  }
}

export default function LiveStatusChip({ status, lastUpdatedMs }: LiveStatusChipProps) {
  const label = status === "live" ? "Live" : status === "reconnecting" ? "Reconnecting" : "Stale";
  const color = colorFor(status);

  return (
    <span
      aria-live="polite"
      aria-label={`Data status: ${label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        borderRadius: 12,
        border: `1px solid ${color}`,
        color,
        fontSize: 12,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}
      {typeof lastUpdatedMs === "number" && (
        <span style={{ opacity: 0.7 }}>· {new Date(lastUpdatedMs).toLocaleTimeString()}</span>
      )}
    </span>
  );
}


