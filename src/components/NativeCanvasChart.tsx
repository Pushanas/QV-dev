import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Candle, Signal } from '../types/trading';
import { INITIAL_PAIRS } from '../services/marketEngine';
import { calculateEMA } from '../utils/indicators';
import { Maximize2, Minimize2, Eye, EyeOff, Activity, Clock } from 'lucide-react';

interface NativeCanvasChartProps {
  currentPair: string;
  candles: Candle[];
  payout: number;
  signals: Signal[];
  onSelectPair: (pair: string) => void;
}

export default function NativeCanvasChart({
  currentPair,
  candles,
  payout,
  signals,
  onSelectPair,
}: NativeCanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndicators, setShowIndicators] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('1M');
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    candle: Candle;
    ema9?: number;
    ema21?: number;
  } | null>(null);

  const pairInfo = useMemo(() => {
    return INITIAL_PAIRS.find((p) => p.id === currentPair) || INITIAL_PAIRS[0];
  }, [currentPair]);

  const lastCandle = candles && candles.length > 0 ? candles[candles.length - 1] : null;
  const currentPrice = lastCandle ? lastCandle.close : pairInfo.basePrice;
  const isUpTick = lastCandle ? lastCandle.close >= lastCandle.open : true;

  // Countdown to next minute
  useEffect(() => {
    const updateCountdown = () => {
      const secs = 60 - new Date().getSeconds();
      setSecondsRemaining(secs === 60 ? 0 : secs);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main Canvas Rendering Engine (Pure HTML5 Canvas - Zero TradingView)
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Deep Dark Canvas Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    if (!candles || candles.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`جاري استقبال تدفق شموع ${currentPair} لحظياً...`, width / 2, height / 2);
      return;
    }

    // Slice visible candles (e.g., last 40 candles)
    const visibleCount = Math.min(42, candles.length);
    const visibleCandles = candles.slice(-visibleCount);

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if ((c.volume || 10) > maxVolume) maxVolume = c.volume || 10;
    });

    const padding = (maxPrice - minPrice) * 0.15 || 0.0005;
    minPrice -= padding;
    maxPrice += padding;
    const priceRange = maxPrice - minPrice;

    const timeAxisHeight = 28;
    const priceAxisWidth = 80;
    const chartHeight = height - timeAxisHeight;
    const chartWidth = width - priceAxisWidth;

    // Horizontal Grid Lines & Price Labels
    const gridRows = 5;
    ctx.strokeStyle = 'rgba(31, 41, 55, 0.45)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridRows; i++) {
      const y = (chartHeight / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      const priceVal = maxPrice - (i / gridRows) * priceRange;
      ctx.fillText(priceVal.toFixed(pairInfo.pipDecimals), chartWidth + 8, y + 4);
    }

    const candleSpacing = chartWidth / visibleCandles.length;
    const candleWidth = Math.max(3, candleSpacing * 0.65);

    // EMA Calculations
    const ema9 = calculateEMA(visibleCandles, 9);
    const ema21 = calculateEMA(visibleCandles, 21);

    // Draw Volume Bars at bottom
    visibleCandles.forEach((c, idx) => {
      const x = idx * candleSpacing + candleSpacing / 2;
      const isGreen = c.close >= c.open;
      const volHeight = ((c.volume || 10) / (maxVolume || 1)) * 40;
      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      ctx.fillRect(x - candleWidth / 2, chartHeight - volHeight, candleWidth, volHeight);
    });

    // Draw EMA Lines
    if (showIndicators) {
      const drawEma = (emaVals: number[], color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        emaVals.forEach((val, idx) => {
          const x = idx * candleSpacing + candleSpacing / 2;
          const y = chartHeight - ((val - minPrice) / priceRange) * chartHeight;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      };

      drawEma(ema9, '#06b6d4'); // EMA 9 (Cyan)
      drawEma(ema21, '#f59e0b'); // EMA 21 (Amber)
    }

    // Draw Candlesticks & Time Labels
    visibleCandles.forEach((c, idx) => {
      const x = idx * candleSpacing + candleSpacing / 2;
      const isGreen = c.close >= c.open;
      const candleColor = isGreen ? '#10b981' : '#ef4444';

      const yHigh = chartHeight - ((c.high - minPrice) / priceRange) * chartHeight;
      const yLow = chartHeight - ((c.low - minPrice) / priceRange) * chartHeight;
      const yOpen = chartHeight - ((c.open - minPrice) / priceRange) * chartHeight;
      const yClose = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;

      // Wick
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      ctx.fillStyle = candleColor;
      const bodyY = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);

      // Time axis label every 5 candles
      if (idx % 6 === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        const d = new Date(c.time * 1000);
        const timeText = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillText(timeText, x, height - 8);
      }
    });

    // Draw Signal Markers (CALL ⬆ / PUT ⬇)
    const pairSignals = signals.filter((s) => s.pair === currentPair);
    pairSignals.forEach((sig) => {
      // Find candle closest to signal time
      const sigSec = Math.floor(sig.time / 1000);
      const matchIdx = visibleCandles.findIndex((c) => Math.abs(c.time - sigSec) <= 60);
      if (matchIdx !== -1) {
        const x = matchIdx * candleSpacing + candleSpacing / 2;
        const targetCandle = visibleCandles[matchIdx];
        const isCall = sig.direction === 'CALL';

        if (isCall) {
          // Below low
          const y = chartHeight - ((targetCandle.low - minPrice) / priceRange) * chartHeight + 18;
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x - 5, y);
          ctx.lineTo(x + 5, y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`CALL`, x, y + 10);
        } else {
          // Above high
          const y = chartHeight - ((targetCandle.high - minPrice) / priceRange) * chartHeight - 14;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(x, y + 8);
          ctx.lineTo(x - 5, y);
          ctx.lineTo(x + 5, y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`PUT`, x, y - 4);
        }
      }
    });

    // Draw Live Current Price Line & Tag
    const last = visibleCandles[visibleCandles.length - 1];
    if (last) {
      const currentY = chartHeight - ((last.close - minPrice) / priceRange) * chartHeight;
      const isGreen = last.close >= last.open;
      const priceColor = isGreen ? '#10b981' : '#ef4444';

      ctx.strokeStyle = priceColor;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(chartWidth, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on Right Axis
      ctx.fillStyle = priceColor;
      ctx.fillRect(chartWidth + 2, currentY - 11, priceAxisWidth - 6, 22);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(last.close.toFixed(pairInfo.pipDecimals), chartWidth + priceAxisWidth / 2, currentY + 4);
    }
  }, [candles, currentPair, pairInfo.pipDecimals, showIndicators, signals]);

  // Redraw when candles change
  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  // Crosshair Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const visibleCount = Math.min(42, candles.length);
    const visibleCandles = candles.slice(-visibleCount);
    const priceAxisWidth = 80;
    const chartWidth = rect.width - priceAxisWidth;
    const candleSpacing = chartWidth / visibleCandles.length;

    const idx = Math.floor(x / candleSpacing);
    if (idx >= 0 && idx < visibleCandles.length) {
      const c = visibleCandles[idx];
      setHoverData({ x, y, candle: c });
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div
      ref={containerRef}
      className={`bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 p-6 bg-gray-950' : 'p-5'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
              {currentPair}
              {pairInfo.isOtc && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                  OTC 24/7
                </span>
              )}
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">({pairInfo.displayName})</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-base font-bold font-mono transition-colors ${
              isUpTick
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            <span>{currentPrice.toFixed(pairInfo.pipDecimals)}</span>
            <span className="text-xs font-normal">
              {isUpTick ? '▲' : '▼'} {pairInfo.change24h > 0 ? `+${pairInfo.change24h}%` : `${pairInfo.change24h}%`}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg">
            <span>العائد: {payout}%</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Candle countdown timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span className="text-gray-400 text-[11px]">إغلاق الشمعة:</span>
            <span className="font-bold">00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
          </div>

          {/* Timeframes */}
          <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
            {['5s', '15s', '30s', '1M', '5M'].map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeTimeframe === tf
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators toggle */}
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            title="إظهار / إخفاء خطوط المؤشرات EMA 9 & EMA 21"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              showIndicators
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-gray-200'
            }`}
          >
            {showIndicators ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">EMA 9/21</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة'}
            className="p-1.5 text-gray-400 hover:text-white bg-gray-950 border border-gray-800 hover:bg-gray-800 rounded-xl transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Pair Selector Bar */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-b border-gray-800/50">
        <span className="text-xs text-gray-400 flex items-center gap-1 font-semibold whitespace-nowrap pl-2">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          أصول كوتكس:
        </span>
        {INITIAL_PAIRS.map((p) => {
          const isSelected = p.id === currentPair;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPair(p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                  : 'bg-gray-950 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <span>{p.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {p.payout}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Native Canvas Area */}
      <div className="relative w-full flex-1 min-h-[350px] pt-2">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full rounded-xl cursor-crosshair"
          style={{ minHeight: isFullscreen ? 'calc(100vh - 220px)' : '350px' }}
        />

        {/* Legend overlays */}
        {showIndicators && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-gray-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-800 text-[11px] font-mono pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-cyan-400 rounded-full" />
              <span className="text-cyan-300 font-bold">EMA 9</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-amber-400 rounded-full" />
              <span className="text-amber-300 font-bold">EMA 21</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-300 font-bold">CALL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-300 font-bold">PUT</span>
            </div>
          </div>
        )}

        {/* Hover Crosshair Tooltip */}
        {hoverData && (
          <div
            className="absolute z-20 bg-gray-900/95 border border-gray-700/80 backdrop-blur-md p-2.5 rounded-xl shadow-xl pointer-events-none text-xs font-mono space-y-1"
            style={{
              left: Math.min(hoverData.x + 15, (containerRef.current?.clientWidth || 500) - 160),
              top: Math.max(10, hoverData.y - 60),
            }}
          >
            <div className="text-[10px] text-gray-400">
              {new Date(hoverData.candle.time * 1000).toLocaleTimeString('ar-SA')}
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Open:</span>
              <span className="text-white font-bold">{hoverData.candle.open}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">High:</span>
              <span className="text-emerald-400 font-bold">{hoverData.candle.high}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Low:</span>
              <span className="text-rose-400 font-bold">{hoverData.candle.low}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Close:</span>
              <span
                className={`font-bold ${
                  hoverData.candle.close >= hoverData.candle.open ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {hoverData.candle.close}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
