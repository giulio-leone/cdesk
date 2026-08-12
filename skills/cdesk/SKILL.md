---
name: cdesk
description: Manage multiple Claude Desktop apps on macOS, one account each, with the `cdesk` CLI. Use when the user wants a second (or third) Claude Desktop for another account, asks to create/rename/remove a per-account Claude app, wants the instances updated after Claude updates, wants to back up or restore a Desktop login, or reports that adding a connector or logging in fails or opens the wrong Claude window.
---

# cdesk

`cdesk` gives every extra Claude account its own real macOS app: own Dock entry,
own icon colour, own login and history. `/Applications/Claude.app` is itself one
of the accounts and is never modified — only create instances for the *extra*
ones.

Run `cdesk` with no arguments for the full command list. Everything below is
what you cannot guess from `--help`.

## Doing the common things

| user asks | command |
| --- | --- |
| "add a Claude for <account>" | `cdesk create <Name>` (colour is derived from the name; pass `#RRGGBB` to force one) |
| "what do I have?" | `cdesk list` |
| "rebuild everything on this machine" | `cdesk apply` (reads `~/.config/cdesk/instances.conf`) |
| "they're out of date" | `cdesk sync` |
| "keep them updated by themselves" | `cdesk autosync on` |
| "rename X to Y" | `cdesk remove X` then `cdesk create Y` — the profile is keyed by name, so the login does not follow. Back up first if it matters. |
| "don't lose my login" | `cdesk backup <Name>` / `cdesk restore <Name>` |

`create`, `remove` and `apply` keep `~/.config/cdesk/instances.conf` in sync, so
that one file plus the repo rebuilds a whole machine.

## The claude:// rule — read before debugging any login or connector problem

Only one app on the system can own the `claude://` URL scheme, and that is where
**OAuth and connector callbacks land**. Instances are deliberately built without
claiming it, so `/Applications/Claude.app` keeps working normally.

If the user says connectors cannot be added, a login never completes, or the
wrong Claude window pops up after authenticating, check the owner first:

```bash
cdesk list          # second line prints the current claude:// owner
```

If it is not `/Applications/Claude.app`, fix it with `cdesk claim main`.

To log an instance in, or add a connector to it, lend the scheme and give it
straight back:

```bash
cdesk claim <Name>   # user logs in / adds the connector
cdesk claim main
```

Never leave the scheme with an instance.

## Things that will bite you

- **The first login of each instance is manual.** It goes through browser OAuth.
  Do not try to seed it from `claude-swap`: the Desktop session lives in the
  profile's Chromium `Cookies`, which is a different auth surface from the OAuth
  token the CLI stores. Ask the user to log in.
- **Backups are machine-bound.** The cookies are encrypted with the local
  `Claude Safe Storage` keychain key, so an archive restored on another Mac will
  not be logged in. They also contain live session cookies — never commit them
  or copy them to shared storage.
- **A removed instance can linger.** `cdesk remove` quits it, drops its Dock
  tile and unregisters it from LaunchServices — if you delete a bundle by hand
  instead, the Dock keeps a tile pointing at nothing and LaunchServices may keep
  it as the preferred `claude://` handler. `cdesk claim main` resets that.
- **`cdesk sync` replaces the bundle under a running instance.** Quit it first
  if it is mid-conversation.
- **Instances are ad-hoc signed** and therefore not notarized. macOS asks once
  for the `Claude Safe Storage` keychain item at first login; that prompt is
  expected, not a failure.
- **The LaunchAgent fails quietly.** If instances stop updating, read the exit
  code rather than guessing:

  ```bash
  launchctl print "gui/$(id -u)/io.cdesk.cdesk-sync" | grep "last exit code"
  ```

  Non-zero means the sync is broken; `~/Library/Logs/cdesk-sync.log` says why.

## Claude Code, not Desktop

If the user means the **CLI**, this is the wrong tool: `claude-swap` already
solves it with `cswap run <n>`, which isolates a terminal via
`CLAUDE_CONFIG_DIR`. `cdesk` is only for the Desktop app.
