#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const { existsSync, mkdirSync, readdirSync } = require('node:fs');
const { constants: { signals }, homedir } = require('node:os');
const { delimiter, isAbsolute, join, resolve } = require('node:path');

const terminalTools = {
  cli: {
    name: 'Claude Code',
    profileRoot: 'CDESK_CODE_PROFILES',
    defaultRoot: '.claude-code-profiles',
    configDir: 'CLAUDE_CONFIG_DIR',
    executable: () => [claudeExecutable()],
  },
  codex: {
    name: 'Codex CLI',
    profileRoot: 'CDESK_CODEX_PROFILES',
    defaultRoot: '.codex-profiles',
    configDir: 'CODEX_HOME',
    executable: codexExecutable,
  },
};

const desktopHelp = `Usage: cdesk run <profile>
       cdesk list

Run Claude Desktop with a separate application data directory for each profile.`;

function run(executable, args, options = {}) {
  const child = spawn(executable, args, { stdio: 'inherit', ...options });
  child.once('error', (error) => {
    console.error(`cdesk: ${error.code === 'ENOENT' ? `executable not found: ${executable}` : error.message}`);
    process.exitCode = error.code === 'ENOENT' ? 127 : 1;
  });
  child.once('exit', (code, signal) => {
    process.exitCode = code ?? (128 + (signals[signal] ?? 0));
  });
}

function profileName(input) {
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(input ?? '') ||
      /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(input)) {
    throw new Error('use a profile name with 1–64 letters, digits, hyphens or underscores, starting with a letter or digit (Windows device names are reserved)');
  }
  return input.toLowerCase();
}

function listProfiles(root) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) console.log(entry.name);
  }
}

function claudeExecutable() {
  if (process.env.CDESK_CLAUDE_BIN) return process.env.CDESK_CLAUDE_BIN;
  if (process.platform !== 'win32') return 'claude';
  // Prefer the official native installer location over the Windows search path.
  const native = join(homedir(), '.local', 'bin', 'claude.exe');
  return existsSync(native) ? native : 'claude.exe';
}

function codexExecutable() {
  if (process.env.CDESK_CODEX_BIN) return [process.env.CDESK_CODEX_BIN];
  if (process.platform !== 'win32') return ['codex'];

  for (const entry of (process.env.PATH ?? '').split(delimiter)) {
    const directory = entry.replace(/^"(.*)"$/, '$1');
    if (!isAbsolute(directory)) continue;
    const native = join(directory, 'codex.exe');
    if (existsSync(native)) return [native];

    // Invoke the official global npm entry point directly. Launching its .cmd
    // shim would require a shell, which can reinterpret the user's arguments.
    const npmEntry = join(directory, 'node_modules', '@openai', 'codex', 'bin', 'codex.js');
    if (existsSync(join(directory, 'codex.cmd')) && existsSync(npmEntry)) {
      return [process.execPath, npmEntry];
    }
  }
  return ['codex.exe'];
}

function terminalHelp(command, tool) {
  return `Usage: cdesk ${command} <profile> [arguments...]
       cdesk ${command} --list

Run ${tool.name} with a separate configuration and login for each profile.
Profile names use letters, digits, hyphens and underscores.`;
}

function runTerminal(command, tool, [profile, ...args]) {
  if (profile === undefined || profile === '--help' || profile === '-h') {
    console.log(terminalHelp(command, tool));
    return;
  }

  const root = resolve(process.env[tool.profileRoot] || join(homedir(), tool.defaultRoot));
  if (profile === '--list' && args.length === 0) {
    return listProfiles(root);
  }

  const config = join(root, profileName(profile));
  mkdirSync(config, { recursive: true, mode: 0o700 });
  const [executable, ...prefix] = tool.executable();
  const forwarded = args[0] === '--' ? args.slice(1) : args;
  run(executable, [...prefix, ...forwarded], {
    env: { ...process.env, [tool.configDir]: config },
  });
}

function claudeDesktop(command, args) {
  const root = resolve(process.env.CDESK_PROFILES || join(homedir(), '.claude-desktop-profiles'));
  if ((command === 'list' || command === 'ls') && args.length === 0) return listProfiles(root);
  if (command !== 'run' || args.length !== 1) throw new Error(desktopHelp);

  const data = join(root, profileName(args[0]));
  mkdirSync(data, { recursive: true, mode: 0o700 });
  const executable = process.env.CDESK_DESKTOP_BIN ||
    (process.platform === 'win32' ? 'claude-desktop.exe' : 'claude-desktop');
  run(executable, [`--user-data-dir=${data}`]);
}

function main([command, ...args]) {
  if (Object.hasOwn(terminalTools, command)) return runTerminal(command, terminalTools[command], args);
  if (process.platform === 'darwin') {
    return run('/bin/bash', [join(__dirname, 'cdesk'), ...process.argv.slice(2)]);
  }
  if (command === undefined || command === 'help' || command === '--help' || command === '-h') {
    const terminalHelpText = Object.entries(terminalTools).map(([name, tool]) => terminalHelp(name, tool));
    console.log([...terminalHelpText, desktopHelp].join('\n\n'));
    return;
  }
  claudeDesktop(command, args);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(`cdesk: ${error.message}`);
  process.exitCode = 1;
}
