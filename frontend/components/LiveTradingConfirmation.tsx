/**
 * Live Trading Confirmation Dialog
 * 
 * Double-confirmation dialog for live money orders.
 * Displays order preview, risks, and requires explicit user consent.
 */

import { useState } from "react";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface OrderPreview {
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: string;
  estimatedValue: number;
  assetClass: "stock" | "option";
  strikePrice?: number;
  optionType?: "call" | "put";
  expirationDate?: string;
}

interface LiveTradingConfirmationProps {
  order: OrderPreview;
  onConfirm: () => void;
  onCancel: () => void;
  tradingMode: "paper" | "live";
}

export default function LiveTradingConfirmation({
  order,
  onConfirm,
  onCancel,
  tradingMode,
}: LiveTradingConfirmationProps) {
  const [understood, setUnderstood] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isLive = tradingMode === "live";
  const confirmationWord = "EXECUTE";

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border-2 border-red-600 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {isLive && (
            <div className="p-3 bg-red-600 rounded-full">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-white">
              {isLive ? "🔴 LIVE TRADING CONFIRMATION" : "Order Confirmation"}
            </h3>
            <p className={`text-sm ${isLive ? "text-red-400" : "text-slate-400"}`}>
              {isLive
                ? "This will execute a REAL order with REAL money"
                : "This will execute a simulated paper trading order"}
            </p>
          </div>
        </div>

        {/* Live Trading Warning */}
        {isLive && (
          <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200 space-y-2">
                <p className="font-bold text-red-400">⚠️ REAL MONEY WARNING</p>
                <ul className="list-disc list-inside space-y-1 text-red-300">
                  <li>This order will use REAL money from your brokerage account</li>
                  <li>Losses are REAL and cannot be reversed</li>
                  <li>You are responsible for all trading decisions</li>
                  <li>Market conditions may cause slippage or partial fills</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Order Preview */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Order Details</h4>

          <div className="space-y-3">
            {/* Symbol */}
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400">Symbol</span>
              <span className="text-white font-mono font-semibold text-lg">{order.symbol}</span>
            </div>

            {/* Side */}
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400">Action</span>
              <div className="flex items-center gap-2">
                {order.side === "buy" ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <span
                  className={`font-semibold uppercase ${
                    order.side === "buy" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {order.side}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400">Quantity</span>
              <span className="text-white font-semibold">{order.qty} {order.assetClass === "option" ? "contracts" : "shares"}</span>
            </div>

            {/* Order Type */}
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400">Order Type</span>
              <span className="text-white font-semibold uppercase">{order.type}</span>
            </div>

            {/* Option Details */}
            {order.assetClass === "option" && (
              <>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Strike Price</span>
                  <span className="text-white font-semibold">${order.strikePrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-semibold uppercase">{order.optionType}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Expiration</span>
                  <span className="text-white font-semibold">{order.expirationDate}</span>
                </div>
              </>
            )}

            {/* Estimated Value */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/30 rounded-lg">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Estimated Value
              </span>
              <span className="text-cyan-400 font-bold text-lg">
                ${order.estimatedValue.toFixed(2)}
              </span>
            </div>

            {/* Trading Mode Indicator */}
            <div
              className={`p-4 rounded-lg border-2 ${
                isLive
                  ? "bg-red-900/30 border-red-600"
                  : "bg-blue-900/30 border-blue-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLive ? "bg-red-500 animate-pulse" : "bg-blue-500"
                  }`}
                ></div>
                <span className={`font-bold ${isLive ? "text-red-400" : "text-blue-400"}`}>
                  {isLive ? "🔴 LIVE TRADING MODE" : "📝 PAPER TRADING MODE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Trading Acknowledgment */}
        {isLive && (
          <div className="space-y-4 mb-6">
            {/* Checkbox Confirmation */}
            <label className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-700 rounded-lg cursor-pointer hover:bg-red-900/30 transition-colors">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-1 w-5 h-5 accent-red-600"
              />
              <span className="text-sm text-red-200">
                I understand this is a <strong className="text-red-400">REAL MONEY</strong> order and I am
                responsible for all risks and losses. I have reviewed the order details above and
                confirm they are correct.
              </span>
            </label>

            {/* Type Confirmation */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type &quot;{confirmationWord}&quot; to confirm (case-sensitive)
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmationWord}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-red-600 rounded-lg text-white font-mono font-bold text-center text-lg focus:border-red-500 focus:outline-none"
                disabled={!understood}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel Order
          </button>
          <button
            onClick={onConfirm}
            disabled={isLive && (!understood || confirmText !== confirmationWord)}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isLive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isLive ? "🔴 Execute LIVE Order" : "✅ Execute Paper Order"}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-500 text-center mt-4">
          {isLive
            ? "This confirmation is required for all live trading orders to prevent accidental execution."
            : "Paper trading orders are simulated and do not use real money."}
        </p>
      </div>
    </div>
  );
}

