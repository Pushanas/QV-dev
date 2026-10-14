/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Shield,
  LineChart,
  Bot,
  SlidersHorizontal,
  History as HistoryIcon,
  Send,
  Volume2,
  VolumeX,
  Wallet,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Cloud,
} from 'lucide-react';

import { marketEngine } from './services/marketEngine';
import NativeCanvasChart from './components/NativeCanvasChart';
import PayoutsList from './components/PayoutsList';
import ControlButtonsPanel from './components/ControlButtonsPanel';
import LiveSignalsFeed from './components/LiveSignalsFeed';
import TradeExecutionPanel from './components/TradeExecutionPanel';
import TelegramBotModal from './components/TelegramBotModal';
import IndicatorsModal from './components/IndicatorsModal';
import HistoryModal from './components/HistoryModal';
import RenderDeployModal from './components/RenderDeployModal';
import { SignalDirection } from './types/trading';

export default function App() {
  const [engineState, setEngineState] = useState(marketEngine.getState());
  const [activeTab, setActiveTab] = useState<'terminal' | 'bot' | 'indicators' | 'history'>('terminal');

  // Modals
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Subscribe to real-time market engine updates
  useEffect(() => {
    const unsubscribe = marketEngine.subscribe(() => {
      setEngineState(marketEngine.getState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const {
    currentPair,
    candles,
    payouts,
    latestSignals,
    activeTrades,
    demoBalance,
    totalWins,
    totalLosses,
    status,
    isBotActive,
    isScanning,
    soundEnabled,
  } = engineState;

  const currentCandles = candles[currentPair] || [];
  const currentPayout = payouts[currentPair] || 88;

  const handleSelectPair = (pair: string) => {
    marketEngine.setPair(pair);
  };

  const handleTriggerManualScan = async () => {
    await marketEngine.triggerManualScan();
  };

  const handleToggleBot = () => {
    marketEngine.toggleBot();
  };

  const handleToggleSound = () => {
    marketEngine.toggleSound();
  };

  const handleExecuteTrade = (pair: string, direction: SignalDirection, amount: number, expirySeconds: number) => {
    marketEngine.executeTrade(pair, direction, amount, expirySeconds);
  };

  const handleResetBalance = () => {
    marketEngine.resetDemoBalance(10000);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-gray-900 border-l border-gray-800 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between h-20 px-6 bg-gray-950 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 via-teal-300 to-blue-400 block font-mono">
                  QUOTEX ELITE
                </span>
                <span className="text-[10px] text-gray-400 font-bold block -mt-1 tracking-widest">
                  PRO TERMINAL
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-2 mt-2">
            <button
              onClick={() => {
                setActiveTab('terminal');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all text-right ${
                activeTab === 'terminal'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LineChart className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>شارت الكانفاس اللحظي</span>
            </button>

            <button
              onClick={() => {
                setIsRenderModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 transition group text-right"
            >
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-purple-400 group-hover:scale-110 transition shrink-0" />
                <span>استضافة ريندر (Render 24/7)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                جاهز
              </span>
            </button>

            <button
              onClick={() => {
                setIsTelegramModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition group text-right"
            >
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-blue-400 group-hover:scale-110 transition shrink-0" />
                <span>إعدادات البوت الآلي</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                تليجرام
              </span>
            </button>

            <button
              onClick={() => {
                setIsIndicatorsModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition group text-right"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-purple-400 group-hover:scale-110 transition shrink-0" />
                <span>التحكم بالمؤشرات</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                RSI / EMA
              </span>
            </button>

            <button
              onClick={() => {
                setIsHistoryModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition group text-right"
            >
              <div className="flex items-center gap-3">
                <HistoryIcon className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition shrink-0" />
                <span>سجل التوصيات الحية</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold font-mono">
                {totalWins}W / {totalLosses}L
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 space-y-3">
          {/* Demo account quick widget */}
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800/80">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>الرصيد التجريبي النشط:</span>
            </span>
            <div className="text-lg font-black font-mono text-white mt-1">
              ${demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span>System v3.5 - Zero Manual Lag</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-col flex-1 overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between h-20 bg-gray-900 border-b border-gray-800 px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white bg-gray-950 border border-gray-800 rounded-xl md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <span>منصة المراقبة الحية والتحليل التلقائي</span>
                <Sparkles className="w-4 h-4 text-emerald-400 hidden sm:inline" />
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-mono">
                  إطار زمني: 1 دقيقة (1M)
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  الزوج المختار: {currentPair}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Render Cloud Button */}
            <button
              onClick={() => setIsRenderModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition"
            >
              <Cloud className="w-3.5 h-3.5 text-purple-400" />
              <span>استضافة Render</span>
            </button>

            {/* Telegram Shortcut */}
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-bold transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ربط التليجرام</span>
            </button>

            {/* Sound Mute/Unmute */}
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل التنبيهات الصوتية'}
              className="p-2 bg-gray-950 border border-gray-800 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Connection Status Pill */}
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                status.includes('Live')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">{status}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-4 md:p-8 space-y-6 flex-1">
          {/* Top Row: Payouts List (1 col) + Native Canvas Chart (3 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
            {/* Payouts Panel */}
            <div className="lg:col-span-1 min-h-[460px]">
              <PayoutsList
                currentPair={currentPair}
                payouts={payouts}
                onSelectPair={handleSelectPair}
              />
            </div>

            {/* Native Canvas Chart Container (No TradingView) */}
            <div className="lg:col-span-3 min-h-[460px]">
              <NativeCanvasChart
                currentPair={currentPair}
                candles={currentCandles}
                payout={currentPayout}
                signals={latestSignals}
                onSelectPair={handleSelectPair}
              />
            </div>
          </div>

          {/* Middle Row: Trade Execution & Demo Order Placement */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Controls */}
            <div className="lg:col-span-1">
              <ControlButtonsPanel
                isBotActive={isBotActive}
                isScanning={isScanning}
                soundEnabled={soundEnabled}
                onTriggerManualScan={handleTriggerManualScan}
                onToggleBot={handleToggleBot}
                onToggleSound={handleToggleSound}
                onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
                onOpenIndicatorsModal={() => setIsIndicatorsModalOpen(true)}
              />
            </div>

            {/* Simulated Quotex Trade Bar */}
            <div className="lg:col-span-2">
              <TradeExecutionPanel
                currentPair={currentPair}
                payout={currentPayout}
                demoBalance={demoBalance}
                activeTrades={activeTrades}
                onExecuteTrade={handleExecuteTrade}
                onResetBalance={handleResetBalance}
              />
            </div>
          </div>

          {/* Bottom Row: Live Signals Stream */}
          <div>
            <LiveSignalsFeed
              signals={latestSignals}
              onSelectPair={handleSelectPair}
              onQuickTrade={(pair, dir) => handleExecuteTrade(pair, dir, 50, 60)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <TelegramBotModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        sampleSignal={latestSignals[0]}
      />

      <IndicatorsModal
        isOpen={isIndicatorsModalOpen}
        onClose={() => setIsIndicatorsModalOpen(false)}
        currentPair={currentPair}
        candles={currentCandles}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        signals={latestSignals}
        totalWins={totalWins}
        totalLosses={totalLosses}
      />

      <RenderDeployModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
      />
    </div>
  );
}
