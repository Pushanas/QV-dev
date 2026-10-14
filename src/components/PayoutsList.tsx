import { useState } from 'react';
import { INITIAL_PAIRS } from '../services/marketEngine';
import { Search, Flame, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface PayoutsListProps {
  currentPair: string;
  payouts: Record<string, number>;
  onSelectPair: (pair: string) => void;
}

export default function PayoutsList({ currentPair, payouts, onSelectPair }: PayoutsListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'forex' | 'otc' | 'crypto'>('all');

  const filteredPairs = INITIAL_PAIRS.filter((pair) => {
    const matchesSearch =
      pair.name.toLowerCase().includes(search.toLowerCase()) ||
      pair.displayName.includes(search);
    if (!matchesSearch) return false;

    if (filter === 'otc') return pair.isOtc;
    if (filter === 'crypto') return pair.category === 'crypto';
    if (filter === 'forex') return pair.category === 'forex' && !pair.isOtc;
    return true;
  }).sort((a, b) => (payouts[b.id] || b.payout) - (payouts[a.id] || a.payout));

  return (
    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col h-full">
      {/* Title & Badge */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
          <Flame className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span>عوائد الأصول الحية (Payouts)</span>
        </h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
          حتى 95% ربح
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ابحث عن زوج (EUR, OTC...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-3 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
            filter === 'all' ? 'bg-gray-800 text-white font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setFilter('otc')}
          className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
            filter === 'otc' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          OTC (عالي)
        </button>
        <button
          onClick={() => setFilter('forex')}
          className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
            filter === 'forex' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          فوركس
        </button>
        <button
          onClick={() => setFilter('crypto')}
          className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
            filter === 'crypto' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          كريبتو
        </button>
      </div>

      {/* Pair list container */}
      <div className="space-y-2 overflow-y-auto max-h-[310px] pr-1 flex-1">
        {filteredPairs.map((pair) => {
          const isSelected = pair.id === currentPair;
          const livePayout = payouts[pair.id] || pair.payout;
          const isHighPayout = livePayout >= 90;

          return (
            <div
              key={pair.id}
              onClick={() => onSelectPair(pair.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-blue-900/30 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-gray-950/70 border-gray-800/80 hover:bg-gray-800/60 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSelected ? 'bg-blue-400 animate-ping' : 'bg-gray-600 group-hover:bg-emerald-400'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-sm text-gray-200 group-hover:text-white">
                      {pair.name}
                    </span>
                    {pair.isOtc && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                        OTC
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                    <span>{pair.displayName}</span>
                    <span className="text-gray-600">•</span>
                    <span
                      className={`flex items-center ${
                        pair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {pair.change24h >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 inline" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 inline" />
                      )}
                      {pair.change24h}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Payout % Badge */}
              <div className="flex flex-col items-end">
                <span
                  className={`px-2.5 py-1 font-black font-mono text-xs rounded-lg border transition ${
                    isHighPayout
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  {livePayout}%
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">عائد الربح</span>
              </div>
            </div>
          );
        })}

        {filteredPairs.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs flex flex-col items-center gap-2">
            <Layers className="w-8 h-8 text-gray-600" />
            <span>لا توجد نتائج مطابقة لبحثك</span>
          </div>
        )}
      </div>
    </div>
  );
}
