# cdesk

Run Claude Code in the terminal and Claude Desktop with named profiles on macOS, Windows and Linux.

## Install

Install [Node.js 22 or later](https://nodejs.org/) and the official [Claude Code CLI](https://code.claude.com/docs/en/setup) or [Claude Desktop app](https://claude.com/download). On Windows use the native Claude Code installer and keep the Claude Desktop execution alias (`claude-desktop.exe`) enabled if using the app.

From a local checkout of this repository:

```sh
npm install -g .
cdesk --help
```

On macOS and Linux, `./install.sh` can instead link this checkout into `~/.local/bin`. On macOS it also applies an existing Desktop instances config and enables autosync if the Desktop requirements are present.

## Claude Code in the terminal

```sh
cdesk cli work auth login
cdesk cli work auth status
cdesk cli work
cdesk cli personal -p "Summarize this project"
cdesk cli --list
```

The first use creates the profile. Arguments, the working directory, terminal input and exit status pass through to Claude Code. Each name selects a different `CLAUDE_CONFIG_DIR` under `~/.claude-code-profiles` (`%USERPROFILE%\.claude-code-profiles` on Windows). The default `claude` command still uses its normal configuration.

Sign in to each profile with Claude Code itself. Explicit authentication and provider variables from the shell, such as `ANTHROPIC_API_KEY`, still apply to the child process. Use different names for different accounts and keep profile directories out of version control.

## Claude Desktop

### Windows and Linux

```sh
cdesk run work
cdesk run personal
cdesk list
```

Run the commands in separate terminals if the app remains attached. Each name has its own application data directory under `~/.claude-desktop-profiles`. On Linux, use Anthropic's [Claude Desktop beta for Ubuntu or Debian](https://support.claude.com/en/articles/10065433-install-claude-desktop).

Browser links and OAuth callbacks use the system's `claude://` handler, which can open the default Claude Desktop profile. To sign in to a named profile by email, choose **Continue with email** in its window, open the email link on another device to get a verification code, then enter the code in the original window. [Claude sign-in instructions](https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account)

### macOS

Install Claude.app in `/Applications`, the Xcode command-line tools, and Python 3. Pillow is optional for tinted icons.

```sh
cdesk create Work
cdesk create Personal "#8B5CF6"
cdesk run Work
cdesk list
```

Each clone gets its own Dock entry and data directory. Existing clones, profiles and `~/.config/cdesk/instances.conf` keep their paths.

| Command | Purpose |
| --- | --- |
| `cdesk create <name> [#hex]` | Build `~/Applications/Claude <name>.app` |
| `cdesk apply` | Build the instances in `~/.config/cdesk/instances.conf` |
| `cdesk run <name>` | Launch a clone |
| `cdesk list` | Show versions, running instances and the `claude://` handler |
| `cdesk claim <name>\|main` | Set the `claude://` handler |
| `cdesk main <name>` | Use a profile in the signed Claude.app and remove its clone |
| `cdesk sync` | Update the signed app and rebuild outdated, closed clones |
| `cdesk autosync on\|off` | Enable or disable the update LaunchAgent |
| `cdesk backup <name>...` | Archive Desktop profiles on this Mac |
| `cdesk restore <name> [file]` | Restore a Desktop profile |
| `cdesk remove <name> [--purge]` | Remove the clone, and with `--purge`, its login and history |

The config uses one `name<TAB>#hex` entry per line. Rebuilds keep app data under `~/.claude-desktop-profiles`. Desktop backups contain live session cookies encrypted with the local Keychain key. Store them privately and restore them on the same Mac.

For browser sign-in or connector setup, run `cdesk claim Work`, complete the flow in Claude Work, then run `cdesk claim main` to return the handler. The original Claude.app keeps Anthropic's signature and hardware device registration. To use a particular account for that registration, quit both apps and run `cdesk main Work`.

## Paths and executable overrides

| Variable | Purpose |
| --- | --- |
| `CDESK_CODE_PROFILES` | Directory for named Claude Code profiles |
| `CDESK_CLAUDE_BIN` | Path to the Claude Code executable |
| `CDESK_PROFILES` | Directory for Claude Desktop profiles |
| `CDESK_DESKTOP_BIN` | Path to the Claude Desktop executable on Windows or Linux |
| `CLAUDE_APP` | Path to Claude.app on macOS |

Use letters, digits, hyphens and underscores for portable profile names. Claude Code and Claude Desktop sign in separately, even when you give their profiles the same name.

## Claude Code plugin

From the repository root:

```sh
claude plugin marketplace add .
claude plugin install cdesk@cdesk
```

That makes the `/cdesk` command and skill available to Claude Code.

## License

MIT
