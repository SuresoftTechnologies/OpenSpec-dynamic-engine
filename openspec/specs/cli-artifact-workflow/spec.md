# cli-artifact-workflow Specification

## Purpose
Define artifact workflow CLI behavior (`status`, `instructions`, `templates`, and setup flows) for scaffolded and active changes.
## Requirements
### Requirement: Status Command

The system SHALL display artifact completion status for a change, including scaffolded (empty) changes.

> **Fixes bug**: Previously required `proposal.md` to exist via `getActiveChangeIds()`.

#### Scenario: Show status with all states

- **WHEN** user runs `openspec status --change <id>`
- **THEN** the system displays each artifact with status indicator:
  - `[x]` for completed artifacts
  - `[ ]` for ready artifacts
  - `[-]` for blocked artifacts (with missing dependencies listed)

#### Scenario: Status shows completion summary

- **WHEN** user runs `openspec status --change <id>`
- **THEN** output includes completion percentage and count (e.g., "2/4 artifacts complete")

#### Scenario: Status JSON output

- **WHEN** user runs `openspec status --change <id> --json`
- **THEN** the system outputs JSON with changeName, schemaName, isPlanningComplete, isComplete, and artifacts array
- **AND** `isPlanningComplete` is true only when every non-skipped planning artifact exists
- **AND** a skipped artifact counts as satisfied without being created
- **AND** `isComplete` remains a compatibility alias with the same value

#### Scenario: Status JSON includes apply requirements

- **WHEN** user runs `openspec status --change <id> --json`
- **THEN** the system outputs JSON with:
  - `changeName`, `schemaName`, `isPlanningComplete`, `isComplete`, `artifacts` array
  - `applyRequires`: array of artifact IDs needed for apply phase

#### Scenario: Status JSON exposes each artifact's dependency edges

- **WHEN** user runs `openspec status --change <id> --json`
- **THEN** every entry in the `artifacts` array includes `requires`: the array of artifact IDs it directly depends on
- **AND** `requires` is present regardless of the artifact's status, so a `done` artifact still reports its dependencies (letting agents compute the transitive required set from status alone)

#### Scenario: Status lists artifacts in dependency order, declaration order breaking ties

- **WHEN** user runs `openspec status --change <id>` (text or `--json`)
- **THEN** artifacts appear in dependency order, so a dependency is never listed after something that requires it
- **AND** artifacts that become ready at the same time keep the order the schema declares them, rather than being reordered alphabetically
- **AND** the first `ready` entry is therefore the artifact to write next
- **AND** a blocked artifact's `missingDeps` uses that same order

#### Scenario: Status on scaffolded change

- **WHEN** user runs `openspec status --change <id>` on a change with no artifacts
- **THEN** system displays all artifacts with their status
- **AND** root artifacts (no dependencies) show as ready `[ ]`
- **AND** dependent artifacts show as blocked `[-]`

#### Scenario: Missing change parameter

- **WHEN** user runs `openspec status` without `--change`
- **THEN** the system displays an error with list of available changes
- **AND** includes scaffolded changes (directories without proposal.md)

#### Scenario: Unknown change

- **WHEN** user runs `openspec status --change unknown-id`
- **AND** directory `openspec/changes/unknown-id/` does not exist
- **THEN** the system displays an error listing all available change directories

### Requirement: Next Artifact Discovery

The workflow SHALL use `openspec status` output to determine what can be created next, rather than a separate next-command surface.

#### Scenario: Discover next artifacts from status output

- **WHEN** a user needs to know which artifact to create next
- **THEN** `openspec status --change <id>` identifies ready artifacts with `[ ]`
- **AND** the first `[ ]` entry is the schema's recommended next artifact
- **AND** no dedicated "next command" is required to continue the workflow

### Requirement: Instructions Command

The system SHALL output enriched instructions for creating an artifact, including for scaffolded changes.

#### Scenario: Show enriched instructions

- **WHEN** user runs `openspec instructions <artifact> --change <id>`
- **THEN** the system outputs:
  - Artifact metadata (ID, output path, description)
  - Template content
  - Dependency status (done/missing)
  - Unlocked artifacts (what becomes available after completion)

#### Scenario: Instructions JSON output

- **WHEN** user runs `openspec instructions <artifact> --change <id> --json`
- **THEN** the system outputs JSON matching ArtifactInstructions interface

#### Scenario: Unknown artifact

- **WHEN** user runs `openspec instructions unknown-artifact --change <id>`
- **THEN** the system displays an error listing valid artifact IDs for the schema

#### Scenario: Artifact with unmet dependencies

- **WHEN** user requests instructions for a blocked artifact
- **THEN** the system displays instructions with a warning about missing dependencies

#### Scenario: Instructions on scaffolded change

- **WHEN** user runs `openspec instructions proposal --change <id>` on a scaffolded change
- **THEN** system outputs template and metadata for creating the proposal
- **AND** does not require any artifacts to already exist

### Requirement: Templates Command
The system SHALL show resolved template paths for all artifacts in a schema.

#### Scenario: List template paths with default schema
- **WHEN** user runs `openspec templates`
- **THEN** the system displays each artifact with its resolved template path using the default schema

#### Scenario: List template paths with custom schema
- **WHEN** user runs `openspec templates --schema tdd`
- **THEN** the system displays template paths for the specified schema

#### Scenario: Templates JSON output
- **WHEN** user runs `openspec templates --json`
- **THEN** the system outputs JSON mapping artifact IDs to template paths

#### Scenario: Template resolution source
- **WHEN** displaying template paths
- **THEN** the system indicates whether each template is from user override or package built-in

### Requirement: New Change Command
The system SHALL create new change directories with validation.

#### Scenario: Create valid change
- **WHEN** user runs `openspec new change add-feature`
- **THEN** the system creates `openspec/changes/add-feature/` directory

#### Scenario: Invalid change name
- **WHEN** user runs `openspec new change "Add Feature"` with invalid name
- **THEN** the system displays validation error with guidance

#### Scenario: Duplicate change name
- **WHEN** user runs `openspec new change existing-change` for an existing change
- **THEN** the system displays an error indicating the change already exists

#### Scenario: Create with description
- **WHEN** user runs `openspec new change add-feature --description "Add new feature"`
- **THEN** the system creates the change directory with description in README.md

### Requirement: Schema Selection
The system SHALL support custom schema selection for workflow commands.

#### Scenario: Default schema
- **WHEN** user runs workflow commands without `--schema`
- **THEN** the system uses the "spec-driven" schema

#### Scenario: Custom schema
- **WHEN** user runs `openspec status --change <id> --schema tdd`
- **THEN** the system uses the specified schema for artifact graph

#### Scenario: Unknown schema
- **WHEN** user specifies an unknown schema
- **THEN** the system displays an error listing available schemas

### Requirement: Output Formatting
The system SHALL provide consistent output formatting.

#### Scenario: Color output
- **WHEN** terminal supports colors
- **THEN** status indicators use colors: green (done), yellow (ready), red (blocked)

#### Scenario: No color output
- **WHEN** `--no-color` flag is used or NO_COLOR environment variable is set
- **THEN** output uses text-only indicators without ANSI colors

#### Scenario: Progress indication
- **WHEN** loading change state takes time
- **THEN** the system displays a spinner during loading

### Requirement: Experimental Isolation
The system SHALL implement artifact workflow commands in isolation for easy removal.

#### Scenario: Single file implementation
- **WHEN** artifact workflow feature is implemented
- **THEN** all commands are in `src/commands/artifact-workflow.ts`

#### Scenario: Help text marking
- **WHEN** user runs `--help` on any artifact workflow command
- **THEN** help text indicates the command is experimental

### Requirement: Schema Apply Block

The system SHALL support an `apply` block in schema definitions that controls when and how implementation begins.

#### Scenario: Schema with apply block

- **WHEN** a schema defines an `apply` block
- **THEN** the system uses `apply.requires` to determine which artifacts must exist before apply
- **AND** uses `apply.tracks` to identify the file for progress tracking (or null if none)
- **AND** uses `apply.instruction` for guidance shown to the agent

#### Scenario: Schema without apply block

- **WHEN** a schema has no `apply` block
- **THEN** the system requires all artifacts to exist before apply is available
- **AND** uses default instruction: "All artifacts complete. Proceed with implementation."

### Requirement: Apply Instructions Command

The system SHALL generate schema-aware apply instructions via `openspec instructions apply`.

#### Scenario: Generate apply instructions

- **WHEN** user runs `openspec instructions apply --change <id>`
- **AND** all required artifacts (per schema's `apply.requires`) exist
- **THEN** the system outputs:
  - `contextFiles` mapping artifact IDs to arrays of concrete paths for all existing artifacts
  - Schema-specific instruction text
  - Progress tracking file path (if `apply.tracks` is set)

#### Scenario: Apply blocked by missing artifacts

- **WHEN** user runs `openspec instructions apply --change <id>`
- **AND** required artifacts are missing
- **THEN** the system indicates apply is blocked
- **AND** lists which artifacts must be created first

#### Scenario: Apply instructions JSON output

- **WHEN** user runs `openspec instructions apply --change <id> --json`
- **THEN** the system outputs JSON with:
  - `contextFiles`: object mapping artifact IDs to arrays of concrete paths for existing artifacts
  - `instruction`: the apply instruction text
  - `tracks`: path to progress file or null
  - `applyRequires`: list of required artifact IDs

### Requirement: Tool selection flag

The `artifact-experimental-setup` command SHALL accept a `--tool <tool-id>` flag to specify the target AI tool.

#### Scenario: Specify tool via flag

- **WHEN** user runs `openspec artifact-experimental-setup --tool cursor`
- **THEN** skill files are generated in `.cursor/skills/`
- **AND** command files are generated using Cursor's frontmatter format

#### Scenario: Missing tool flag

- **WHEN** user runs `openspec artifact-experimental-setup` without `--tool`
- **THEN** the system displays an error requiring the `--tool` flag
- **AND** lists valid tool IDs in the error message

#### Scenario: Unknown tool ID

- **WHEN** user runs `openspec artifact-experimental-setup --tool unknown-tool`
- **AND** the tool ID is not in `AI_TOOLS`
- **THEN** the system displays an error listing valid tool IDs

#### Scenario: Tool without skillsDir

- **WHEN** user specifies a tool that has no `skillsDir` configured
- **THEN** the system displays an error indicating skill generation is not supported for that tool

#### Scenario: Tool without command adapter

- **WHEN** user specifies a tool that has `skillsDir` but no command adapter registered
- **THEN** skill files are generated successfully
- **AND** command generation is skipped with informational message

### Requirement: Output messaging

The setup command SHALL display clear output about what was generated.

#### Scenario: Show target tool in output

- **WHEN** setup command runs successfully
- **THEN** output includes the target tool name (e.g., "Setting up for Cursor...")

#### Scenario: Show generated paths

- **WHEN** setup command completes
- **THEN** output lists all generated skill file paths
- **AND** lists all generated command file paths (if applicable)

#### Scenario: Show skipped commands message

- **WHEN** command generation is skipped due to missing adapter
- **THEN** output includes message: "Command generation skipped - no adapter for <tool>"

### Requirement: Status JSON provides planning context
The status command SHALL provide machine-readable planning context for changes.

#### Scenario: Reporting next steps
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** the output SHALL include next step guidance for agents
- **AND** the guidance SHALL use plain action language

### Requirement: Status JSON action context
The status command SHALL expose action context that lets agents act without hardcoded filesystem assumptions.

#### Scenario: Repo-local action context
- **GIVEN** the change is repo-local
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** status JSON SHALL preserve existing artifact status behavior
- **AND** it SHALL report a repo-local planning home for agents that use action context

### Requirement: Instructions use resolved planning paths
Artifact and apply instructions SHALL use resolved planning paths rather than hardcoded repo-local change paths.

#### Scenario: Repo-local artifact instructions
- **GIVEN** the change is repo-local
- **WHEN** a user runs `openspec instructions <artifact> --change <id> --json`
- **THEN** instruction output SHALL preserve existing repo-local paths

### Requirement: Workflow skills use CLI artifact context
Generated workflow skills SHALL use OpenSpec CLI output as the source of truth for artifact locations.

#### Scenario: Skills inspect status before artifact work
- **WHEN** a generated workflow skill needs to inspect or create artifacts for a change
- **THEN** it SHALL instruct the agent to run `openspec status --change <id> --json`
- **AND** it SHALL use returned planning context and artifact paths rather than assuming a repo-local change path

#### Scenario: Skills use instructions before writing artifacts
- **WHEN** a generated workflow skill is about to create or update an artifact
- **THEN** it SHALL instruct the agent to run `openspec instructions <artifact> --change <id> --json`
- **AND** it SHALL write to the resolved artifact path returned by the command

### Requirement: Config Based Team Apply Guidance
Artifact workflow SHALL dynamic-engine 팀 구현 정책을 project-local config의 `operations.apply.guidance`로 전달한다.

#### Scenario: TDD apply guidance
- **WHEN** 팀 preset이 적용된 저장소에서 사용자가 `openspec instructions apply --change <id> --json`을 실행한다
- **THEN** 응답의 `operationGuidance`는 실패하는 테스트를 먼저 작성하도록 안내한다
- **AND** 구현 전 테스트 의도와 기대 동작을 정리하고 테스트 실패를 확인한 뒤 구현하도록 안내한다

#### Scenario: 한글 주석과 테스트 추적성
- **WHEN** 팀 preset이 적용된 저장소에서 apply 지침을 요청한다
- **THEN** `operationGuidance`는 중요한 로직과 함수에 한글 주석을 작성하도록 안내한다
- **AND** 테스트 바로 앞 주석에 `테스트 의도`, `목적`, `출처`, `기대 동작`을 포함하도록 안내한다
- **AND** 출처는 `<spec path> > Requirement: <이름> > Scenario: <이름>` 형식을 사용한다

#### Scenario: Task 완료 기준
- **WHEN** 팀 preset이 적용된 저장소에서 apply 지침을 요청한다
- **THEN** `operationGuidance`는 구현과 관련 테스트가 통과한 뒤에만 task를 완료하도록 안내한다

#### Scenario: Built-in apply instruction 보존
- **WHEN** 팀 `operationGuidance`가 apply 응답에 추가된다
- **THEN** schema의 built-in `instruction`은 그대로 유지된다
- **AND** 팀 정책은 별도 `operationGuidance` 배열로 제공된다

### Requirement: Config Based Team Artifact Guidance
Artifact workflow SHALL `openspec/config.yaml`의 `context`와 artifact별 `rules`를 통해 dynamic-engine 팀 문서 정책을 전달한다.

#### Scenario: 한글 문서와 품질 지침
- **WHEN** 사용자가 팀 preset 저장소에서 proposal, design, tasks 또는 specs 지침을 요청한다
- **THEN** 응답은 리뷰 대상 본문을 자연스러운 한글로 작성하도록 안내한다
- **AND** 첫 문단에 결론과 이유를 먼저 두고 짧은 문장과 문단을 사용하도록 안내한다

#### Scenario: Proposal section 역할 분리
- **WHEN** 사용자가 proposal 지침을 요청한다
- **THEN** `Why`에는 결론과 이유, `What Changes`에는 변경 동작과 산출물, `Impact`에는 영향 범위를 쓰도록 안내한다
- **AND** `What Changes`와 `Impact`에 같은 내용을 반복하지 않도록 안내한다

#### Scenario: 문서 간 피드백 전파
- **WHEN** 사용자가 design, specs 또는 tasks 지침을 요청한다
- **THEN** 응답은 proposal의 용어, 문제 정의와 문체를 이어받도록 안내한다
- **AND** proposal의 문체나 구조 피드백을 같은 change 문서에 적용하도록 안내한다

#### Scenario: 3-depth capability guidance
- **WHEN** 사용자가 proposal 또는 specs 지침을 요청한다
- **THEN** 응답은 `대분류/소분류/주제`의 정확한 3-depth와 segment별 kebab-case 규칙을 포함한다
- **AND** proposal capability ID와 `specs/<capability-path>/spec.md`가 동일한 전체 경로를 사용하도록 안내한다

#### Scenario: Generated template minimalism
- **WHEN** OpenSpec이 workflow skill 또는 command template을 생성한다
- **THEN** generated template은 저장소별 한국어 또는 capability 이름 정책을 hardcode하지 않는다
- **AND** agent가 현재 `context`, `rules`, `operationGuidance`를 동적으로 읽어 적용하도록 안내한다
