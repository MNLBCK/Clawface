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

- `lip_sync`: emitted at animation frame cadence. `amplitude` and `mouth_open` are normalized `0.0..1.0` floats.
- `emotion`: switches the frontend expression state. Supported baseline emotions are `neutral`, `happy`, `sad`, `angry`, `surprised`, and `thinking`.

Godot consumes these events to deform the mouth polygon now; the same values can later drive photorealistic `MeshInstance2D` blend shapes or bone weights.
