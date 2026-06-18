## ADDED Requirements

### Requirement: Jira Key Archive Directory Name
Archive command SHALL 팀 Jira/archive 정책이 설정된 repository에서 Jira key가 확인된 change를 Jira key가 포함된 archive directory name으로 이동한다.

#### Scenario: Branch에서 Jira key 추론
- **WHEN** 사용자가 change를 archive한다
- **AND** 현재 Git branch에 기본 Jira key 형식과 일치하는 key가 있다
- **AND** 팀 archive naming 정책이 설정되어 있다
- **THEN** archive command는 해당 key를 archive directory name에 포함한다
- **AND** 보조 metadata를 기록하는 경우 `jira.source`를 `branch`로 저장한다
- **AND** archive summary에 Jira key와 archive path를 포함한다

#### Scenario: 필수 Jira key 입력 요청
- **WHEN** 사용자가 Jira key가 확인되지 않은 change를 archive한다
- **AND** 팀 정책이 archive 시 Jira key를 요구한다
- **THEN** archive command는 사용자에게 Jira key를 입력받는다
- **AND** 입력받은 key를 archive directory name에 포함한다
- **AND** 보조 metadata를 기록하는 경우 `jira.source`를 `prompt`로 저장한다

#### Scenario: Jira key가 필수가 아님
- **WHEN** 사용자가 Jira key가 확인되지 않은 change를 archive한다
- **AND** 팀 정책이 archive 시 Jira key를 요구하지 않는다
- **THEN** archive command는 기존 `YYYY-MM-DD-<change-name>` naming으로 archive를 계속 진행한다

### Requirement: Jira Auxiliary Metadata Preservation
Archive command SHALL Jira key를 archive directory name에 포함하면서 `.openspec.yaml`의 Jira metadata도 보조 정보로 보존할 수 있다.

#### Scenario: 보조 metadata 기록
- **WHEN** archive command가 archive directory name에 사용할 Jira key를 resolve한다
- **THEN** 시스템은 `.openspec.yaml`에 `jira.key`와 `jira.source`를 기록할 수 있다
- **AND** change directory 이동 시 `.openspec.yaml`을 함께 보존한다
- **AND** `.openspec.yaml`의 기존 Jira metadata는 archive key의 입력 source로 사용하지 않는다
