"""
Quotex Elite High-Performance Web Dashboard & Server
Runs FastAPI with asynchronous WebSockets, REST APIs, and Jinja2 templates.
Built with zero external charting widgets (100% Native HTML5 Canvas / JS engine).
"""

import asyncio
import json
import os
import time
from typing import Dict, Any, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI(title="Quotex Elite Terminal", version="3.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Shared in-memory engine state
GLOBAL_STATE: Dict[str, Any] = {
    "status": "متصل مباشر (Live Engine)",
    "current_pair": "USD/BRL (OTC)",
    "candles": {},
    "payouts": {},
    "latest_signals": [],
    "assets": [],
    "bot_active": True,
    "last_tick_time": time.time(),
    "server_start_time": time.time()
}

# Active WebSocket dashboard clients
connected_clients: List[WebSocket] = []

class TelegramConfigRequest(BaseModel):
    bot_token: str
    chat_id: str

@app.get("/", response_class=HTMLResponse)
async def get_dashboard(request: Request):
    """Renders the Native Canvas Dark Mode Quotex Dashboard"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "initial_state": json.dumps({
            "status": GLOBAL_STATE["status"],
            "current_pair": GLOBAL_STATE["current_pair"],
            "payouts": GLOBAL_STATE["payouts"],
            "assets": GLOBAL_STATE["assets"]
        })
    })

@app.get("/health")
async def health_check():
    """Health check endpoint for Render deployment monitoring"""
    uptime_seconds = int(time.time() - GLOBAL_STATE.get("server_start_time", time.time()))
    return {
        "status": "healthy",
        "engine": "Quotex Elite Real-time Stream",
        "uptime_seconds": uptime_seconds,
        "connected_ws_clients": len(connected_clients),
        "total_signals": len(GLOBAL_STATE.get("latest_signals", []))
    }

@app.get("/api/state")
async def get_state():
    """Returns current live data snapshot"""
    return GLOBAL_STATE

@app.post("/api/scan")
async def trigger_scan():
    """Triggers an immediate AI market scan across all OTC and regular pairs"""
    engine = app.state.quotex_engine if hasattr(app.state, "quotex_engine") else None
    if engine:
        sig = await engine.trigger_manual_scan()
        return {"success": True, "signal": sig}
    return {"success": False, "message": "Engine not attached"}

@app.post("/api/telegram/config")
async def update_telegram_config(config: TelegramConfigRequest):
    """Dynamically updates Telegram Bot Token and Chat ID"""
    broadcaster = app.state.telegram_broadcaster if hasattr(app.state, "telegram_broadcaster") else None
    if broadcaster:
        broadcaster.update_credentials(config.bot_token, config.chat_id)
        test_res = await broadcaster.test_connection()
        return {"success": True, "test": test_res}
    return {"success": False, "message": "Broadcaster not initialized"}

@app.post("/api/telegram/test")
async def send_telegram_test():
    """Sends a sample test signal to the connected Telegram chat"""
    broadcaster = app.state.telegram_broadcaster if hasattr(app.state, "telegram_broadcaster") else None
    if not broadcaster or not broadcaster.enabled:
        raise HTTPException(status_code=400, detail="Telegram credentials not set")

    sample_signal = {
        "id": f"test_{int(time.time())}",
        "pair": "USD/BRL (OTC)",
        "is_otc": True,
        "direction": "CALL",
        "confidence": 95,
        "payout": 95,
        "entry_price": 5.4862,
        "timestamp": int(time.time() * 1000),
        "timeframe": "1M (دقيقة واحدة)",
        "expiry_seconds": 60,
        "strategy": "إشارة تجريبية للتحقق من الاتصال السحابي على Render",
        "status": "ACTIVE"
    }

    success = await broadcaster.broadcast_signal(sample_signal)
    return {"success": success}

@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """High-frequency real-time WebSocket pipe for native canvas chart & dashboard updates"""
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            # Broadcast the updated state directly to the client
            payload = {
                "status": GLOBAL_STATE.get("status"),
                "current_pair": GLOBAL_STATE.get("current_pair"),
                "payouts": GLOBAL_STATE.get("payouts", {}),
                "candles": GLOBAL_STATE.get("candles", {}),
                "latest_signals": GLOBAL_STATE.get("latest_signals", []),
                "assets": GLOBAL_STATE.get("assets", []),
                "timestamp": time.time()
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.5) # 2 FPS high-precision tick push
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
    except Exception as e:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
