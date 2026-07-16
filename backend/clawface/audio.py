"""Audio analysis helpers for driving 2D avatar lip-sync."""

from __future__ import annotations

from dataclasses import dataclass
import math


@dataclass(frozen=True)
class LipSyncFrame:
    """Single normalized lip-sync sample sent to the frontend."""

    amplitude: float
    mouth_open: float


def pcm16_amplitude(pcm: bytes, *, sample_width: int = 2, gain: float = 2.5) -> LipSyncFrame:
    """Convert signed little-endian PCM audio bytes into normalized lip-sync values.

    The returned amplitude is RMS normalized to ``0.0..1.0``. ``mouth_open`` applies
    a gentle square-root response so quiet speech still opens the avatar mouth.
    """

    if not pcm:
        return LipSyncFrame(amplitude=0.0, mouth_open=0.0)
    if sample_width != 2:
        raise ValueError("only 16-bit PCM is currently supported")
    usable_length = len(pcm) - (len(pcm) % sample_width)
    if usable_length == 0:
        return LipSyncFrame(amplitude=0.0, mouth_open=0.0)

    total_squares = 0
    sample_count = usable_length // sample_width
    for offset in range(0, usable_length, sample_width):
        sample = int.from_bytes(pcm[offset : offset + sample_width], "little", signed=True)
        total_squares += sample * sample

    rms = math.sqrt(total_squares / sample_count)
    amplitude = min(1.0, max(0.0, rms / 32768.0 * gain))
    mouth_open = math.sqrt(amplitude)
    return LipSyncFrame(amplitude=round(amplitude, 4), mouth_open=round(mouth_open, 4))
