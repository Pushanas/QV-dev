import { useState } from 'react';
import { SimulatedTrade, SignalDirection } from '../types/trading';
import { ArrowUp, ArrowDown, Wallet, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TradeExecutionPanelProps {
  currentPair: string;
  payout: number;
  demoBalance: number;
  activeTrades: SimulatedTrade[];
  onExecuteTrade: (pair: string, direction: SignalDirection, amount: number, expirySeconds: number) => void;
  onResetBalance: () => void;
}

export default function TradeExecutionPanel({
  currentPair,
  payout,
  demoBalance,
  activeTrades,
  onExecuteTrade,
  onResetBalance,
}: TradeExecutionPanelProps) {
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [expirySeconds, setExpirySeconds] = useState<number>(60);

  const profitAmount = parseFloat((tradeAmount * (payout / 100)).toFixed(2));
  const totalReturn = parseFloat((tradeAmount + profitAmount).toFixed(2));

  const handleAdjustAmount = (delta: number) => {
    setTradeAmount((prev) => Math.max(1, prev + delta));
  };

  const activePendingTrades = activeTrades.filter((t) => t.status === 'PENDING');

  return (
    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
      {/* Header: Demo Balance & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
          <span className="text-xs text-gray-400 block font-medium">الرصيد التجريبي (Quotex Demo)</span>
          <div className="flex items-center gap-2 mt-0.5">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="text-2xl font-black font-mono text-white">
              ${demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button
          onClick={onResetBalance}
          title="إعادة شحن الرصيد التجريبي إلى $10,000"
          className="p-2 text-gray-400 hover:text-white bg-gray-950 border border-gray-800 hover:bg-gray-800 rounded-xl transition flex items-center gap-1.5 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">إعادة ضبط</span>
        </button>
      </div>

      {/* Middle: Trade Amount & Expiry Controls */}
      <div className="py-4 space-y-4">
        {/* Amount Section */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-400 font-medium">مبلغ الاستثمار (الرهان)</span>
            <span className="text-emerald-400 font-mono font-bold">العائد: +{profitAmount} USD</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdjustAmount(-10)}
              className="w-10 h-10 bg-gray-950 border border-gray-800 hover:bg-gray-800 text-gray-300 font-mono font-bold rounded-xl transition flex items-center justify-center text-base"
            >
              -
            </button>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono font-bold">$</span>
              <input
                type="number"
                min="1"
                step="5"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-8 text-center text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button
              onClick={() => handleAdjustAmount(10)}
              className="w-10 h-10 bg-gray-950 border border-gray-800 hover:bg-gray-800 text-gray-300 font-mono font-bold rounded-xl transition flex items-center justify-center text-base"
            >
              +
            </button>
          </div>

          {/* Quick Amount Presets */}
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[10, 25, 50, 100, 250].map((amt) => (
              <button
                key={amt}
                onClick={() => setTradeAmount(amt)}
                className={`py-1 text-xs font-mono font-semibold rounded-lg border transition ${
                  tradeAmount === amt
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-gray-950 text-gray-400 hover:text-white border-gray-800 hover:bg-gray-800'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Expiry Selector */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-400 font-medium">وقت انتهاء الصفقة (Duration)</span>
            <span className="text-gray-400 font-mono text-[11px]">موصى به: 1 دقيقة</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '1 دقيقة (1M)', secs: 60 },
              { label: '2 دقيقة (2M)', secs: 120 },
              { label: '5 دقائق (5M)', secs: 300 },
            ].map((exp) => (
              <button
                key={exp.secs}
                onClick={() => setExpirySeconds(exp.secs)}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  expirySeconds === exp.secs
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-gray-950 text-gray-400 hover:text-white border-gray-800 hover:bg-gray-800'
                }`}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: CALL & PUT */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* CALL BUTTON */}
          <button
            onClick={() => onExecuteTrade(currentPair, 'CALL', tradeAmount, expirySeconds)}
            className="py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white rounded-2xl shadow-xl shadow-emerald-950/40 font-black flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-base">
              <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition" />
              <span>صعود (CALL)</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-200">
              ربح: +${profitAmount} (${totalReturn})
            </span>
          </button>

          {/* PUT BUTTON */}
          <button
            onClick={() => onExecuteTrade(currentPair, 'PUT', tradeAmount, expirySeconds)}
            className="py-4 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-[0.98] text-white rounded-2xl shadow-xl shadow-rose-950/40 font-black flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-base">
              <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition" />
              <span>هبوط (PUT)</span>
            </div>
            <span className="text-[11px] font-mono text-rose-200">
              ربح: +${profitAmount} (${totalReturn})
            </span>
          </button>
        </div>
      </div>

      {/* Active Trades Live Tracker */}
      <div className="pt-3 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>الصفقات النشطة قيد الانتظار:</span>
          </span>
          <span className="font-mono text-white font-bold">{activePendingTrades.length}</span>
        </div>

        {activePendingTrades.length === 0 ? (
          <div className="p-2.5 bg-gray-950 rounded-xl border border-gray-800 text-center text-[11px] text-gray-500">
            لا توجد صفقات معلقة حالياً — اختر الاتجاه لبدء التداول
          </div>
        ) : (
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {activePendingTrades.map((t) => {
              const isCall = t.direction === 'CALL';
              const remainingSecs = Math.max(0, Math.ceil((t.expiryTime - Date.now()) / 1000));
              const isCurrentlyWinning =
                (isCall && t.currentPrice >= t.entryPrice) || (!isCall && t.currentPrice <= t.entryPrice);

              return (
                <div
                  key={t.id}
                  className={`p-2 rounded-lg border flex items-center justify-between text-xs font-mono transition ${
                    isCurrentlyWinning
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{t.pair}</span>
                    <span className="text-[10px] px-1 rounded bg-black/40">
                      {isCall ? 'CALL ⬆' : 'PUT ⬇'}
                    </span>
                    <span className="text-gray-400">${t.amount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{remainingSecs} ثانية</span>
                    {isCurrentlyWinning ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
