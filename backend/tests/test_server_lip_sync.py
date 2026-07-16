import struct

from clawface.server import demo_pcm16_frame, lip_sync_event_from_pcm16


def test_pcm16_audio_frame_becomes_lip_sync_event():
    pcm = b"".join(struct.pack("<h", 16_000) for _ in range(64))

    event = lip_sync_event_from_pcm16(pcm).to_jsonable()

    assert event["type"] == "lip_sync"
    assert event["payload"]["amplitude"] > 0.0
    assert event["payload"]["mouth_open"] >= event["payload"]["amplitude"]


def test_demo_pcm16_frame_drives_visible_mouth_movement():
    event = lip_sync_event_from_pcm16(demo_pcm16_frame(0.8)).to_jsonable()

    assert event["type"] == "lip_sync"
    assert event["payload"]["amplitude"] > 0.5
    assert event["payload"]["mouth_open"] > 0.7
