## MODIFIED Requirements

### Requirement: Config Based Team Artifact Guidance
Artifact workflow SHALL 기존 `openspec/config.yaml`의 `context`와 `rules`를 통해 dynamic-engine 팀 artifact 작성 정책을 전달한다.

#### Scenario: Korean document guidance
- **WHEN** 사용자가 dynamic-engine config preset이 적용된 repository에서 `openspec instructions proposal`, `design`, `tasks`, 또는 `specs`를 요청한다
- **THEN** 응답은 문서 본문을 한글로 작성하라는 팀 정책을 포함한다
- **AND** command, code, config key, path, OpenSpec parser keyword는 원문을 유지할 수 있음을 안내한다

#### Scenario: Korean writing quality guidance
- **WHEN** 사용자가 dynamic-engine config preset이 적용된 repository에서 `openspec instructions proposal`, `design`, `tasks`, 또는 `specs`를 요청한다
- **THEN** 응답은 번역투를 피하고 자연스러운 한국어로 작성하라는 팀 정책을 포함한다
- **AND** 응답은 첫 문단에 결론과 이유를 먼저 두라는 팀 정책을 포함한다

#### Scenario: Proposal section boundary guidance
- **WHEN** 사용자가 dynamic-engine config preset이 적용된 repository에서 `openspec instructions proposal`을 요청한다
- **THEN** 응답은 `Why`를 두괄식으로 쓰고 짧은 문장과 문단을 유지하라는 팀 정책을 포함한다
- **AND** 응답은 `What Changes`에는 변경 내용을 쓰고 `Impact`에는 영향 범위와 바뀌지 않는 것을 쓰라는 팀 정책을 포함한다
- **AND** 응답은 `What Changes`와 `Impact`에 같은 내용을 반복하지 말라는 팀 정책을 포함한다

#### Scenario: Cross artifact feedback propagation guidance
- **WHEN** 사용자가 dynamic-engine config preset이 적용된 repository에서 `openspec instructions design`, `specs`, 또는 `tasks`를 요청한다
- **THEN** 응답은 proposal에서 정한 용어와 문체를 이어받으라는 팀 정책을 포함한다
- **AND** 응답은 proposal에 대한 문체/구조 피드백을 같은 change의 다른 문서에도 적용하라는 팀 정책을 포함한다

#### Scenario: Capability naming guidance
- **WHEN** 사용자가 dynamic-engine config preset이 적용된 repository에서 `openspec instructions proposal` 또는 `specs`를 요청한다
- **THEN** 응답은 `대기능_중기능_소기능` 형식과 kebab-case segment 정책을 포함한다
- **AND** proposal `Capabilities` section과 `specs/<capability>/spec.md` directory name에 적용됨을 안내한다

#### Scenario: Generated skill template minimalism
- **WHEN** OpenSpec이 workflow skill 또는 command template을 생성한다
- **THEN** generated template은 repository별 팀 정책을 hardcode하지 않는다
- **AND** agent에게 `openspec instructions ... --json`의 dynamic instruction, context, rules를 따르도록 안내한다

#### Scenario: Team artifact instructions extend built-in guidance
- **WHEN** 사용자가 dynamic-engine schema preset의 proposal, specs, design, tasks instruction을 요청한다
- **THEN** 응답은 built-in `spec-driven` artifact instruction의 기본 작성 지침을 유지한다
- **AND** 한글 문서 작성, 팀 capability naming, 테스트 우선 task 작성 같은 팀 지시를 추가로 포함한다

#### Scenario: Team artifact instructions include document quality guidance
- **WHEN** 사용자가 dynamic-engine schema preset의 proposal, specs, design, tasks instruction을 요청한다
- **THEN** 응답은 자연스러운 한국어 문체와 두괄식 서술 원칙을 추가 지침으로 포함한다
- **AND** proposal instruction은 `Why`, `What Changes`, `Impact` section의 역할 구분을 안내한다
- **AND** design, specs, tasks instruction은 proposal의 문체와 용어를 이어받도록 안내한다
