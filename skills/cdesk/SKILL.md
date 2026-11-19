---
name: cdesk
description: Use named Claude Code terminal profiles, or create, launch, update or troubleshoot isolated Claude Desktop profiles managed by cdesk.
---

# cdesk

Determine whether the request concerns Claude Code in the terminal or the Claude Desktop app. They store sessions separately.

## Claude Code on macOS, Windows and Linux

Run `cdesk cli --list` to show named profiles. Use `cdesk cli <profile> auth status` to check the selected account and `cdesk cli <profile> auth login` to start sign-in. For other work, pass Claude Code arguments after the profile name. Credentials configured explicitly in the shell still apply to the child process.

## Claude Desktop

On Windows and Linux, use `cdesk list` to see profiles and `cdesk run <profile>` to open one. The first run creates its data directory. If browser sign-in opens the wrong window, close other Claude Desktop profiles and retry, then verify the account shown in the app.

On macOS, use `cdesk create <name>` to build a clone before running it. `cdesk apply` rebuilds instances from the config and `cdesk sync` updates closed clones. Refer to `cdesk --help` for the other Desktop commands.

On macOS, `cdesk list` shows the current `claude://` handler. For sign-in or connector setup, use `cdesk claim <name>`, complete the flow in the chosen window and restore the handler with `cdesk claim main`. If device registration requires the official signed app, quit both apps and use `cdesk main <name>`.

Desktop backups on macOS include session cookies tied to the local Keychain. Keep them private. Use `cdesk remove <name>` to keep the profile data or add `--purge` only when the request includes deleting the login and history.
