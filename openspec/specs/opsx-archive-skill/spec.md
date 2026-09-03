# OPSX Archive Skill Spec

## Purpose

Define the expected behavior for the `/opsx:archive` skill, including readiness checks, spec sync prompting, archive execution, and user-facing output.

## Requirements

### Requirement: OPSX Archive Skill

The system SHALL provide an `/opsx:archive` skill that archives completed changes in the experimental workflow.

#### Scenario: Archive a change with all artifacts complete

- **WHEN** agent executes `/opsx:archive` with a change name
- **AND** all artifacts in the schema are complete
- **AND** all tasks are complete
- **THEN** the agent moves the change to `openspec/changes/archive/<target-name>/`
- **AND** displays success message with archived location

#### Scenario: Change selection prompt

- **WHEN** agent executes `/opsx:archive` without specifying a change
- **THEN** the agent infers the change from conversation context, or auto-selects it when only one active change exists
- **AND** when ambiguous, prompts user to select from available changes, showing only active changes (excludes archive/)
- **AND** announces which change was selected and how to override

### Requirement: Artifact Completion Check

The skill SHALL check artifact completion status using the artifact graph before archiving.

#### Scenario: Incomplete artifacts warning

- **WHEN** agent checks artifact status
- **AND** one or more artifacts have status other than `done`
- **THEN** display warning listing incomplete artifacts
- **AND** prompt user for confirmation to continue
- **AND** proceed if user confirms

#### Scenario: All artifacts complete

- **WHEN** agent checks artifact status
- **AND** all artifacts have status `done`
- **THEN** proceed without warning

### Requirement: Task Completion Check

The skill SHALL check task completion status from tasks.md before archiving.

#### Scenario: Incomplete tasks found

- **WHEN** agent reads tasks.md
- **AND** incomplete tasks are found (marked with `- [ ]`)
- **THEN** display warning showing count of incomplete tasks
- **AND** prompt user for confirmation to continue
- **AND** proceed if user confirms

#### Scenario: All tasks complete

- **WHEN** agent reads tasks.md
- **AND** all tasks are complete (marked with `- [x]`)
- **THEN** proceed without task-related warning

#### Scenario: No tasks file

- **WHEN** tasks.md does not exist
- **THEN** proceed without task-related warning

### Requirement: Spec Sync Prompt

The skill SHALL prompt to sync delta specs before archiving if specs exist.

#### Scenario: Delta specs exist

- **WHEN** agent checks for delta specs
- **AND** `specs/` directory exists in the change with spec files
- **THEN** prompt user: "This change has delta specs. Would you like to sync them to main specs before archiving?"
- **AND** if user cancels, stop without archiving
- **AND** if user confirms, execute `/opsx:sync` logic inline and wait for it to complete
- **AND** verify every capability that has a delta spec, not only those the sync reports it touched: ADDED requirements present, MODIFIED requirements carrying the changes named in the delta, REMOVED requirements absent, RENAMED requirements present under the new name and absent under the old one
- **AND** treat a capability whose last requirement the sync removed as verified when its main spec was deleted rather than left empty, and a spec the sync deliberately kept and reported as verified too
- **AND** stop without archiving if the sync fails or any capability does not verify
- **AND** archive only after verification passes, or when the user explicitly chose to archive without syncing or to archive already-synced specs

#### Scenario: No delta specs

- **WHEN** agent checks for delta specs
- **AND** no `specs/` directory or no spec files exist
- **THEN** proceed without sync prompt

### Requirement: Archive Process

The skill SHALL move the change to the archive folder with date prefix.

#### Scenario: Successful archive

- **WHEN** archiving a change
- **THEN** create `archive/` directory if it doesn't exist
- **AND** generate target name as `YYYY-MM-DD-<change-name>` using current date, keeping the name as-is when it already starts with a `YYYY-MM-DD-` prefix
- **AND** move entire change directory to archive location
- **AND** preserve `.openspec.yaml` file in archived change

#### Scenario: Archive already exists

- **WHEN** target archive directory already exists
- **THEN** fail with error message
- **AND** suggest renaming existing archive or using different date

### Requirement: Skill Output

The skill SHALL provide clear feedback about the archive operation.

#### Scenario: Archive complete with sync

- **WHEN** archive completes after syncing specs
- **THEN** display summary:
  - Specs synced (from `/opsx:sync` output)
  - Change archived to location
  - Schema that was used

#### Scenario: Archive complete without sync

- **WHEN** archive completes without syncing specs
- **THEN** display summary:
  - Note that specs were not synced (if applicable)
  - Change archived to location
  - Schema that was used

#### Scenario: Archive complete with warnings

- **WHEN** archive completes with incomplete artifacts or tasks
- **THEN** include note about what was incomplete
- **AND** suggest reviewing if archive was intentional

### Requirement: OPSX Archive Follows CLI Jira Policy
Archive skill SHALL `operationGuidance`가 CLI-managed naming 또는 metadata를 요구할 때 최종 move를 CLI archive command에 위임하도록 안내한다.

#### Scenario: CLI archive 동작 사용
- **WHEN** 선택된 change를 archive한다
- **AND** `operations.archive.guidance`가 CLI-managed Jira archive를 요구한다
- **THEN** skill은 spec sync 결정을 먼저 완료하고 `openspec archive <name> --skip-specs --yes --require-jira`를 사용한다
- **AND** `--skip-specs`로 이미 적용한 delta를 중복 적용하지 않는다
- **AND** archive completion summary에 CLI가 출력한 Jira key와 archive path를 포함한다

#### Scenario: 필수 Jira key 누락
- **WHEN** CLI가 필수 Jira key 누락을 보고한다
- **THEN** skill은 사용자에게 key를 요청하고 `--jira <key>`로 다시 실행한다
- **AND** 다른 CLI 실패에는 metadata를 잃는 manual move로 fallback하지 않는다

### Requirement: OPSX Archive Auxiliary Metadata Summary
`/opsx:archive` skill SHALL archive directory name을 primary trace key로 사용하고 `.openspec.yaml` Jira metadata를 보조 정보로 다룬다.

#### Scenario: Archive path와 metadata summary
- **WHEN** skill이 Jira key가 있는 change를 archive한다
- **THEN** summary는 Jira key, archive path, metadata 기록 여부를 표시한다
- **AND** Jira data는 archive directory name 검색성과 `.openspec.yaml` 구조화 metadata 양쪽에 남을 수 있음을 설명한다
