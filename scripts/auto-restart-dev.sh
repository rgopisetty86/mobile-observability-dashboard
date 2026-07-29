#!/usr/bin/env bash
# auto-restart-dev.sh
#
# Keeps the Vite dev server alive by restarting it automatically every N hours.
#
# Usage:
#   ./scripts/auto-restart-dev.sh            # default: restart every 6 hours
#   ./scripts/auto-restart-dev.sh 2          # restart every 2 hours
#   INTERVAL_HOURS=4 ./scripts/auto-restart-dev.sh
#
# Stop with:  Ctrl-C  (or kill the PID printed on startup)

set -euo pipefail

# ── Config ─────────────────────────────────────────────────────────────────
INTERVAL_HOURS="${1:-${INTERVAL_HOURS:-6}}"
INTERVAL_SECS=$(( INTERVAL_HOURS * 3600 ))
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/scripts/logs"
LOG_FILE="$LOG_DIR/dev-server.log"
PID_FILE="$LOG_DIR/dev-server.pid"

mkdir -p "$LOG_DIR"

# ── Helpers ─────────────────────────────────────────────────────────────────
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

kill_server() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      log "Stopping dev server (PID $pid)…"
      kill "$pid" 2>/dev/null || true
      # Give the process up to 5 s to exit cleanly
      local waited=0
      while kill -0 "$pid" 2>/dev/null && (( waited < 5 )); do
        sleep 1
        (( waited++ ))
      done
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
  # Also catch any stray vite processes on port 5173
  pkill -f "vite" 2>/dev/null || true
  sleep 1
}

start_server() {
  log "Starting Vite dev server…"
  cd "$PROJECT_DIR"
  npm run dev >> "$LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" > "$PID_FILE"
  log "Dev server started (PID $pid)"

  # Wait up to 10 s for Vite to report a URL
  local waited=0
  while (( waited < 10 )); do
    local url
    url=$(grep -oE 'http://localhost:[0-9]+' "$LOG_FILE" | tail -1)
    if [[ -n "$url" ]]; then
      log "Server ready at $url"
      break
    fi
    sleep 1
    (( waited++ ))
  done
}

cleanup() {
  log "Shutting down auto-restart watcher…"
  kill_server
  exit 0
}

# ── Main ────────────────────────────────────────────────────────────────────
trap cleanup INT TERM

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Auto-restart dev server — interval: ${INTERVAL_HOURS}h"
log "Project : $PROJECT_DIR"
log "Log file: $LOG_FILE"
log "Press Ctrl-C to stop"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any server already running from a previous session
kill_server

cycle=1
while true; do
  log "── Cycle $cycle ──────────────────────────────────────"
  start_server
  log "Next restart in ${INTERVAL_HOURS}h (sleeping ${INTERVAL_SECS}s)…"
  sleep "$INTERVAL_SECS"
  log "Interval elapsed — restarting…"
  kill_server
  (( cycle++ ))
done
