"""WebSocket message models shared by backend producers."""

from __future__ import annotations

from dataclasses import asdict, dataclass
import time
from typing import Any, Literal

Emotion = Literal["neutral", "happy", "sad", "angry", "surprised", "thinking"]


@dataclass(frozen=True)
class AvatarEvent:
    """Envelope consumed by the Godot avatar controller."""

    type: Literal["lip_sync", "emotion"]
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
