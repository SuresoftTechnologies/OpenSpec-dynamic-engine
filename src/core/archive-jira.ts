/**
 * Jira archive 추적 헬퍼.
 *
 * archive 시점에만 Jira key를 resolve한다. resolution 순서는
 * branch 추론 -> (필수일 때) prompt -> optional fallback 이다.
 * archive directory name이 primary trace key이고, `.openspec.yaml`의 jira metadata는 보조 정보다.
 */
import { execFileSync } from 'node:child_process';
import { JIRA_KEY_PATTERN } from './change-metadata/schema.js';

/** branch 등에서 첫 Jira key를 찾기 위한 전역 패턴(기본 PROJECT-123 형식). */
const JIRA_KEY_GLOBAL = /[A-Z][A-Z0-9]+-\d+/;

/** 기본 `PROJECT-123` 형식의 Jira key인지 검증한다. */
export function isValidJiraKey(key: string): boolean {
  return typeof key === 'string' && JIRA_KEY_PATTERN.test(key);
}

/**
 * branch 이름에서 기본 Jira key 형식과 일치하는 첫 key를 추출한다.
 * 일치하는 key가 없으면 null을 반환한다.
 *
 * @param branch - Git branch 이름(예: `feature/CT2606-616-add-archive`)
 */
export function extractJiraKeyFromBranch(branch: string | null | undefined): string | null {
  if (!branch) {
    return null;
  }
  const match = branch.match(JIRA_KEY_GLOBAL);
  return match ? match[0] : null;
}

/**
 * 현재 Git branch 이름을 반환한다. Git repo가 아니거나 조회에 실패하면 null.
 *
 * @param cwd - git 명령을 실행할 작업 디렉터리
 */
export function getCurrentGitBranch(cwd: string = process.cwd()): string | null {
  try {
    const out = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const branch = out.trim();
    return branch.length > 0 ? branch : null;
  } catch {
    return null;
  }
}

/**
 * archive directory 이름을 만든다.
 * - Jira key가 있으면 `YYYY-MM-DD_<JIRA-KEY>_<change-name>` 형식.
 * - 없으면 기존 `YYYY-MM-DD-<change-name>` 형식으로 fallback.
 */
export function buildArchiveDirName(params: {
  date: string;
  changeName: string;
  jiraKey?: string | null;
}): string {
  const { date, changeName, jiraKey } = params;
  if (jiraKey) {
    return `${date}_${jiraKey}_${changeName}`;
  }
  return `${date}-${changeName}`;
}

export interface JiraResolution {
  /** resolve된 Jira key. 없으면 null. */
  key: string | null;
  /** key를 얻은 출처. key가 없으면 undefined. */
  source?: 'branch' | 'prompt';
}

/**
 * branch와 명시적 prompt 입력으로부터 Jira key를 resolve한다(순수 함수, I/O 없음).
 *
 * 순서:
 * 1. branch에서 추론한 key가 유효하면 source `branch`로 사용한다.
 * 2. 아니면 prompt 입력 key가 유효하면 source `prompt`로 사용한다.
 * 3. 둘 다 없으면 key 없이 반환한다(호출 측에서 필수 여부에 따라 처리).
 *
 * @param branch - 현재 branch 이름(없으면 null)
 * @param promptKey - 사용자에게 입력받은 key(없으면 undefined)
 */
export function resolveJiraKey(
  branch: string | null | undefined,
  promptKey?: string | null
): JiraResolution {
  const fromBranch = extractJiraKeyFromBranch(branch);
  if (fromBranch && isValidJiraKey(fromBranch)) {
    return { key: fromBranch, source: 'branch' };
  }
  if (promptKey && isValidJiraKey(promptKey)) {
    return { key: promptKey, source: 'prompt' };
  }
  return { key: null };
}
