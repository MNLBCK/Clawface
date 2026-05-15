# Clawface
Real-time 2D avatar system for AI agents. A Python backend extracts audio amplitude for lip-sync and sends emotion triggers via WebSockets to a Godot 4 frontend. Animates photorealistic characters using 2D mesh deformation on local displays (e.g. dedicated 7-inch kiosk)

## Backend (FastAPI)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

WebSocket stream: `ws://127.0.0.1:8000/ws`  
Emotion trigger:

```bash
curl -X POST http://127.0.0.1:8000/trigger_emotion \
  -H "Content-Type: application/json" \
  -d '{"emotion":"begging"}'
```

Supported emotions: `idle`, `begging`, `puzzled`

## Godot 4 Project

The Godot frontend scaffold lives in `/godot` with:

- `Main.tscn` (main scene with WebSocket client + avatar nodes)
- `scripts/main.gd` (WebSocket client + payload routing)
- `scripts/avatar.gd` (amplitude-driven lip-sync, basic emotion state handling, Skeleton2D/Bone2D hooks)
