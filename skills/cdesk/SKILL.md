---
name: cdesk
description: Install and configure cdesk, create named Claude Code or Codex CLI profiles, connect a terminal profile to an LLM gateway, or manage isolated Claude Desktop instances.
---

# cdesk

Identify the client and the profile name from the request. Claude Code, Codex CLI and Claude Desktop keep their local state in separate directories.

## Install and set up a profile

1. Check `cdesk --help` and the selected client’s `--version`. If `cdesk` is missing, install it with `npm install -g cdesk-profiles`. For a source checkout or a supplied npm tarball, install from that source instead. The terminal launchers require Node.js 22 or newer.
2. Use the commands below inside the selected profile. The first launch creates its directory. Guide the user through any browser sign-in that the native client opens.
3. Check the profile's login status and list profiles again. For gateway profiles, use the verification step in the [gateway guide](references/gateways.md).

| Client | List | Sign in | Verify |
| --- | --- | --- | --- |
| Claude Code | `cdesk cli --list` | `cdesk cli <profile> auth login` | `cdesk cli <profile> auth status` |
| Codex CLI | `cdesk codex --list` | `cdesk codex <profile> login` | `cdesk codex <profile> login status` |

Launch with `cdesk cli <profile>` or `cdesk codex <profile>`. Additional arguments go to the selected client. Auth and provider variables from the shell still apply to that process.

## Configure a gateway

Identify whether the gateway uses Claude apps gateway sign-in, Anthropic Messages or OpenAI Responses. Follow the [gateway guide](references/gateways.md) to merge settings into the selected profile. Read or report only the fields needed for setup and keep credential values in the user's native sign-in flow or secret store.

## Claude Desktop

On Windows and Linux, use `cdesk list` to see profiles and `cdesk run <profile>` to open one. The first run creates its data directory. The system `claude://` handler can open the default profile. For email sign-in to a named profile, follow the verification-code instructions in the [README](../../README.md#windows-and-linux) and enter the code in the window that requested it.

On macOS, use `cdesk create <name>` to build a clone before running it. `cdesk apply` rebuilds instances from the config and `cdesk sync` updates closed clones. Refer to `cdesk --help` for the other Desktop commands.

On macOS, `cdesk list` shows the current `claude://` handler. For sign-in or connector setup, use `cdesk claim <name>`, complete the flow in the chosen window and restore the handler with `cdesk claim main`. If device registration requires the official signed app, quit both apps and use `cdesk main <name>`.

Desktop backups on macOS include session cookies tied to the local Keychain. Keep them private. Use `cdesk remove <name>` to keep the profile data or add `--purge` only when the request includes deleting the login and history.
