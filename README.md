# 🚀 Quotex Elite Terminal - دليل النشر والتشغيل على استضافة Render (24/7)

نظام تداول وتحليل فوري 100% آلي مصمم خصيصاً لمنصة **Quotex**، تم إلغاء أي اعتماد على مكتبات خارجية كـ TradingView نهائياً، والاعتماد بالكامل على محرك شموع مدمج بتقنية **HTML5 Canvas الأصلية** وخادم عالي السرعة بـ **Python FastAPI + WebSockets**.

---

## 📁 الهيكل البرمجي للمشروع (Production Architecture)

```text
├── core/
│   ├── __init__.py
│   ├── quotex_ws.py       # محرك تدفق البيانات المباشر اللحظي للأزواج العادية وأزواج OTC
│   └── indicators.py      # حاسبة المؤشرات الفنية (RSI, EMA 9/21, Bollinger Bands, MACD) وتوليد الإشارات
├── bot/
│   ├── __init__.py
│   └── telegram_bot.py    # بوت تليجرام للبث الفوري التلقائي للإشارات (مع معرفات القنوات)
├── web/
│   ├── __init__.py
│   ├── server.py          # خادم FastAPI + WebSockets وبوابات الفحص اليدوي والصحة /health
│   └── templates/
│       └── index.html     # لوحة تحكم عصرية فائقة السرعة مع شارت كانفاس أصلي (No TradingView)
├── main.py                # المدخل المتزامن (Asyncio + Uvicorn) لتشغيل الخادم والبوت والمحرك معاً
├── render.yaml            # ملف التهيئة التلقائية السحابية (Render Blueprint)
├── Procfile               # ملف تشغيل السيرفر المباشر
└── requirements.txt       # حزم بايثون المعتمدة
```

---

## ⚡ خطوات النشر على استضافة ريندر (Render.com) بـ 3 خطوات فقط

### 1. رفع المشروع إلى GitHub
قم بإنشاء مستودع جديد (Repository) على GitHub وارفع هذه الملفات إليه:
```bash
git init
git add .
git commit -m "Initial commit of Quotex Elite Terminal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quotex-terminal.git
git push -u origin main
```

### 2. الربط مع Render (Blueprint أو Web Service)
1. سجّل الدخول إلى حسابك في [Render Dashboard](https://dashboard.render.com).
2. اضغط على زر **New +** ثم اختر **Blueprint** (أو **Web Service**).
3. اختر مستودع الـ GitHub الخاص بالمشروع.
4. سيتعرّف Render تلقائياً على ملف `render.yaml` ويبدأ البناء بدون أي خطوات إضافية!

### 3. المتغيرات البيئية (Environment Variables)
في إعدادات السيرفر في Render (قسم **Environment**)، يمكنك إضافة المتغيرات التالية:
- `TELEGRAM_BOT_TOKEN`: رمز توكن البوت الذي حصلت عليه من `@BotFather`
- `TELEGRAM_CHAT_ID`: معرف قناتك أو شات التليجرام الخاص بك (مثل `@MyChannel` أو معرّف رقمي)
- `MIN_CONFIDENCE`: الحد الأدنى للدقة لإرسال الإشارة تلقائياً (الافتراضي: `85`)
- `PORT`: المنفذ (يتم تعيينه تلقائياً من قِبل Render عبر `$PORT`)

---

## 🌟 مميزات النظام الحصرية
- **بدون أي اعتماد على TradingView**: شارت كانفاس أصلي وخفيف جداً وسريع الاستجابة.
- **دعم كامل لأزواج OTC طوال أيام الأسبوع 24/7**: USD/BRL OTC, EUR/USD OTC, USD/TRY OTC بعوائد تصل حتى **95%**.
- **رابط فحص الحالة (Health Check)**: متوفر على `/health` لمراقبة استقرار الخادم على مدار الساعة.
- **بث تلقائي متكامل لتليجرام**: رسائل منسقة بالإيموجي ونسب الدقة والاستراتيجية المتبعة.
