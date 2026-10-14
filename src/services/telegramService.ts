import { Signal } from '../types/trading';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  autoSendEnabled: boolean;
}

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  autoSendEnabled: true,
};

export function getStoredTelegramConfig(): TelegramConfig {
  try {
    const saved = localStorage.getItem('quotex_telegram_config');
    if (saved) {
      return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_TELEGRAM_CONFIG;
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem('quotex_telegram_config', JSON.stringify(config));
  } catch {
    // fallback
  }
}

/**
 * Formats a signal into a beautiful Telegram message
 */
export function formatSignalForTelegram(signal: Signal): string {
  const isCall = signal.direction === 'CALL';
  const icon = isCall ? '🟢' : '🔴';
  const actionText = isCall ? 'CALL / صعود (شراء) ⬆️' : 'PUT / هبوط (بيع) ⬇️';
  const timeStr = new Date(signal.time).toLocaleTimeString('ar-SA', { hour12: true });

  return `
🚨 <b>إشارة تداول فورية جديدة | QUOTEX ELITE</b> 🚨
───────────────────────
💱 <b>الزوج:</b> <code>${signal.pair}</code>
🎯 <b>الاتجاه:</b> ${icon} <b>${actionText}</b>
📊 <b>نسبة النجاح المتوقعة:</b> <code>${signal.confidence}%</code> ⭐
💰 <b>العائد الحالي (Payout):</b> <code>${signal.payout}%</code>
⏱️ <b>مدة الصفقة (Expiry):</b> <code>1 دقيقة (1M M1)</code>
📈 <b>سعر الدخول الموصى به:</b> <code>${signal.entryPrice}</code>
🧠 <b>الاستراتيجية والمؤشرات:</b> <i>${signal.strategy}</i>
🕒 <b>توقيت الإشارة:</b> <code>${timeStr}</code>
───────────────────────
⚠️ <i>نصيحة: التزم بإدارة رأس المال (1% - 3% كحد أقصى لكل صفقة). لا تطارد الشمعة بعد انقضاء 10 ثوانٍ!</i>
🤖 <b>Quotex Elite System v3.5 - Zero Lag</b>
`.trim();
}

/**
 * Sends a message to Telegram using the official Bot API
 */
export async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<{ success: boolean; message: string }> {
  if (!botToken || !chatId) {
    return { success: false, message: 'يرجى إدخال Bot Token و Chat ID أولاً في الإعدادات' };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'تم إرسال الإشارة بنجاح إلى تليجرام! ✅' };
    } else {
      return { success: false, message: `خطأ من تليجرام: ${data.description || 'فشل الإرسال'}` };
    }
  } catch (error) {
    return { success: false, message: `تعذر الاتصال بـ Telegram API: ${(error as Error).message}` };
  }
}

/**
 * Verifies bot token validity via Telegram getMe
 */
export async function verifyTelegramBot(botToken: string): Promise<{ success: boolean; botName?: string; username?: string; message: string }> {
  if (!botToken.trim()) {
    return { success: false, message: 'توكن البوت فارغ' };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/getMe`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok) {
      return {
        success: true,
        botName: data.result.first_name,
        username: data.result.username,
        message: `البوت متصل بنجاح: @${data.result.username} (${data.result.first_name})`,
      };
    } else {
      return { success: false, message: data.description || 'التوكن غير صالح' };
    }
  } catch (error) {
    return { success: false, message: `خطأ اتصال: ${(error as Error).message}` };
  }
}
