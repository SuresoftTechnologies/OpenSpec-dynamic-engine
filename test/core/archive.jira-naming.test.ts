import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import * as fssync from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';
import { ArchiveCommand } from '../../src/core/archive.js';
import { registerStore } from '../../src/core/store/registry.js';
import { getGlobalDataDir } from '../../src/core/global-config.js';

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
  let xdgDataHome: string | undefined;

  beforeEach(async () => {
    cwd = process.cwd();
    xdgDataHome = process.env.XDG_DATA_HOME;
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-archive-jira-'));
    process.env.XDG_DATA_HOME = path.join(tempDir, 'global-data');
    process.chdir(tempDir);
    await fs.mkdir(path.join(tempDir, 'openspec', 'changes', 'archive'), { recursive: true });
    copyPresetSchema(tempDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(cwd);
    if (xdgDataHome === undefined) delete process.env.XDG_DATA_HOME;
    else process.env.XDG_DATA_HOME = xdgDataHome;
    process.exitCode = undefined;
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

  it('includes jira data in the single JSON payload without human prose', async () => {
    const changeName = 'json-archive';
    const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
    await fs.mkdir(changeDir, { recursive: true });
    await fs.writeFile(path.join(changeDir, '.openspec.yaml'), 'schema: engine-spec-driven\n');
    await fs.writeFile(path.join(changeDir, 'tasks.md'), '- [x] 완료\n');

    await new ArchiveCommand().execute(changeName, {
      yes: true,
      json: true,
      skipSpecs: true,
      jira: 'WOR-1767',
    });

    const calls = vi.mocked(console.log).mock.calls.map(([line]) => String(line));
    expect(calls).toHaveLength(1);
    const payload = JSON.parse(calls[0]);
    expect(payload.archive.jira).toEqual({ key: 'WOR-1767', source: 'prompt' });
    expect(payload.archive.archivedAs).toMatch(/^\d{4}-\d{2}-\d{2}_WOR-1767_json-archive$/);
    expect(calls[0]).not.toContain('Jira key:');
  });

  it('requires jira without changing the active change', async () => {
    const changeName = 'jira-required';
    const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
    const original = 'schema: engine-spec-driven\nskip_specs: true\n';
    await fs.mkdir(changeDir, { recursive: true });
    await fs.writeFile(path.join(changeDir, '.openspec.yaml'), original);
    await fs.writeFile(path.join(changeDir, 'tasks.md'), '- [x] 완료\n');

    await expect(
      new ArchiveCommand().execute(changeName, {
        yes: true,
        skipSpecs: true,
        requireJira: true,
      })
    ).rejects.toThrow(/Jira key is required/);

    await expect(fs.readFile(path.join(changeDir, '.openspec.yaml'), 'utf8')).resolves.toBe(original);
    expect(await fs.readdir(path.join(tempDir, 'openspec', 'changes', 'archive'))).toEqual([]);
  });

  it('restores exact metadata bytes when the final archive move fails', async () => {
    const changeName = 'rollback-jira';
    const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
    const original = '# keep this comment\nschema: engine-spec-driven\nskip_specs: true\n';
    await fs.mkdir(changeDir, { recursive: true });
    await fs.writeFile(path.join(changeDir, '.openspec.yaml'), original);
    await fs.writeFile(path.join(changeDir, 'tasks.md'), '- [x] 완료\n');

    const realRename = fs.rename.bind(fs);
    vi.spyOn(fs, 'rename').mockImplementation(async (source, destination) => {
      if (path.resolve(String(source)) === path.resolve(changeDir)) {
        const error = new Error('simulated final move failure') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        throw error;
      }
      return realRename(source, destination);
    });

    await expect(
      new ArchiveCommand().execute(changeName, {
        yes: true,
        skipSpecs: true,
        noValidate: true,
        jira: 'WOR-1767',
      })
    ).rejects.toThrow(/simulated final move failure/);

    await expect(fs.readFile(path.join(changeDir, '.openspec.yaml'), 'utf8')).resolves.toBe(original);
  });

  it('uses the selected Store root with an explicit jira key', async () => {
    const storeRoot = path.join(tempDir, 'team-store');
    await fs.mkdir(path.join(storeRoot, 'openspec', 'changes', 'archive'), { recursive: true });
    await fs.mkdir(path.join(storeRoot, 'openspec', 'specs'), { recursive: true });
    copyPresetSchema(storeRoot);
    await fs.writeFile(
      path.join(storeRoot, 'openspec', 'config.yaml'),
      'schema: engine-spec-driven\n',
    );
    await registerStore({
      id: 'team-store',
      localPath: storeRoot,
      globalDataDir: getGlobalDataDir(),
    });

    const changeName = 'store-jira';
    const changeDir = path.join(storeRoot, 'openspec', 'changes', changeName);
    await fs.mkdir(changeDir, { recursive: true });
    await fs.writeFile(path.join(changeDir, '.openspec.yaml'), 'schema: engine-spec-driven\n');
    await fs.writeFile(path.join(changeDir, 'tasks.md'), '- [x] 완료\n');

    await new ArchiveCommand().execute(changeName, {
      store: 'team-store',
      yes: true,
      skipSpecs: true,
      noValidate: true,
      jira: 'WOR-1767',
    });

    const archived = await fs.readdir(path.join(storeRoot, 'openspec', 'changes', 'archive'));
    expect(archived).toEqual([
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}_WOR-1767_store-jira$/),
    ]);
    expect(fssync.existsSync(path.join(tempDir, 'openspec', 'changes', changeName))).toBe(false);
  });
});
