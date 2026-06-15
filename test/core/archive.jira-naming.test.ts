import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import * as fssync from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';
import { ArchiveCommand } from '../../src/core/archive.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// 팀 schema preset(engine-spec-driven)을 임시 project로 복사한다.
function copyPresetSchema(projectRoot: string): void {
  const src = path.join(REPO_ROOT, 'docs', 'team-config', 'engine-spec-driven');
  const dest = path.join(projectRoot, 'openspec', 'schemas', 'engine-spec-driven');
  fssync.cpSync(src, dest, { recursive: true });
}

describe('ArchiveCommand jira naming', () => {
  let tempDir: string;
  let cwd: string;

  beforeEach(async () => {
    cwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-archive-jira-'));
    process.chdir(tempDir);
    await fs.mkdir(path.join(tempDir, 'openspec', 'changes', 'archive'), { recursive: true });
    copyPresetSchema(tempDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(cwd);
    vi.restoreAllMocks();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  // 4.4 팀 schema change를 archive 하면 Jira key가 포함된 directory name과 보조 metadata가 기록된다.
  it('archives with date_jira_change directory name and records jira metadata', async () => {
    const changeName = 'add-archive';
    const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
    await fs.mkdir(changeDir, { recursive: true });
    // 팀 schema를 가리키는 metadata와 완료된 tasks.
    await fs.writeFile(path.join(changeDir, '.openspec.yaml'), 'schema: engine-spec-driven\n');
    await fs.writeFile(path.join(changeDir, 'tasks.md'), '## 1. 작업\n\n- [x] 1.1 완료된 작업\n');

    const archiveCommand = new ArchiveCommand();
    await archiveCommand.execute(changeName, {
      yes: true,
      skipSpecs: true,
      noValidate: true,
      jira: 'CT2606-616',
    });

    const archiveBase = path.join(tempDir, 'openspec', 'changes', 'archive');
    const entries = await fs.readdir(archiveBase);
    const archived = entries.find((e) => e.includes('CT2606-616'));
    expect(archived).toBeDefined();
    expect(archived).toMatch(/^\d{4}-\d{2}-\d{2}_CT2606-616_add-archive$/);

    // 이동된 디렉터리의 .openspec.yaml에 jira 보조 metadata가 보존되어야 한다.
    const movedMeta = await fs.readFile(
      path.join(archiveBase, archived!, '.openspec.yaml'),
      'utf-8'
    );
    expect(movedMeta).toContain('CT2606-616');
    expect(movedMeta).toContain('source: prompt');
  });

  // 4.4 팀 schema가 아니면 기존 date-change naming을 유지한다(regression).
  it('keeps date-change naming for non-team schema changes', async () => {
    const changeName = 'plain-change';
    const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
    await fs.mkdir(changeDir, { recursive: true });
    await fs.writeFile(path.join(changeDir, '.openspec.yaml'), 'schema: spec-driven\n');
    await fs.writeFile(path.join(changeDir, 'tasks.md'), '## 1. 작업\n\n- [x] 1.1 완료\n');

    const archiveCommand = new ArchiveCommand();
    await archiveCommand.execute(changeName, {
      yes: true,
      skipSpecs: true,
      noValidate: true,
      jira: 'CT2606-616',
    });

    const archiveBase = path.join(tempDir, 'openspec', 'changes', 'archive');
    const entries = await fs.readdir(archiveBase);
    expect(entries.some((e) => e.includes('CT2606-616'))).toBe(false);
    expect(entries.some((e) => /^\d{4}-\d{2}-\d{2}-plain-change$/.test(e))).toBe(true);
  });
});
