# 팀 OpenSpec 커스텀 기능 레지스트리

이 문서는 공식 OpenSpec의 새 릴리스를 Suresoft Dynamic Engine 배포판에 통합할 때 반드시 먼저 확인하는 레지스트리다. 각 팀 커스텀 기능과 동작 계약, 설정, 구현, 회귀 테스트, 예상 업스트림 충돌 지점을 연결한다.

상세 동작은 연결된 OpenSpec main spec에 기록한다. 이 문서는 요구사항을 복제하지 않고 AI와 유지보수자가 팀 커스텀 범위를 발견하는 영구 인덱스와 업그레이드 체크리스트 역할만 한다.

## 배포판 기준선

- 공식 업스트림 원격: `https://github.com/Fission-AI/OpenSpec.git` (`upstream`)
- 마지막으로 통합한 공식 ref: `v1.11.0`
- 통합 전략: 정확한 공식 tag를 팀 전용 브랜치에 merge한다. 기본적으로 팀 이력을 다시 쓰지 않는다.
- 팀 배포판 식별과 버전: [`package.json`](../package.json)
- 현재 통합 기록: [`upgrade-openspec-v1-11`](../openspec/changes/upgrade-openspec-v1-11/)
- 유지보수자용 흐름: [`openspec-upstream-upgrader`](../.codex/skills/openspec-upstream-upgrader/SKILL.md)
- 사용자 설치 갱신 흐름: [`openspec-local-updater`](../.codex/skills/openspec-local-updater/SKILL.md)

공식 ref 기준선은 merge, 팀 기능 재적응, 전체 회귀 테스트, build, lint와 strict validation이 성공한 뒤에만 갱신한다. 팀 package version만으로 업스트림 기준선을 판단하지 않는다.

## Source of Truth 우선순위

기록 사이에 차이가 있으면 다음 우선순위를 적용하고 같은 change에서 하위 기록을 수정한다.

1. OpenSpec main spec이 사용자에게 보이는 동작을 정의한다.
2. `docs/team-config`가 배포되는 팀 정책과 schema 내용을 정의한다.
3. 이 레지스트리가 커스텀 범위와 업그레이드 검증 근거를 연결한다.
4. 구현과 테스트가 현재 계약의 구현 상태를 증명한다.
5. archived change는 과거 결정을 설명하지만 main spec을 덮어쓰지 않는다.

active change에만 있는 요구사항은 main spec 승격 대기 상태로 표시한다. 관련 PR이 병합되면 change를 정상적으로 archive하고 레지스트리 링크를 승격된 main spec으로 갱신한다.

## 커스텀 기능 요약

| ID                            | 기능                                | 보존 규칙                                                                                        |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `TEAM-DISTRIBUTION-001`       | 팀 배포판 식별과 자체 업데이트 경계 | 공식 package 업데이트 로직이 팀 CLI를 자동 교체하면 안 된다.                                     |
| `TEAM-POLICY-001`             | 한글 문서, TDD, 주석과 완료 정책    | 작성 지침은 프로젝트 config/schema extension point에 유지한다.                                   |
| `TEAM-CAPABILITY-001`         | 3-depth nested capability ID        | 팀 schema에서는 `/`로 구분한 정확히 세 개의 kebab-case segment를 강제한다.                       |
| `TEAM-JIRA-ARCHIVE-001`       | Jira-aware transactional archive    | Jira 이름과 metadata를 업스트림 archive transaction, Store, rollback, JSON 계약 안에서 보존한다. |
| `TEAM-SPEC-MIGRATION-001`     | legacy underscore 경로 마이그레이션 | 모든 이동을 먼저 검증하고 active 데이터만 원자적으로 이동하며 archive 이력은 유지한다.           |
| `TEAM-LOCAL-DISTRIBUTION-001` | 최초 설치와 기존 설치 갱신          | 최초 설치와 사용자 업데이트를 분리하되 하나의 build/install 경로를 공유한다.                     |
| `TEAM-UPSTREAM-UPGRADE-001`   | 레지스트리 기반 공식 source 통합    | 업그레이드 완료 전에 정확한 upstream ref를 기준으로 모든 커스텀 ID를 감사한다.                   |

## 커스텀 기능 상세

### TEAM-DISTRIBUTION-001 — 팀 배포판 식별과 자체 업데이트 경계

- 계약: package는 `suresoft-dynamic-engine`으로 식별된다. 공식 npm 업데이트 탐색은 공식 build에 정보를 제공할 수 있지만 팀 build를 교체할 수 없다.
- Spec: [`cli-update`](../openspec/specs/cli-update/spec.md), 승격 대기 중인 [`upgrade cli-update delta`](../openspec/changes/upgrade-openspec-v1-11/specs/cli-update/spec.md).
- 구현: [`package.json`](../package.json), [`src/core/version-check.ts`](../src/core/version-check.ts).
- 회귀 테스트: [`test/core/version-check.test.ts`](../test/core/version-check.test.ts), [`test/package-install-scripts.test.ts`](../test/package-install-scripts.test.ts).
- 업스트림 충돌 지점: package version/update metadata, registry 조회, upgrade prompt, global install 판별, CLI 재실행 동작.

### TEAM-POLICY-001 — 한글 문서와 엔지니어링 흐름 지침

- 계약: 팀 OpenSpec 산출물은 한글로 작성한다. 구현은 test-first 지침을 따르고 생성 테스트와 중요한 로직에는 한글 설명 주석을 둔다. task 완료에는 구현과 관련 테스트 통과가 포함되며 archive 지침은 Jira 추적성을 보존한다.
- Spec: [`openspec-conventions`](../openspec/specs/openspec-conventions/spec.md), [`config-loading`](../openspec/specs/config-loading/spec.md), [`cli-artifact-workflow`](../openspec/specs/cli-artifact-workflow/spec.md), [`opsx-archive-skill`](../openspec/specs/opsx-archive-skill/spec.md).
- 배포 정책: [`docs/team-config/engine.config.yaml`](team-config/engine.config.yaml), [`engine-spec-driven schema`](team-config/engine-spec-driven/schema.yaml).
- 생성 template: [`proposal`](team-config/engine-spec-driven/templates/proposal.md), [`design`](team-config/engine-spec-driven/templates/design.md), [`spec`](team-config/engine-spec-driven/templates/spec.md), [`tasks`](team-config/engine-spec-driven/templates/tasks.md).
- 회귀 테스트: [`test/core/team-preset.instructions.test.ts`](../test/core/team-preset.instructions.test.ts), [`test/core/templates/team-policy-template-minimalism.test.ts`](../test/core/templates/team-policy-template-minimalism.test.ts).
- 업스트림 충돌 지점: config context/rules 주입, operation guidance, schema loading, 생성 Skill/command template. 업스트림 template에 팀 문구를 직접 넣기보다 공개 extension point를 우선한다.

### TEAM-CAPABILITY-001 — 3-depth nested capability ID

- 계약: `engine-spec-driven`에서 capability ID와 경로는 정확히 `대분류/소분류/주제` 형식이다. 세 segment 모두 lowercase kebab-case이고 논리 구분자는 모든 OS에서 `/`다.
- Spec: [`openspec-conventions`](../openspec/specs/openspec-conventions/spec.md), 승격 대기 중인 [`cli-validate delta`](../openspec/changes/upgrade-openspec-v1-11/specs/cli-validate/spec.md), [`conventions delta`](../openspec/changes/upgrade-openspec-v1-11/specs/openspec-conventions/spec.md).
- 정책: [`docs/team-config/engine.config.yaml`](team-config/engine.config.yaml), [`engine-spec-driven schema`](team-config/engine-spec-driven/schema.yaml).
- 구현: [`src/core/validation/team-policy.ts`](../src/core/validation/team-policy.ts), [`src/core/validation/validator.ts`](../src/core/validation/validator.ts), [`src/commands/validate.ts`](../src/commands/validate.ts).
- 회귀 테스트: [`test/core/validation.team-policy.test.ts`](../test/core/validation.team-policy.test.ts), [`test/core/validation.test.ts`](../test/core/validation.test.ts), [`test/core/templates/skill-templates-parity.test.ts`](../test/core/templates/skill-templates-parity.test.ts).
- 업스트림 충돌 지점: 재귀 spec 탐색, capability identity 정규화, proposal parsing, validator 진입점, archive spec 적용, Windows 경로 처리.

### TEAM-JIRA-ARCHIVE-001 — Jira-aware transactional archive

- 계약: `engine-spec-driven` change는 명시적 option이나 작업 branch에서 Jira key를 해석하고 `YYYY-MM-DD_<JIRA-KEY>_<change-name>`을 사용한다. 보조 metadata, transaction, Store root, 구조화된 JSON stdout을 보존한다.
- Spec: [`cli-archive`](../openspec/specs/cli-archive/spec.md), [`openspec-conventions`](../openspec/specs/openspec-conventions/spec.md), 승격 대기 중인 [`upgrade archive delta`](../openspec/changes/upgrade-openspec-v1-11/specs/cli-archive/spec.md).
- 정책: [`docs/team-config/engine.config.yaml`](team-config/engine.config.yaml), [`archive Skill`](../skills/openspec-archive-change/SKILL.md).
- 구현: [`src/core/archive-jira.ts`](../src/core/archive-jira.ts), [`src/core/archive.ts`](../src/core/archive.ts), [`src/core/change-metadata/schema.ts`](../src/core/change-metadata/schema.ts), [`src/cli/index.ts`](../src/cli/index.ts).
- 회귀 테스트: [`test/core/archive-jira.test.ts`](../test/core/archive-jira.test.ts), [`test/core/archive.jira-naming.test.ts`](../test/core/archive.jira-naming.test.ts), [`test/core/change-metadata.jira.test.ts`](../test/core/change-metadata.jira.test.ts).
- 업스트림 충돌 지점: archive destination 선택, validation/staging/rollback 경계, Store root 선택, JSON 결과 형태, metadata 이동, CLI flag.

### TEAM-SPEC-MIGRATION-001 — Legacy underscore 경로 마이그레이션

- 계약: 유효한 `a_b_c` main/active delta spec을 `a/b/c`로 매핑하고 명시적인 OpenSpec 참조를 갱신한다. 변경 전에 잘못되거나 충돌하는 매핑을 거부하고 부분 실패를 rollback하며 archived change는 수정하지 않는다.
- Main spec 승격 대기: [`team/spec/migration`](../openspec/changes/upgrade-openspec-v1-11/specs/team/spec/migration/spec.md).
- 구현: [`migrate-team-spec-paths.mjs`](../.codex/skills/openspec-local-installer/scripts/migrate-team-spec-paths.mjs).
- 회귀 테스트: [`test/scripts/migrate-team-spec-paths.test.ts`](../test/scripts/migrate-team-spec-paths.test.ts).
- 업스트림 충돌 지점: nested capability 탐색과 identity 규칙. 일반 업스트림 migration과 분리된 호환성 도구로 유지한다.

### TEAM-LOCAL-DISTRIBUTION-001 — 최초 설치와 기존 설치 갱신

- 계약: 팀 최초 설치와 기존 팀 설치 갱신은 서로 다른 AI 진입점이다. 두 흐름은 고정 package manager를 사용하는 동일한 build/install 구현을 공유하고 프로젝트 config 변경은 backup과 strict validation을 거친다.
- Main spec 승격 대기: [`team/distribution/installation`](../openspec/changes/upgrade-openspec-v1-11/specs/team/distribution/installation/spec.md).
- 최초 설치 흐름: [`openspec-local-installer`](../.codex/skills/openspec-local-installer/SKILL.md), [`install script`](../.codex/skills/openspec-local-installer/scripts/install-custom-openspec.mjs).
- 기존 설치 흐름: [`openspec-local-updater`](../.codex/skills/openspec-local-updater/SKILL.md), [`read-only inspector`](../.codex/skills/openspec-local-updater/scripts/inspect-installed-openspec.mjs).
- Config 적용: [`apply-team-config.mjs`](../.codex/skills/openspec-local-installer/scripts/apply-team-config.mjs).
- 회귀 테스트: [`test/scripts/inspect-installed-openspec.test.ts`](../test/scripts/inspect-installed-openspec.test.ts), [`test/scripts/local-openspec-skills-parity.test.ts`](../test/scripts/local-openspec-skills-parity.test.ts), [`test/package-install-scripts.test.ts`](../test/package-install-scripts.test.ts).
- 업스트림 충돌 지점: package-manager lifecycle, build output, global installation 판별, tool/Skill 생성, config backup, schema validation, 공식 self-upgrade 동작.

### TEAM-UPSTREAM-UPGRADE-001 — 레지스트리 기반 공식 source 통합

- 계약: source 유지보수는 사용자가 선택한 정확한 upstream tag/ref와 clean 전용 branch/worktree를 사용하고 모든 레지스트리 ID의 판정을 기록한다. 팀 기능을 묵시적으로 제거하지 않는다.
- Main spec 승격 대기: [`team/distribution/upstream-upgrade`](../openspec/changes/upgrade-openspec-v1-11/specs/team/distribution/upstream-upgrade/spec.md).
- Agent 진입점: [`AGENTS.md`](../AGENTS.md).
- 유지보수 흐름: [`openspec-upstream-upgrader`](../.codex/skills/openspec-upstream-upgrader/SKILL.md).
- 회귀 테스트: [`test/scripts/team-customizations-registry.test.ts`](../test/scripts/team-customizations-registry.test.ts), [`test/scripts/local-openspec-skills-parity.test.ts`](../test/scripts/local-openspec-skills-parity.test.ts).
- 업스트림 충돌 지점: Git ancestry와 release 선택, conflict resolution, 커스텀 기능 판정 추적, 전체 검증, 기준선 갱신, PR/archive 순서.

## 과거 변경 기록

- [`customize-dynamic-engine-team-workflow`](../openspec/changes/archive/2026-06-18-customize-dynamic-engine-team-workflow/)에서 팀 workflow, Jira archive, validation과 최초 설치 경로를 도입했다.
- [`improve-team-document-guidance`](../openspec/changes/archive/2026-06-30-improve-team-document-guidance/)에서 한글 문서, TDD, 주석과 완료 지침을 강화했다.
- [`upgrade-openspec-v1-11`](../openspec/changes/upgrade-openspec-v1-11/)은 v1.4.1에서 v1.11.0으로 통합한 과정과 최초의 전체 보존 감사를 기록한다.

## 업그레이드 필수 증거

향후 공식 OpenSpec을 통합하는 모든 change artifact에는 다음 내용을 기록한다.

1. 이전/대상 공식 ref와 resolve된 commit.
2. 이 레지스트리와 관련된 업스트림 release note와 변경 지점.
3. 모든 커스텀 ID의 `preserved`, `adapted`, `removed`, `not-applicable` 판정과 근거 파일·테스트.
4. 모든 merge conflict와 선택한 해결이 업스트림 동작과 팀 계약을 함께 보존하는 이유.
5. 영향받은 각 커스텀 기능의 집중 회귀 테스트 결과.
6. 전체 build, test, lint와 OpenSpec strict validation 결과.
7. 필요한 경우 제품 저장소 마이그레이션 범위와 결과.
8. 구현 PR URL과 merge 상태.

`removed`는 항상 명시적인 사용자 승인과 해당 OpenSpec 요구사항 변경이 필요하다. 1~7번이 성공하기 전에는 위 기준선을 갱신하지 않는다. 8번에서 PR merge가 확인될 때까지 upgrade change를 active 상태로 유지하고, 이후 archive하여 delta spec을 main spec으로 승격한다.
