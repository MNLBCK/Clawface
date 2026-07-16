# Clawface

Real-time 2D avatar system for AI agents. A Python backend extracts audio amplitude for lip-sync and sends emotion triggers via WebSockets to a Godot 4 frontend. The frontend is intended to animate photorealistic characters with 2D mesh deformation on local displays such as a dedicated 7-inch kiosk.

## Repository layout

- `backend/clawface/` — FastAPI WebSocket backend and audio amplitude utilities.
- `backend/tests/` — backend unit tests.
- `godot/` — Godot 4 project with a minimal avatar stage and WebSocket controller.
- `docs/protocol.md` — JSON event protocol between backend and frontend.


## MVP Quick Start

The MVP is intentionally **local-first**: setup and runtime do not require cloud services, hosted APIs, external accounts, or login flows. Run the backend and Godot frontend on the same machine for the default configuration.

### Requirements

- Python **3.11 or newer** (the package declares `requires-python = ">=3.11"`).
- Godot **4.x** for opening and running the frontend project.

### 1. Setup backend

```bash
./scripts/setup_backend.sh
```

This creates `.venv` in the repository root and installs the backend in editable mode with development dependencies via `pip install -e '.[dev]'`.

### 2. Start backend

```bash
./scripts/run_backend.sh
```

The backend listens locally on `127.0.0.1:8765` by default.

### 3. Start Godot

Open `godot/project.godot` with Godot 4.x and run the main scene. The default scene connects to the local backend WebSocket.


### Koppelungsanleitung

1. Backend mit `./scripts/run_backend.sh` starten.
2. `godot/project.godot` in Godot 4.x öffnen und die Hauptszene starten.
3. Im Avatar-Fenster den WebSocket-Status prüfen: Er sollte von `connecting` auf `connected` wechseln. Falls `disconnected` oder `reconnecting` angezeigt wird, läuft das Backend nicht oder die Godot-WebSocket-URL passt nicht zu `ws://127.0.0.1:8765/ws/avatar`.

### Expected endpoints

- Healthcheck: `GET http://127.0.0.1:8765/health`
- Avatar WebSocket: `ws://127.0.0.1:8765/ws/avatar`

### Troubleshooting

- **Port 8765 already in use:** stop the process occupying `127.0.0.1:8765` and restart `./scripts/run_backend.sh`. On Linux/macOS, `lsof -i :8765` can help identify the process.
- **Godot version mismatch:** use Godot **4.x**. Godot 3.x projects and APIs are not compatible with this frontend.
- **Connection errors in Godot:** confirm the backend is running, verify `GET http://127.0.0.1:8765/health` returns a healthy response, and check that the Godot WebSocket URL is `ws://127.0.0.1:8765/ws/avatar`.
- **Virtual environment missing:** run `./scripts/setup_backend.sh` before `./scripts/run_backend.sh`.

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
