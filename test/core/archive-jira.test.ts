import { describe, it, expect } from 'vitest';
import {
  isValidJiraKey,
  extractJiraKeyFromBranch,
  buildArchiveDirName,
  resolveJiraKey,
} from '../../src/core/archive-jira.js';

describe('jira key helpers', () => {
  // 4.2 기본 PROJECT-123 형식 검증.
  it('validates PROJECT-123 style keys', () => {
    expect(isValidJiraKey('CT2606-616')).toBe(true);
    expect(isValidJiraKey('ABC-123')).toBe(true);
    expect(isValidJiraKey('abc-123')).toBe(false);
    expect(isValidJiraKey('ABC123')).toBe(false);
    expect(isValidJiraKey('')).toBe(false);
  });

  // 4.2 branch 이름에서 Jira key를 추론한다.
  it('extracts jira key from a branch name', () => {
    expect(extractJiraKeyFromBranch('feature/CT2606-616-add-archive')).toBe('CT2606-616');
    expect(extractJiraKeyFromBranch('ABC-123')).toBe('ABC-123');
    expect(extractJiraKeyFromBranch('bugfix/no-key-here')).toBeNull();
    expect(extractJiraKeyFromBranch(null)).toBeNull();
  });
});

describe('archive directory naming', () => {
  // 4.2 Jira key가 있으면 YYYY-MM-DD_<JIRA-KEY>_<change-name> 형식이어야 한다.
  it('uses date_jira_change when a jira key is present', () => {
    const name = buildArchiveDirName({
      date: '2026-06-15',
      changeName: 'add-archive',
      jiraKey: 'CT2606-616',
    });
    expect(name).toBe('2026-06-15_CT2606-616_add-archive');
  });

  // 4.3 Jira key가 없으면 기존 YYYY-MM-DD-<change-name>로 fallback 한다.
  it('falls back to date-change when no jira key', () => {
    expect(buildArchiveDirName({ date: '2026-06-15', changeName: 'add-archive' })).toBe(
      '2026-06-15-add-archive'
    );
    expect(
      buildArchiveDirName({ date: '2026-06-15', changeName: 'add-archive', jiraKey: null })
    ).toBe('2026-06-15-add-archive');
  });
});

describe('jira key resolution order', () => {
  // 4.2 branch에서 key를 찾으면 source는 branch 이다.
  it('prefers a key inferred from the branch', () => {
    const result = resolveJiraKey('feature/CT2606-616-add', 'ABC-123');
    expect(result).toEqual({ key: 'CT2606-616', source: 'branch' });
  });

  // 4.3 branch에 key가 없으면 prompt 입력 key를 source prompt로 사용한다.
  it('uses the prompt key when the branch has none', () => {
    const result = resolveJiraKey('bugfix/no-key', 'ABC-123');
    expect(result).toEqual({ key: 'ABC-123', source: 'prompt' });
  });

  // 4.3 둘 다 없으면 key 없이 반환한다(optional fallback).
  it('returns no key when neither branch nor prompt provide one', () => {
    expect(resolveJiraKey('bugfix/no-key', undefined)).toEqual({ key: null });
    expect(resolveJiraKey(null, '')).toEqual({ key: null });
  });

  // 4.3 잘못된 형식의 prompt key는 무시한다.
  it('ignores an invalid prompt key', () => {
    expect(resolveJiraKey(null, 'not-a-key')).toEqual({ key: null });
  });
});
