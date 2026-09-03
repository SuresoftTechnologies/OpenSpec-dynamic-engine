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
│   └── <capability-path>/  # One or more directories for a focused capability
│       ├── spec.md         # WHAT and WHY
│       └── design.md       # HOW (optional, for established patterns)
└── changes/                # Proposed changes
    ├── [change-name]/      # Descriptive change identifier
    │   ├── proposal.md     # Why, what, and impact
    │   ├── tasks.md        # Implementation checklist
    │   ├── design.md       # Technical decisions (optional)
    │   └── specs/          # Complete future state
    │       └── <capability-path>/
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
- An optional `## Purpose` section on deltas that introduce a new capability
- Normalized header matching for requirement identification
- Complete requirements using the structured format
- Clear indication of change type for each requirement

#### Scenario: Introducing a new capability

- **WHEN** a delta introduces a capability that has no main spec yet
- **THEN** the delta MAY open with a `## Purpose` section describing the capability
- **AND** that Purpose SHALL seed the main spec created for it
- **AND** a delta for a capability that already has a main spec SHOULD NOT carry a `## Purpose`, because the existing Purpose is authoritative and the delta's is ignored

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
- **AND** validate that all MODIFIED headers exist in current spec
- **AND** treat a REMOVED header that is already absent as already removed (warn and continue; a REMOVED header that names the FROM side of a RENAMED in the same delta — compared case- and whitespace-insensitively — or that differs only in case or whitespace from an existing requirement, is a conflict)
- **AND** treat an ADDED header that already exists with identical content as already synced (differing content is a conflict)
- **AND** treat a RENAMED whose source is gone but target present as already synced
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
- Command line: `diff -u "specs/<capability-path>/spec.md" "changes/<name>/specs/<capability-path>/spec.md"`
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

### Requirement: Team Policy Dynamic Instruction Source
OpenSpec SHALL dynamic-engine 팀 정책을 project config, project-local schema와 동적 instruction 응답을 통해 전달한다.

#### Scenario: Artifact 정책 source of truth
- **WHEN** 저장소가 `openspec/config.yaml`의 `context`와 `rules`로 문서 정책을 설정한다
- **THEN** `openspec instructions <artifact> --json` 응답은 현재 정책을 제공한다
- **AND** generated workflow template은 저장소별 정책을 중복해 hardcode하지 않는다

#### Scenario: Operation 정책 source of truth
- **WHEN** 저장소가 `operations.apply.guidance` 또는 `operations.archive.guidance`를 설정한다
- **THEN** 해당 operation instruction JSON은 정책을 별도 `operationGuidance` 배열로 제공한다
- **AND** built-in instruction과 command contract는 그대로 유지한다

#### Scenario: Config 또는 schema 변경 반영
- **WHEN** project config나 project-local schema가 변경된다
- **THEN** 다음 instruction 호출은 변경된 정책을 반영한다
- **AND** 사용자는 generated skill 파일에 정책을 직접 복사하지 않아도 된다

### Requirement: Team Capability Naming Convention
OpenSpec SHALL `/`로 구분된 정확히 세 segment와 segment별 kebab-case로 구성된 팀 capability 경로 규칙을 지원한다.

#### Scenario: 팀 capability 경로 허용
- **WHEN** 사용자가 `order-payment/refund-api/timeout-fix` ID를 proposal 또는 spec path에 작성한다
- **THEN** 시스템은 해당 ID를 유효한 팀 capability로 허용한다
- **AND** main spec과 delta spec에서 전체 nested 상대 경로를 보존한다

#### Scenario: 잘못된 팀 capability 경로 거부
- **WHEN** capability가 대문자, 공백, 빈 segment, underscore 구분자 또는 정확히 세 개가 아닌 segment를 포함한다
- **THEN** 시스템은 해당 ID를 거부한다
- **AND** `대분류/소분류/주제`와 `order-payment/refund-api/timeout-fix` 예시를 표시한다

### Requirement: Korean OpenSpec Documents
OpenSpec SHALL dynamic-engine preset 저장소에서 리뷰 대상 OpenSpec 문서를 자연스러운 한글로 작성하도록 안내한다.

#### Scenario: 한글 문서 작성
- **WHEN** 사용자가 proposal, design, tasks 또는 spec을 생성하거나 갱신한다
- **THEN** 설명 문장과 리뷰 대상 본문은 한글로 작성하도록 안내한다
- **AND** command, path, config key, code identifier와 OpenSpec parser keyword는 원문을 허용한다

#### Scenario: 한국어 문서 품질
- **WHEN** 사용자가 OpenSpec 문서를 생성하거나 갱신한다
- **THEN** 번역투를 피하고 짧은 문장과 문단을 사용하도록 안내한다
- **AND** 첫 문단에는 결론과 이유를 먼저 두도록 안내한다

#### Scenario: Proposal 역할 분리와 피드백 전파
- **WHEN** proposal과 후속 artifact를 작성한다
- **THEN** `Why`, `What Changes`, `Impact`의 역할을 구분하고 내용을 반복하지 않도록 안내한다
- **AND** proposal에서 정한 용어, 문체와 구조 피드백을 design, specs, tasks에 적용하도록 안내한다

### Requirement: Team Apply Implementation Guidance
OpenSpec SHALL dynamic-engine preset 저장소에서 apply 작업을 TDD와 명시적 task 완료 기준에 맞게 안내한다.

#### Scenario: TDD 구현 순서
- **WHEN** 사용자가 `openspec instructions apply --json`을 실행한다
- **THEN** `operationGuidance`는 실패 테스트를 먼저 작성하도록 안내한다
- **AND** 테스트 의도와 기대 동작을 정리하고 테스트 실패를 확인한 뒤 구현하도록 안내한다

#### Scenario: 한글 주석과 출처 추적
- **WHEN** 팀 apply 정책이 제공된다
- **THEN** 중요한 로직과 함수에 한글 주석을 작성하도록 안내한다
- **AND** 테스트 주석은 목적, 출처 spec scenario와 기대 동작을 포함하도록 안내한다

#### Scenario: Task 완료 기준
- **WHEN** 구현 task를 수행한다
- **THEN** 구현과 관련 테스트가 모두 통과한 뒤에만 checkbox를 완료하도록 안내한다

### Requirement: Team Jira Archive Naming
OpenSpec SHALL `engine-spec-driven` change에서 확인한 Jira issue key를 `YYYY-MM-DD_<JIRA-KEY>_<change-name>` archive directory 이름에 보존한다.

#### Scenario: Branch Jira key
- **WHEN** 현재 작업 branch에 `WOR-1767` 형식의 Jira key가 있고 팀 change를 archive한다
- **THEN** archive directory 이름에 해당 key를 포함한다
- **AND** archive 결과에 Jira key와 경로를 표시한다

#### Scenario: 명시적 Jira key
- **WHEN** branch에서 key를 찾지 못하고 사용자가 `--jira`로 유효한 key를 제공한다
- **THEN** archive directory 이름과 metadata에 해당 key를 사용한다

#### Scenario: 선택적 Jira fallback
- **WHEN** Jira key가 없고 `--require-jira`가 지정되지 않았다
- **THEN** archive는 기존 `YYYY-MM-DD-<change-name>` 형식을 사용할 수 있다

#### Scenario: 필수 Jira 누락
- **WHEN** 자동화가 `--require-jira --yes`로 실행되었으나 key를 확인할 수 없다
- **THEN** archive는 main spec이나 change를 이동하지 않고 실패한다

### Requirement: Team Jira Auxiliary Metadata
OpenSpec SHALL archive directory 이름을 primary trace key로 사용하고 Jira key와 source를 change metadata에 보조 정보로 보존한다.

#### Scenario: Jira metadata 저장
- **WHEN** Jira key가 resolve된다
- **THEN** `.openspec.yaml`의 `jira.key`에 정규화한 key를 저장한다
- **AND** `jira.source`에는 `branch` 또는 `prompt`를 저장한다
- **AND** 기존 `skip_specs`와 `retire_capabilities` metadata를 보존한다

#### Scenario: Archive rollback
- **WHEN** Jira metadata staging 이후 archive가 실패한다
- **THEN** 시스템은 metadata 원본 bytes와 main spec 변경을 복구한다

### Requirement: Minimal Core Change Principle
OpenSpec SHALL 팀 workflow 정책을 기존 v1.11 extension point에 얹고 핵심 코드 변경을 필요한 enforcement로 제한한다.

#### Scenario: 기존 동적 instruction 경로 활용
- **WHEN** artifact 또는 operation 정책을 agent에게 전달한다
- **THEN** 시스템은 `context`, `rules`, `operationGuidance` 응답을 사용한다
- **AND** 별도 workflow engine이나 저장소별 parser hook을 요구하지 않는다

#### Scenario: 역할 구분
- **WHEN** 팀 정책이 적용된다
- **THEN** config는 문서와 operation guidance, project-local schema는 artifact graph와 기본 instruction을 제공한다
- **AND** validator와 archive CLI는 3-depth 경로와 Jira trace enforcement만 담당한다

#### Scenario: Built-in schema 보존
- **WHEN** 팀 schema preset이 built-in `spec-driven`을 기반으로 갱신된다
- **THEN** v1.11 artifact instruction과 parser 주의사항을 유지한다
- **AND** 팀별 지침은 추가 section 또는 config guidance로 분리한다

### Requirement: Team Config And Schema Preset Convention
OpenSpec SHALL 팀 정책 preset과 installer를 제공하되 일반 `openspec init` 또는 `openspec update`에서 임의로 프로젝트 설정을 덮어쓰지 않는다.

#### Scenario: 명시적 installer opt-in
- **WHEN** 사용자가 팀 installer에 대상 저장소를 명시한다
- **THEN** installer는 `docs/team-config/engine.config.yaml`과 `engine-spec-driven` schema를 대상 `openspec/` 아래에 적용한다
- **AND** 내용이 다른 기존 config는 timestamp backup을 만든다

#### Scenario: 일반 command의 설정 보존
- **WHEN** 사용자가 installer 없이 `openspec init` 또는 `openspec update`를 실행한다
- **THEN** CLI는 dynamic-engine preset을 자동 복사하지 않는다
- **AND** 기존 project config와 schema를 팀 정책으로 자동 변경하지 않는다
