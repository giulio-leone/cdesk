'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { existsSync, mkdtempSync, realpathSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const test = require('node:test');

test('terminal profiles have independent directories and forward the native command arguments', (t) => {
  const temp = mkdtempSync(join(realpathSync(tmpdir()), 'cdesk-test-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const claudeRoot = join(temp, 'Claude profiles');
  const codexRoot = join(temp, 'Codex profiles');
  const env = {
    ...process.env,
    CDESK_CODE_PROFILES: claudeRoot,
    CDESK_CODEX_PROFILES: codexRoot,
    CDESK_CLAUDE_BIN: process.execPath,
    CDESK_CODEX_BIN: process.execPath,
  };
  const launcher = join(__dirname, '..', 'bin', 'cdesk.js');
  const probe = join(temp, 'probe.cjs');
  writeFileSync(probe, `console.log(JSON.stringify({
    directory: process.env[process.argv[2]],
    args: process.argv.slice(3),
  }));
  process.exitCode = 23;
`);
  const invoke = (...args) => spawnSync(process.execPath, [launcher, ...args], { env, encoding: 'utf8' });

  for (const [command, root, variable] of [
    ['cli', claudeRoot, 'CLAUDE_CONFIG_DIR'],
    ['codex', codexRoot, 'CODEX_HOME'],
  ]) {
    const fresh = invoke(command, '--list');
    assert.equal(fresh.status, 0, fresh.stderr);
    assert.equal(fresh.stdout, '');
    assert.equal(existsSync(root), false);

    for (const name of ['Work', 'Personal']) {
      const args = ['argument with spaces', 'symbols & quotes "'];
      const launched = invoke(command, name, '--', probe, variable, ...args);
      assert.equal(launched.status, 23, launched.stderr);
      assert.deepEqual(JSON.parse(launched.stdout), {
        directory: join(root, name.toLowerCase()),
        args,
      });
    }

    const listed = invoke(command, '--list');
    assert.equal(listed.status, 0, listed.stderr);
    assert.deepEqual(listed.stdout.trim().split(/\r?\n/).sort(), ['personal', 'work']);
  }
});
