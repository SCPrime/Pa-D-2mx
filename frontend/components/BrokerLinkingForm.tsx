/**
 * Broker Linking Form Component
 *
 * Allows users to link their Alpaca or Tradier brokerage accounts.
 * Credentials are encrypted and stored securely in the backend.
 */

import { Building2, Key, Lock, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { logger } from "../lib/logger";
import { useToast } from "./ui/Toast";

interface LinkedAccount {
  id: number;
  broker_name: string;
  account_number: string;
  is_default: boolean;
  is_active: boolean;
  account_type: string;
  created_at: string;
}

export default function BrokerLinkingForm() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<"alpaca" | "tradier" | null>(null);

  // Alpaca form state
  const [alpacaApiKey, setAlpacaApiKey] = useState("");
  const [alpacaSecretKey, setAlpacaSecretKey] = useState("");
  const [alpacaPaper, setAlpacaPaper] = useState(true);

  // Tradier form state
  const [tradierApiKey, setTradierApiKey] = useState("");
  const [tradierAccountId, setTradierAccountId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/api/brokers/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(Array.isArray(data) ? data : data.accounts || []);
      }
    } catch (err) {
      logger.error("[BrokerLinking] Failed to fetch accounts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAlpaca = async () => {
    if (!alpacaApiKey || !alpacaSecretKey) {
      setError("API Key and Secret are required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/proxy/api/brokers/link/alpaca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: alpacaApiKey,
          secret_key: alpacaSecretKey,
          is_paper: alpacaPaper,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to link Alpaca account");
      }

      const newAccount = await response.json();
      setAccounts([...accounts, newAccount]);
      setShowLinkForm(false);
      setSelectedBroker(null);
      setAlpacaApiKey("");
      setAlpacaSecretKey("");
      toast.success("✅ Alpaca account linked successfully!");
      logger.info("[BrokerLinking] Alpaca account linked", { accountId: newAccount.id });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to link account";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      logger.error("[BrokerLinking] Failed to link Alpaca", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkTradier = async () => {
    if (!tradierApiKey || !tradierAccountId) {
      setError("API Key and Account ID are required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/proxy/api/brokers/link/tradier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tradierApiKey,
          account_id: tradierAccountId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to link Tradier account");
      }

      const newAccount = await response.json();
      setAccounts([...accounts, newAccount]);
      setShowLinkForm(false);
      setSelectedBroker(null);
      setTradierApiKey("");
      setTradierAccountId("");
      toast.success("✅ Tradier account linked successfully!");
      logger.info("[BrokerLinking] Tradier account linked", { accountId: newAccount.id });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to link account";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      logger.error("[BrokerLinking] Failed to link Tradier", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!confirm("Are you sure you want to remove this broker account?")) return;

    try {
      const response = await fetch(`/api/proxy/api/brokers/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      setAccounts(accounts.filter((acc) => acc.id !== accountId));
      toast.success("✅ Broker account removed");
      logger.info("[BrokerLinking] Account deleted", { accountId });
    } catch (err) {
      toast.error("❌ Failed to remove account");
      logger.error("[BrokerLinking] Failed to delete account", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 p-4">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent"></div>
        <span>Loading broker accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Linked Accounts List */}
      {accounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Linked Accounts</h3>
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-900/30 rounded-lg">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{account.broker_name}</span>
                      {account.is_default && (
                        <span className="px-2 py-0.5 bg-cyan-600/30 text-cyan-400 text-xs rounded-full border border-cyan-600/50">
                          Default
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full border ${
                          account.account_type === "live"
                            ? "bg-red-600/30 text-red-400 border-red-600/50"
                            : "bg-blue-600/30 text-blue-400 border-blue-600/50"
                        }`}
                      >
                        {account.account_type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Account: •••• {account.account_number.slice(-4)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Added: {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Button */}
      {!showLinkForm && (
        <button
          onClick={() => setShowLinkForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Link Broker Account
        </button>
      )}

      {/* Link Form */}
      {showLinkForm && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Link Broker Account</h3>
            <button
              onClick={() => {
                setShowLinkForm(false);
                setSelectedBroker(null);
                setError("");
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Broker Selection */}
          {!selectedBroker && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Select your broker:</p>

              <button
                onClick={() => setSelectedBroker("alpaca")}
                className="w-full p-4 bg-slate-800/50 border border-slate-700 hover:border-emerald-600 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Alpaca Markets</p>
                    <p className="text-xs text-slate-400">
                      Commission-free trading • Paper & Live accounts
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedBroker("tradier")}
                className="w-full p-4 bg-slate-800/50 border border-slate-700 hover:border-emerald-600 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Tradier Brokerage</p>
                    <p className="text-xs text-slate-400">Options trading • Real-time data</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Alpaca Form */}
          {selectedBroker === "alpaca" && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedBroker(null)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Key className="w-4 h-4 inline mr-1" />
                    API Key
                  </label>
                  <input
                    type="text"
                    value={alpacaApiKey}
                    onChange={(e) => setAlpacaApiKey(e.target.value)}
                    placeholder="PKXXXXXXXXXX"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={alpacaSecretKey}
                    onChange={(e) => setAlpacaSecretKey(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <input
                    type="checkbox"
                    id="alpaca-paper"
                    checked={alpacaPaper}
                    onChange={(e) => setAlpacaPaper(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <label htmlFor="alpaca-paper" className="text-sm text-slate-300 cursor-pointer">
                    Paper Trading Account (recommended for testing)
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleLinkAlpaca}
                  disabled={isSubmitting || !alpacaApiKey || !alpacaSecretKey}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Linking Account..." : "Link Alpaca Account"}
                </button>
              </div>
            </div>
          )}

          {/* Tradier Form */}
          {selectedBroker === "tradier" && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedBroker(null)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Key className="w-4 h-4 inline mr-1" />
                    API Key (Bearer Token)
                  </label>
                  <input
                    type="text"
                    value={tradierApiKey}
                    onChange={(e) => setTradierApiKey(e.target.value)}
                    placeholder="Bearer token from Tradier dashboard"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Account ID
                  </label>
                  <input
                    type="text"
                    value={tradierAccountId}
                    onChange={(e) => setTradierAccountId(e.target.value)}
                    placeholder="Your Tradier account number"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                  <p className="text-xs text-yellow-200">
                    <strong>Note:</strong> Tradier API keys can be generated in your account
                    dashboard. Make sure to enable trading permissions for the API key.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleLinkTradier}
                  disabled={isSubmitting || !tradierApiKey || !tradierAccountId}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Linking Account..." : "Link Tradier Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">🔒 Secure Credential Storage</p>
            <p className="text-blue-300/90">
              Your API keys are encrypted using AES-256 before storage. They are never exposed in
              logs or responses. Only decrypted when executing trades on your behalf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
