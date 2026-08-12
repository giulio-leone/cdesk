# cdesk

Run several Claude Desktop apps side by side on macOS, one account each.

macOS will not launch two copies of the same app bundle against the same
profile, and Claude Desktop has no account switcher. `cdesk` gives every extra
account its own real app: its own Dock entry, its own icon colour, its own
login and history — all still running against the single `/Applications/Claude.app`
that Anthropic keeps up to date.

```
$ cdesk list
Claude.app: 1.28929.0
claude:// : /Applications/Claude.app
  Work           1.28929.0
  Personal        1.28929.0
```

## Install

```bash
git clone https://example.invalid/cdesk.git
cd cdesk && ./install.sh
```

`install.sh` symlinks `bin/cdesk` into `~/.local/bin`, rebuilds whatever is
listed in `~/.config/cdesk/instances.conf`, turns on the update LaunchAgent, and
registers the Claude Code plugin. On a new machine that is the whole setup:
clone, copy your `instances.conf` across, run it.

Requirements: macOS on APFS, Claude Desktop in `/Applications`, Xcode command
line tools (`codesign`, `swift`), and `python3` with Pillow (only for the tinted
icons — without it instances still build, they just keep the stock icon).

## Use

```bash
cdesk create Work            # build "Claude Work.app", colour picked from the name
cdesk create Work "#3B82F6"  # ...or pick it yourself
cdesk run Work
cdesk list
cdesk autosync on            # keep every instance in step with Claude.app
```

`/Applications/Claude.app` is itself one of your accounts — leave it alone and
only create instances for the *extra* ones.

| command | what it does |
| --- | --- |
| `cdesk create <name> [#hex]` | build `~/Applications/Claude <name>.app` |
| `cdesk apply` | build everything in `~/.config/cdesk/instances.conf` |
| `cdesk run <name>` | launch it |
| `cdesk list` | instances, versions, running state, `claude://` owner |
| `cdesk sync` | rebuild every instance behind Claude.app |
| `cdesk claim <name>\|main` | hand the `claude://` scheme to one app |
| `cdesk autosync on\|off` | LaunchAgent that syncs when Claude.app updates |
| `cdesk backup <name>...` | archive a profile, i.e. its login |
| `cdesk restore <name> [file]` | put a profile back from the newest backup |
| `cdesk remove <name> [--purge]` | delete the app; `--purge` also drops its login |

### The config file

`create`, `remove` and `apply` all maintain `~/.config/cdesk/instances.conf`:

```
Work	#EF4444
Personal	#8B5CF6
```

One `name<TAB>#hex` per line. That file plus this repo is everything needed to
rebuild a machine, so keep it somewhere you sync.

### Auth profiles

A profile directory holds the logged-in session, so it is worth keeping:

```bash
cdesk backup Personal            # -> ~/.config/cdesk/backups/personal-<stamp>.tgz
cdesk restore Personal           # newest backup, or pass a specific file
```

Backups survive rebuilds and reinstalls **on the same Mac**. They are not
portable: the cookies inside are encrypted with the local `Claude Safe Storage`
keychain key, so a restore on another machine lands you logged out. They also
contain live session cookies — keep them out of git and off shared drives.

## Claude Code plugin

The repo doubles as a Claude Code plugin, so any session knows how to drive
`cdesk` and, more usefully, knows the `claude://` rule below before it starts
debugging a login.

```bash
claude plugin marketplace add /path/to/cdesk
claude plugin install cdesk@cdesk
```

That gives you the `cdesk` skill and a `/cdesk` command. The plugin cache is
keyed by the version in `.claude-plugin/plugin.json` — bump it and run
`claude plugin update cdesk@cdesk` to ship a change.

## Logging an instance in

Only one app on the system can own the `claude://` URL scheme, and that is where
OAuth and connector callbacks land. Instances are therefore built **without**
claiming it, so the main Claude.app keeps working normally. To log an instance
in — or to add a connector to it — borrow the scheme, then give it back:

```bash
cdesk claim Work     # log in / add connectors in Claude Work.app
cdesk claim main     # hand claude:// back to /Applications/Claude.app
```

If connectors ever stop working in the main app, `cdesk list` will show you who
owns the scheme, and `cdesk claim main` fixes it.

## Updates

Instances do not self-update: they are separate bundles. `cdesk sync` re-clones
each one from the current `/Applications/Claude.app`, and `cdesk autosync on`
installs a LaunchAgent that watches that bundle and runs `sync` the moment
Anthropic ships an update. Profiles live in `~/.claude-desktop-profiles/<slug>`,
outside the bundles, so rebuilds never touch your logins or history.

## How it works

Claude Desktop is an Electron app, so the isolation lever is Chromium's
`--user-data-dir`. An instance is an APFS clone of `Claude.app` with:

- `CFBundleName` / `CFBundleDisplayName` / `CFBundleIdentifier` rewritten, so
  LaunchServices treats it as a separate app with its own Dock entry;
- the four `Contents/Frameworks/Claude Helper*.app` bundles renamed to match —
  Electron resolves its helpers from `CFBundleName` and dies with
  `FATAL … Unable to find helper app` otherwise;
- `CFBundleExecutable` pointing at a launcher shim that `exec`s the real binary
  with `--user-data-dir=~/.claude-desktop-profiles/<slug>`, so a Dock click needs
  no arguments;
- `CFBundleURLTypes` removed, so it cannot steal `claude://` from the main app;
- the icon hue-rotated to a per-instance colour.

### Disk

About **17 MB per instance**, not 800 MB. `cp -c` clones the bundle at the APFS
block level, and the frameworks — which are copied verbatim and keep Anthropic's
valid signature — are deliberately *not* re-signed, so their blocks stay shared
with `/Applications/Claude.app`. Only the renamed helper bundles, the main
binary and the outer bundle get an ad-hoc signature.

Memory is unaffected either way: three running Claude instances cost three
Electron processes no matter how they are installed.

### Caveats

- Instances are **ad-hoc signed**, so they are no longer notarized. macOS asks
  once for the `Claude Safe Storage` keychain item on first login.
- `cdesk sync` replaces the bundle underneath a running instance — quit it first
  if it is in the middle of something.
- Renaming an instance means `remove` + `create`; the profile is keyed by name.

## Claude Code

For the CLI the same problem is already solved by
[claude-swap](https://pypi.org/project/claude-swap/): `cswap run <n>` isolates a
terminal via `CLAUDE_CONFIG_DIR`. `cdesk` is the desktop-side counterpart.

## Licence

MIT
