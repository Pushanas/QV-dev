import { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  ISeriesMarkersPluginApi,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  UTCTimestamp,
  SeriesMarker,
  Time,
} from 'lightweight-charts';
import { Candle, Signal } from '../types/trading';
import { INITIAL_PAIRS } from '../services/marketEngine';
import { calculateEMA } from '../utils/indicators';
import { Maximize2, Minimize2, Eye, EyeOff, Activity, Clock } from 'lucide-react';

interface TradingViewChartProps {
  currentPair: string;
  candles: Candle[];
  payout: number;
  signals: Signal[];
  onSelectPair: (pair: string) => void;
}

export default function TradingViewChart({
  currentPair,
  candles,
  payout,
  signals,
  onSelectPair,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const emaFastSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSlowSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndicators, setShowIndicators] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('1M');
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // Active pair details
  const pairInfo = useMemo(() => {
    return INITIAL_PAIRS.find((p) => p.id === currentPair) || INITIAL_PAIRS[0];
  }, [currentPair]);

  // Current price and high/low stats
  const lastCandle = candles && candles.length > 0 ? candles[candles.length - 1] : null;
  const currentPrice = lastCandle ? lastCandle.close : pairInfo.basePrice;
  const isUpTick = lastCandle ? lastCandle.close >= lastCandle.open : true;

  // Candle countdown timer to minute end
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const secs = 60 - now.getSeconds();
      setSecondsRemaining(secs === 60 ? 0 : secs);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize TradingView chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear any previous chart DOM
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 150 : 380,
      layout: {
        background: { color: '#030712' },
        textColor: '#9ca3af',
        fontSize: 12,
        fontFamily: 'Cairo, JetBrains Mono, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(31, 41, 55, 0.5)' },
        horzLines: { color: 'rgba(31, 41, 55, 0.5)' },
      },
      crosshair: {
        vertLine: {
          color: '#6366f1',
          width: 1,
          style: 3,
          labelBackgroundColor: '#4f46e5',
        },
        horzLine: {
          color: '#6366f1',
          width: 1,
          style: 3,
          labelBackgroundColor: '#4f46e5',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#1f2937',
        barSpacing: 12,
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: pairInfo.pipDecimals || 5,
        minMove: 1 / Math.pow(10, pairInfo.pipDecimals || 5),
      },
    });

    // EMA 9 (Fast - Cyan)
    const emaFast = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 2,
      title: 'EMA 9',
      priceLineVisible: false,
    });

    // EMA 21 (Slow - Amber)
    const emaSlow = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: 'EMA 21',
      priceLineVisible: false,
    });

    // Initialize markers plugin for candlestick series
    const markersPlugin = createSeriesMarkers(candlestickSeries, []);

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    emaFastSeriesRef.current = emaFast;
    emaSlowSeriesRef.current = emaSlow;
    markersPluginRef.current = markersPlugin;

    // Handle container resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartContainerRef.current) return;
      const { width, height } = entries[0].contentRect;
      chart.resize(width, height);
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      emaFastSeriesRef.current = null;
      emaSlowSeriesRef.current = null;
      markersPluginRef.current = null;
    };
  }, [currentPair, isFullscreen, pairInfo.pipDecimals]);

  // Update chart data whenever candles change
  useEffect(() => {
    if (!candlestickSeriesRef.current || !candles || candles.length === 0) return;

    const formattedData: CandlestickData<Time>[] = candles.map((c) => ({
      time: Math.floor(c.time) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candlestickSeriesRef.current.setData(formattedData);

    // Calculate & update EMA data if indicators enabled
    if (showIndicators && emaFastSeriesRef.current && emaSlowSeriesRef.current) {
      const ema9Values = calculateEMA(candles, 9);
      const ema21Values = calculateEMA(candles, 21);

      const ema9Data: LineData<Time>[] = [];
      const ema21Data: LineData<Time>[] = [];

      candles.forEach((c, idx) => {
        if (ema9Values[idx] !== undefined) {
          ema9Data.push({
            time: Math.floor(c.time) as UTCTimestamp,
            value: parseFloat(ema9Values[idx].toFixed(pairInfo.pipDecimals)),
          });
        }
        if (ema21Values[idx] !== undefined) {
          ema21Data.push({
            time: Math.floor(c.time) as UTCTimestamp,
            value: parseFloat(ema21Values[idx].toFixed(pairInfo.pipDecimals)),
          });
        }
      });

      emaFastSeriesRef.current.setData(ema9Data);
      emaSlowSeriesRef.current.setData(ema21Data);
    } else if (!showIndicators) {
      emaFastSeriesRef.current?.setData([]);
      emaSlowSeriesRef.current?.setData([]);
    }

    // Attach markers for recent signals on this pair
    const relevantSignals = signals.filter((s) => s.pair === currentPair);
    if (markersPluginRef.current) {
      if (relevantSignals.length > 0) {
        const markers: SeriesMarker<Time>[] = relevantSignals.map((sig) => {
          const isCall = sig.direction === 'CALL';
          return {
            time: Math.floor(sig.time / 1000) as UTCTimestamp,
            position: isCall ? 'belowBar' : 'aboveBar',
            color: isCall ? '#10b981' : '#ef4444',
            shape: isCall ? 'arrowUp' : 'arrowDown',
            text: `${isCall ? 'CALL' : 'PUT'} (${sig.confidence}%)`,
            size: 2,
          };
        });
        // Sort markers by time
        markers.sort((a, b) => (a.time as number) - (b.time as number));
        markersPluginRef.current.setMarkers(markers);
      } else {
        markersPluginRef.current.setMarkers([]);
      }
    }
  }, [candles, showIndicators, signals, currentPair, pairInfo.pipDecimals]);

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 p-6 bg-gray-950' : 'p-5'
      }`}
    >
      {/* Top Header of Chart */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-800/80">
        {/* Left: Active Pair, Price, Live Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
              {currentPair}
              {pairInfo.isOtc && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                  OTC
                </span>
              )}
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">({pairInfo.displayName})</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-base font-bold font-mono transition-colors ${
              isUpTick ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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

        {/* Center / Right: Timeframe, Candle countdown & Controls */}
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

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة الكاملة'}
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
          الأزواج النشطة:
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

      {/* Lightweight Charts Canvas Container */}
      <div className="relative w-full flex-1 min-h-[340px] pt-2">
        <div ref={chartContainerRef} className="w-full h-full rounded-xl overflow-hidden" />

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
              <span className="text-emerald-300 font-bold">إشارات CALL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-300 font-bold">إشارات PUT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
