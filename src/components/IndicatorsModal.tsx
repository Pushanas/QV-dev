import { useState } from 'react';
import { X, Sliders, Activity, TrendingUp, TrendingDown, Check, RotateCcw } from 'lucide-react';
import { Candle } from '../types/trading';
import { calculateRSI, calculateEMA, calculateBollingerBands, calculateMACD, detectCandlePattern } from '../utils/indicators';

interface IndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPair: string;
  candles: Candle[];
}

export default function IndicatorsModal({ isOpen, onClose, currentPair, candles }: IndicatorsModalProps) {
  const [minConfidence, setMinConfidence] = useState(85);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);

  // Enabled strategy toggles
  const [strategies, setStrategies] = useState({
    rsiReversal: true,
    emaCrossover: true,
    bollingerBands: true,
    candlePatterns: true,
  });

  if (!isOpen) return null;

  // Real-time calculations for current candles
  const rsi = calculateRSI(candles, rsiPeriod);
  const emaFast = calculateEMA(candles, 9);
  const emaSlow = calculateEMA(candles, 21);
  const currentFast = emaFast[emaFast.length - 1] || 0;
  const currentSlow = emaSlow[emaSlow.length - 1] || 0;
  const isEmaBullish = currentFast >= currentSlow;

  const bb = calculateBollingerBands(candles, 20, 2);
  const macd = calculateMACD(candles);
  const pattern = detectCandlePattern(candles);

  const handleReset = () => {
    setMinConfidence(85);
    setRsiPeriod(14);
    setRsiOversold(30);
    setRsiOverbought(70);
    setStrategies({
      rsiReversal: true,
      emaCrossover: true,
      bollingerBands: true,
      candlePatterns: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">التحكم بالمؤشرات والتحليل الفني الذكي</h3>
              <p className="text-xs text-gray-400">مراقبة حية للمؤشرات وتخصيص معايير فحص السوق لـ {currentPair}</p>
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
          {/* Live Indicators Gauge Grid */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>القراءات اللحظية للمؤشرات على الزوج الحالي ({currentPair}):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* RSI */}
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[11px] text-gray-400 block mb-1">RSI ({rsiPeriod})</span>
                <div className="text-xl font-black font-mono text-cyan-400">{rsi}</div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      rsi < 30 ? 'bg-emerald-400' : rsi > 70 ? 'bg-rose-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {rsi < 30 ? '🟢 تشبع بيعي' : rsi > 70 ? '🔴 تشبع شرائي' : '⚪ محايد'}
                </span>
              </div>

              {/* EMA Trend */}
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[11px] text-gray-400 block mb-1">متوسط EMA 9/21</span>
                <div
                  className={`text-base font-black font-mono flex items-center gap-1 ${
                    isEmaBullish ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isEmaBullish ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isEmaBullish ? 'صاعد (Bullish)' : 'هابط (Bearish)'}</span>
                </div>
                <span className="text-[10px] text-gray-500 mt-2 block font-mono">
                  9: {currentFast.toFixed(5)}
                </span>
              </div>

              {/* MACD */}
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[11px] text-gray-400 block mb-1">مؤشر MACD</span>
                <div
                  className={`text-base font-black font-mono ${
                    macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {macd.histogram >= 0 ? `+${macd.histogram}` : macd.histogram}
                </div>
                <span className="text-[10px] text-gray-500 mt-2 block">
                  {macd.histogram >= 0 ? 'زخم شرائي إيجابي' : 'زخم بيعي سلبي'}
                </span>
              </div>

              {/* Pattern */}
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[11px] text-gray-400 block mb-1">النمط الشموع الحالي</span>
                <div className="text-xs font-bold text-yellow-400 line-clamp-1">{pattern.name}</div>
                <span className="text-[10px] text-gray-500 mt-2 block">
                  {pattern.bias === 'bullish' ? '🟢 انحياز صعودي' : pattern.bias === 'bearish' ? '🔴 انحياز هبوطي' : '⚪ حيادي'}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4 pt-2 border-t border-gray-800">
            {/* Min Confidence Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-gray-300">الحد الأدنى لنسبة دقة الإشارة (Min Confidence Filter)</span>
                <span className="text-purple-400 font-mono text-sm">{minConfidence}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="95"
                step="1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-gray-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                <span>80% (إشارات أكثر)</span>
                <span>85% (متوازن - موصى به)</span>
                <span>95% (إشارات نادرة فائقة الدقة)</span>
              </div>
            </div>

            {/* RSI Thresholds */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">حد التشبع البيعي (Oversold)</label>
                <input
                  type="number"
                  min="15"
                  max="40"
                  value={rsiOversold}
                  onChange={(e) => setRsiOversold(parseInt(e.target.value) || 30)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">حد التشبع الشرائي (Overbought)</label>
                <input
                  type="number"
                  min="60"
                  max="85"
                  value={rsiOverbought}
                  onChange={(e) => setRsiOverbought(parseInt(e.target.value) || 70)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Strategy Toggles */}
            <div>
              <span className="block text-xs font-bold text-gray-300 mb-2">استراتيجيات وخوارزميات التداول المعتمدة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'rsiReversal', label: 'انعكاسات RSI للقمم والقيعان (Overbought/Oversold)' },
                  { key: 'emaCrossover', label: 'تقاطعات متوسطات الحركة السريعة (EMA 9 & 21)' },
                  { key: 'bollingerBands', label: 'ارتداد الحدود الخارجية لبولنجر باند (Bollinger Bands)' },
                  { key: 'candlePatterns', label: 'نماذج الشموع اليابانية الانعكاسية (Engulfing / Pinbar)' },
                ].map((st) => (
                  <label
                    key={st.key}
                    className="flex items-center gap-2.5 p-3 bg-gray-950 border border-gray-800 rounded-xl cursor-pointer hover:bg-gray-800/60 transition"
                  >
                    <input
                      type="checkbox"
                      checked={strategies[st.key as keyof typeof strategies]}
                      onChange={(e) =>
                        setStrategies({ ...strategies, [st.key]: e.target.checked })
                      }
                      className="accent-purple-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-300 font-medium">{st.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>تطبيق الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
}
