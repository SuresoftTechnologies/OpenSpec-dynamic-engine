# OpenSpec Conventions Specification

## Purpose

OpenSpec conventions SHALL define how system capabilities are documented, how changes are proposed and tracked, and how specifications evolve over time. This meta-specification serves as the source of truth for OpenSpec's own conventions.
## Requirements
### Requirement: Structured conventions for specs and changes

OpenSpec conventions SHALL mandate a structured spec format with clear requirement and scenario sections so tooling can parse consistently.

#### Scenario: Following the structured spec format

- **WHEN** writing or updating OpenSpec specifications
- **THEN** authors SHALL use `### Requirement: ...` followed by at least one `#### Scenario: ...` section

### Requirement: Behavior-First Specification Boundary
OpenSpec specifications SHALL capture verifiable behavior contracts and avoid internal implementation detail.

#### Scenario: Writing behavior requirements
- **WHEN** documenting a capability in `spec.md`
- **THEN** requirements focus on externally observable behavior, interfaces, error handling, and constraints
- **AND** scenarios remain testable or explicitly verifiable

#### Scenario: Avoiding implementation leakage
- **WHEN** details involve concrete library choices, class/function structure, or execution mechanics
- **THEN** those details SHALL be documented in `design.md` or `tasks.md` instead of behavioral requirements

### Requirement: Progressive Rigor
OpenSpec conventions SHALL keep specs lightweight by default and scale rigor only when risk or coordination complexity demands it.

#### Scenario: Routine change specification
- **WHEN** a change is local and low-risk
- **THEN** authors use concise, behavior-first requirements with minimal ceremony

#### Scenario: High-risk or cross-boundary change specification
- **WHEN** a change is cross-team, cross-repo, API-contract breaking, migration-heavy, or security/privacy sensitive
- **THEN** authors increase detail and explicit validation expectations proportionally

### Requirement: Project Structure
An OpenSpec project SHALL maintain a consistent directory structure for specifications and changes.

#### Scenario: Initializing project structure
- **WHEN** an OpenSpec project is initialized
- **THEN** it SHALL have this structure:
```
openspec/
├── project.md              # Project-specific context
├── AGENTS.md               # AI assistant instructions
├── specs/                  # Current deployed capabilities
│   └── [capability]/       # Single, focused capability
│       ├── spec.md         # WHAT and WHY
│       └── design.md       # HOW (optional, for established patterns)
└── changes/                # Proposed changes
    ├── [change-name]/      # Descriptive change identifier
    │   ├── proposal.md     # Why, what, and impact
    │   ├── tasks.md        # Implementation checklist
    │   ├── design.md       # Technical decisions (optional)
    │   └── specs/          # Complete future state
    │       └── [capability]/
    │           └── spec.md # Clean markdown (no diff syntax)
    └── archive/            # Completed changes
        └── YYYY-MM-DD-[name]/
```

### Requirement: Structured Format for Behavioral Specs

Behavioral specifications SHALL use a structured format with consistent section headers and keywords to ensure visual consistency and parseability.

#### Scenario: Writing requirement sections

- **WHEN** documenting a requirement in a behavioral specification
- **THEN** use a level-3 heading with format `### Requirement: [Name]`
- **AND** immediately follow with a SHALL statement describing core behavior
- **AND** keep requirement names descriptive and under 50 characters

#### Scenario: Documenting scenarios

- **WHEN** documenting specific behaviors or use cases
- **THEN** use level-4 headings with format `#### Scenario: [Description]`
- **AND** use bullet points with bold keywords for steps:
  - **GIVEN** for initial state (optional)
  - **WHEN** for conditions or triggers
  - **THEN** for expected outcomes
  - **AND** for additional outcomes or conditions

#### Scenario: Adding implementation details

- **WHEN** a step requires additional detail
- **THEN** use sub-bullets under the main step
- **AND** maintain consistent indentation
  - Sub-bullets provide examples or specifics
  - Keep sub-bullets concise

### Requirement: Header-Based Requirement Identification

Requirement headers SHALL serve as unique identifiers for programmatic matching between current specs and proposed changes.

#### Scenario: Matching requirements programmatically

- **WHEN** processing delta changes
- **THEN** use the `### Requirement: [Name]` header as the unique identifier
- **AND** match using normalized headers: `normalize(header) = trim(header)`
- **AND** compare headers with case-sensitive equality after normalization

#### Scenario: Handling requirement renames

- **WHEN** renaming a requirement
- **THEN** use a special `## RENAMED Requirements` section
- **AND** specify both old and new names explicitly:
  ```markdown
  ## RENAMED Requirements
  - FROM: `### Requirement: Old Name`
  - TO: `### Requirement: New Name`
  ```
- **AND** if content also changes, include under MODIFIED using the NEW header

#### Scenario: Validating header uniqueness

- **WHEN** creating or modifying requirements
- **THEN** ensure no duplicate headers exist within a spec
- **AND** validation tools SHALL flag duplicate headers as errors

### Requirement: Change Storage Convention

Change proposals SHALL store only the additions, modifications, and removals to specifications, not complete future states.

#### Scenario: Creating change proposals with additions

- **WHEN** creating a change proposal that adds new requirements
- **THEN** include only the new requirements under `## ADDED Requirements`
- **AND** each requirement SHALL include its complete content
- **AND** use the standard structured format for requirements and scenarios

#### Scenario: Creating change proposals with modifications  

- **WHEN** creating a change proposal that modifies existing requirements
- **THEN** include the modified requirements under `## MODIFIED Requirements`
- **AND** use the same header text as in the current spec (normalized)
- **AND** include the complete modified requirement (not a diff)
- **AND** optionally annotate what changed with inline comments like `← (was X)`

#### Scenario: Creating change proposals with removals

- **WHEN** creating a change proposal that removes requirements
- **THEN** list them under `## REMOVED Requirements`
- **AND** use the normalized header text for identification
- **AND** include reason for removal
- **AND** document any migration path if applicable

The `changes/[name]/specs/` directory SHALL contain:
- Delta files showing only what changes
- Sections for ADDED, MODIFIED, REMOVED, and RENAMED requirements
- Normalized header matching for requirement identification
- Complete requirements using the structured format
- Clear indication of change type for each requirement

#### Scenario: Using standard output symbols

- **WHEN** displaying delta operations in CLI output
- **THEN** use these standard symbols:
  - `+` for ADDED (green)
  - `~` for MODIFIED (yellow)
  - `-` for REMOVED (red)
  - `→` for RENAMED (cyan)

### Requirement: Archive Process Enhancement

The archive process SHALL programmatically apply delta changes to current specifications using header-based matching.

#### Scenario: Archiving changes with deltas

- **WHEN** archiving a completed change
- **THEN** the archive command SHALL:
  1. Parse RENAMED sections first and apply renames
  2. Parse REMOVED sections and remove by normalized header match
  3. Parse MODIFIED sections and replace by normalized header match (using new names if renamed)
  4. Parse ADDED sections and append new requirements
- **AND** validate that all MODIFIED/REMOVED headers exist in current spec
- **AND** validate that ADDED headers don't already exist
- **AND** generate the updated spec in the main specs/ directory

#### Scenario: Handling conflicts during archive

- **WHEN** delta changes conflict with current spec state
- **THEN** the archive command SHALL report specific conflicts
- **AND** require manual resolution before proceeding
- **AND** provide clear guidance on resolving conflicts

### Requirement: Proposal Format

Proposals SHALL explicitly document all changes with clear from/to comparisons.

#### Scenario: Documenting changes

- **WHEN** documenting what changes
- **THEN** the proposal SHALL explicitly describe each change:

```markdown
**[Section or Behavior Name]**
- From: [current state/requirement]
- To: [future state/requirement]
- Reason: [why this change is needed]
- Impact: [breaking/non-breaking, who's affected]
```

This explicit format compensates for not having inline diffs and ensures reviewers understand exactly what will change.

### Requirement: Change Review

The system SHALL support multiple methods for reviewing proposed changes.

#### Scenario: Reviewing changes

- **WHEN** reviewing proposed changes
- **THEN** reviewers can compare using:
- GitHub PR diff view when changes are committed
- Command line: `diff -u specs/[capability]/spec.md changes/[name]/specs/[capability]/spec.md`
- Any visual diff tool comparing current vs future state

### Requirement: Structured Format Adoption

Behavioral specifications SHALL adopt the structured format with `### Requirement:` and `#### Scenario:` headers as the default.

#### Scenario: Use structured headings for behavior

- **WHEN** documenting behavioral requirements
- **THEN** use `### Requirement:` for requirements
- **AND** use `#### Scenario:` for scenarios with bold WHEN/THEN/AND keywords

### Requirement: Verb–Noun CLI Command Structure
OpenSpec CLI design SHALL use verbs as top-level commands with nouns provided as arguments or flags for scoping.

#### Scenario: Verb-first command discovery
- **WHEN** a user runs a command like `openspec list`
- **THEN** the verb communicates the action clearly
- **AND** nouns refine scope via flags or arguments (e.g., `--changes`, `--specs`)

#### Scenario: Backward compatibility for noun commands
- **WHEN** users run noun-prefixed commands such as `openspec spec ...` or `openspec change ...`
- **THEN** the CLI SHALL continue to support them for at least one release
- **AND** display a deprecation warning that points to verb-first alternatives

#### Scenario: Disambiguation guidance
- **WHEN** item names are ambiguous between changes and specs
- **THEN** `openspec show` and `openspec validate` SHALL accept `--type spec|change`
- **AND** the help text SHALL document this clearly

### Requirement: Workspace Product Language
OpenSpec conventions SHALL describe coordination workspaces in user-facing product terms.

#### Scenario: Describing workspace structure
- **WHEN** OpenSpec documentation describes workspace support
- **THEN** it SHALL present a workspace as the planning home for work across linked repos or folders
- **AND** it SHALL describe `changes/` as the workspace planning area

#### Scenario: Avoiding internal workspace vocabulary
- **WHEN** OpenSpec documentation explains what a workspace includes
- **THEN** it SHALL prefer plain product language such as "repos or folders"
- **AND** it SHALL avoid user-facing reliance on terms such as "working set", "code area", "entry", "alias", or "local overlay"

#### Scenario: Distinguishing workspaces from changes
- **WHEN** OpenSpec documentation explains workspace planning
- **THEN** it SHALL describe a workspace as a durable planning home
- **AND** it SHALL describe individual features, fixes, and projects as changes inside the workspace

#### Scenario: Distinguishing workspace and repo-local surfaces
- **WHEN** OpenSpec documentation compares workspace and repo-local flows
- **THEN** it SHALL explain that workspace planning lives in the workspace folder
- **AND** it SHALL explain that repo-local specs and changes continue to live under each repo's `openspec/` directory

#### Scenario: Sequencing the workspace roadmap
- **WHEN** workspace reimplementation work is split across multiple active changes
- **THEN** conventions SHALL allow those changes to remain flat siblings under `openspec/changes/`
- **AND** dependency order MAY be documented in proposal prose until formal change stacking metadata is available

### Requirement: Workspace planning vocabulary
OpenSpec conventions SHALL distinguish workspace planning concepts using user-facing product language.

#### Scenario: Naming affected areas
- **WHEN** documentation or generated guidance refers to repos, folders, packages, services, apps, or docs sites touched by a workspace change
- **THEN** it SHALL call them affected areas
- **AND** it SHALL avoid using "target repo" or "repo slice" as the primary user-facing term

#### Scenario: Naming delivery slices
- **WHEN** documentation or generated guidance refers to delivery increments inside a larger change
- **THEN** it SHALL call them slices or phases only when delivery sequencing is the subject
- **AND** it SHALL not use slice as a synonym for repo, folder, or affected area

### Requirement: Workspace planning and implementation boundary
OpenSpec conventions SHALL distinguish workspace-level planning from repo-local implementation ownership.

#### Scenario: Workspace as shared planning home
- **WHEN** a change spans linked repos or folders
- **THEN** conventions SHALL describe the workspace as the shared planning home
- **AND** repo-local implementation homes SHALL retain ownership of their code and canonical behavior

#### Scenario: Avoiding materialization-first language
- **WHEN** documentation explains workspace change creation
- **THEN** it SHALL describe the user outcome in terms of shared planning and affected areas
- **AND** it SHALL avoid making users understand implementation terms such as materialization before they can plan

#### Scenario: Preserving familiar workflow verbs
- **WHEN** workspace guidance describes OpenSpec workflows
- **THEN** it SHALL keep the familiar verbs explore, propose, apply, verify, and archive
- **AND** it SHALL explain that workspace context changes paths, scope, and allowed edit roots rather than creating a separate workflow family

### Requirement: Team Policy Dynamic Instruction Source
OpenSpec SHALL dynamic-engine 팀별 artifact 작성 및 apply 구현 정책을 기존 config, schema, dynamic instruction 응답을 통해 전달한다.

#### Scenario: Artifact policy source of truth
- **WHEN** repository가 `openspec/config.yaml`의 `context`와 `rules`로 문서 작성 정책을 설정한다
- **THEN** OpenSpec은 artifact 생성 시점의 `openspec instructions <artifact> --json` 응답을 통해 해당 정책을 안내한다
- **AND** generated skill template 본문은 repository별 artifact 정책을 중복으로 hardcode하지 않는다

#### Scenario: Apply policy source of truth
- **WHEN** repository가 project-local schema의 `apply.instruction`으로 구현 정책을 설정한다
- **THEN** OpenSpec은 implementation 시작 시점의 `openspec instructions apply --json` 응답을 통해 해당 정책을 안내한다
- **AND** generated apply skill은 CLI가 반환한 dynamic instruction을 실행 지침으로 사용한다

#### Scenario: Config and schema 변경 반영
- **WHEN** repository의 `openspec/config.yaml` 또는 `openspec/schemas/<name>/schema.yaml` 정책이 변경된다
- **THEN** 다음 `openspec instructions ... --json` 호출은 변경된 정책을 반영한다
- **AND** 사용자는 skill file을 직접 수정하지 않아도 된다

### Requirement: Team Capability Naming Convention
OpenSpec SHALL `_`로 구분된 세 segment로 구성되고 각 segment가 kebab-case인 팀 capability 이름 규칙을 지원한다.

#### Scenario: 팀 capability 이름 허용
- **WHEN** 사용자가 `order-payment_refund-api_timeout-fix` 이름으로 capability를 proposal 또는 spec path에 작성한다
- **THEN** 시스템은 해당 이름을 유효한 capability 이름으로 허용한다
- **AND** `order-payment`, `refund-api`, `timeout-fix`를 `_`로 구분된 kebab-case segment로 처리한다

#### Scenario: 잘못된 팀 capability 이름 거부
- **WHEN** 사용자가 대문자, 공백, 빈 segment, 또는 kebab-case가 아닌 segment를 포함한 팀 형식 capability 이름을 작성하거나 검증한다
- **THEN** 시스템은 해당 capability 이름을 거부한다
- **AND** `대기능_중기능_소기능` 규칙과 `order-payment_refund-api_timeout-fix` 예시를 포함한 guidance를 표시한다

### Requirement: Korean OpenSpec Documents
OpenSpec SHALL dynamic-engine config preset이 적용된 repository에서 OpenSpec 문서를 한글로 작성하도록 요구한다.

#### Scenario: 한글 문서 작성
- **WHEN** 사용자가 proposal, design, tasks, spec 문서를 생성하거나 갱신한다
- **THEN** 시스템은 설명 문장과 리뷰 대상 본문을 한글로 작성하도록 안내한다
- **AND** command, path, config key, code identifier, OpenSpec parser keyword는 원문을 허용한다

#### Scenario: 자연스러운 한국어 문체
- **WHEN** 사용자가 proposal, design, tasks, spec 문서를 생성하거나 갱신한다
- **THEN** 시스템은 영문을 직역한 듯한 번역투를 피하고 사람이 읽기 쉬운 자연스러운 한국어로 작성하도록 안내한다
- **AND** 시스템은 문장을 짧게 유지하고 한 문단에 여러 논점을 섞지 않도록 안내한다

#### Scenario: Proposal Why 두괄식 작성
- **WHEN** 사용자가 proposal의 `Why` section을 생성하거나 갱신한다
- **THEN** 시스템은 첫 문장에 변경의 결론과 필요한 이유를 먼저 쓰도록 안내한다
- **AND** 시스템은 배경 설명과 세부 근거를 그 뒤에 배치하도록 안내한다

#### Scenario: Proposal section 역할 분리
- **WHEN** 사용자가 proposal의 `What Changes`와 `Impact` section을 생성하거나 갱신한다
- **THEN** 시스템은 `What Changes`에는 변경될 동작, 산출물, 검증 방식만 쓰도록 안내한다
- **AND** 시스템은 `Impact`에는 영향 범위, 바뀌지 않는 것, 운영/테스트 영향만 쓰도록 안내한다
- **AND** 시스템은 두 section에 같은 내용을 반복하지 않도록 안내한다

#### Scenario: Proposal 피드백의 문서 묶음 적용
- **WHEN** proposal에 대해 문체, 구조, 용어 피드백이 제기된다
- **THEN** 시스템은 같은 change의 design, specs, tasks에도 같은 기준을 적용하도록 안내한다
- **AND** 시스템은 proposal에서 정한 핵심 용어와 문제 정의를 다른 artifact가 이어받도록 안내한다

#### Scenario: 영문 template 잔여 문구 검출
- **WHEN** OpenSpec 문서에 scaffold template의 영문 placeholder 또는 명백한 영문 설명문이 남아 있다
- **THEN** 시스템은 한글 작성을 요구하는 warning 또는 validation issue를 표시한다

### Requirement: Team Apply Implementation Guidance
OpenSpec SHALL dynamic-engine schema preset이 적용된 repository에서 apply 구현 순서를 TDD와 task 완료 기준에 맞게 안내한다.

#### Scenario: TDD 구현 순서 안내
- **WHEN** 사용자가 `openspec instructions apply --json`로 구현 지침을 요청한다
- **AND** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 task 수행 순서를 테스트 우선으로 안내한다
- **AND** 실패하는 테스트를 먼저 작성하도록 안내한다
- **AND** 테스트가 존재한 뒤 구현을 시작하도록 안내한다
- **AND** 구현 전에 테스트 의도와 기대 동작을 정리하도록 안내한다

#### Scenario: 한글 주석 안내
- **WHEN** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 테스트 목적과 동작을 설명하는 한글 주석을 작성하도록 안내한다
- **AND** 중요한 로직과 함수에는 한글 주석을 작성하도록 안내한다

#### Scenario: 테스트 출처 추적 주석 안내
- **WHEN** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 생성되는 테스트 바로 앞에 고정된 문서형 주석을 작성하도록 안내한다
- **AND** 주석은 테스트의 목적, 출처 spec scenario, 기대 동작을 포함하도록 안내한다
- **AND** 출처 spec scenario는 `<spec path> > Requirement: <이름> > Scenario: <이름>` 형식으로 작성하도록 안내한다

#### Scenario: Task 완료 기준 안내
- **WHEN** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 구현과 테스트 통과가 끝난 뒤에만 task를 완료 처리하도록 안내한다

### Requirement: Team Jira Archive Naming
OpenSpec SHALL Jira issue key가 확인된 archived change를 `YYYY-MM-DD_<JIRA-KEY>_<change-name>` directory name으로 저장할 수 있다.

#### Scenario: Jira key가 있는 archive naming
- **WHEN** change가 Jira key `CT2606-616`과 연결된 상태로 archive된다
- **THEN** 시스템은 archive directory name을 `YYYY-MM-DD_CT2606-616_<change-name>` 형식으로 만든다
- **AND** 사용자는 archive directory 목록과 파일 검색에서 Jira key로 해당 change를 찾을 수 있다

#### Scenario: Jira key가 없는 archive naming fallback
- **WHEN** Jira key가 확인되지 않았고 팀 정책이 Jira key를 필수로 요구하지 않는다
- **THEN** 시스템은 기존 `YYYY-MM-DD-<change-name>` archive naming으로 fallback할 수 있다
- **AND** archive 작업은 Jira key 부재만으로 실패하지 않는다

### Requirement: Team Jira Auxiliary Metadata
OpenSpec SHALL archive directory name을 primary trace key로 사용하되, change metadata에도 Jira issue key를 보조 정보로 보존할 수 있다.

#### Scenario: Jira metadata 저장
- **WHEN** change가 Jira key `ABC-123`과 연결된다
- **THEN** 시스템은 `.openspec.yaml`의 `jira.key`에 key를 저장할 수 있다
- **AND** `jira.source`에는 `branch`, `prompt` 중 하나로 source를 저장한다

#### Scenario: Jira metadata 검증
- **WHEN** change metadata에 Jira key가 포함되어 있다
- **THEN** 시스템은 기본 `PROJECT-123` style pattern으로 key를 검증한다
- **AND** source가 허용된 값이 아니면 metadata를 거부한다

### Requirement: Minimal Core Change Principle
OpenSpec SHALL 팀 workflow 정책을 기존 extension point에 얹어 원본 코드 변경 범위를 최소화한다.

#### Scenario: 기존 dynamic instruction 경로 활용
- **WHEN** 팀 artifact 또는 apply 정책을 agent에게 전달한다
- **THEN** 시스템은 기존 `openspec instructions ... --json` 응답을 우선 사용한다
- **AND** apply 정책은 새 config parser가 아니라 기존 schema `apply.instruction`을 사용한다
- **AND** 별도 workflow schema engine이나 repository별 script hook을 새로 요구하지 않는다

#### Scenario: 역할 구분
- **WHEN** 팀 정책이 적용된다
- **THEN** config는 artifact context/rules 전달 역할을 한다
- **AND** project-local schema는 apply instruction 전달 역할을 한다
- **AND** validator와 archive CLI는 필요한 최소 enforcement 역할을 한다

#### Scenario: 팀 schema는 기본 schema를 대체하지 않고 확장
- **WHEN** dynamic-engine 팀 schema preset이 built-in `spec-driven` schema와 같은 artifact를 정의한다
- **THEN** preset은 built-in artifact instruction의 기본 작성 지침을 유지한다
- **AND** 팀별 한글 문서, capability naming, TDD, 테스트 추적성 주석 정책은 추가 지시로 분리한다
- **AND** OpenSpec 기본 parser 주의사항과 task tracking 규칙은 팀 정책 때문에 축약되지 않는다

#### Scenario: 문서 품질 정책은 프리셋 지침으로 추가
- **WHEN** dynamic-engine 팀이 자연스러운 한국어, 두괄식 Why, section 중복 방지 같은 문서 품질 정책을 강화한다
- **THEN** 시스템은 해당 정책을 config `context`/`rules`와 project-local schema artifact instruction에 추가 지침으로 둔다
- **AND** generated workflow skill template에는 repository별 문서 품질 문구를 hardcode하지 않는다
- **AND** 기존 `spec-driven` schema의 artifact instruction은 변경하지 않는다

### Requirement: Team Config And Schema Preset Convention
OpenSpec SHALL 팀 정책 preset을 자동 설치 기능이 아니라 복사 가능한 config/schema 예시로 제공할 수 있다.

#### Scenario: dynamic-engine preset manual opt-in
- **WHEN** dynamic-engine 팀 정책을 새 repository에 적용한다
- **THEN** 사용자는 source repository의 `docs/team-config/engine.config.yaml`을 대상 repository의 `openspec/config.yaml`로 복사한다
- **AND** 사용자는 source repository의 `docs/team-config/engine-spec-driven/`을 대상 repository의 `openspec/schemas/engine-spec-driven/`로 복사한다
- **AND** preset은 실제 OpenSpec config/schema key만 포함한다

#### Scenario: No automatic preset install
- **WHEN** 사용자가 `openspec init`, `openspec update`, 또는 skill install을 실행한다
- **THEN** 시스템은 dynamic-engine preset을 자동으로 복사하지 않는다
- **AND** 기존 repository config/schema를 팀 정책으로 자동 변경하지 않는다

## Core Principles

The system SHALL follow these principles:
- Specs reflect what IS currently built and deployed
- Changes contain proposals for what SHOULD be changed
- AI drives the documentation process
- Specs are living documentation kept in sync with deployed code

## Directory Structure

### Project Structure

An OpenSpec project SHALL maintain a consistent directory structure for specifications and changes.

#### Scenario: Initializing project structure

- **WHEN** an OpenSpec project is initialized
- **THEN** it SHALL have this structure:
```
openspec/
├── project.md              # Project-specific context
├── AGENTS.md               # AI assistant instructions
├── specs/                  # Current deployed capabilities
│   └── [capability]/       # Single, focused capability
│       ├── spec.md         # WHAT and WHY
│       └── design.md       # HOW (optional, for established patterns)
└── changes/                # Proposed changes
    ├── [change-name]/      # Descriptive change identifier
    │   ├── proposal.md     # Why, what, and impact
    │   ├── tasks.md        # Implementation checklist
    │   ├── design.md       # Technical decisions (optional)
    │   └── specs/          # Complete future state
    │       └── [capability]/
    │           └── spec.md # Clean markdown (no diff syntax)
    └── archive/            # Completed changes
        └── YYYY-MM-DD-[name]/
```

## Specification Format

### Behavioral Spec Format

Behavioral specifications SHALL use a structured format with consistent section headers and keywords to ensure visual consistency and parseability.

#### Scenario: Writing requirement sections

- **WHEN** documenting a requirement in a behavioral specification
- **THEN** use a level-3 heading with format `### Requirement: [Name]`
- **AND** immediately follow with a SHALL statement describing core behavior
- **AND** keep requirement names descriptive and under 50 characters

#### Scenario: Documenting scenarios

- **WHEN** documenting specific behaviors or use cases
- **THEN** use level-4 headings with format `#### Scenario: [Description]`
- **AND** use bullet points with bold keywords for steps:
  - **GIVEN** for initial state (optional)
  - **WHEN** for conditions or triggers
  - **THEN** for expected outcomes
  - **AND** for additional outcomes or conditions

#### Scenario: Adding implementation details

- **WHEN** a step requires additional detail
- **THEN** use sub-bullets under the main step
- **AND** maintain consistent indentation
  - Sub-bullets provide examples or specifics
  - Keep sub-bullets concise

## Change Storage Convention

### Header-Based Requirement Identification

Requirement headers SHALL serve as unique identifiers for programmatic matching between current specs and proposed changes.

#### Scenario: Matching requirements programmatically

- **WHEN** processing delta changes
- **THEN** use the `### Requirement: [Name]` header as the unique identifier
- **AND** match using normalized headers: `normalize(header) = trim(header)`
- **AND** compare headers with case-sensitive equality after normalization

#### Scenario: Handling requirement renames

- **WHEN** renaming a requirement
- **THEN** use a special `## RENAMED Requirements` section
- **AND** specify both old and new names explicitly:
  ```markdown
  ## RENAMED Requirements
  - FROM: `### Requirement: Old Name`
  - TO: `### Requirement: New Name`
  ```
- **AND** if content also changes, include under MODIFIED using the NEW header

#### Scenario: Validating header uniqueness

- **WHEN** creating or modifying requirements
- **THEN** ensure no duplicate headers exist within a spec
- **AND** validation tools SHALL flag duplicate headers as errors

### Change Storage Convention

Change proposals SHALL store only the additions, modifications, and removals to specifications, not complete future states.

#### Scenario: Creating change proposals with additions

- **WHEN** creating a change proposal that adds new requirements
- **THEN** include only the new requirements under `## ADDED Requirements`
- **AND** each requirement SHALL include its complete content
- **AND** use the standard structured format for requirements and scenarios

#### Scenario: Creating change proposals with modifications  

- **WHEN** creating a change proposal that modifies existing requirements
- **THEN** include the modified requirements under `## MODIFIED Requirements`
- **AND** use the same header text as in the current spec (normalized)
- **AND** include the complete modified requirement (not a diff)
- **AND** optionally annotate what changed with inline comments like `← (was X)`

#### Scenario: Creating change proposals with removals

- **WHEN** creating a change proposal that removes requirements
- **THEN** list them under `## REMOVED Requirements`
- **AND** use the normalized header text for identification
- **AND** include reason for removal
- **AND** document any migration path if applicable

The `changes/[name]/specs/` directory SHALL contain:
- Delta files showing only what changes
- Sections for ADDED, MODIFIED, REMOVED, and RENAMED requirements
- Normalized header matching for requirement identification
- Complete requirements using the structured format
- Clear indication of change type for each requirement

#### Scenario: Using standard output symbols

- **WHEN** displaying delta operations in CLI output
- **THEN** use these standard symbols:
  - `+` for ADDED (green)
  - `~` for MODIFIED (yellow)
  - `-` for REMOVED (red)
  - `→` for RENAMED (cyan)

### Archive Process Enhancement

The archive process SHALL programmatically apply delta changes to current specifications using header-based matching.

#### Scenario: Archiving changes with deltas

- **WHEN** archiving a completed change
- **THEN** the archive command SHALL:
  1. Parse RENAMED sections first and apply renames
  2. Parse REMOVED sections and remove by normalized header match
  3. Parse MODIFIED sections and replace by normalized header match (using new names if renamed)
  4. Parse ADDED sections and append new requirements
- **AND** validate that all MODIFIED/REMOVED headers exist in current spec
- **AND** validate that ADDED headers don't already exist
- **AND** generate the updated spec in the main specs/ directory

#### Scenario: Handling conflicts during archive

- **WHEN** delta changes conflict with current spec state
- **THEN** the archive command SHALL report specific conflicts
- **AND** require manual resolution before proceeding
- **AND** provide clear guidance on resolving conflicts

### Proposal Format

Proposals SHALL explicitly document all changes with clear from/to comparisons.

#### Scenario: Documenting changes

- **WHEN** documenting what changes
- **THEN** the proposal SHALL explicitly describe each change:

```markdown
**[Section or Behavior Name]**
- From: [current state/requirement]
- To: [future state/requirement]
- Reason: [why this change is needed]
- Impact: [breaking/non-breaking, who's affected]
```

This explicit format compensates for not having inline diffs and ensures reviewers understand exactly what will change.

## Change Lifecycle

The change process SHALL follow these states:

1. **Propose**: AI creates change with future state specs and explicit proposal
2. **Review**: Humans review proposal and future state
3. **Approve**: Change is approved for implementation
4. **Implement**: Follow tasks.md checklist (can span multiple PRs)
5. **Deploy**: Changes are deployed to production
6. **Update**: Specs in `specs/` are updated to match deployed reality
7. **Archive**: Change is moved to `archive/YYYY-MM-DD-[name]/`

## Viewing Changes

### Change Review

The system SHALL support multiple methods for reviewing proposed changes.

#### Scenario: Reviewing changes

- **WHEN** reviewing proposed changes
- **THEN** reviewers can compare using:
- GitHub PR diff view when changes are committed
- Command line: `diff -u specs/[capability]/spec.md changes/[name]/specs/[capability]/spec.md`
- Any visual diff tool comparing current vs future state

The system relies on tools to generate diffs rather than storing them.

## Capability Naming

Capabilities SHALL use:
- Verb-noun patterns (e.g., `user-auth`, `payment-capture`)
- Hyphenated lowercase names
- Singular focus (one responsibility per capability)
- No nesting (flat structure under `specs/`)

## When Changes Require Proposals

A proposal SHALL be created for:
- New features or capabilities
- Breaking changes to existing behavior
- Architecture or pattern changes
- Performance optimizations that change behavior
- Security updates affecting access patterns

A proposal is NOT required for:
- Bug fixes restoring intended behavior
- Typos or formatting fixes
- Non-breaking dependency updates
- Adding tests for existing behavior
- Documentation clarifications

## Why This Approach

Clean future state storage provides:
- **Readability**: No diff syntax pollution
- **AI-compatibility**: Standard markdown that AI tools understand
- **Simplicity**: No special parsing or processing needed
- **Tool-agnostic**: Any diff tool can show changes
- **Clear intent**: Explicit proposals document reasoning

The structured format adds:
- **Visual Consistency**: Requirement and Scenario prefixes make sections instantly recognizable
- **Parseability**: Consistent structure enables tooling and automation
- **Gradual Adoption**: Existing specs can migrate incrementally
