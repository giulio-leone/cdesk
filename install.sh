#!/bin/bash
# Symlink cdesk into ~/.local/bin and report what it needs.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dest="${PREFIX:-$HOME/.local/bin}"

[ "$(uname -s)" = "Darwin" ] || { echo "cdesk is macOS-only" >&2; exit 1; }

mkdir -p "$dest"
ln -sf "$here/bin/cdesk" "$dest/cdesk"
echo "installed $dest/cdesk -> $here/bin/cdesk"

case ":$PATH:" in
  *":$dest:"*) ;;
  *) echo "warning: $dest is not on your PATH" >&2 ;;
esac

missing=0
for tool in codesign swift iconutil python3; do
  command -v "$tool" >/dev/null 2>&1 || { echo "missing: $tool" >&2; missing=1; }
done
python3 -c "import PIL" 2>/dev/null || echo "note: Pillow not installed — instances will keep the stock icon" >&2
[ -d "${CLAUDE_APP:-/Applications/Claude.app}" ] || { echo "missing: /Applications/Claude.app" >&2; missing=1; }

[ "$missing" -eq 0 ] || { echo "install the items above, then re-run" >&2; exit 1; }
echo "ready — try: cdesk create Work"
