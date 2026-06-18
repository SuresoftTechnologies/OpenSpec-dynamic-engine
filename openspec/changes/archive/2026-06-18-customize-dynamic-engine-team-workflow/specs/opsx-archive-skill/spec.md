## ADDED Requirements

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
