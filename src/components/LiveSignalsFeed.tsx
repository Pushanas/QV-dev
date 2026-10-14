import { useState } from 'react';
import { Signal } from '../types/trading';
import { Radio, ArrowUpCircle, ArrowDownCircle, CheckCheck, Clock, Copy, Check, Send, Zap } from 'lucide-react';
import { formatSignalForTelegram } from '../services/telegramService';

interface LiveSignalsFeedProps {
  signals: Signal[];
  onSelectPair: (pair: string) => void;
  onQuickTrade?: (pair: string, direction: 'CALL' | 'PUT') => void;
}

export default function LiveSignalsFeed({ signals, onSelectPair, onQuickTrade }: LiveSignalsFeedProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'win'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSignals = signals.filter((s) => {
    if (filter === 'active') return s.status === 'ACTIVE';
    if (filter === 'win') return s.status === 'WIN';
    return true;
  });

  const handleCopy = (sig: Signal) => {
    const text = formatSignalForTelegram(sig);
    navigator.clipboard.writeText(text);
    setCopiedId(sig.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col h-full">
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </div>
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-amber-400" />
            <span>تدفق الصفقات والتوصيات اللحظية</span>
          </h2>
          <span className="text-xs text-gray-500 font-mono">({signals.length} إشارة)</span>
        </div>

        {/* Filters */}
        <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'all' ? 'bg-gray-800 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            الكل ({signals.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'active' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            نشطة
          </button>
          <button
            onClick={() => setFilter('win')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'win' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            ناجحة (ITM)
          </button>
        </div>
      </div>

      {/* Signals Stream Container */}
      <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-xl overflow-y-auto max-h-[310px] space-y-2.5 flex-1">
        {filteredSignals.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs flex flex-col items-center gap-2 font-mono">
            <Clock className="w-8 h-8 text-gray-700 animate-pulse" />
            <span>في انتظار رصد فرص قوية بناءً على تحليل الشموع بدقيقة...</span>
          </div>
        ) : (
          filteredSignals.map((sig) => {
            const isCall = sig.direction === 'CALL';
            const isWin = sig.status === 'WIN';
            const isActive = sig.status === 'ACTIVE';

            return (
              <div
                key={sig.id}
                className={`p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                  isActive
                    ? isCall
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      : 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-500/10'
                    : isWin
                    ? 'bg-gray-900/90 border-emerald-500/30'
                    : 'bg-gray-900/60 border-gray-800 opacity-75'
                }`}
              >
                {/* Top row: Pair, Direction, Confidence, Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectPair(sig.pair)}
                      className="text-sm font-black font-mono text-white hover:text-blue-400 underline-offset-2 hover:underline transition flex items-center gap-1"
                    >
                      {sig.pair}
                    </button>

                    <span
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black font-mono ${
                        isCall
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isCall ? (
                        <>
                          <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>CALL (شراء)</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>PUT (بيع)</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/20">
                      دقة: {sig.confidence}%
                    </span>
                  </div>

                  {/* Status Tag */}
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>قيد الشمعة (1M)</span>
                      </span>
                    ) : isWin ? (
                      <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>ربح ITM +{sig.payout}%</span>
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 font-medium">
                        خسارة OTM
                      </span>
                    )}
                  </div>
                </div>

                {/* Strategy Details */}
                <div className="text-xs text-gray-300 mb-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-gray-400 text-[11px] flex items-center gap-1">
                    <span className="text-gray-500">الاستراتيجية:</span>
                    <span className="text-gray-200 font-medium">{sig.strategy}</span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
                    <span>دخول: <b className="text-white">{sig.entryPrice}</b></span>
                    {sig.exitPrice && (
                      <span>خروج: <b className={isWin ? 'text-emerald-400' : 'text-rose-400'}>{sig.exitPrice}</b></span>
                    )}
                  </div>
                </div>

                {/* Footer of card: Indicators Snapshot + Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-[11px] text-gray-400 font-mono">
                  <div className="flex items-center gap-3">
                    <span>RSI: <b className="text-cyan-400">{sig.indicators.rsi}</b></span>
                    <span>MACD: <b className="text-purple-400">{sig.indicators.macd}</b></span>
                    {sig.telegramSent && (
                      <span className="flex items-center gap-1 text-blue-400 text-[10px]">
                        <Send className="w-3 h-3 text-blue-400" />
                        <span>تليجرام ✓</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onQuickTrade && isActive && (
                      <button
                        onClick={() => onQuickTrade(sig.pair, sig.direction)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-md transition"
                        title="تنفيذ الصفقة فوراً في المحاكي"
                      >
                        <Zap className="w-3 h-3 text-yellow-300" />
                        <span>دخول تجريبي</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(sig)}
                      className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition flex items-center gap-1 text-[10px]"
                      title="نسخ نص الإشارة لتليجرام"
                    >
                      {copiedId === sig.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
