import React from "react";

interface SimTimeBadgeProps {
  simTime: Date | string;
  mode: "replay" | "live";
}

export default function SimTimeBadge({ simTime, mode }: SimTimeBadgeProps) {
  const value = typeof simTime === "string" ? new Date(simTime) : simTime;
  const text = `${value.toLocaleDateString()} ${value.toLocaleTimeString()}`;
  const isReplay = mode === "replay";

  return (
    <span
      title={isReplay ? "Anti-look-ahead enabled" : "Live mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: 12,
        border: `1px solid ${isReplay ? "#60a5fa" : "#94a3b8"}`,
        color: isReplay ? "#60a5fa" : "#94a3b8",
        fontSize: 12,
      }}
      aria-label={`Simulation time: ${text}`}
    >
      <span style={{ fontWeight: 600 }}>{isReplay ? "Sim Time" : "Live"}</span>
      <span style={{ opacity: 0.8 }}>{text}</span>
    </span>
  );
}


