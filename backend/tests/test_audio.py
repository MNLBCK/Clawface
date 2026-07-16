import struct

from clawface.audio import pcm16_amplitude
from clawface.protocol import emotion_event, lip_sync_event


def test_silence_has_closed_mouth():
    frame = pcm16_amplitude(b"\x00\x00" * 128)
    assert frame.amplitude == 0.0
    assert frame.mouth_open == 0.0


def test_loud_pcm_opens_mouth():
    pcm = b"".join(struct.pack("<h", 24_000) for _ in range(128))
    frame = pcm16_amplitude(pcm)
    assert frame.amplitude > 0.5
    assert frame.mouth_open >= frame.amplitude


def test_events_are_jsonable():
    assert lip_sync_event(0.2, 0.4).to_jsonable()["type"] == "lip_sync"
    event = emotion_event("happy", 2.0).to_jsonable()
    assert event["payload"]["intensity"] == 1.0
