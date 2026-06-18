import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  isValidTeamCapabilityName,
  teamCapabilityNameIssue,
  extractProposalCapabilityNames,
  findScaffoldPlaceholderIssues,
  TEAM_CAPABILITY_EXAMPLE,
} from '../../src/core/validation/team-policy.js';
import { Validator } from '../../src/core/validation/validator.js';

describe('team capability naming validator', () => {
  // 2.2 세 개의 kebab-case segment로 구성된 팀 capability 이름은 유효해야 한다.
  it('accepts three-part kebab-case capability names', () => {
    expect(isValidTeamCapabilityName('order-payment_refund-api_timeout-fix')).toBe(true);
    expect(isValidTeamCapabilityName('a_b_c')).toBe(true);
    expect(isValidTeamCapabilityName('major-feature_middle-feature_minor-feature')).toBe(true);
  });

  // 2.2 segment 수가 틀리거나 kebab-case가 아니면 거부해야 한다.
  it('rejects names that are not three kebab-case segments', () => {
    expect(isValidTeamCapabilityName('order-payment')).toBe(false); // segment 부족
    expect(isValidTeamCapabilityName('a_b_c_d')).toBe(false); // segment 초과
    expect(isValidTeamCapabilityName('Order_b_c')).toBe(false); // 대문자
    expect(isValidTeamCapabilityName('a_b c_d')).toBe(false); // 공백
    expect(isValidTeamCapabilityName('a__c')).toBe(false); // 빈 segment
    expect(isValidTeamCapabilityName('a_-b_c')).toBe(false); // 잘못된 kebab segment
    expect(isValidTeamCapabilityName('')).toBe(false);
  });

  // 2.2 위반 시 예시를 포함한 guidance ERROR issue를 반환해야 한다.
  it('returns a guidance issue with the example for invalid names', () => {
    const ok = teamCapabilityNameIssue('order-payment_refund-api_timeout-fix', 'specs/x');
    expect(ok).toBeNull();

    const issue = teamCapabilityNameIssue('badname', 'specs/badname/spec.md');
    expect(issue).not.toBeNull();
    expect(issue?.level).toBe('ERROR');
    expect(issue?.path).toBe('specs/badname/spec.md');
    expect(issue?.message).toContain(TEAM_CAPABILITY_EXAMPLE);
    expect(issue?.message).toContain('대기능_중기능_소기능');
  });

  // 2.2 proposal Capabilities section에서 capability 이름을 추출한다.
  it('extracts capability names from the proposal Capabilities section', () => {
    const proposal = `## Why\n어떤 이유\n\n## Capabilities\n\n### New Capabilities\n- \`order-payment_refund-api_timeout-fix\`: 결제 환불\n- \`<name>\`: placeholder는 무시\n\n### Modified Capabilities\n- \`config-loading_team-preset_apply\`: 설정 로딩\n\n## Impact\n- \`not-a-capability\`: 다른 section은 무시\n`;
    const names = extractProposalCapabilityNames(proposal);
    expect(names).toEqual([
      'order-payment_refund-api_timeout-fix',
      'config-loading_team-preset_apply',
    ]);
  });
});

describe('Korean document scaffold placeholder warning', () => {
  // 2.3 영문 scaffold placeholder가 남아 있으면 한글 작성 요구 warning을 보고한다.
  it('warns when English template placeholders remain', () => {
    const content = `## Why\n\n<!-- Explain the motivation for this change. -->\n`;
    const issues = findScaffoldPlaceholderIssues(content, 'proposal.md');
    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('WARNING');
    expect(issues[0].path).toBe('proposal.md');
  });

  // 2.3 angle-bracket placeholder도 검출한다.
  it('warns on angle-bracket scaffold placeholders', () => {
    const content = `### New Capabilities\n- \`<name>\`: <brief description of capability>\n`;
    const issues = findScaffoldPlaceholderIssues(content, 'proposal.md');
    expect(issues).toHaveLength(1);
  });

  // 2.3 한글로 채워진 문서에는 warning이 없어야 한다.
  it('does not warn when the document is fully written in Korean', () => {
    const content = `## Why\n\n이 변경은 팀 정책을 일관되게 적용하기 위한 것이다.\n\n## Capabilities\n\n### New Capabilities\n- \`order-payment_refund-api_timeout-fix\`: 결제 환불 타임아웃 수정\n`;
    const issues = findScaffoldPlaceholderIssues(content, 'proposal.md');
    expect(issues).toHaveLength(0);
  });
});

describe('Validator team policy integration', () => {
  let tempDir: string;
  let changeDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-team-validate-'));
    changeDir = path.join(tempDir, 'change');
    fs.mkdirSync(path.join(changeDir, 'specs', 'bad-name'), { recursive: true });
    // capability 이름이 팀 형식이 아니고, 영문 scaffold placeholder가 남은 delta spec.
    fs.writeFileSync(
      path.join(changeDir, 'specs', 'bad-name', 'spec.md'),
      `## ADDED Requirements\n\n### Requirement: <!-- requirement name -->\nThe system SHALL do something.\n\n#### Scenario: 기본 동작\n- **WHEN** 조건\n- **THEN** 결과\n`
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // 2.4 팀 정책을 켜면 잘못된 capability 이름을 ERROR로 보고한다.
  it('reports invalid team capability directory names when team policy is on', async () => {
    const validator = new Validator(false, { teamPolicy: true });
    const report = await validator.validateChangeDeltaSpecs(changeDir);
    const namingError = report.issues.find(
      (i) => i.level === 'ERROR' && i.message.includes('대기능_중기능_소기능')
    );
    expect(namingError).toBeDefined();
    expect(namingError?.path).toBe('bad-name/spec.md');
  });

  // 2.4 팀 정책을 끄면 (built-in 동작) capability 이름 ERROR를 보고하지 않는다.
  it('does not report team naming issues when team policy is off (built-in behavior)', async () => {
    const validator = new Validator(false);
    const report = await validator.validateChangeDeltaSpecs(changeDir);
    const namingError = report.issues.find((i) =>
      i.message.includes('대기능_중기능_소기능')
    );
    expect(namingError).toBeUndefined();
  });
});
