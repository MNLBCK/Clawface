from clawface.protocol import ALLOWED_EMOTIONS
from clawface.server import incoming_emotion_event


def test_incoming_enveloped_emotion_is_normalized():
    event = incoming_emotion_event(
        {
            "type": "emotion",
            "payload": {"emotion": "happy", "intensity": 0.75},
        }
    ).to_jsonable()

    assert event["type"] == "emotion"
    assert event["payload"] == {"emotion": "happy", "intensity": 0.75}


def test_incoming_emotion_with_missing_payload_values_defaults_to_neutral():
    event = incoming_emotion_event({"type": "emotion", "payload": {}}).to_jsonable()

    assert event["payload"] == {"emotion": "neutral", "intensity": 1.0}


def test_incoming_invalid_emotion_falls_back_to_neutral_and_clamps_intensity():
    event = incoming_emotion_event(
        {
            "type": "emotion",
            "payload": {"emotion": "confused", "intensity": 2.0},
        }
    ).to_jsonable()

    assert event["payload"] == {"emotion": "neutral", "intensity": 1.0}


def test_incoming_legacy_top_level_emotion_is_still_accepted():
    event = incoming_emotion_event({"type": "emotion", "emotion": "thinking", "intensity": 0.25}).to_jsonable()

    assert event["payload"] == {"emotion": "thinking", "intensity": 0.25}


def test_allowed_emotions_match_baseline_protocol_values():
    assert ALLOWED_EMOTIONS == ("neutral", "happy", "sad", "angry", "surprised", "thinking")
