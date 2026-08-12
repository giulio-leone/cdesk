#!/bin/bash
# One command to go from a fresh clone to working instances:
#   - symlink bin/cdesk into ~/.local/bin
#   - rebuild every instance listed in ~/.config/cdesk/instances.conf
#   - install the LaunchAgent that keeps them in step with Claude.app
#   - register this repo as a Claude Code plugin marketplace
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dest="${PREFIX:-$HOME/.local/bin}"

[ "$(uname -s)" = "Darwin" ] || { echo "cdesk is macOS-only" >&2; exit 1; }

missing=0
for tool in codesign swift iconutil python3; do
  command -v "$tool" >/dev/null 2>&1 || { echo "missing: $tool" >&2; missing=1; }
done
[ -d "${CLAUDE_APP:-/Applications/Claude.app}" ] || { echo "missing: /Applications/Claude.app" >&2; missing=1; }
[ "$missing" -eq 0 ] || { echo "install the items above, then re-run" >&2; exit 1; }
python3 -c "import PIL" 2>/dev/null || echo "note: Pillow missing — instances keep the stock icon" >&2

mkdir -p "$dest"
ln -sf "$here/bin/cdesk" "$dest/cdesk"
echo "installed $dest/cdesk -> $here/bin/cdesk"
case ":$PATH:" in
  *":$dest:"*) ;;
  *) echo "warning: $dest is not on your PATH" >&2 ;;
esac

if [ -s "${CDESK_CONFIG:-$HOME/.config/cdesk/instances.conf}" ]; then
  "$dest/cdesk" apply
  "$dest/cdesk" autosync on
else
  echo "no instances configured yet — try: cdesk create Work"
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

echo "done — cdesk list"
