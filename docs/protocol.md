# Clawface WebSocket protocol

The backend serves avatar events from `/ws/avatar`. Messages are JSON envelopes:

```json
{
  "type": "lip_sync",
  "timestamp": 1720000000.0,
  "payload": { "amplitude": 0.42, "mouth_open": 0.65 }
}
```

## Event types

- `hello`: emitted once immediately after a WebSocket client connects. The payload contains `protocol_version`, `server_name`, and `supported_events` so clients can mark the connection as protocol-compatible before applying animation events.
- `lip_sync`: emitted at animation frame cadence. `amplitude` and `mouth_open` are normalized `0.0..1.0` floats.
- `emotion`: switches the frontend expression state. Supported baseline emotions are `neutral`, `happy`, `sad`, `angry`, `surprised`, and `thinking`.

### `hello` payload

```json
{
  "type": "hello",
  "timestamp": 1720000000.0,
  "payload": {
    "protocol_version": "1.0",
    "server_name": "clawface-backend",
    "supported_events": ["hello", "lip_sync", "emotion"]
  }
}
```

Godot consumes `hello` to confirm protocol compatibility and then uses `lip_sync` and `emotion` events to deform the mouth polygon now; the same values can later drive photorealistic `MeshInstance2D` blend shapes or bone weights.
