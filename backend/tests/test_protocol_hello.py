from clawface.protocol import PROTOCOL_VERSION, SERVER_NAME, SUPPORTED_EVENTS, hello_event


def test_hello_event_json_structure():
    event = hello_event().to_jsonable()

    assert event["type"] == "hello"
    assert isinstance(event["timestamp"], float)
    assert event["payload"] == {
        "protocol_version": PROTOCOL_VERSION,
        "server_name": SERVER_NAME,
        "supported_events": list(SUPPORTED_EVENTS),
    }


def test_hello_event_advertises_animation_events():
    supported_events = hello_event().to_jsonable()["payload"]["supported_events"]

    assert "hello" in supported_events
    assert "lip_sync" in supported_events
    assert "emotion" in supported_events
