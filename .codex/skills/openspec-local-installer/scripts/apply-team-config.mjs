#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const source = resolve(args.source ?? findOpenSpecRepo(process.cwd()));
const target = args.target ? resolve(args.target) : null;
const backup = args.backup !== 'false' && !args['no-backup'];

if (!target) {
  fail('Pass --target <repository-root> for the repository that should receive team config.');
}

const sourceConfig = join(source, 'docs', 'team-config', 'engine.config.yaml');
const sourceSchema = join(source, 'docs', 'team-config', 'engine-spec-driven');
if (!existsSync(sourceConfig)) fail(`Missing ${sourceConfig}`);
if (!existsSync(join(sourceSchema, 'schema.yaml'))) fail(`Missing ${join(sourceSchema, 'schema.yaml')}`);
if (!existsSync(target)) fail(`Target path does not exist: ${target}`);

const targetOpenSpec = join(target, 'openspec');
const targetSchemas = join(targetOpenSpec, 'schemas');
const targetConfig = join(targetOpenSpec, 'config.yaml');
const targetSchema = join(targetSchemas, basename(sourceSchema));

mkdirSync(targetSchemas, { recursive: true });

const configChanged =
  !existsSync(targetConfig) || readFileSync(sourceConfig, 'utf8') !== readFileSync(targetConfig, 'utf8');

if (backup && existsSync(targetConfig) && configChanged) {
  const backupPath = `${targetConfig}.bak-${timestamp()}`;
  copyFileSync(targetConfig, backupPath);
  console.log(`Backed up existing config: ${backupPath}`);
}

if (configChanged) {
  copyFileSync(sourceConfig, targetConfig);
} else {
  console.log('Team config is already current; no config backup or rewrite was needed.');
}
cpSync(sourceSchema, targetSchema, { recursive: true, force: true });

console.log(`Applied team config to ${target}`);
console.log(`Config: ${targetConfig}`);
console.log(`Schema: ${targetSchema}`);
console.log('Next: run `openspec update`, validate engine-spec-driven, then validate all artifacts strictly.');

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

function findOpenSpecRepo(start) {
  let current = resolve(start);
  while (true) {
    const candidate = join(current, 'package.json');
    if (existsSync(candidate)) return current;
    const parent = resolve(current, '..');
    if (parent === current) fail('Could not find source repo. Pass --source <OpenSpec-repo-root>.');
    current = parent;
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
