#!/bin/bash
# Install the Unix launcher and set up any configured macOS Desktop instances.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dest="${PREFIX:-$HOME/.local/bin}"

mkdir -p "$dest"
ln -sf "$here/bin/cdesk" "$dest/cdesk"
echo "installed $dest/cdesk -> $here/bin/cdesk"
case ":$PATH:" in
  *":$dest:"*) ;;
  *) echo "warning: $dest is not on your PATH" >&2 ;;
esac

if [ "$(uname -s)" = Darwin ] && [ -s "${CDESK_CONFIG:-$HOME/.config/cdesk/instances.conf}" ]; then
  missing=0
  for tool in codesign swift iconutil python3; do
    command -v "$tool" >/dev/null 2>&1 || { echo "Desktop setup requires $tool" >&2; missing=1; }
  done
  [ -d "${CLAUDE_APP:-/Applications/Claude.app}" ] || { echo "Desktop setup requires Claude.app" >&2; missing=1; }
  if [ "$missing" -eq 0 ]; then
    "$dest/cdesk" apply
    "$dest/cdesk" autosync on
  fi
fi

# Optional: expose the cdesk skill and /cdesk command to Claude Code.
if command -v claude >/dev/null 2>&1; then
  if claude plugin marketplace add "$here" >/dev/null 2>&1 \
     || claude plugin marketplace update cdesk >/dev/null 2>&1; then
    claude plugin install cdesk@cdesk >/dev/null 2>&1 \
      && echo "installed the cdesk plugin for Claude Code (skill + /cdesk)" \
      || echo "note: register the plugin by hand: claude plugin install cdesk@cdesk" >&2
  fi
fi

echo "done — cdesk --help"
