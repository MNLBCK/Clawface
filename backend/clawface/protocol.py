"""WebSocket message models shared by backend producers."""

from __future__ import annotations

from dataclasses import asdict, dataclass
import time
from typing import Any, Literal

Emotion = Literal["neutral", "happy", "sad", "angry", "surprised", "thinking"]
ProtocolEventType = Literal["hello", "lip_sync", "emotion"]
PROTOCOL_VERSION = "1.0"
SERVER_NAME = "clawface-backend"
SUPPORTED_EVENTS: tuple[ProtocolEventType, ...] = ("hello", "lip_sync", "emotion")


@dataclass(frozen=True)
class AvatarEvent:
    """Envelope consumed by the Godot avatar controller."""

    type: ProtocolEventType
    timestamp: float
    payload: dict[str, Any]

    def to_jsonable(self) -> dict[str, Any]:
        return asdict(self)


def lip_sync_event(amplitude: float, mouth_open: float) -> AvatarEvent:
    return AvatarEvent(
        type="lip_sync",
        timestamp=time.time(),
        payload={"amplitude": amplitude, "mouth_open": mouth_open},
    )


def emotion_event(emotion: Emotion, intensity: float = 1.0) -> AvatarEvent:
    return AvatarEvent(
        type="emotion",
        timestamp=time.time(),
        payload={"emotion": emotion, "intensity": max(0.0, min(1.0, intensity))},
    )


def hello_event() -> AvatarEvent:
    return AvatarEvent(
        type="hello",
        timestamp=time.time(),
        payload={
            "protocol_version": PROTOCOL_VERSION,
            "server_name": SERVER_NAME,
            "supported_events": list(SUPPORTED_EVENTS),
        },
    )
