# cdesk

**Named profiles for Codex CLI, Claude Code and Claude Desktop.**

Keep a work account and a personal account ready to use from the same machine. Pick a profile when you launch. Each profile keeps its own sign-in and local state.

| Client | Open a profile | List profiles |
| --- | --- | --- |
| Codex CLI | `cdesk codex work` | `cdesk codex --list` |
| Claude Code | `cdesk cli work` | `cdesk cli --list` |
| Claude Desktop | `cdesk run work` | `cdesk list` |

The terminal commands run on macOS, Windows and Linux. The Claude Desktop setup varies by platform.

## Get started

Install [Node.js 22+](https://nodejs.org/) and the client you want to use. Download `cdesk-profiles-1.3.0.tgz` from the repository’s GitHub release, then run these commands from your downloads folder.

```sh
npm install -g ./cdesk-profiles-1.3.0.tgz
cdesk --help
```

<details>
<summary>Install from source</summary>

Run `npm install -g .` from a local checkout. On macOS or Linux, `./install.sh` can link the checkout into `~/.local/bin`. On macOS the script also applies an existing Claude Desktop instances config and enables autosync when the Desktop requirements are present.

</details>

## In the terminal

### Codex CLI

Install the [official Codex CLI](https://developers.openai.com/codex/cli), then sign in once per profile:

```sh
cdesk codex work login
cdesk codex work login status
cdesk codex work
```

Use another profile for a separate login. To run a one-off prompt, pass the usual Codex arguments:

```sh
cdesk codex personal exec "Summarize this project"
cdesk codex --list
```

### Claude Code

Install the [official Claude Code CLI](https://code.claude.com/docs/en/setup). On Windows, use its native installer.

```sh
cdesk cli work auth login
cdesk cli work
cdesk cli personal -p "Summarize this project"
cdesk cli --list
```

Both launchers forward arguments, terminal input and exit status. They open in your current directory. Use letters, digits, hyphens and underscores for profile names. The client still honors any authentication or provider credentials explicitly set in your shell.

### Using a gateway

Set the gateway on the profile that needs it. Claude Code supports Claude apps gateway sign-in and Anthropic Messages gateways. Codex CLI can use an OpenAI Responses-compatible gateway. See the [profile configuration examples](skills/cdesk/references/gateways.md).

## Claude Desktop

Install [Claude Desktop](https://claude.com/download). On Linux, use Anthropic’s [Ubuntu or Debian beta](https://support.claude.com/en/articles/10065433-install-claude-desktop). On Windows, enable `claude-desktop.exe` under **App execution aliases**.

### macOS

Install Claude.app in `/Applications`, the Xcode command-line tools and Python 3. Pillow adds optional tinted icons.

```sh
cdesk create Work
cdesk run Work
cdesk list
```

Each clone gets its own Dock entry and data directory. Add a color with `cdesk create Personal "#8B5CF6"`.

<details>
<summary>macOS updates, sign-in and backups</summary>

| Command | Purpose |
| --- | --- |
| `cdesk apply` | Build the instances in `~/.config/cdesk/instances.conf` |
| `cdesk sync` | Update Claude.app and rebuild outdated, closed clones |
| `cdesk autosync on\|off` | Enable or disable the update LaunchAgent |
| `cdesk claim Work` | Send `claude://` sign-in and connector callbacks to Claude Work |
| `cdesk claim main` | Return `claude://` to the original app |
| `cdesk main Work` | Move the Work profile to the signed Claude.app for device registration |
| `cdesk backup Work` | Archive a Desktop profile |
| `cdesk restore Work [file]` | Restore a Desktop profile |
| `cdesk remove Work [--purge]` | Remove the clone. Add `--purge` to also delete its login and history |

To sign in or connect a service in a clone, run `cdesk claim Work`, finish in its window, then run `cdesk claim main`. Quit both apps before using `cdesk main Work`.

The instances config uses one `name<TAB>#hex` entry per line. Rebuilds keep the profile data. Desktop backups contain live session cookies tied to your Mac’s Keychain. Keep them private and restore them on the same Mac.

</details>

### Windows and Linux

```sh
cdesk run work
cdesk run personal
cdesk list
```

The first launch creates the profile. Use separate terminals if the app remains attached.

Browser callbacks can open the default Claude Desktop profile. For email sign-in to a named profile, choose **Continue with email** in its window, open the emailed link on another device to get a code, then enter the code in the original window. [Claude sign-in instructions](https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account)

## Where profiles live

| Client | Default profile root | Directory override | Executable override |
| --- | --- | --- | --- |
| Codex CLI | `~/.codex-profiles` | `CDESK_CODEX_PROFILES` | `CDESK_CODEX_BIN` |
| Claude Code | `~/.claude-code-profiles` | `CDESK_CODE_PROFILES` | `CDESK_CLAUDE_BIN` |
| Claude Desktop | `~/.claude-desktop-profiles` | `CDESK_PROFILES` | `CDESK_DESKTOP_BIN` on Windows/Linux, `CLAUDE_APP` on macOS |

On Windows, `~` means your user profile directory. The terminal launchers point Codex’s `CODEX_HOME` and Claude Code’s `CLAUDE_CONFIG_DIR` at the selected profile for that process. Keep profile directories private and out of version control.

## Let Claude Code set it up

The bundled skill helps Claude Code install the tool, configure a named profile and verify the login or gateway. Register the package as a local Claude Code marketplace.

```sh
claude plugin marketplace add "$(npm root -g)/cdesk-profiles"
claude plugin install cdesk@cdesk
```

In PowerShell, use `claude plugin marketplace add (Join-Path (npm root -g) 'cdesk-profiles')` for the first command. From a source checkout, use `claude plugin marketplace add .`.

Open a new Claude Code session and use `/cdesk:cdesk setup claude work`, or ask Claude to configure a gateway for a named profile.

[MIT License](LICENSE)
