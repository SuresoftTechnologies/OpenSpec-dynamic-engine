/**
 * dynamic-engine 팀 정책 검증 헬퍼.
 *
 * 이 모듈은 원본 OpenSpec 검증 흐름을 바꾸지 않고, 팀 schema(`engine-spec-driven`)가
 * 적용된 change에서만 추가로 적용할 수 있는 순수 검증 함수를 제공한다.
 * - 팀 capability 경로 규칙(`대분류/소분류/주제`).
 * - 한글 문서 작성 정책에 대한 명백한 영문 scaffold placeholder 경고.
 */
import { ValidationIssue } from './types.js';

/** 팀 schema 이름. 이 schema를 쓰는 change에서만 팀 정책 검증을 켠다. */
export const TEAM_SCHEMA_NAME = 'engine-spec-driven';

/** 각 segment는 kebab-case(소문자/숫자 + 단일 하이픈)여야 한다. */
const KEBAB_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** guidance와 테스트에서 공유하는 팀 capability 이름 예시. */
export const TEAM_CAPABILITY_EXAMPLE = 'order-payment/refund-api/timeout-fix';

/**
 * 팀 capability ID가 `/`로 구분된 세 개의 kebab-case segment인지 검증한다.
 * 대문자, 공백, 빈 segment, 잘못된 segment 수는 모두 거부한다.
 */
export function isValidTeamCapabilityPath(capabilityPath: string): boolean {
  if (typeof capabilityPath !== 'string' || capabilityPath.length === 0) {
    return false;
  }
  // Capability IDs are portable identifiers, not platform-native paths.
  // Reject backslashes even on Windows and use the canonical forward slash.
  if (capabilityPath.includes('\\')) {
    return false;
  }
  const segments = capabilityPath.split('/');
  // 정확히 대분류/소분류/주제 세 segment여야 한다.
  if (segments.length !== 3) {
    return false;
  }
  return segments.every((segment) => KEBAB_SEGMENT.test(segment));
}

/** @deprecated Use isValidTeamCapabilityPath. */
export const isValidTeamCapabilityName = isValidTeamCapabilityPath;

/**
 * capability 이름이 팀 형식을 어기면 guidance가 포함된 ValidationIssue를, 아니면 null을 반환한다.
 *
 * @param name - 검증할 capability 이름
 * @param where - issue.path에 기록할 위치(예: spec directory 또는 proposal 항목)
 */
export function teamCapabilityNameIssue(
  capabilityPath: string,
  where: string
): ValidationIssue | null {
  if (isValidTeamCapabilityPath(capabilityPath)) {
    return null;
  }
  return {
    level: 'ERROR',
    path: where,
    message:
      `Capability path "${capabilityPath}" must use the team format ` +
      `대분류/소분류/주제: three '/'-separated kebab-case ` +
      `segments (e.g., ${TEAM_CAPABILITY_EXAMPLE}).`,
  };
}

/**
 * proposal `Capabilities` section 본문에서 `- \`name\`:` 형식의 capability 이름을 추출한다.
 * New/Modified Capabilities 양쪽을 모두 본다.
 */
export function extractProposalCapabilityNames(content: string): string[] {
  const names: string[] = [];
  const lines = content.split('\n');
  let inCapabilities = false;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      // `## Capabilities` 구간에 들어오고, 다른 최상위 section을 만나면 종료한다.
      inCapabilities = /^capabilities\b/i.test(heading[1].trim());
      continue;
    }
    if (!inCapabilities) {
      continue;
    }
    // `- \`order-payment_refund-api_timeout-fix\`: 설명` 패턴에서 이름만 뽑는다.
    const item = line.match(/^\s*-\s*`([^`]+)`/);
    if (item) {
      const name = item[1].trim();
      // 템플릿의 `<name>`, `<existing-name>` placeholder는 건너뛴다.
      if (!name.startsWith('<')) {
        names.push(name);
      }
    }
  }
  return names;
}

/** 템플릿에서 남기 쉬운 명백한 영문 scaffold placeholder 패턴. */
const SCAFFOLD_PLACEHOLDER_PATTERNS: RegExp[] = [
  // 남아 있는 템플릿 HTML 주석 placeholder: `<!-- requirement text -->`
  /<!--[^>]*-->/,
  // angle-bracket placeholder: `<name>`, `<existing-name>`, `<brief description ...>`
  /<(?:name|existing-name|brief[^>]*)>/i,
];

/**
 * 문서에 명백한 영문 scaffold placeholder가 남아 있으면 한글 작성 요구 warning을 반환한다.
 * 채워지지 않은 템플릿 잔여 문구만 대상으로 하며, 파일당 하나의 warning으로 제한한다.
 */
export function findScaffoldPlaceholderIssues(
  content: string,
  where: string
): ValidationIssue[] {
  const hasPlaceholder = SCAFFOLD_PLACEHOLDER_PATTERNS.some((pattern) =>
    pattern.test(content)
  );
  if (!hasPlaceholder) {
    return [];
  }
  return [
    {
      level: 'WARNING',
      path: where,
      message:
        'Document still contains English scaffold placeholders. ' +
        'Replace template placeholders and write reviewer-facing prose in Korean ' +
        '(command, path, config key, code identifier, and parser keywords may stay in English).',
    },
  ];
}
