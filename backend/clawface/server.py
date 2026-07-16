"""FastAPI WebSocket server for real-time avatar control."""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
import json
import math
import struct
import time
from typing import Any, AsyncIterator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from .audio import pcm16_amplitude
from .protocol import (
    AvatarEvent,
    emotion_event,
    hello_event,
    lip_sync_event,
    validate_emotion,
    validate_intensity,
)


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


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Start and stop background lip-sync producers with the API process."""

    pulse_task = asyncio.create_task(demo_pulse())
    try:
        yield
    finally:
        pulse_task.cancel()
        try:
            await pulse_task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="Clawface Avatar Backend", version="0.1.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws/avatar")
async def avatar_socket(websocket: WebSocket) -> None:
    await hub.connect(websocket)
    try:
        await websocket.send_json(hello_event().to_jsonable())
        await websocket.send_json(emotion_event("neutral").to_jsonable())
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            if data.get("type") == "emotion":
                await hub.broadcast(incoming_emotion_event(data).to_jsonable())
    except WebSocketDisconnect:
        hub.disconnect(websocket)


def lip_sync_event_from_pcm16(pcm: bytes) -> AvatarEvent:
    """Translate a PCM16 audio frame into the avatar lip-sync protocol event."""

    frame = pcm16_amplitude(pcm)
    return lip_sync_event(frame.amplitude, frame.mouth_open)


def incoming_emotion_event(message: dict[str, Any]) -> AvatarEvent:
    """Normalize a client emotion message into the shared avatar event envelope.

    The preferred client-to-server format mirrors outbound events:
    {"type": "emotion", "payload": {"emotion": "happy", "intensity": 1.0}}.
    Top-level emotion fields are still accepted for compatibility with earlier clients.
    """

    payload = message.get("payload")
    if not isinstance(payload, dict):
        payload = message

    emotion = validate_emotion(payload.get("emotion"))
    intensity = validate_intensity(payload.get("intensity", 1.0))
    return emotion_event(emotion, intensity)


def demo_pcm16_frame(amplitude: float, *, sample_count: int = 160) -> bytes:
    """Create a short synthetic PCM16 frame for the MVP demo lip-sync source."""

    peak = int(max(0.0, min(1.0, amplitude)) * 32767)
    if peak == 0:
        return b"\x00\x00" * sample_count
    return b"".join(
        struct.pack("<h", int(math.sin(index / sample_count * math.tau) * peak)) for index in range(sample_count)
    )


async def demo_pulse() -> None:
    """Emit synthetic PCM-backed lip-sync frames for development without a microphone."""

    while True:
        phase = time.monotonic() * 6.0
        amplitude = (math.sin(phase) + 1.0) / 2.0
        await hub.broadcast(lip_sync_event_from_pcm16(demo_pcm16_frame(amplitude)).to_jsonable())
        await asyncio.sleep(1 / 30)


def main() -> None:
    import uvicorn

    uvicorn.run("clawface.server:app", host="0.0.0.0", port=8765, reload=False)
