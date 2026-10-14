import { Signal } from '../types/trading';
import { X, History, Trophy, TrendingUp, CheckCircle, XCircle, Download } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  signals: Signal[];
  totalWins: number;
  totalLosses: number;
}

export default function HistoryModal({ isOpen, onClose, signals, totalWins, totalLosses }: HistoryModalProps) {
  if (!isOpen) return null;

  const totalClosed = totalWins + totalLosses;
  const winRate = totalClosed > 0 ? ((totalWins / totalClosed) * 100).toFixed(1) : '0';

  const handleExportCSV = () => {
    const headers = 'ID,Pair,Direction,Confidence,Payout,Status,EntryPrice,ExitPrice,Strategy,Date\n';
    const rows = signals
      .map(
        (s) =>
          `"${s.id}","${s.pair}","${s.direction}","${s.confidence}%","${s.payout}%","${s.status}","${s.entryPrice}","${
            s.exitPrice || ''
          }","${s.strategy.replace(/"/g, '""')}","${new Date(s.time).toISOString()}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotex_signals_history_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <History className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">سجل التوصيات الحية وإحصائيات الأداء</h3>
              <p className="text-xs text-gray-400">تقييم شامل لدقة خوارزميات وتوصيات Quotex Elite Terminal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Performance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Win Rate */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>نسبة النجاح (Win Rate)</span>
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-2">{winRate}%</div>
              <span className="text-[11px] text-gray-500 mt-1">نسبة الفوز الحقيقية</span>
            </div>

            {/* Total Wins */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>الصفقات الرابحة (ITM)</span>
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-2">{totalWins}</div>
              <span className="text-[11px] text-gray-500 mt-1">صفقات ناجحة بالهدف</span>
            </div>

            {/* Total Losses */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>الصفقات الخاسرة (OTM)</span>
              </span>
              <div className="text-3xl font-black font-mono text-rose-400 mt-2">{totalLosses}</div>
              <span className="text-[11px] text-gray-500 mt-1">صفقات خارج الهدف</span>
            </div>

            {/* Total Signals */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>إجمالي التوصيات</span>
              </span>
              <div className="text-3xl font-black font-mono text-white mt-2">{signals.length}</div>
              <span className="text-[11px] text-gray-500 mt-1">منذ بدء الجلسة</span>
            </div>
          </div>

          {/* Historical Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-300">تفاصيل جميع التوصيات المسجلة:</h4>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير CSV</span>
              </button>
            </div>

            <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-950">
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-900/90 text-gray-400 font-bold border-b border-gray-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">الزوج</th>
                      <th className="py-2.5 px-3">الاتجاه</th>
                      <th className="py-2.5 px-3">الدقة</th>
                      <th className="py-2.5 px-3">سعر الدخول</th>
                      <th className="py-2.5 px-3">سعر الخروج</th>
                      <th className="py-2.5 px-3">النتيجة</th>
                      <th className="py-2.5 px-3">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-mono">
                    {signals.map((sig) => {
                      const isCall = sig.direction === 'CALL';
                      const isWin = sig.status === 'WIN';
                      const isActive = sig.status === 'ACTIVE';

                      return (
                        <tr key={sig.id} className="hover:bg-gray-900/40 transition">
                          <td className="py-2 px-3 font-bold text-white">{sig.pair}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCall
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {isCall ? 'CALL ⬆' : 'PUT ⬇'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-cyan-400">{sig.confidence}%</td>
                          <td className="py-2 px-3 text-gray-300">{sig.entryPrice}</td>
                          <td className="py-2 px-3 text-gray-400">{sig.exitPrice || '—'}</td>
                          <td className="py-2 px-3 font-bold">
                            {isActive ? (
                              <span className="text-amber-400">⏳ جارية</span>
                            ) : isWin ? (
                              <span className="text-emerald-400">✅ ربح (+{sig.payout}%)</span>
                            ) : (
                              <span className="text-rose-400">❌ خسارة</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-gray-500 text-[11px]">
                            {new Date(sig.time).toLocaleTimeString('ar-SA')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
