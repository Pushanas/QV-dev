"""
Quotex Elite Terminal - Production Entry Point for Render & Cloud Deployment
Concurrently runs:
1. The FastAPI web server and WebSocket dashboard.
2. The asynchronous Quotex streaming engine (24/7 self-healing loop).
3. The automated Telegram signal broadcasting daemon.
"""

import asyncio
import logging
import os
import uvicorn
from contextlib import asynccontextmanager

from web.server import app, GLOBAL_STATE
from core.quotex_ws import QuotexEngine
from bot.telegram_bot import TelegramBroadcaster

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("QuotexMain")

# Global instances
telegram_broadcaster = TelegramBroadcaster()
quotex_engine = QuotexEngine(
    data_store=GLOBAL_STATE,
    signal_callback=telegram_broadcaster.broadcast_signal
)

# Store instances on FastAPI app state for API routes
app.state.quotex_engine = quotex_engine
app.state.telegram_broadcaster = telegram_broadcaster

@asynccontextmanager
async def lifespan(app):
    """Async startup and shutdown lifecycle for background tasks"""
    logger.info("⚡ Initializing Quotex 24/7 background streaming tasks...")
    streaming_task = asyncio.create_task(quotex_engine.start_streaming())
    yield
    logger.info("🛑 Shutting down streaming engine...")
    quotex_engine.is_running = False
    streaming_task.cancel()
    try:
        await streaming_task
    except asyncio.CancelledError:
        pass

# Attach lifespan to FastAPI app
app.router.lifespan_context = lifespan

def main():
    port = int(os.getenv("PORT", "10000"))
    logger.info(f"🚀 Starting Quotex Elite Terminal on 0.0.0.0:{port} (Optimized for Render)")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info", access_log=False)

if __name__ == "__main__":
    main()
