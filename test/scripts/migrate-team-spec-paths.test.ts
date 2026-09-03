import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve(
  '.codex/skills/openspec-local-installer/scripts/migrate-team-spec-paths.mjs',
);
const tempDirectories: string[] = [];

describe('team spec path migration script', () => {
  afterEach(() => {
    for (const directory of tempDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('previews without mutation, then migrates main and active delta specs', () => {
    const project = makeProject();
    write(
      join(project, 'openspec/specs/build-stub-generator_build-stub_filename-limit/spec.md'),
      '# main',
    );
    write(
      join(
        project,
        'openspec/changes/current/specs/tfg_iut-include_unittest/spec.md',
      ),
      '# delta tfg_iut-include_unittest',
    );
    write(
      join(project, 'openspec/changes/current/proposal.md'),
      'Uses build-stub-generator_build-stub_filename-limit and tfg_iut-include_unittest.',
    );
    write(
      join(
        project,
        'openspec/changes/archive/2026-01-01-old/specs/legacy_archive_entry/spec.md',
      ),
      '# archived legacy_archive_entry',
    );

    const preview = run(project);
    expect(preview.status).toBe(0);
    expect(preview.stdout).toContain(
      'build-stub-generator_build-stub_filename-limit -> build-stub-generator/build-stub/filename-limit',
    );
    expect(
      existsSync(
        join(project, 'openspec/specs/build-stub-generator_build-stub_filename-limit/spec.md'),
      ),
    ).toBe(true);

    const applied = run(project, '--write');
    expect(applied.status).toBe(0);
    expect(
      existsSync(
        join(project, 'openspec/specs/build-stub-generator/build-stub/filename-limit/spec.md'),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(project, 'openspec/changes/current/specs/tfg/iut-include/unittest/spec.md'),
      ),
    ).toBe(true);
    expect(readFileSync(join(project, 'openspec/changes/current/proposal.md'), 'utf8')).toBe(
      'Uses build-stub-generator/build-stub/filename-limit and tfg/iut-include/unittest.',
    );
    expect(
      existsSync(
        join(
          project,
          'openspec/changes/archive/2026-01-01-old/specs/legacy_archive_entry/spec.md',
        ),
      ),
    ).toBe(true);

    const repeated = run(project, '--write');
    expect(repeated.status).toBe(0);
    expect(repeated.stdout).toContain('No legacy team spec paths or references need migration.');
  });

  it('does not change anything when a nested destination already exists', () => {
    const project = makeProject();
    const legacy = join(project, 'openspec/specs/domain_area_topic/spec.md');
    const nested = join(project, 'openspec/specs/domain/area/topic/spec.md');
    write(legacy, '# legacy');
    write(nested, '# existing');

    const result = run(project, '--write');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('destination already exists');
    expect(readFileSync(legacy, 'utf8')).toBe('# legacy');
    expect(readFileSync(nested, 'utf8')).toBe('# existing');
  });

  it('preflights every spec before moving a valid legacy path', () => {
    const project = makeProject();
    const legacy = join(project, 'openspec/specs/domain_area_topic/spec.md');
    write(legacy, '# legacy');
    write(join(project, 'openspec/specs/not-valid/spec.md'), '# invalid');

    const result = run(project, '--write');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('neither a legacy three-part ID nor a three-depth nested path');
    expect(existsSync(legacy)).toBe(true);
    expect(existsSync(join(project, 'openspec/specs/domain/area/topic/spec.md'))).toBe(false);
  });
});

function makeProject(): string {
  const directory = mkdtempSync(join(tmpdir(), 'openspec-team-migration-'));
  tempDirectories.push(directory);
  mkdirSync(join(directory, 'openspec'), { recursive: true });
  return directory;
}

function write(filePath: string, content: string): void {
  mkdirSync(join(filePath, '..'), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function run(project: string, ...extraArgs: string[]) {
  return spawnSync(process.execPath, [script, '--target', project, ...extraArgs], {
    encoding: 'utf8',
  });
}
