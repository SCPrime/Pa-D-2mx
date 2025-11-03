/**
 * Broker Selector Component
 * 
 * Allows user to select which broker account to use for trading.
 * Displays linked accounts with balances and sets default.
 */

import { useEffect, useState } from "react";
import { Building2, CheckCircle, ExternalLink, Plus } from "lucide-react";
import { logger } from "../lib/logger";

interface BrokerAccount {
  id: number;
  broker_name: string;
  account_number: string;
  is_default: boolean;
  is_active: boolean;
  account_type: string; // "paper" | "live" | "margin"
  buying_power?: number;
  equity?: number;
  created_at: string;
}

interface BrokerSelectorProps {
  onAccountChange?: (accountId: number | null) => void;
  showAddButton?: boolean;
}

export default function BrokerSelector({ onAccountChange, showAddButton = true }: BrokerSelectorProps) {
  const [accounts, setAccounts] = useState<BrokerAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/proxy/api/brokers/accounts");
      
      if (!response.ok) {
        if (response.status === 404) {
          // No accounts linked yet
          setAccounts([]);
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to fetch broker accounts: ${response.status}`);
      }

      const data = await response.json();
      const accountsList = Array.isArray(data) ? data : data.accounts || [];
      
      setAccounts(accountsList);

      // Set default account if available
      const defaultAccount = accountsList.find((acc: BrokerAccount) => acc.is_default);
      if (defaultAccount) {
        setSelectedAccountId(defaultAccount.id);
        onAccountChange?.(defaultAccount.id);
      } else if (accountsList.length > 0) {
        // If no default, select first active account
        const firstActive = accountsList.find((acc: BrokerAccount) => acc.is_active);
        if (firstActive) {
          setSelectedAccountId(firstActive.id);
          onAccountChange?.(firstActive.id);
        }
      }
    } catch (err) {
      logger.error("[BrokerSelector] Failed to fetch accounts", err);
      setError(err instanceof Error ? err.message : "Failed to load broker accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = async (accountId: number) => {
    setSelectedAccountId(accountId);
    onAccountChange?.(accountId);

    // Optionally set as default
    try {
      await fetch(`/api/proxy/api/brokers/accounts/${accountId}/set-default`, {
        method: "PATCH",
      });
      logger.info("[BrokerSelector] Default account updated", { accountId });
    } catch (err) {
      logger.error("[BrokerSelector] Failed to set default account", err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
          <span className="text-sm">Loading broker accounts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-white">No broker accounts linked</p>
              <p className="text-xs text-slate-400 mt-1">Link a broker to start trading</p>
            </div>
          </div>
          {showAddButton && (
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Link Broker
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-300">Trading Account</label>
        {showAddButton && (
          <button className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            <Plus className="w-3 h-3" />
            Add Account
          </button>
        )}
      </div>

      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => handleAccountSelect(account.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAccountId === account.id
                ? "bg-emerald-900/30 border-emerald-600"
                : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedAccountId === account.id && (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {account.broker_name}
                    </span>
                    {account.is_default && (
                      <span className="px-2 py-0.5 bg-cyan-600/30 text-cyan-400 text-xs rounded-full border border-cyan-600/50">
                        Default
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${
                      account.account_type === "live"
                        ? "bg-red-600/30 text-red-400 border-red-600/50"
                        : "bg-blue-600/30 text-blue-400 border-blue-600/50"
                    }`}>
                      {account.account_type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Account: •••• {account.account_number.slice(-4)}
                  </p>
                  {account.buying_power !== undefined && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Buying Power: ${account.buying_power.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-500" />
            </div>
          </button>
        ))}
      </div>

      {/* Selected Account Summary */}
      {selectedAccountId && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 mt-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>
              Orders will execute on{" "}
              <span className="text-white font-semibold">
                {accounts.find(a => a.id === selectedAccountId)?.broker_name}
              </span>{" "}
              account
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

