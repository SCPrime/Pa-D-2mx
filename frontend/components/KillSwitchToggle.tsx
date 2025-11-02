/**
 * Kill Switch Toggle Component
 * 
 * Owner-only emergency trading halt control.
 * Displays current status and allows activation/deactivation with confirmation.
 */

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Power, XCircle } from "lucide-react";
import { logger } from "../lib/logger";
import { useAuth } from "../hooks/useAuth";

interface KillSwitchStatus {
  is_active: boolean;
  reason: string | null;
  activated_at: string | null;
  activated_by: string | null;
}

export default function KillSwitchToggle() {
  const { user } = useAuth();
  const [status, setStatus] = useState<KillSwitchStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show to owner role
  if (!user || user.role !== "owner") {
    return null;
  }

  useEffect(() => {
    fetchStatus();
    // Poll status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
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
      setIsLoading(false);
    } catch (err) {
      logger.error("[KillSwitch] Failed to fetch status", err);
      setError(err instanceof Error ? err.message : "Failed to fetch status");
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!reason || reason.length < 10) {
      setError("Please provide a reason (minimum 10 characters)");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/proxy/api/kill-switch/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to activate kill switch");
      }

      logger.info("[KillSwitch] Activated", { reason });
      await fetchStatus();
      setShowConfirm(false);
      setReason("");
    } catch (err) {
      logger.error("[KillSwitch] Activation failed", err);
      setError(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/proxy/api/kill-switch/deactivate", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to deactivate kill switch");
      }

      logger.info("[KillSwitch] Deactivated");
      await fetchStatus();
      setShowConfirm(false);
    } catch (err) {
      logger.error("[KillSwitch] Deactivation failed", err);
      setError(err instanceof Error ? err.message : "Deactivation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent"></div>
          <span className="text-slate-400">Loading kill switch status...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-400">
          <XCircle className="w-5 h-5" />
          <span>Failed to load kill switch status</span>
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div
        className={`border rounded-lg p-6 ${
          status.is_active
            ? "bg-red-900/20 border-red-700"
            : "bg-emerald-900/20 border-emerald-700"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status.is_active ? (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            ) : (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            )}
            <div>
              <h3
                className={`text-lg font-semibold ${
                  status.is_active ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {status.is_active ? "🚨 Trading HALTED" : "✅ Trading Active"}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {status.is_active
                  ? "All order execution is blocked"
                  : "Orders can be executed normally"}
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              status.is_active
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Power className="w-5 h-5" />
            {status.is_active ? "Resume Trading" : "Emergency Halt"}
          </button>
        </div>

        {/* Active Halt Details */}
        {status.is_active && status.reason && (
          <div className="mt-4 pt-4 border-t border-red-700">
            <p className="text-sm text-slate-400 mb-1">Reason:</p>
            <p className="text-red-300 font-medium">{status.reason}</p>
            {status.activated_at && (
              <p className="text-xs text-slate-500 mt-2">
                Activated: {new Date(status.activated_at).toLocaleString()} by{" "}
                {status.activated_by}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              {status.is_active ? "Resume Trading?" : "Emergency Halt?"}
            </h3>

            {status.is_active ? (
              <div className="space-y-4">
                <p className="text-slate-300">
                  This will resume all trading operations. Orders will be executed normally.
                </p>
                <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                  <p className="text-sm text-emerald-400 font-medium">
                    ✅ Trading will be re-enabled
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Current halt reason: {status.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300">
                  This will immediately halt ALL trading operations. No orders will be executed
                  until you manually resume trading.
                </p>
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-sm text-red-400 font-medium">
                    🚨 All order execution will be blocked
                  </p>
                </div>

                {/* Reason Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reason for halt (required, min 10 characters)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Market volatility detected, System maintenance, etc."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-red-500 focus:outline-none resize-none"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  {reason && reason.length < 10 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      {10 - reason.length} more characters required
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setReason("");
                  setError("");
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={status.is_active ? handleDeactivate : handleActivate}
                disabled={
                  isSubmitting || (!status.is_active && (!reason || reason.length < 10))
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  status.is_active
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isSubmitting ? "Processing..." : status.is_active ? "Confirm Resume" : "Confirm Halt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
