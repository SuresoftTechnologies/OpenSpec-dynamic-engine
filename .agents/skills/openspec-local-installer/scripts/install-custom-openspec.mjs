#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = parseArgs(process.argv.slice(2));
const repo = resolve(args.repo ?? process.cwd());
const mode = args.mode ?? 'link';
const skipUninstall = Boolean(args['skip-uninstall']);
const targetRepo = args.target ? resolve(args.target) : null;
const skipTargetUpdate = Boolean(args['skip-target-update']);
const skipTargetValidation = Boolean(args['skip-target-validation']);
const migrateSpecs = Boolean(args['migrate-specs']);

if (!['link', 'global-copy'].includes(mode)) {
  fail(`Invalid --mode "${mode}". Use "link" or "global-copy".`);
}

const packageJsonPath = join(repo, 'package.json');
if (!existsSync(packageJsonPath)) {
  fail(`No package.json found at ${packageJsonPath}`);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== '@fission-ai/openspec') {
  fail(`Expected @fission-ai/openspec, found ${packageJson.name ?? '(missing name)'}`);
}
if (packageJson.openspecDistribution !== 'suresoft-dynamic-engine') {
  fail('This installer only installs the Suresoft team OpenSpec distribution.');
}

const pnpmVersion = getPinnedPnpmVersion(packageJson.packageManager);

console.log(`OpenSpec repo: ${repo}`);
console.log(`Install mode: ${mode}`);
console.log(`Pinned pnpm: ${pnpmVersion}`);

checkNodeVersion();
ensureCorepackPnpm(pnpmVersion);
run('corepack', ['pnpm', 'install', '--force'], { cwd: repo });
run('corepack', ['pnpm', 'run', 'build'], { cwd: repo });

if (!skipUninstall) {
  run('npm', ['uninstall', '-g', '@fission-ai/openspec'], { cwd: repo, allowFailure: true });
  run('npm', ['uninstall', '-g', 'openspec'], { cwd: repo, allowFailure: true });
}

if (mode === 'link') {
  run('npm', ['link'], { cwd: repo });
} else {
  run('npm', ['install', '-g', '.'], { cwd: repo });
}

run('openspec', ['--version'], { cwd: repo, env: openspecEnv() });
printResolvedExecutable();

if (targetRepo) {
  applyTeamConfig(targetRepo);
  if (migrateSpecs) {
    migrateTeamSpecs(targetRepo);
  }
  if (!skipTargetUpdate) {
    run('openspec', ['update'], { cwd: targetRepo, env: openspecEnv() });
  }
  if (!skipTargetValidation) {
    run('openspec', ['schema', 'validate', 'engine-spec-driven'], {
      cwd: targetRepo,
      env: openspecEnv(),
    });
    run('openspec', ['validate', '--all', '--strict', '--no-interactive'], {
      cwd: targetRepo,
      env: openspecEnv(),
    });
  }
} else {
  console.log('No --target provided, so team config was not applied to a working repository.');
  console.log('To install and configure a repository in one step, rerun with --target <target-repo>.');
}

console.log('Customized OpenSpec installation completed.');

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function getPinnedPnpmVersion(packageManager) {
  const match = /^pnpm@([^+]+)(?:\+.*)?$/.exec(packageManager ?? '');
  if (!match) {
    fail('package.json must pin pnpm in the packageManager field.');
  }
  return match[1];
}

function checkNodeVersion() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 20 || (major === 20 && minor < 19)) {
    fail(`Node ${process.versions.node} detected. OpenSpec requires Node >=20.19.0.`);
  }
  console.log(`Node: ${process.versions.node}`);
}

function ensureCorepackPnpm(version) {
  run('corepack', ['--version']);
  run('corepack', ['prepare', `pnpm@${version}`, '--activate']);
  const active = run('corepack', ['pnpm', '--version']);
  if (active.stdout.trim() !== version) {
    fail(`Expected pnpm ${version}, but Corepack resolved ${active.stdout.trim() || '(no version)'}.`);
  }
}

function printResolvedExecutable() {
  const command = process.platform === 'win32' ? 'where.exe' : 'which';
  run(command, ['openspec'], { allowFailure: true });
}

function applyTeamConfig(target) {
  const scriptPath = join(
    repo,
    '.codex',
    'skills',
    'openspec-local-installer',
    'scripts',
    'apply-team-config.mjs',
  );
  if (!existsSync(scriptPath)) {
    fail(`Team config script not found: ${scriptPath}`);
  }
  run('node', [scriptPath, '--source', repo, '--target', target], { cwd: repo });
}

function migrateTeamSpecs(target) {
  const scriptPath = join(
    repo,
    '.codex',
    'skills',
    'openspec-local-installer',
    'scripts',
    'migrate-team-spec-paths.mjs',
  );
  if (!existsSync(scriptPath)) {
    fail(`Team spec migration script not found: ${scriptPath}`);
  }
  run('node', [scriptPath, '--target', target, '--write'], { cwd: repo });
}

function openspecEnv() {
  return {
    OPENSPEC_NO_UPDATE_CHECK: '1',
    OPENSPEC_TELEMETRY: '0',
  };
}

function run(command, commandArgs, options = {}) {
  console.log(`> ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, ...options.env },
  });

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  const status = result.status ?? 1;
  if (status !== 0 && !options.allowFailure) {
    fail(`${command} ${commandArgs.join(' ')} failed with exit code ${status}`);
  }
  return { status, stdout, stderr, combined: `${stdout}\n${stderr}` };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
