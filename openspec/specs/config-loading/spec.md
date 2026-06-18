# config-loading Specification

## Purpose
Define how `openspec/config.yaml` is discovered, parsed, validated, and exposed to callers with safe fallbacks.

## Requirements
### Requirement: Load project config from openspec/config.yaml

The system SHALL read and parse the project configuration file located at `openspec/config.yaml` relative to the project root.

#### Scenario: Valid config file exists
- **WHEN** `openspec/config.yaml` exists with valid YAML content
- **THEN** system parses the file and returns a ProjectConfig object

#### Scenario: Config file does not exist
- **WHEN** `openspec/config.yaml` does not exist
- **THEN** system returns null without error

#### Scenario: Config file has invalid YAML syntax
- **WHEN** `openspec/config.yaml` contains malformed YAML
- **THEN** system logs a warning message and returns null

#### Scenario: Config file has valid YAML but invalid schema
- **WHEN** `openspec/config.yaml` contains valid YAML that fails Zod schema validation
- **THEN** system logs a warning message with validation details and returns null

### Requirement: Support .yml file extension alias

The system SHALL accept both `.yaml` and `.yml` file extensions for the config file.

#### Scenario: Config file uses .yml extension
- **WHEN** `openspec/config.yml` exists and `openspec/config.yaml` does not exist
- **THEN** system reads from `openspec/config.yml`

#### Scenario: Both .yaml and .yml exist
- **WHEN** both `openspec/config.yaml` and `openspec/config.yml` exist
- **THEN** system prefers `openspec/config.yaml`

### Requirement: Use resilient field-by-field parsing

The system SHALL parse each config field independently, collecting valid fields and warning about invalid ones without rejecting the entire config.

#### Scenario: Schema field is valid
- **WHEN** config contains `schema: "spec-driven"`
- **THEN** schema field is included in returned config

#### Scenario: Schema field is missing
- **WHEN** config lacks the `schema` field
- **THEN** no warning is logged (field is optional at parse level)

#### Scenario: Schema field is empty string
- **WHEN** config contains `schema: ""`
- **THEN** warning is logged and schema field is not included in returned config

#### Scenario: Schema field is invalid type
- **WHEN** config contains `schema: 123` (number instead of string)
- **THEN** warning is logged and schema field is not included in returned config

#### Scenario: Context field is valid
- **WHEN** config contains `context: "Tech stack: TypeScript"`
- **THEN** context field is included in returned config

#### Scenario: Context field is invalid type
- **WHEN** config contains `context: 123` (number instead of string)
- **THEN** warning is logged and context field is not included in returned config

#### Scenario: Rules field has valid structure
- **WHEN** config contains `rules: { proposal: ["Rule 1"], specs: ["Rule 2"] }`
- **THEN** rules field is included in returned config with valid rules

#### Scenario: Rules field has non-array value for artifact
- **WHEN** config contains `rules: { proposal: "not an array", specs: ["Valid"] }`
- **THEN** warning is logged for proposal, but specs rules are still included in returned config

#### Scenario: Rules array contains non-string elements
- **WHEN** config contains `rules: { proposal: ["Valid rule", 123, ""] }`
- **THEN** only "Valid rule" is included, warning logged about invalid elements

#### Scenario: Mix of valid and invalid fields
- **WHEN** config contains valid schema, invalid context type, valid rules
- **THEN** config is returned with schema and rules fields, warning logged about context

### Requirement: Enforce context size limit

The system SHALL reject context fields exceeding 50KB and log a warning.

#### Scenario: Context within size limit
- **WHEN** config contains context of 1KB
- **THEN** context is included in returned config

#### Scenario: Context at size limit
- **WHEN** config contains context of exactly 50KB
- **THEN** context is included in returned config

#### Scenario: Context exceeds size limit
- **WHEN** config contains context of 51KB
- **THEN** warning is logged with size and limit, context field is not included in returned config

### Requirement: Defer artifact ID validation to instruction loading

The system SHALL NOT validate artifact IDs in rules during config load time. Validation happens during instruction loading when schema is known.

#### Scenario: Config with rules is loaded
- **WHEN** config contains `rules: { unknownartifact: [...] }`
- **THEN** config is loaded successfully without validation errors

#### Scenario: Validation happens at instruction load time
- **WHEN** instructions are loaded for any artifact and config has unknown artifact IDs in rules
- **THEN** warnings are emitted about unknown artifact IDs (see rules-injection spec for details)

### Requirement: Gracefully handle config errors without halting

The system SHALL continue operation with default values when config loading or parsing fails.

#### Scenario: Config parse failure during command execution
- **WHEN** config file has syntax errors and user runs `openspec new change`
- **THEN** command executes using default schema "spec-driven"

#### Scenario: Warning is visible to user
- **WHEN** config loading fails
- **THEN** system outputs warning message to stderr with details about the failure

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

#### Scenario: Schema preset preserves built-in apply flow
- **WHEN** `engine-spec-driven` schema의 `apply.instruction`이 반환된다
- **THEN** instruction은 built-in apply flow의 context file 확인, pending task 처리, blocker 시 중단/확인 guidance를 유지한다
- **AND** dynamic-engine 팀 TDD, 한글 주석, 테스트 추적성 주석, task 완료 timing 정책을 추가로 안내한다

#### Scenario: Manual copy usage
- **WHEN** 사용자가 대상 repository에 dynamic-engine 팀 정책을 적용하려 한다
- **THEN** 사용자는 `engine.config.yaml`을 대상 repository의 `openspec/config.yaml`로 복사한다
- **AND** 사용자는 `engine-spec-driven` schema preset directory 전체를 대상 repository의 `openspec/schemas/engine-spec-driven/`로 복사한다
- **AND** `openspec init`, `openspec update`, skill install 과정은 preset을 자동으로 복사하거나 기존 config/schema를 덮어쓰지 않는다

