# Configure a terminal profile for a gateway

Use the gateway URL, protocol, authentication method and model ID provided by the user or their administrator. Merge these keys into the named profile's existing file and preserve unrelated settings. Create profile directories by running `cdesk cli <profile> --version` or `cdesk codex <profile> --version` before editing. The paths below use the default roots. Respect `CDESK_CODE_PROFILES` or `CDESK_CODEX_PROFILES` when set.

## Claude apps gateway sign-in

For a workstation where the organization allows user settings, merge these fields into `~/.claude-code-profiles/<profile>/settings.json`:

```json
{
  "forceLoginMethod": "gateway",
  "forceLoginGatewayUrl": "https://claude-gateway.example.com"
}
```

Start `cdesk cli <profile>`, enter `/login`, and complete the **Cloud gateway** flow in Claude Code. Check `/status` in that session. Follow administrator-provided managed settings on managed machines. [Claude apps gateway setup](https://code.claude.com/docs/en/claude-apps-gateway#set-the-gateway-url-in-user-settings)

## Claude Code with an Anthropic Messages gateway

Merge this `env` entry into `~/.claude-code-profiles/<profile>/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://messages-gateway.example.com"
  }
}
```

Provide `ANTHROPIC_AUTH_TOKEN` for bearer auth or `ANTHROPIC_API_KEY` for `x-api-key` via the shell or approved credential helper. Check `/status` in `cdesk cli <profile>`, then verify with a short prompt using a model the gateway exposes. [Claude Code gateway connection guide](https://code.claude.com/docs/en/llm-gateway-connect)

## Codex CLI with an OpenAI Responses gateway

Merge these settings into `~/.codex-profiles/<profile>/config.toml`:

```toml
model_provider = "gateway"
model = "gateway-model-id"

[model_providers.gateway]
name = "Gateway"
base_url = "https://responses-gateway.example.com/v1"
wire_api = "responses"
env_key = "CDESK_GATEWAY_API_KEY"
```

Use the gateway's actual Responses API base URL and model ID. Set `CDESK_GATEWAY_API_KEY` in the invoking shell for this bearer-token example, then verify with `cdesk codex <profile> exec "Reply with OK"` from the intended project. This setup requires a Responses-compatible endpoint. [Codex provider settings](https://developers.openai.com/codex/config-reference)
