"""
Automated Telegram Signal Broadcaster
Asynchronously broadcasts high-probability Quotex trading signals
(Asset name, OTC badge, Direction, Timeframe, Payout %, Confidence %, and Technical Strategy)
directly to designated Telegram channels or private chats.
"""

import os
import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

logger = logging.getLogger("TelegramBroadcaster")

class TelegramBroadcaster:
    def __init__(self, bot_token: Optional[str] = None, chat_id: Optional[str] = None):
        self.bot_token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID", "").strip()
        self.enabled = bool(self.bot_token and self.chat_id)

    def update_credentials(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token.strip()
        self.chat_id = chat_id.strip()
        self.enabled = bool(self.bot_token and self.chat_id)
        logger.info(f"Telegram credentials updated. Enabled: {self.enabled}")

    def format_signal_message(self, signal: Dict[str, Any]) -> str:
        is_call = signal.get("direction") == "CALL"
        icon = "🟢" if is_call else "🔴"
        action = "CALL / صعود (شراء) ⬆️" if is_call else "PUT / هبوط (بيع) ⬇️"
        otc_badge = " [⚡ OTC سوبر]" if signal.get("is_otc") else ""
        time_str = datetime.fromtimestamp(signal.get("timestamp", 0) / 1000).strftime("%I:%M:%S %p")

        message = (
            f"🚨 <b>إشارة كوتيكس لحظية جديدة | QUOTEX ELITE</b> 🚨\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"💱 <b>الزوج:</b> <code>{signal.get('pair')}{otc_badge}</code>\n"
            f"🎯 <b>الاتجاه:</b> {icon} <b>{action}</b>\n"
            f"📊 <b>نسبة الثقة والدقة:</b> <code>{signal.get('confidence')}%</code> ⭐\n"
            f"💰 <b>العائد الحالي (Payout):</b> <code>{signal.get('payout')}%</code>\n"
            f"⏱️ <b>مدة الصفقة (Expiry):</b> <code>{signal.get('timeframe', '1M')}</code>\n"
            f"📈 <b>سعر الدخول:</b> <code>{signal.get('entry_price')}</code>\n"
            f"🧠 <b>الاستراتيجية:</b> <i>{signal.get('strategy')}</i>\n"
            f"🕒 <b>توقيت الرصد:</b> <code>{time_str}</code>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"⚠️ <i>إدارة رأس المال الصارمة: 1% إلى 2% من الرصيد. لا تدخل بعد مرور 10 ثوانٍ من الشمعة!</i>\n"
            f"🤖 <b>Render Automated Bot v3.5 - 24/7 Zero Lag</b>"
        )
        return message

    async def broadcast_signal(self, signal: Dict[str, Any]) -> bool:
        """Sends signal to Telegram channel or chat"""
        if not self.enabled:
            logger.debug("Telegram broadcast skipped: bot_token or chat_id not configured.")
            return False

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": self.format_signal_message(signal),
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)
                data = response.json()
                if data.get("ok"):
                    logger.info(f"✅ Telegram signal broadcasted for {signal.get('pair')}")
                    signal["telegram_sent"] = True
                    return True
                else:
                    logger.error(f"❌ Telegram API Error: {data.get('description')}")
                    return False
        except Exception as e:
            logger.error(f"Failed to broadcast Telegram message: {e}")
            return False

    async def test_connection(self) -> Dict[str, Any]:
        """Validates bot token via getMe"""
        if not self.bot_token:
            return {"success": False, "message": "Bot token is empty"}

        url = f"https://api.telegram.org/bot{self.bot_token}/getMe"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                data = res.json()
                if data.get("ok"):
                    bot_user = data["result"]
                    return {
                        "success": True,
                        "bot_name": bot_user.get("first_name"),
                        "username": bot_user.get("username"),
                        "message": f"Connected as @{bot_user.get('username')}"
                    }
                else:
                    return {"success": False, "message": data.get("description", "Invalid token")}
        except Exception as e:
            return {"success": False, "message": f"Connection error: {str(e)}"}
