import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  loadChangeContext,
  generateInstructions,
} from '../../src/core/artifact-graph/index.js';
import { generateApplyInstructions } from '../../src/commands/workflow/instructions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * 임시 project에 dynamic-engine 팀 preset(config + schema)을 복사하고,
 * 지정한 schema를 가리키는 change를 생성한다.
 */
function setupTeamProject(schema: 'engine-spec-driven' | 'spec-driven'): {
  projectRoot: string;
  changeName: string;
} {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-team-preset-'));
  const openspecDir = path.join(projectRoot, 'openspec');
  fs.mkdirSync(openspecDir, { recursive: true });

  // config preset 복사 (schema: engine-spec-driven + context/rules).
  const configPreset = fs.readFileSync(
    path.join(REPO_ROOT, 'docs', 'team-config', 'engine.config.yaml'),
    'utf-8'
  );
  fs.writeFileSync(path.join(openspecDir, 'config.yaml'), configPreset);

  // engine-spec-driven schema preset 복사.
  fs.cpSync(
    path.join(REPO_ROOT, 'docs', 'team-config', 'engine-spec-driven'),
    path.join(openspecDir, 'schemas', 'engine-spec-driven'),
    { recursive: true }
  );

  // change name은 hyphenated(기존 규칙)이고, capability/spec directory만 팀 세 segment 형식을 쓴다.
  const changeName = 'refund-api-timeout-fix';
  const capabilityName = 'order-payment_refund-api_timeout-fix';
  const changeDir = path.join(openspecDir, 'changes', changeName);
  fs.mkdirSync(path.join(changeDir, 'specs', capabilityName), { recursive: true });
  fs.writeFileSync(path.join(changeDir, '.openspec.yaml'), `schema: ${schema}\n`);
  fs.writeFileSync(path.join(changeDir, 'proposal.md'), '## Why\n이유\n\n## What Changes\n변경\n');
  fs.writeFileSync(path.join(changeDir, 'design.md'), '## Context\n배경\n');
  fs.writeFileSync(
    path.join(changeDir, 'specs', capabilityName, 'spec.md'),
    '## ADDED Requirements\n\n### Requirement: 예시\n시스템은 무언가를 한다.\n\n#### Scenario: 기본\n- **WHEN** 조건\n- **THEN** 결과\n'
  );
  fs.writeFileSync(path.join(changeDir, 'tasks.md'), '## 1. 작업\n\n- [ ] 1.1 미완료 작업\n');

  return { projectRoot, changeName };
}

describe('dynamic-engine preset artifact instructions', () => {
  let projectRoot: string;
  let changeName: string;

  beforeEach(() => {
    ({ projectRoot, changeName } = setupTeamProject('engine-spec-driven'));
  });

  afterEach(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  // 2.1 config의 context/rules가 proposal/design/tasks/specs instructions에 노출된다.
  it('exposes config context and rules across artifact instructions', () => {
    const context = loadChangeContext(projectRoot, changeName);
    for (const artifactId of ['proposal', 'design', 'tasks', 'specs']) {
      const instructions = generateInstructions(context, artifactId, projectRoot);
      expect(instructions.context, artifactId).toContain('한글');
      expect(instructions.rules, artifactId).toBeDefined();
      expect((instructions.rules ?? []).join('\n'), artifactId).toContain('한글');
    }
  });

  // 2.1 proposal/specs rules는 팀 capability naming 정책을 포함한다.
  it('includes team capability naming guidance in proposal and specs rules', () => {
    const context = loadChangeContext(projectRoot, changeName);
    const proposal = generateInstructions(context, 'proposal', projectRoot);
    const specs = generateInstructions(context, 'specs', projectRoot);
    expect((proposal.rules ?? []).join('\n')).toContain('대기능_중기능_소기능');
    expect((specs.rules ?? []).join('\n')).toContain('대기능_중기능_소기능');
  });

  // 2.1 새 문서 품질 marker가 config context/rules와 schema instruction에 노출된다.
  it('includes Korean writing quality and section boundary guidance', () => {
    const context = loadChangeContext(projectRoot, changeName);
    const proposal = generateInstructions(context, 'proposal', projectRoot);
    const design = generateInstructions(context, 'design', projectRoot);
    const specs = generateInstructions(context, 'specs', projectRoot);
    const tasks = generateInstructions(context, 'tasks', projectRoot);

    expect(proposal.context).toContain('자연스러운 한국어');
    expect(proposal.context).toContain('첫 문단에는 결론과 필요한 이유를 먼저');

    expect((proposal.rules ?? []).join('\n')).toContain('What Changes와 Impact에 같은 내용을 반복하지 않는다');
    expect(proposal.instruction).toContain('avoid literal translation-like phrasing');
    expect(proposal.instruction).toContain('Do not repeat the same content in `What Changes` and `Impact`');

    for (const [artifactId, instructions] of [
      ['design', design],
      ['specs', specs],
      ['tasks', tasks],
    ] as const) {
      expect((instructions.rules ?? []).join('\n'), artifactId).toContain(
        'proposal에서 정한 핵심 용어와 문제 정의, 문체를 이어받는다'
      );
      expect(instructions.instruction, artifactId).toContain(
        'Use the core terms, problem framing, and writing tone established in the proposal'
      );
      expect(instructions.instruction, artifactId).toContain('Apply proposal style/structure feedback');
    }
  });

  // 8.3 팀 schema preset은 built-in proposal/specs instruction의 핵심 골자를 유지한다.
  it('preserves built-in proposal and specs guidance while adding team guidance', () => {
    const context = loadChangeContext(projectRoot, changeName);
    const proposal = generateInstructions(context, 'proposal', projectRoot);
    const specs = generateInstructions(context, 'specs', projectRoot);

    expect(proposal.instruction).toContain('Sections:');
    expect(proposal.instruction).toContain('The Capabilities section is critical');
    expect(proposal.instruction).toContain('Dynamic-engine team additional guidance');
    expect(proposal.instruction).toContain('대기능_중기능_소기능');

    expect(specs.instruction).toContain('Scenarios MUST use exactly 4 hashtags (`####`)');
    expect(specs.instruction).toContain('MODIFIED requirements workflow');
    expect(specs.instruction).toContain('Copy the ENTIRE requirement block');
    expect(specs.instruction).toContain('Specs should be testable');
    expect(specs.instruction).toContain('Dynamic-engine team additional guidance');
  });

  // 8.3 팀 schema preset은 built-in tasks/design instruction의 핵심 골자를 유지한다.
  it('preserves built-in design and tasks guidance while adding team guidance', () => {
    const context = loadChangeContext(projectRoot, changeName);
    const design = generateInstructions(context, 'design', projectRoot);
    const tasks = generateInstructions(context, 'tasks', projectRoot);

    expect(design.instruction).toContain('When to include design.md');
    expect(design.instruction).toContain('Open Questions');
    expect(design.instruction).toContain('Dynamic-engine team additional guidance');

    expect(tasks.instruction).toContain('Follow the template below exactly');
    expect(tasks.instruction).toContain('Each task MUST be a checkbox: `- [ ] X.Y Task description`');
    expect(tasks.instruction).toContain('Each task should be verifiable');
    expect(tasks.instruction).toContain('Dynamic-engine team additional guidance');
    expect(tasks.instruction).toContain('테스트 우선');
  });
});

describe('dynamic-engine preset apply instructions', () => {
  let projectRoot: string;
  let changeName: string;

  afterEach(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  // 1.4 / 3.1 / 3.2 / 3.3 팀 schema apply instruction이 팀 구현 원칙을 포함한다.
  it('returns team TDD, Korean comment, and task completion guidance', async () => {
    ({ projectRoot, changeName } = setupTeamProject('engine-spec-driven'));
    const apply = await generateApplyInstructions(projectRoot, changeName);

    expect(apply.schemaName).toBe('engine-spec-driven');
    // 3.1 테스트 우선 / 구현 시작 순서 / 의도 정리
    expect(apply.instruction).toContain('실패하는 테스트를 먼저 작성');
    expect(apply.instruction).toContain('테스트가 존재한 뒤 구현을 시작');
    expect(apply.instruction).toContain('테스트 의도와 기대 동작을 정리');
    // 3.2 한글 주석
    expect(apply.instruction).toContain('한글 주석');
    // 3.3 테스트 통과 후 task 완료
    expect(apply.instruction).toContain('테스트 통과가 끝난 뒤에만 task를 완료');
  });

  // 7.3 생성되는 테스트의 spec 출처 추적 주석 형식을 apply instruction에 노출한다.
  it('returns test traceability comment format guidance', async () => {
    ({ projectRoot, changeName } = setupTeamProject('engine-spec-driven'));
    const apply = await generateApplyInstructions(projectRoot, changeName);

    expect(apply.schemaName).toBe('engine-spec-driven');
    expect(apply.instruction).toContain('생성되는 테스트 바로 앞');
    expect(apply.instruction).toContain('테스트 의도');
    expect(apply.instruction).toContain('목적');
    expect(apply.instruction).toContain('출처');
    expect(apply.instruction).toContain('기대 동작');
    expect(apply.instruction).toContain('<spec path> > Requirement: <이름> > Scenario: <이름>');
  });

  // 8.3 팀 schema apply instruction은 built-in apply flow를 유지한 뒤 팀 지침을 추가한다.
  it('preserves built-in apply flow before adding team guidance', async () => {
    ({ projectRoot, changeName } = setupTeamProject('engine-spec-driven'));
    const apply = await generateApplyInstructions(projectRoot, changeName);

    expect(apply.instruction).toContain('Read context files, work through pending tasks');
    expect(apply.instruction).toContain('Pause if you hit blockers or need clarification');
    expect(apply.instruction).toContain('Dynamic-engine team implementation guidance');
    expect(apply.instruction.indexOf('Read context files')).toBeLessThan(
      apply.instruction.indexOf('Dynamic-engine team implementation guidance')
    );
  });

  // 3.4 built-in spec-driven schema는 기존 apply instruction을 유지한다.
  it('keeps built-in spec-driven apply instruction unchanged', async () => {
    ({ projectRoot, changeName } = setupTeamProject('spec-driven'));
    const apply = await generateApplyInstructions(projectRoot, changeName);

    expect(apply.schemaName).toBe('spec-driven');
    expect(apply.instruction).toContain('Read context files, work through pending tasks');
    expect(apply.instruction).not.toContain('실패하는 테스트를 먼저 작성');
  });
});
