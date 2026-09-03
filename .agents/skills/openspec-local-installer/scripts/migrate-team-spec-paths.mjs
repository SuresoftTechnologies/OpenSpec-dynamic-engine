#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const target = args.target ? resolve(args.target) : process.cwd();
const write = Boolean(args.write);
const openspecRoot = join(target, 'openspec');

if (!existsSync(openspecRoot)) {
  fail(`OpenSpec directory not found: ${openspecRoot}`);
}

const plan = buildPlan(openspecRoot);
printPlan(plan, write);

if (plan.errors.length > 0) {
  fail(`Migration preflight failed with ${plan.errors.length} error(s). No files were changed.`);
}

if (!write) {
  console.log('Dry run only. Rerun with --write to apply this migration.');
  process.exit(0);
}

if (plan.moves.length === 0 && plan.contentChanges.length === 0) {
  console.log('No legacy team spec paths or references need migration.');
  process.exit(0);
}

applyPlan(plan);
console.log(
  `Migrated ${plan.moves.length} spec path(s) and updated ${plan.contentChanges.length} text file(s).`,
);

function buildPlan(root) {
  const scopeRoots = [];
  const mainSpecs = join(root, 'specs');
  if (existsSync(mainSpecs)) scopeRoots.push({ label: 'main specs', root: mainSpecs });

  const changesRoot = join(root, 'changes');
  if (existsSync(changesRoot)) {
    for (const entry of readdirSync(changesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'archive') continue;
      const specsRoot = join(changesRoot, entry.name, 'specs');
      if (existsSync(specsRoot)) {
        scopeRoots.push({ label: `change ${entry.name}`, root: specsRoot });
      }
    }
  }

  const moves = [];
  const errors = [];
  for (const scope of scopeRoots) {
    for (const specDirectory of findSpecDirectories(scope.root)) {
      const relativeDirectory = relative(scope.root, specDirectory);
      const segments = relativeDirectory.split(sep);

      if (isNestedTeamId(segments)) continue;

      if (segments.length === 1 && isLegacyTeamId(segments[0])) {
        const nestedId = segments[0].split('_').join('/');
        const destination = join(scope.root, ...nestedId.split('/'));
        if (existsSync(destination)) {
          errors.push(
            `${scope.label}: ${segments[0]} cannot move to ${nestedId}; destination already exists.`,
          );
          continue;
        }
        moves.push({
          scope: scope.label,
          source: specDirectory,
          destination,
          legacyId: segments[0],
          nestedId,
        });
        continue;
      }

      errors.push(
        `${scope.label}: ${relativeDirectory.split(sep).join('/')} is neither a legacy three-part ID nor a three-depth nested path.`,
      );
    }
  }

  const idMappings = new Map(moves.map((move) => [move.legacyId, move.nestedId]));
  const contentChanges = [];
  for (const filePath of findTextFiles(root, join(root, 'changes', 'archive'))) {
    const original = readFileSync(filePath, 'utf8');
    let updated = original;
    for (const [legacyId, nestedId] of idMappings) {
      updated = updated.replaceAll(legacyId, nestedId);
    }
    if (updated !== original) {
      contentChanges.push({
        originalPath: filePath,
        finalPath: remapMovedPath(filePath, moves),
        original,
        updated,
      });
    }
  }

  return { moves, errors, contentChanges };
}

function applyPlan(plan) {
  const completedMoves = [];
  const writtenFiles = [];

  try {
    for (const move of plan.moves) {
      mkdirSync(dirname(move.destination), { recursive: true });
      renameSync(move.source, move.destination);
      completedMoves.push(move);
    }

    for (const change of plan.contentChanges) {
      writeFileSync(change.finalPath, change.updated, 'utf8');
      writtenFiles.push(change);
    }
  } catch (error) {
    for (const change of [...writtenFiles].reverse()) {
      if (existsSync(change.finalPath)) {
        writeFileSync(change.finalPath, change.original, 'utf8');
      }
    }
    for (const move of [...completedMoves].reverse()) {
      if (existsSync(move.destination)) {
        mkdirSync(dirname(move.source), { recursive: true });
        renameSync(move.destination, move.source);
        removeEmptyParents(dirname(move.destination), moveRoot(move));
      }
    }
    fail(`Migration failed and was rolled back: ${error instanceof Error ? error.message : error}`);
  }
}

function findSpecDirectories(root) {
  const found = [];
  walk(root, (filePath) => {
    if (filePath.endsWith(`${sep}spec.md`)) found.push(dirname(filePath));
  });
  return found;
}

function findTextFiles(root, excludedRoot) {
  const extensions = new Set(['.md', '.yaml', '.yml', '.json', '.txt']);
  const found = [];
  walk(
    root,
    (filePath) => {
      const dot = filePath.lastIndexOf('.');
      const extension = dot >= 0 ? filePath.slice(dot).toLowerCase() : '';
      if (extensions.has(extension)) found.push(filePath);
    },
    excludedRoot,
  );
  return found;
}

function walk(directory, onFile, excludedRoot = null) {
  if (!existsSync(directory)) return;
  if (excludedRoot && resolve(directory) === resolve(excludedRoot)) return;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const child = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(child, onFile, excludedRoot);
    } else if (entry.isFile()) {
      onFile(child);
    }
  }
}

function isNestedTeamId(segments) {
  return segments.length === 3 && segments.every(isKebabSegment);
}

function isLegacyTeamId(value) {
  const segments = value.split('_');
  return segments.length === 3 && segments.every(isKebabSegment);
}

function isKebabSegment(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function remapMovedPath(filePath, moves) {
  for (const move of moves) {
    const suffix = relative(move.source, filePath);
    if (suffix !== '..' && !suffix.startsWith(`..${sep}`)) {
      return join(move.destination, suffix);
    }
  }
  return filePath;
}

function moveRoot(move) {
  const parts = move.nestedId.split('/');
  let root = move.destination;
  for (let index = 0; index < parts.length; index += 1) root = dirname(root);
  return root;
}

function removeEmptyParents(start, stopExclusive) {
  let current = start;
  while (current !== stopExclusive && current.startsWith(`${stopExclusive}${sep}`)) {
    if (!existsSync(current) || readdirSync(current).length > 0) break;
    rmdirSync(current);
    current = dirname(current);
  }
}

function printPlan(plan, writeMode) {
  console.log(`${writeMode ? 'Applying' : 'Planning'} team spec path migration in ${target}`);
  for (const move of plan.moves) {
    console.log(`- [${move.scope}] ${move.legacyId} -> ${move.nestedId}`);
  }
  for (const error of plan.errors) console.error(`- ERROR: ${error}`);
  console.log(`Text files to update: ${plan.contentChanges.length}`);
}

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

function fail(message) {
  console.error(message);
  process.exit(1);
}
