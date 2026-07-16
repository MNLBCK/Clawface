# Clawface

Real-time 2D avatar system for AI agents. A Python backend extracts audio amplitude for lip-sync and sends emotion triggers via WebSockets to a Godot 4 frontend. The frontend is intended to animate photorealistic characters with 2D mesh deformation on local displays such as a dedicated 7-inch kiosk.

## Repository layout

- `backend/clawface/` — FastAPI WebSocket backend and audio amplitude utilities.
- `backend/tests/` — backend unit tests.
- `godot/` — Godot 4 project with a minimal avatar stage and WebSocket controller.
- `docs/protocol.md` — JSON event protocol between backend and frontend.

## Backend quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
clawface-backend
```

The backend starts in **MVP demo mode**: `clawface-backend` launches a FastAPI lifecycle task that emits synthetic PCM16-backed `lip_sync` events at startup, so the Godot scene shows mouth movement immediately after connecting. It does **not** capture a real microphone yet; a future audio source can feed PCM16 frames into the same backend lip-sync conversion path.

The backend exposes:

- `GET /health` for process health checks.
- `WS /ws/avatar` for lip-sync and emotion events.

## Frontend quick start

Open `godot/project.godot` with Godot 4 and run the main scene. The default scene connects to `ws://127.0.0.1:8765/ws/avatar` and updates a placeholder mouth mesh from incoming `lip_sync` messages.

## Protocol

See `docs/protocol.md` for the WebSocket envelope and event payloads.
