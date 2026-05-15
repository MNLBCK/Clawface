import asyncio
import math
import random
import time
from contextlib import asynccontextmanager, suppress
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

TARGET_FPS = 60
FRAME_INTERVAL_SECONDS = 1.0 / TARGET_FPS


class EmotionTrigger(BaseModel):
    emotion: str


class AvatarServerState:
    def __init__(self) -> None:
        self.clients: set[WebSocket] = set()
        self._emotion: str = "idle"
        self._emotion_lock = asyncio.Lock()

    async def current_emotion(self) -> str:
        async with self._emotion_lock:
            return self._emotion

    async def set_emotion(self, emotion: str) -> None:
        async with self._emotion_lock:
            self._emotion = emotion


state = AvatarServerState()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _app.state.stream_task = asyncio.create_task(lip_sync_stream())
    try:
        yield
    finally:
        stream_task = getattr(_app.state, "stream_task", None)
        if stream_task:
            stream_task.cancel()
            with suppress(asyncio.CancelledError):
                await stream_task


app = FastAPI(title="Clawface Avatar Backend", lifespan=lifespan)


def mock_amplitude(timestamp: float) -> float:
    """Generate mock amplitude in range [0.0, 1.0] using sine + noise."""
    sine = (math.sin(timestamp * 4.0) + 1.0) / 2.0
    jitter = random.uniform(-0.08, 0.08)
    return max(0.0, min(1.0, sine + jitter))


async def broadcast(payload: dict[str, Any]) -> None:
    disconnected: list[WebSocket] = []
    for client in list(state.clients):
        try:
            await client.send_json(payload)
        except Exception:
            disconnected.append(client)

    for client in disconnected:
        with suppress(KeyError):
            state.clients.remove(client)


async def lip_sync_stream() -> None:
    while True:
        now = time.time()
        payload = {
            "type": "lip_sync",
            "amplitude": mock_amplitude(now),
            "emotion": await state.current_emotion(),
            "timestamp": now,
        }
        await broadcast(payload)
        await asyncio.sleep(FRAME_INTERVAL_SECONDS)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    state.clients.add(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        with suppress(KeyError):
            state.clients.remove(websocket)


@app.post("/trigger_emotion")
async def trigger_emotion(trigger: EmotionTrigger) -> dict[str, str]:
    emotion = trigger.emotion.strip()
    if not emotion:
        raise HTTPException(status_code=400, detail="Emotion must not be empty")

    await state.set_emotion(emotion)
    await broadcast({"type": "action", "trigger": emotion})
    return {"status": "ok", "emotion": emotion}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
