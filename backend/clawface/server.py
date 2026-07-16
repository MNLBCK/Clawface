"""FastAPI WebSocket server for real-time avatar control."""

from __future__ import annotations

import asyncio
import json
import math
import time
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from .protocol import emotion_event, lip_sync_event

app = FastAPI(title="Clawface Avatar Backend", version="0.1.0")


class ConnectionHub:
    def __init__(self) -> None:
        self._clients: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._clients.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._clients.discard(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        stale: list[WebSocket] = []
        for client in self._clients:
            try:
                await client.send_json(message)
            except RuntimeError:
                stale.append(client)
        for client in stale:
            self.disconnect(client)


hub = ConnectionHub()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws/avatar")
async def avatar_socket(websocket: WebSocket) -> None:
    await hub.connect(websocket)
    try:
        await websocket.send_json(emotion_event("neutral").to_jsonable())
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            if data.get("type") == "emotion":
                await hub.broadcast(
                    emotion_event(data.get("emotion", "neutral"), float(data.get("intensity", 1.0))).to_jsonable()
                )
    except WebSocketDisconnect:
        hub.disconnect(websocket)


async def demo_pulse() -> None:
    """Emit synthetic lip-sync frames for frontend development without a microphone."""

    while True:
        phase = time.monotonic() * 6.0
        amplitude = (math.sin(phase) + 1.0) / 2.0
        await hub.broadcast(lip_sync_event(amplitude, math.sqrt(amplitude)).to_jsonable())
        await asyncio.sleep(1 / 30)


def main() -> None:
    import uvicorn

    uvicorn.run("clawface.server:app", host="0.0.0.0", port=8765, reload=False)
