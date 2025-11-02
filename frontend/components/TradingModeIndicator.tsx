/**
 * Trading Mode Indicator
 * 
 * Displays current trading mode (PAPER or LIVE) in header.
 * Shows visual indicator and tooltip for user awareness.
 */

import { useEffect, useState } from "react";
import { Circle } from "lucide-react";

export default function TradingModeIndicator() {
  const [mode, setMode] = useState<"paper" | "live" | "unknown">("unknown");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check trading mode from environment or backend
    // For now, we'll default to paper mode (safe default)
    const liveTrading = process.env.NEXT_PUBLIC_LIVE_TRADING === "true";
    setMode(liveTrading ? "live" : "paper");
  }, []);

  if (mode === "unknown") {
    return null;
  }

  const isLive = mode === "live";

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
          isLive
            ? "bg-red-900/30 border-red-600 hover:bg-red-900/50"
            : "bg-blue-900/30 border-blue-600 hover:bg-blue-900/50"
        }`}
      >
        <Circle
          className={`w-2.5 h-2.5 ${isLive ? "text-red-500 fill-red-500 animate-pulse" : "text-blue-500 fill-blue-500"}`}
        />
        <span
          className={`text-xs font-bold uppercase tracking-wide ${
            isLive ? "text-red-400" : "text-blue-400"
          }`}
        >
          {isLive ? "LIVE" : "PAPER"}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="text-xs space-y-2">
            {isLive ? (
              <>
                <p className="text-red-400 font-bold">🔴 LIVE TRADING MODE</p>
                <p className="text-slate-300">
                  All orders use <strong>real money</strong> from your brokerage account. Losses
                  are real and cannot be reversed.
                </p>
                <p className="text-slate-400 text-[10px]">
                  Use the Emergency Halt in Settings to stop all trading immediately if needed.
                </p>
              </>
            ) : (
              <>
                <p className="text-blue-400 font-bold">📝 PAPER TRADING MODE</p>
                <p className="text-slate-300">
                  All orders are <strong>simulated</strong>. No real money is used. Perfect for
                  testing strategies risk-free.
                </p>
                <p className="text-slate-400 text-[10px]">
                  To enable live trading, contact your administrator.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
