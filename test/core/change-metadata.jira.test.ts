import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ChangeMetadataSchema, JIRA_KEY_PATTERN } from '../../src/core/change-metadata/index.js';
import {
  writeChangeMetadata,
  readChangeMetadata,
} from '../../src/utils/change-metadata.js';

describe('change metadata jira fields', () => {
  // 4.1 유효한 Jira key/source가 metadata schema로 통과해야 한다.
  it('accepts valid jira key and source', () => {
    const result = ChangeMetadataSchema.safeParse({
      schema: 'spec-driven',
      jira: { key: 'CT2606-616', source: 'branch' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jira).toEqual({ key: 'CT2606-616', source: 'branch' });
    }
  });

  // 4.1 PROJECT-123 형식이 아니면 거부한다.
  it('rejects jira key that does not match PROJECT-123 pattern', () => {
    expect(JIRA_KEY_PATTERN.test('abc-123')).toBe(false);
    const result = ChangeMetadataSchema.safeParse({
      schema: 'spec-driven',
      jira: { key: 'lowercase-1', source: 'branch' },
    });
    expect(result.success).toBe(false);
  });

  // 4.1 source가 허용된 값(branch|prompt)이 아니면 거부한다.
  it('rejects jira source outside the allowed enum', () => {
    const result = ChangeMetadataSchema.safeParse({
      schema: 'spec-driven',
      jira: { key: 'ABC-123', source: 'manual' },
    });
    expect(result.success).toBe(false);
  });
});

describe('change metadata jira read/write round trip', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-jira-meta-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // 4.1 .openspec.yaml에 jira.key/source를 쓰고 다시 읽을 수 있어야 한다.
  it('writes and reads jira metadata to .openspec.yaml', () => {
    writeChangeMetadata(tempDir, {
      schema: 'spec-driven',
      jira: { key: 'ABC-123', source: 'prompt' },
    });

    const onDisk = fs.readFileSync(path.join(tempDir, '.openspec.yaml'), 'utf-8');
    expect(onDisk).toContain('ABC-123');

    const read = readChangeMetadata(tempDir);
    expect(read?.jira).toEqual({ key: 'ABC-123', source: 'prompt' });
  });
});
