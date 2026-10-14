import { useState } from 'react';
import { X, Cloud, Terminal, Check, Copy, ExternalLink, ShieldCheck, FileCode, CheckCircle2 } from 'lucide-react';

interface RenderDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_FILES: Record<string, { label: string; path: string; desc: string }> = {
  'render.yaml': {
    label: 'render.yaml',
    path: 'render.yaml',
    desc: 'ملف التهيئة التلقائية السحابية (Render Blueprint) لتشغيل السيرفر والمحرك 24/7',
  },
  'main.py': {
    label: 'main.py',
    path: 'main.py',
    desc: 'نقطة الانطلاق المتزامنة لتشغيل FastAPI مع محرك Quotex وبوت تليجرام في آن واحد',
  },
  'quotex_ws.py': {
    label: 'core/quotex_ws.py',
    path: 'core/quotex_ws.py',
    desc: 'محرك البث اللحظي المباشر لشمعات الدقيقة (OHLCV) وأزواج OTC والعادية',
  },
  'indicators.py': {
    label: 'core/indicators.py',
    path: 'core/indicators.py',
    desc: 'خوارزميات المؤشرات الفنية (RSI, EMA 9/21, Bollinger, MACD) وتوليد الإشارات',
  },
  'telegram_bot.py': {
    label: 'bot/telegram_bot.py',
    path: 'bot/telegram_bot.py',
    desc: 'بوت تليجرام للبث التلقائي المستمر للإشارات المكتشفة للقنوات والمحادثات',
  },
  'server.py': {
    label: 'web/server.py',
    path: 'web/server.py',
    desc: 'خادم الويب عالي السرعة بـ FastAPI مع WebSockets وبوابات الفحص الصحي /health',
  },
  'index.html': {
    label: 'web/templates/index.html',
    path: 'web/templates/index.html',
    desc: 'لوحة التحكم السحابية مع شارت الكانفاس الأصلي (Native Canvas - بدون TradingView نهائياً)',
  },
  'requirements.txt': {
    label: 'requirements.txt',
    path: 'requirements.txt',
    desc: 'مكتبات بايثون المطلوبة للاستضافة على ريندر (FastAPI, Uvicorn, WebSockets, Aiohttp)',
  },
};

export default function RenderDeployModal({ isOpen, onClose }: RenderDeployModalProps) {
  const [selectedFile, setSelectedFile] = useState<string>('render.yaml');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFileData = PROJECT_FILES[selectedFile];

  const handleCopyPath = () => {
    navigator.clipboard.writeText(currentFileData.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>جاهز للنشر على استضافة ريندر (Render 24/7)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for Production
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                تم إنشاء وتوليد كافة ملفات بايثون والسيرفر السحابي وشارت الكانفاس بدون أي مكتبات خارجية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 3 Steps Guide Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-black">
                1
              </div>
              <h4 className="text-xs font-bold text-white">ارفع المشروع إلى GitHub</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                الملفات منشأة وجاهزة في المجلد الرئيسي. ارفعها إلى مستودعك الخاص.
              </p>
            </div>

            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center text-xs font-black">
                2
              </div>
              <h4 className="text-xs font-bold text-white">اختر Blueprint على Render</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                في منصة Render اضغط New + ثم Blueprint واختر المستودع وسيقوم ببنائه آلياً عبر render.yaml.
              </p>
            </div>

            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs font-black">
                3
              </div>
              <h4 className="text-xs font-bold text-white">ضع متغيرات تليجرام</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                أضف TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID في إعدادات البيئة ليعمل البث 24/7 دون توقف!
              </p>
            </div>
          </div>

          {/* File Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>الملفات المُنشأة خصيصاً لاستضافة Render:</span>
              </span>
              <button
                onClick={handleCopyPath}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 font-mono transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ مسار الملف'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-800">
              {Object.keys(PROJECT_FILES).map((fileKey) => {
                const isSelected = fileKey === selectedFile;
                return (
                  <button
                    key={fileKey}
                    onClick={() => setSelectedFile(fileKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    {PROJECT_FILES[fileKey].label}
                  </button>
                );
              })}
            </div>

            {/* Selected File Details */}
            <div className="mt-3 p-4 bg-gray-950 rounded-xl border border-gray-800 font-mono text-xs">
              <div className="flex items-center justify-between text-gray-400 text-[11px] pb-2 border-b border-gray-800/80 mb-2">
                <span>المسار: <b className="text-emerald-400">{currentFileData.path}</b></span>
                <span className="text-gray-500">مُنشأ في المشروع</span>
              </div>
              <p className="text-gray-300 text-xs font-sans mb-3">{currentFileData.desc}</p>
              
              <div className="p-3 bg-gray-900 rounded-lg text-[11px] text-gray-400 flex items-center justify-between">
                <span>الملف متواجد وجاهز في مجلد المشروع للإرسال مباشرة إلى GitHub و Render.</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>محفوظ بالكامل</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
          <a
            href="https://dashboard.render.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>الانتقال إلى Render Dashboard</span>
          </a>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
