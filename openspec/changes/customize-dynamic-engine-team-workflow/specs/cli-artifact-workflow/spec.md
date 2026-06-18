## ADDED Requirements

### Requirement: Schema Based Team Apply Guidance
Artifact workflow SHALL project-local schema의 `apply.instruction`을 통해 dynamic-engine 팀 apply 정책을 전달한다.

#### Scenario: TDD apply instruction
- **WHEN** 사용자가 `engine-spec-driven` schema를 사용하는 change에서 `openspec instructions apply --change <id> --json`을 실행한다
- **THEN** 응답의 `instruction`은 task 수행 순서를 테스트 우선으로 안내한다
- **AND** 실패하는 테스트를 먼저 작성하라는 정책을 포함한다
- **AND** 테스트가 존재한 뒤 구현을 시작하라는 순서를 포함한다
- **AND** 구현 전에 테스트 의도와 기대 동작을 정리하라는 지침을 포함한다

#### Scenario: Korean comments apply instruction
- **WHEN** 사용자가 `engine-spec-driven` schema를 사용하는 change에서 `openspec instructions apply --change <id> --json`을 실행한다
- **THEN** 응답의 `instruction`은 테스트 목적과 동작을 설명하는 한글 주석을 작성하라는 정책을 포함한다
- **AND** 중요한 로직과 함수에 한글 주석을 작성하라는 정책을 포함한다

#### Scenario: Test traceability comment format
- **WHEN** 사용자가 `engine-spec-driven` schema를 사용하는 change에서 `openspec instructions apply --change <id> --json`을 실행한다
- **THEN** 응답의 `instruction`은 생성되는 테스트 바로 앞에 문서형 주석을 작성하라고 안내한다
- **AND** 주석은 `테스트 의도`, `목적`, `출처`, `기대 동작` 항목을 포함한다
- **AND** `출처`는 `<spec path> > Requirement: <이름> > Scenario: <이름>` 형식으로 spec scenario를 추적할 수 있게 안내한다

#### Scenario: Task completion apply instruction
- **WHEN** 사용자가 `engine-spec-driven` schema를 사용하는 change에서 `openspec instructions apply --change <id> --json`을 실행한다
- **THEN** 응답의 `instruction`은 구현과 테스트 통과가 끝난 뒤에만 task checkbox를 완료 처리하라는 정책을 포함한다

#### Scenario: Built-in schema remains unchanged
- **WHEN** 사용자가 built-in `spec-driven` schema를 사용하는 change에서 `openspec instructions apply --change <id> --json`을 실행한다
- **THEN** 응답의 `instruction`은 built-in schema의 기존 apply instruction을 유지한다

#### Scenario: Team schema apply instruction extends built-in flow
- **WHEN** 사용자가 `engine-spec-driven` schema를 사용하는 change에서 `openspec instructions apply --change <id> --json`을 실행한다
- **THEN** 응답의 `instruction`은 built-in apply flow의 기본 진행 지침을 유지한다
- **AND** dynamic-engine 팀 구현 원칙을 추가 지침으로 포함한다

### Requirement: Config Based Team Artifact Guidance
Artifact workflow SHALL 기존 `openspec/config.yaml`의 `context`와 `rules`를 통해 dynamic-engine 팀 artifact 작성 정책을 전달한다.

#### Scenario: Korean document guidance
- **WHEN** 사용자가 dynamic-engine config preset이 적용된 repository에서 `openspec instructions proposal`, `design`, `tasks`, 또는 `specs`를 요청한다
- **THEN** 응답은 문서 본문을 한글로 작성하라는 팀 정책을 포함한다
- **AND** command, code, config key, path, OpenSpec parser keyword는 원문을 유지할 수 있음을 안내한다

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
