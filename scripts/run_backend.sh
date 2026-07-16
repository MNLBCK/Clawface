#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .venv/bin/activate ]]; then
  echo "Missing .venv. Run ./scripts/setup_backend.sh first." >&2
  exit 1
fi

# shellcheck source=/dev/null
source .venv/bin/activate
exec clawface-backend
