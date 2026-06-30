## MODIFIED Requirements

### Requirement: Dynamic Engine Config Preset
시스템 SHALL 현재 구현된 `openspec/config.yaml` 옵션만 사용하는 dynamic-engine 팀용 config preset을 제공한다.

#### Scenario: Preset file is present
- **WHEN** 사용자가 source repository에서 팀 config 예시를 찾는다
- **THEN** `docs/team-config/engine.config.yaml` 파일이 존재한다
- **AND** 파일 내용은 `schema`, `context`, `rules` field만 사용하는 실제 OpenSpec project config 형식이다

#### Scenario: Preset selects team schema
- **WHEN** 사용자가 `engine.config.yaml` preset을 대상 repository의 `openspec/config.yaml`로 복사한다
- **THEN** config는 `schema: engine-spec-driven`을 선언한다
- **AND** OpenSpec은 project-local `openspec/schemas/engine-spec-driven/schema.yaml` schema를 사용할 수 있다

#### Scenario: Preset artifact policies
- **WHEN** `engine.config.yaml` preset이 대상 repository에 적용된다
- **THEN** `context`와 `rules`는 한글 문서 작성 정책을 proposal, specs, design, tasks artifact에 전달한다
- **AND** proposal/specs rules는 `대기능_중기능_소기능` capability naming guidance를 포함한다
- **AND** tasks rules는 테스트 우선 task 작성 및 테스트 통과 후 task 완료 기준을 포함한다

#### Scenario: Preset Korean writing quality policies
- **WHEN** `engine.config.yaml` preset이 대상 repository에 적용된다
- **THEN** `context`는 번역투를 피하고 자연스러운 한국어로 문서를 작성하라는 정책을 전달한다
- **AND** `context`는 첫 문단에 결론과 이유를 먼저 두라는 정책을 전달한다
- **AND** proposal rules는 `Why`를 두괄식으로 쓰고 문단을 짧게 유지하라는 정책을 포함한다
- **AND** proposal rules는 `What Changes`와 `Impact`의 내용을 중복하지 말라는 정책을 포함한다

#### Scenario: Preset feedback propagation policies
- **WHEN** `engine.config.yaml` preset이 대상 repository에 적용된다
- **THEN** design, specs, tasks rules는 proposal에서 정한 용어와 문체를 이어받으라는 정책을 포함한다
- **AND** design, specs, tasks rules는 proposal에 대한 문체/구조 피드백을 같은 change의 다른 문서에도 적용하라는 정책을 포함한다

### Requirement: Dynamic Engine Schema Preset
시스템 SHALL 현재 구현된 project-local schema mechanism을 사용하는 dynamic-engine 팀용 schema preset을 제공한다.

#### Scenario: Schema preset file is present
- **WHEN** 사용자가 source repository에서 팀 schema 예시를 찾는다
- **THEN** `docs/team-config/engine-spec-driven/schema.yaml` 파일이 존재한다
- **AND** `docs/team-config/engine-spec-driven/templates/` directory가 존재한다
- **AND** 파일 내용은 OpenSpec schema 형식의 `artifacts`와 `apply` section을 포함한다

#### Scenario: Apply instruction contains team policy
- **WHEN** `engine-spec-driven` schema가 대상 repository의 `openspec/schemas/engine-spec-driven/schema.yaml`로 복사된다
- **THEN** schema의 `apply.instruction`은 실패 테스트 선작성, 테스트 존재 후 구현 시작, 구현 전 테스트 의도/기대 동작 정리 지침을 포함한다
- **AND** 테스트 목적/동작 및 중요한 로직/함수에 한글 주석을 작성하라는 지침을 포함한다
- **AND** 생성되는 테스트 바로 앞에 테스트 목적, 출처 spec scenario, 기대 동작을 포함한 문서형 주석 형식을 작성하라는 지침을 포함한다
- **AND** 구현과 테스트 통과 뒤에만 task를 완료 처리하라는 지침을 포함한다

#### Scenario: Schema preset preserves built-in artifact instructions
- **WHEN** 사용자가 `docs/team-config/engine-spec-driven/schema.yaml` preset을 확인한다
- **THEN** proposal, specs, design, tasks artifact instruction은 built-in `spec-driven` schema의 기본 작성 지침을 유지한다
- **AND** dynamic-engine 팀 지시는 기본 지침을 대체하지 않고 추가 section으로 덧붙인다
- **AND** specs instruction은 `#### Scenario:` parser 주의사항과 `MODIFIED` requirement 전체 block 작성 workflow를 유지한다
- **AND** tasks instruction은 checkbox tracking 형식과 task verifiability guidance를 유지한다

#### Scenario: Schema preset contains document quality guidance
- **WHEN** 사용자가 `docs/team-config/engine-spec-driven/schema.yaml` preset을 확인한다
- **THEN** proposal instruction은 자연스러운 한국어, 두괄식 Why, 짧은 문장과 문단 작성 지침을 포함한다
- **AND** proposal instruction은 `What Changes`와 `Impact`의 역할을 분리하고 같은 내용을 반복하지 말라는 지침을 포함한다
- **AND** design, specs, tasks instruction은 proposal에서 정한 용어와 문체를 이어받으라는 지침을 포함한다
- **AND** design, specs, tasks instruction은 proposal에 대한 문체/구조 피드백을 같은 change의 다른 문서에도 적용하라는 지침을 포함한다

#### Scenario: Schema preset preserves built-in apply flow
- **WHEN** `engine-spec-driven` schema의 `apply.instruction`이 반환된다
- **THEN** instruction은 built-in apply flow의 context file 확인, pending task 처리, blocker 시 중단/확인 guidance를 유지한다
- **AND** dynamic-engine 팀 TDD, 한글 주석, 테스트 추적성 주석, task 완료 timing 정책을 추가로 안내한다

#### Scenario: Manual copy usage
- **WHEN** 사용자가 대상 repository에 dynamic-engine 팀 정책을 적용하려 한다
- **THEN** 사용자는 `engine.config.yaml`을 대상 repository의 `openspec/config.yaml`로 복사한다
- **AND** 사용자는 `engine-spec-driven` schema preset directory 전체를 대상 repository의 `openspec/schemas/engine-spec-driven/`로 복사한다
- **AND** `openspec init`, `openspec update`, skill install 과정은 preset을 자동으로 복사하거나 기존 config/schema를 덮어쓰지 않는다
