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
- **THEN** the agent moves the change to `openspec/changes/archive/YYYY-MM-DD-<name>/`
- **AND** displays success message with archived location

#### Scenario: Change selection prompt

- **WHEN** agent executes `/opsx:archive` without specifying a change
- **THEN** the agent prompts user to select from available changes
- **AND** shows only active changes (excludes archive/)

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
- **AND** if user confirms, execute `/opsx:sync` logic
- **AND** proceed with archive regardless of sync choice

#### Scenario: No delta specs

- **WHEN** agent checks for delta specs
- **AND** no `specs/` directory or no spec files exist
- **THEN** proceed without sync prompt

### Requirement: Archive Process

The skill SHALL move the change to the archive folder with date prefix.

#### Scenario: Successful archive

- **WHEN** archiving a change
- **THEN** create `archive/` directory if it doesn't exist
- **AND** generate target name as `YYYY-MM-DD-<change-name>` using current date
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
`/opsx:archive` skill SHALL Jira archive naming과 보조 metadata 처리를 CLI archive command의 동작에 위임하도록 안내한다.

#### Scenario: CLI archive 동작 사용
- **WHEN** 선택된 change를 archive한다
- **AND** repository에 팀 Jira/archive 정책이 설정되어 있다
- **THEN** skill은 `openspec archive`가 branch, prompt, optional fallback 순서로 Jira key를 resolve함을 안내한다
- **AND** archive completion summary에 CLI가 출력한 Jira key와 archive path를 포함한다

#### Scenario: Jira key optional fallback
- **WHEN** 선택된 change에서 Jira key를 찾지 못했다
- **AND** 팀 정책이 Jira key를 요구하지 않는다
- **THEN** skill은 CLI archive가 기존 `archive/YYYY-MM-DD-<change-name>/` 형식으로 archive할 수 있음을 안내한다

### Requirement: OPSX Archive Auxiliary Metadata Summary
`/opsx:archive` skill SHALL archive directory name을 primary trace key로 사용하고 `.openspec.yaml` Jira metadata를 보조 정보로 다룬다.

#### Scenario: Archive path와 metadata summary
- **WHEN** skill이 Jira key가 있는 change를 archive한다
- **THEN** summary는 Jira key, archive path, metadata 기록 여부를 표시한다
- **AND** Jira data는 archive directory name 검색성과 `.openspec.yaml` 구조화 metadata 양쪽에 남을 수 있음을 설명한다
