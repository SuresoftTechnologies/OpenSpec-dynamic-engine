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
- **THEN** the system outputs JSON with changeName, schemaName, isComplete, and artifacts array

#### Scenario: Status JSON includes apply requirements

- **WHEN** user runs `openspec status --change <id> --json`
- **THEN** the system outputs JSON with:
  - `changeName`, `schemaName`, `isComplete`, `artifacts` array
  - `applyRequires`: array of artifact IDs needed for apply phase

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

### Requirement: Workspace Setup Commands
The CLI artifact workflow SHALL expose workspace setup commands before change creation.

#### Scenario: Preparing workspace planning before a change
- **WHEN** a user needs to prepare workspace planning across repos or folders
- **THEN** the CLI SHALL provide commands to set up, list, link, relink, and doctor workspaces
- **AND** those commands SHALL not require an active workspace change

#### Scenario: Listing workspaces with a short command
- **WHEN** a user wants a concise workspace list command
- **THEN** the CLI SHALL support `openspec workspace ls`
- **AND** it SHALL behave the same as `openspec workspace list`

#### Scenario: Keeping setup separate from agent launch
- **WHEN** a user completes workspace setup
- **THEN** the setup workflow SHALL leave agent launch and workspace open behavior to a later workflow
- **AND** setup SHALL not require a preferred agent choice

#### Scenario: Avoiding public direct creation
- **WHEN** users create a workspace in the first workspace setup flow
- **THEN** the CLI SHALL use `openspec workspace setup`
- **AND** it SHALL not expose `openspec workspace create` as the public creation path

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
The status command SHALL provide machine-readable planning context for repo-local and workspace changes.

#### Scenario: Reporting planning home
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** the output SHALL identify whether the change is repo-local or workspace-scoped
- **AND** it SHALL include the planning home root and change root

#### Scenario: Reporting concrete artifact paths
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** the output SHALL include concrete paths for existing artifacts
- **AND** agents SHALL be able to read those paths without assuming `openspec/changes/<id>/`
- **AND** workspace-scoped nested spec paths SHALL be reported without flattening the area or capability path

#### Scenario: Reporting workspace affected areas
- **GIVEN** the change is workspace-scoped
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** the output SHALL include known affected areas
- **AND** it SHALL indicate when affected areas remain unresolved without requiring an additional area manifest artifact

#### Scenario: Reporting next steps
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** the output SHALL include next step guidance for agents
- **AND** the guidance SHALL use plain action language

### Requirement: Status JSON action context
The status command SHALL expose action context that lets agents act without hardcoded filesystem assumptions.

#### Scenario: Planning action context
- **WHEN** a workspace change is still in planning
- **THEN** status JSON SHALL identify the planning artifacts agents may read or update
- **AND** it SHALL indicate that linked repos and folders are context for exploration

#### Scenario: Implementation action context
- **WHEN** a workspace change has a selected affected area for implementation
- **THEN** status JSON SHALL include the allowed edit root for that area
- **AND** it SHALL avoid authorizing edits outside that selected area

#### Scenario: Repo-local action context
- **GIVEN** the change is repo-local
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** status JSON SHALL preserve existing artifact status behavior
- **AND** it SHALL report a repo-local planning home for agents that use action context

### Requirement: Instructions use resolved planning paths
Artifact and apply instructions SHALL use resolved planning paths rather than hardcoded repo-local change paths.

#### Scenario: Workspace artifact instructions
- **GIVEN** the change is workspace-scoped
- **WHEN** a user runs `openspec instructions <artifact> --change <id> --json`
- **THEN** instruction output SHALL point to the artifact path under the workspace change root
- **AND** it SHALL not instruct the agent to write under a linked repo unless an explicit implementation context allows it

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

#### Scenario: Skills avoid hardcoded repo-local paths
- **WHEN** generated workflow skills describe artifact locations
- **THEN** they SHALL avoid hardcoded examples that require changes to live under `openspec/changes/<id>/`
- **AND** any examples SHALL defer to CLI-reported paths for repo-local and workspace-scoped changes

#### Scenario: Skills guard unsupported workspace workflows
- **GIVEN** a generated workflow skill is selected by the global profile
- **AND** the workflow does not yet have full workspace-scoped behavior in this slice
- **WHEN** the skill is used for a workspace-scoped change
- **THEN** it SHALL tell the agent that the workspace action is not supported yet
- **AND** it SHALL not instruct the agent to fall back to repo-local paths or edit linked repos without an explicit allowed edit root

### Requirement: Workspace schema instructions
Workflow commands SHALL use the workspace planning schema instructions for workspace-scoped changes that use that schema.

#### Scenario: Workspace planning artifact order
- **GIVEN** a workspace-scoped change uses schema `workspace-planning`
- **WHEN** a user runs `openspec status --change <id> --json`
- **THEN** the artifact list SHALL reflect the workspace planning schema
- **AND** it SHALL include the normal proposal, specs, design, and tasks artifacts

#### Scenario: Workspace specs instructions
- **GIVEN** a workspace-scoped change uses schema `workspace-planning`
- **WHEN** a user requests instructions for the specs artifact
- **THEN** instruction output SHALL guide the agent to organize area-specific requirements under workspace-scoped `specs/` paths
- **AND** it SHALL not require all affected areas to be finalized before planning can continue
- **AND** it SHALL not instruct the agent to create repo-local spec files while the change is still in workspace planning

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

