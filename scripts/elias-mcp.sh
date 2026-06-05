#!/usr/bin/env bash
# Wrapper that checks for a newer Docker image once per hour, then starts the MCP server.
# The update prompt uses osascript (macOS GUI dialog) so it never touches stdin/stdout,
# which would corrupt the MCP JSON-RPC stream.

set -euo pipefail

IMAGE="mathiast71/elias-mcp-server:latest"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
CACHE_FILE="${TMPDIR:-/tmp}/.elias-mcp-lastcheck"
CHECK_INTERVAL=3600  # seconds — only hit Docker Hub once per hour

should_check() {
  local now last_check
  now=$(date +%s)
  last_check=$(cat "$CACHE_FILE" 2>/dev/null || echo 0)
  (( now - last_check > CHECK_INTERVAL ))
}

remote_digest() {
  curl -sf "https://hub.docker.com/v2/repositories/mathiast71/elias-mcp-server/tags/latest" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('digest',''))" 2>/dev/null || echo ""
}

local_digest() {
  docker inspect --format='{{index .RepoDigests 0}}' "$IMAGE" 2>/dev/null \
    | sed 's/.*@//' || echo ""
}

check_for_update() {
  local remote local
  remote=$(remote_digest)
  local=$(local_digest)

  # No local image yet — nothing to compare; docker run will pull automatically.
  [ -z "$local" ] && return

  if [ -n "$remote" ] && [ "$remote" != "$local" ]; then
    # Show a native macOS dialog — does not touch stdin/stdout.
    local button
    button=$(osascript -e \
      'button returned of (display dialog "A new version of elias-mcp-server is available on Docker Hub.\n\nUpdate now?" buttons {"Skip", "Update"} default button "Update" with title "EliasMCP Update" with icon caution)' \
      2>/dev/null || echo "Skip")

    if [ "$button" = "Update" ]; then
      docker pull --quiet "$IMAGE" >&2
    fi
  fi
}

# --- Update check (skipped if within the cache window) ---
if should_check; then
  date +%s > "$CACHE_FILE"
  check_for_update
fi

# --- Start MCP server (replaces this shell process) ---
exec docker run --rm -i \
  --env-file "$ENV_FILE" \
  "$IMAGE"
