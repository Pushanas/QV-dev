import { useState } from 'react';
import { Search, Bot, Power, Volume2, VolumeX, Send, Sliders, CheckCircle2 } from 'lucide-react';

interface ControlButtonsPanelProps {
  isBotActive: boolean;
  isScanning: boolean;
  soundEnabled: boolean;
  onTriggerManualScan: () => void;
  onToggleBot: () => void;
  onToggleSound: () => void;
  onOpenTelegramModal: () => void;
  onOpenIndicatorsModal: () => void;
}

export default function ControlButtonsPanel({
  isBotActive,
  isScanning,
  soundEnabled,
  onTriggerManualScan,
  onToggleBot,
  onToggleSound,
  onOpenTelegramModal,
  onOpenIndicatorsModal,
}: ControlButtonsPanelProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleScanClick = () => {
    onTriggerManualScan();
    showToast('تم إرسال طلب فحص فوري بالذكاء الاصطناعي وجاري استخراج أقوى فرصة!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-blue-600/95 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce border border-blue-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-purple-400 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <span>أزرار التحكم السريع والنظام</span>
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
            Live v3.5
          </span>
        </div>

        <div className="space-y-3">
          {/* Manual Market Scan Button */}
          <button
            onClick={handleScanClick}
            disabled={isScanning}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 relative overflow-hidden group cursor-pointer ${
              isScanning
                ? 'bg-blue-800 opacity-80 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/30 active:scale-[0.98]'
            }`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />
            <Search className={`w-4 h-4 ${isScanning ? 'animate-spin' : 'group-hover:scale-110 transition'}`} />
            <span>{isScanning ? 'جاري الفحص المتقدم للأزواج...' : 'فحص السوق وإرسال إشارة فورية'}</span>
          </button>

          {/* Bot State Toggle Button */}
          <button
            onClick={onToggleBot}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] ${
              isBotActive
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30'
                : 'bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 shadow-red-900/30'
            }`}
          >
            {isBotActive ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <Bot className="w-4 h-4" />
                <span>حالة البوت: يعمل تلقائياً (24/7)</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                <span>حالة البوت: متوقف مؤقتاً (إيقاف)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auxiliary Buttons */}
      <div className="pt-4 mt-4 border-t border-gray-800/80 grid grid-cols-3 gap-2">
        <button
          onClick={onOpenTelegramModal}
          className="py-2.5 px-2 bg-gray-950 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/80 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5"
        >
          <Send className="w-4 h-4 text-blue-400" />
          <span>إعداد تليجرام</span>
        </button>

        <button
          onClick={onOpenIndicatorsModal}
          className="py-2.5 px-2 bg-gray-950 border border-gray-800 hover:border-purple-500/50 hover:bg-gray-800/80 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5"
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>المؤشرات</span>
        </button>

        <button
          onClick={onToggleSound}
          className={`py-2.5 px-2 bg-gray-950 border border-gray-800 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 ${
            soundEnabled
              ? 'text-emerald-400 hover:border-emerald-500/40'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>الصوت مفعّل</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-500" />
              <span>الصوت صامت</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
