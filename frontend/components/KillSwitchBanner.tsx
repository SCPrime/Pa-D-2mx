/**
 * Kill Switch Banner Component
 * 
 * Displays a prominent banner when trading is halted.
 * Visible to all users, shows reason and who activated it.
 */

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { logger } from "../lib/logger";

interface KillSwitchStatus {
  is_active: boolean;
  reason: string | null;
  activated_at: string | null;
  activated_by: string | null;
}

export default function KillSwitchBanner() {
  const [status, setStatus] = useState<KillSwitchStatus | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Poll status every 10 seconds (more frequent than toggle for real-time updates)
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/proxy/api/kill-switch/status");
      if (!response.ok) {
        throw new Error("Failed to fetch kill switch status");
      }
      const data = await response.json();
      setStatus(data);
      
      // Reset visibility when status changes
      if (data.is_active) {
        setIsVisible(true);
      }
    } catch (err) {
      logger.error("[KillSwitchBanner] Failed to fetch status", err);
    }
  };

  // Don't render if not active or user dismissed
  if (!status?.is_active || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">
                  🚨 TRADING HALTED
                </span>
                {status.activated_at && (
                  <span className="text-xs text-red-200 hidden sm:inline">
                    since {new Date(status.activated_at).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {status.reason && (
                <p className="text-sm text-red-100 mt-1 line-clamp-1">
                  Reason: {status.reason}
                </p>
              )}
            </div>
          </div>

          {/* Dismiss Button (temporary - banner reappears on page reload) */}
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 p-1 hover:bg-red-700 rounded transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

