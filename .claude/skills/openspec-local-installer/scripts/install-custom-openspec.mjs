#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = parseArgs(process.argv.slice(2));
const repo = resolve(args.repo ?? process.cwd());
const mode = args.mode ?? 'link';
const skipUninstall = Boolean(args['skip-uninstall']);
const autoAllowEsbuild = args['auto-allow-esbuild'] !== 'false';
const targetRepo = args.target ? resolve(args.target) : null;
const skipTargetUpdate = Boolean(args['skip-target-update']);

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

console.log(`OpenSpec repo: ${repo}`);
console.log(`Install mode: ${mode}`);

checkNodeVersion();
ensurePnpm();

let install = run('pnpm', ['install'], { cwd: repo, allowFailure: true });
if (install.status !== 0 && /ERR_PNPM_IGNORED_BUILDS|Ignored build scripts/i.test(install.combined)) {
  if (autoAllowEsbuild) {
    console.log('pnpm blocked esbuild build scripts. Adding pnpm.onlyBuiltDependencies=["esbuild"] and retrying.');
    allowEsbuildBuild(packageJsonPath);
    install = run('pnpm', ['install'], { cwd: repo, allowFailure: true });
  } else {
    fail([
      'pnpm blocked esbuild build scripts.',
      'Run `pnpm approve-builds`, select esbuild, then rerun this installer.',
    ].join('\n'));
  }
}
if (install.status !== 0) {
  fail(`pnpm install failed with exit code ${install.status}`);
}

run('pnpm', ['run', 'build'], { cwd: repo });

if (!skipUninstall) {
  run('npm', ['uninstall', '-g', '@fission-ai/openspec'], { cwd: repo, allowFailure: true });
  run('npm', ['uninstall', '-g', 'openspec'], { cwd: repo, allowFailure: true });
}

if (mode === 'link') {
  run('npm', ['link'], { cwd: repo });
} else {
  run('npm', ['install', '-g', '.'], { cwd: repo });
}

run('openspec', ['--version'], { cwd: repo });
printResolvedExecutable();

if (targetRepo) {
  applyTeamConfig(targetRepo);
  if (!skipTargetUpdate) {
    run('openspec', ['update'], { cwd: targetRepo });
  }
} else {
  console.log('No --target provided, so team config was not applied to a working repository.');
  console.log('To apply it later, run:');
  console.log(`node .codex/skills/openspec-local-installer/scripts/apply-team-config.mjs --source ${repo} --target <target-repo>`);
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

function checkNodeVersion() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 20 || (major === 20 && minor < 19)) {
    fail(`Node ${process.versions.node} detected. OpenSpec requires Node >=20.19.0.`);
  }
  console.log(`Node: ${process.versions.node}`);
}

function ensurePnpm() {
  const existing = run('pnpm', ['--version'], { allowFailure: true });
  if (existing.status === 0) return;

  console.log('pnpm not found. Trying Corepack activation.');
  run('corepack', ['enable'], { allowFailure: true });
  run('corepack', ['prepare', 'pnpm@latest', '--activate'], { allowFailure: true });

  const afterCorepack = run('pnpm', ['--version'], { allowFailure: true });
  if (afterCorepack.status === 0) return;

  console.log('Corepack did not activate pnpm. Installing pnpm globally with npm.');
  run('npm', ['install', '-g', 'pnpm']);
  run('pnpm', ['--version']);
}

function allowEsbuildBuild(filePath) {
  const current = JSON.parse(readFileSync(filePath, 'utf8'));
  current.pnpm ??= {};
  const existing = Array.isArray(current.pnpm.onlyBuiltDependencies)
    ? current.pnpm.onlyBuiltDependencies
    : [];
  if (!existing.includes('esbuild')) {
    current.pnpm.onlyBuiltDependencies = [...existing, 'esbuild'];
    writeFileSync(filePath, `${JSON.stringify(current, null, 2)}\n`);
  }
}

function printResolvedExecutable() {
  const command = process.platform === 'win32' ? 'where.exe' : 'which';
  run(command, ['openspec'], { allowFailure: true });
}

function applyTeamConfig(target) {
  const scriptPath = join(repo, '.codex', 'skills', 'openspec-local-installer', 'scripts', 'apply-team-config.mjs');
  if (!existsSync(scriptPath)) {
    fail(`Team config script not found: ${scriptPath}`);
  }
  run('node', [scriptPath, '--source', repo, '--target', target], { cwd: repo });
}

function run(command, commandArgs, options = {}) {
  console.log(`> ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
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
