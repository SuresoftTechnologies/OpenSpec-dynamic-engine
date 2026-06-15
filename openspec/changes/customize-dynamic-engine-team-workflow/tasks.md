## 1. dynamic-engine preset

- [x] 1.1 `docs/team-config/engine.config.yaml`이 현재 구현된 `schema`, `context`, `rules` 옵션만 사용하도록 정리한다.
- [x] 1.2 `docs/team-config/engine-spec-driven/` schema preset을 추가하고 built-in `spec-driven` workflow 구조와 templates를 유지한다.
- [x] 1.3 `engine-spec-driven` schema의 `apply.instruction`에 TDD, 한글 주석, task 완료 timing 정책을 직접 작성한다.
- [x] 1.4 preset을 대상 repository의 `openspec/config.yaml` 및 `openspec/schemas/engine-spec-driven/`로 복사했을 때 `openspec instructions apply --json`에 팀 구현 원칙이 포함되는 regression 테스트를 추가한다.

## 2. Artifact Instruction 및 Validation

- [x] 2.1 `engine.config.yaml`의 `context`/`rules`가 proposal, design, tasks, specs instructions에 노출되는 regression 테스트를 추가한다.
- [x] 2.2 proposal `Capabilities` section과 change spec directory name의 three-part capability validator 테스트를 추가한다.
- [x] 2.3 명백한 영문 scaffold placeholder를 한글 문서 warning으로 보고하는 테스트를 추가한다.
- [x] 2.4 artifact validator에 팀 capability naming 및 한글 문서 warning을 최소 범위로 구현한다.

## 3. Dynamic Apply Instruction

- [x] 3.1 `engine-spec-driven` schema를 사용하는 change에서 `openspec instructions apply --json`이 실패 테스트 선작성, 테스트 존재 후 구현, 구현 전 테스트 의도/기대 동작 정리 guidance를 포함하는 테스트를 추가한다.
- [x] 3.2 같은 apply instruction이 테스트 목적/동작 한글 주석 및 주요 로직/함수 한글 주석 guidance를 포함하는 테스트를 추가한다.
- [x] 3.3 같은 apply instruction이 테스트 통과 후 task 완료 guidance를 포함하는 테스트를 추가한다.
- [x] 3.4 built-in `spec-driven` schema를 사용하는 repository에서는 기존 apply instruction 출력이 유지되는 regression 테스트를 추가한다.

## 4. Jira Archive Tracking

- [x] 4.1 Jira key와 source를 보조 metadata로 검증/read/write하는 metadata 테스트를 추가한다.
- [x] 4.2 archive command가 branch에서 Jira key를 추론해 `YYYY-MM-DD_<JIRA-KEY>_<change-name>` path를 생성하는 실패 테스트를 추가한다.
- [x] 4.3 Jira key 필수 prompt와 optional fallback 동작에 대한 archive 테스트를 추가한다.
- [x] 4.4 archive command에 Jira key resolution, archive path naming, metadata 기록을 구현한다.
- [x] 4.5 `/opsx:archive` generated guidance가 CLI archive 동작을 따르도록 최소 문구를 정리한다.

## 5. Generated Skill/Command Template 최소화

- [x] 5.1 apply/propose generated template이 repository별 팀 정책 문구를 hardcode하지 않는지 확인하는 테스트를 추가한다.
- [x] 5.2 generated template이 CLI dynamic instruction과 artifact instructions를 따르도록 기존 orchestration 문구를 유지한다.
- [x] 5.3 skill/template parity hash를 필요한 범위에서만 갱신한다.

## 6. 검증

- [x] 6.1 Artifact workflow, archive, metadata, template generation focused tests를 실행한다.
- [x] 6.2 `npm run lint`, `npm run build`, 가능한 전체 test command를 실행한다.
- [x] 6.3 `docs/team-config/engine.config.yaml`과 `docs/team-config/engine-spec-driven/` preset이 대상 repository로 복사 가능한 실제 config/schema인지 확인한다.
- [x] 6.4 `customize-dynamic-engine-team-workflow` OpenSpec validation을 통과시킨다.

## 7. 테스트 추적성 주석 정책

- [x] 7.1 `engine-spec-driven` schema의 `apply.instruction`에 테스트 의도/출처/기대 동작 주석 형식을 추가한다.
- [x] 7.2 `docs/team-config/engine.config.yaml`의 context 또는 rules가 테스트 추적성 주석 정책과 충돌하지 않는지 확인한다.
- [x] 7.3 `openspec instructions apply --json`이 `테스트 의도`, `목적`, `출처`, `기대 동작` 및 `<spec path> > Requirement: <이름> > Scenario: <이름>` 형식을 포함하는 regression 테스트를 추가한다.
- [x] 7.4 관련 focused tests와 `customize-dynamic-engine-team-workflow` OpenSpec validation을 실행한다.

## 8. 기본 schema instruction 보존

- [x] 8.1 `docs/team-config/engine-spec-driven/schema.yaml`의 proposal/specs/design/tasks instruction을 built-in `spec-driven` instruction 골자와 맞추고 팀 지시는 additive section으로 분리한다.
- [x] 8.2 `engine-spec-driven` apply instruction이 built-in apply flow를 유지한 뒤 TDD, 한글 주석, 테스트 추적성 주석, task 완료 timing 정책을 추가하도록 정리한다.
- [x] 8.3 schema preset이 specs parser 주의사항, `MODIFIED` requirement workflow, task checkbox tracking, task verifiability guidance를 유지하는 regression 테스트를 추가한다.
- [x] 8.4 관련 focused tests와 `customize-dynamic-engine-team-workflow` OpenSpec validation을 실행한다.
