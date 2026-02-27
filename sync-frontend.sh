#!/usr/bin/env bash
# sync-frontend.sh — Re-extract 3rdSeat frontend from the Frontend branch
# Usage: ./sync-frontend.sh [--rebuild]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$HOME/Desktop/work-hang-coordinator"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "Syncing frontend from $REPO_DIR (branch: Frontend)..."

# Clean and re-extract
rm -rf "$FRONTEND_DIR"
mkdir -p "$FRONTEND_DIR"
git -C "$REPO_DIR" archive Frontend:frontend | tar -x -C "$FRONTEND_DIR"

echo "Extracted to $FRONTEND_DIR"

# Preserve local overrides (Dockerfile, nginx.conf) that aren't in git
# These are already in the extracted tree if they're on the branch,
# but if you've made local-only changes, re-apply them here.

if [[ "${1:-}" == "--rebuild" ]]; then
    echo "Rebuilding container..."
    cd "$SCRIPT_DIR"
    docker compose --env-file .env.workhang up --build thirdseat-frontend -d
    echo "Container rebuilt and started."
fi

echo "Done."
