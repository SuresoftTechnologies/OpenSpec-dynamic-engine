import { describe, it, expect } from 'vitest';
import {
  getApplyChangeSkillTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxProposeCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

// repository별 팀 정책이 generated template 본문에 hardcode되면 안 된다.
const HARDCODED_TEAM_POLICY_MARKERS = [
  '한글',
  '대기능_중기능_소기능',
  'engine-spec-driven',
];

describe('generated apply/propose template minimalism', () => {
  // 5.1 generated skill 본문에 repository별 팀 정책 문구가 hardcode되지 않아야 한다.
  it('does not hardcode team policy strings in apply/propose skill content', () => {
    const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
    const proposeContent = generateSkillContent(getOpsxProposeSkillTemplate(), 'TEST');

    for (const marker of HARDCODED_TEAM_POLICY_MARKERS) {
      expect(applyContent, `apply:${marker}`).not.toContain(marker);
      expect(proposeContent, `propose:${marker}`).not.toContain(marker);
    }
  });

  // 5.1 command template payload에도 팀 정책 문구가 hardcode되지 않아야 한다.
  it('does not hardcode team policy strings in apply/propose command content', () => {
    const applyCmd = getOpsxApplyCommandTemplate().content;
    const proposeCmd = getOpsxProposeCommandTemplate().content;

    for (const marker of HARDCODED_TEAM_POLICY_MARKERS) {
      expect(applyCmd, `apply-cmd:${marker}`).not.toContain(marker);
      expect(proposeCmd, `propose-cmd:${marker}`).not.toContain(marker);
    }
  });

  // 5.2 generated template은 CLI dynamic instruction과 artifact instructions를 따르도록 안내한다.
  it('directs agents to the CLI dynamic instructions and rules/context', () => {
    const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
    expect(applyContent).toContain('openspec instructions apply');
    expect(applyContent).toContain('contextFiles');

    const proposeContent = generateSkillContent(getOpsxProposeSkillTemplate(), 'TEST');
    expect(proposeContent).toContain('openspec instructions');
    expect(proposeContent).toContain('rules');
    expect(proposeContent).toContain('context');
  });
});
