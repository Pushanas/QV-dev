import { useState, useEffect } from 'react';
import { Send, X, ShieldCheck, Check, AlertCircle, ExternalLink, MessageSquare } from 'lucide-react';
import {
  getStoredTelegramConfig,
  saveTelegramConfig,
  sendTelegramMessage,
  verifyTelegramBot,
} from '../services/telegramService';
import { Signal } from '../types/trading';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleSignal?: Signal;
}

export default function TelegramBotModal({ isOpen, onClose, sampleSignal }: TelegramBotModalProps) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [autoSend, setAutoSend] = useState(true);
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'loading' | null>(null);
  const [botInfo, setBotInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredTelegramConfig();
      setBotToken(config.botToken);
      setChatId(config.chatId);
      setAutoSend(config.autoSendEnabled);
      setTestingStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveTelegramConfig({
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      autoSendEnabled: autoSend,
    });
    setTestingStatus('تم حفظ إعدادات البوت بنجاح! سيتم إرسال الإشارات تلقائياً.');
    setStatusType('success');
  };

  const handleTestConnection = async () => {
    if (!botToken.trim()) {
      setTestingStatus('يرجى كتابة رمز التوكن (Bot Token) أولاً');
      setStatusType('error');
      return;
    }
    setTestingStatus('جاري التحقق من التوكن عبر Telegram API...');
    setStatusType('loading');

    const result = await verifyTelegramBot(botToken);
    if (result.success) {
      setBotInfo(result.message);
      setTestingStatus('تم التحقق بنجاح! البوت جاهز للاستخدام.');
      setStatusType('success');
    } else {
      setBotInfo(null);
      setTestingStatus(result.message);
      setStatusType('error');
    }
  };

  const handleSendTestSignal = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestingStatus('يرجى تعبئة التوكن ومعرف الشات (Chat ID)');
      setStatusType('error');
      return;
    }

    setTestingStatus('جاري إرسال إشارة تجريبية إلى تليجرام...');
    setStatusType('loading');

    const testMessage = `
🚨 <b>إشارة تجريبية | QUOTEX ELITE TEST</b> 🚨
───────────────────────
💱 <b>الزوج:</b> <code>EUR/USD (OTC)</code>
🎯 <b>الاتجاه:</b> 🟢 <b>CALL / صعود (شراء) ⬆️</b>
📊 <b>نسبة النجاح المتوقعة:</b> <code>95%</code> ⭐
💰 <b>العائد الحالي (Payout):</b> <code>93%</code>
⏱️ <b>مدة الصفقة (Expiry):</b> <code>1 دقيقة (1M)</code>
📈 <b>سعر الدخول:</b> <code>1.08540</code>
🧠 <b>الاستراتيجية:</b> <i>ارتداد من منطقة دعم قوية + RSI Oversold (24.2)</i>
🕒 <b>التوقيت:</b> <code>${new Date().toLocaleTimeString('ar-SA')}</code>
───────────────────────
✅ <b>تهانينا! تم ربط بوت التليجرام الخاص بك بنجاح تام!</b>
🤖 <i>Quotex Elite Auto Terminal System</i>
`.trim();

    const res = await sendTelegramMessage(botToken, chatId, testMessage);
    if (res.success) {
      setTestingStatus('تم إرسال الإشارة التجريبية بنجاح إلى قناتك / محادثتك! تفقد تليجرام الآن.');
      setStatusType('success');
      handleSave();
    } else {
      setTestingStatus(res.message);
      setStatusType('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">إعدادات وربط بوت تليجرام (Telegram Bot)</h3>
              <p className="text-xs text-gray-400">بث تلقائي فوري للصفقات والإشارات إلى قناتك أو مجموعتك</p>
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
        <div className="p-5 space-y-5">
          {/* Status Message Alert */}
          {testingStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border ${
                statusType === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  : statusType === 'error'
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                  : 'bg-blue-950/40 text-blue-300 border-blue-500/40'
              }`}
            >
              {statusType === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testingStatus}</span>
            </div>
          )}

          {botInfo && (
            <div className="p-3 bg-blue-950/30 border border-blue-800/50 rounded-xl text-xs text-blue-300 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{botInfo}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                رمز البوت (Telegram Bot Token)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono transition"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                يمكنك الحصول عليه مجاناً عبر التحدث مع بوت <span className="text-blue-400 font-mono">@BotFather</span> في تليجرام وإرسال الأمر <code className="bg-gray-800 px-1 py-0.5 rounded text-white">/newbot</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                معرّف المحادثة أو القناة (Chat ID / Channel ID)
              </label>
              <input
                type="text"
                placeholder="مثال: 123456789 أو @MySignalsChannel أو -100123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                للحصول على معرّفك الشخصي استخدم <span className="text-blue-400 font-mono">@userinfobot</span>، وللقنوات أضف البوت مشرفاً (Admin) واكتب معرف القناة مثل <code className="bg-gray-800 px-1 py-0.5 rounded text-white">@channel_name</code>
              </p>
            </div>

            {/* Auto send toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
              <div>
                <span className="text-xs font-bold text-white block">الإرسال التلقائي المستمر للإشارات</span>
                <span className="text-[11px] text-gray-400">إرسال كل إشارة تتجاوز نسبة ثقتها 85% تلقائياً دون تدخل يدوي</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSend}
                  onChange={(e) => setAutoSend(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Telegram Preview Bubble */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>معاينة شكل الإشارة كما تظهر في تليجرام:</span>
            </div>
            <div className="bg-[#182533] p-4 rounded-2xl border border-gray-700/60 font-sans text-xs text-[#e4ecf2] leading-relaxed shadow-lg max-w-md mx-auto">
              <div className="font-bold text-amber-400 mb-1">🚨 إشارة تداول فورية جديدة | QUOTEX ELITE 🚨</div>
              <div className="text-gray-500 text-[10px] mb-2">───────────────────────</div>
              <div className="space-y-1 font-mono text-[11px]">
                <div>💱 <b>الزوج:</b> <span className="bg-black/30 px-1 rounded text-cyan-300">{sampleSignal?.pair || 'EUR/USD'}</span></div>
                <div>🎯 <b>الاتجاه:</b> 🟢 <b className="text-emerald-400">CALL / صعود (شراء) ⬆️</b></div>
                <div>📊 <b>نسبة النجاح المتوقعة:</b> <span className="bg-black/30 px-1 rounded text-yellow-300">{sampleSignal?.confidence || 94}%</span> ⭐</div>
                <div>💰 <b>العائد الحالي (Payout):</b> <span className="bg-black/30 px-1 rounded text-emerald-300">{sampleSignal?.payout || 89}%</span></div>
                <div>⏱️ <b>مدة الصفقة (Expiry):</b> <span className="bg-black/30 px-1 rounded">1 دقيقة (1M M1)</span></div>
                <div>📈 <b>سعر الدخول:</b> <span className="bg-black/30 px-1 rounded">{sampleSignal?.entryPrice || 1.08450}</span></div>
                <div>🧠 <b>الاستراتيجية:</b> <i className="text-gray-300">{sampleSignal?.strategy || 'تشبع بيعي قوي RSI + ارتداد شرائي'}</i></div>
              </div>
              <div className="text-gray-500 text-[10px] my-2">───────────────────────</div>
              <div className="text-[10px] text-gray-400 italic">⚠️ نصيحة: التزم بإدارة رأس المال (1% - 3% كحد أقصى).</div>
              <div className="text-[10px] text-blue-300 font-bold mt-1">🤖 Quotex Elite System v3.5 - Zero Lag</div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-800 bg-gray-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>فحص التوكن</span>
            </button>
            <button
              onClick={handleSendTestSignal}
              className="px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال إشارة تجريبية الآن</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                handleSave();
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتفعيل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
