#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const { existsSync, mkdirSync, readdirSync } = require('node:fs');
const { constants: { signals }, homedir } = require('node:os');
const { join, resolve } = require('node:path');

const cliHelp = `Usage: cdesk cli <profile> [claude arguments...]
       cdesk cli --list

Run Claude Code with a separate configuration and login for each profile.
Profile names use letters, digits, hyphens and underscores.`;

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
  for (const entry of readdirSync(root, { withFileTypes: true, throwIfNoEntry: false }) ?? []) {
    if (entry.isDirectory()) console.log(entry.name);
  }
}

function codeExecutable() {
  if (process.env.CDESK_CLAUDE_BIN) return process.env.CDESK_CLAUDE_BIN;
  if (process.platform !== 'win32') return 'claude';
  // Prefer the official native installer location over the Windows search path.
  const native = join(homedir(), '.local', 'bin', 'claude.exe');
  return existsSync(native) ? native : 'claude.exe';
}

function claudeCode([profile, ...args]) {
  if (profile === undefined || profile === '--help' || profile === '-h') {
    console.log(cliHelp);
    return;
  }

  const root = resolve(process.env.CDESK_CODE_PROFILES || join(homedir(), '.claude-code-profiles'));
  if (profile === '--list' && args.length === 0) {
    return listProfiles(root);
  }

  const config = join(root, profileName(profile));
  mkdirSync(config, { recursive: true, mode: 0o700 });
  run(codeExecutable(), args[0] === '--' ? args.slice(1) : args, {
    env: { ...process.env, CLAUDE_CONFIG_DIR: config },
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
  if (command === 'cli') return claudeCode(args);
  if (process.platform === 'darwin') {
    return run('/bin/bash', [join(__dirname, 'cdesk'), ...process.argv.slice(2)]);
  }
  if (command === undefined || command === 'help' || command === '--help' || command === '-h') {
    console.log(`${cliHelp}\n\n${desktopHelp}`);
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
