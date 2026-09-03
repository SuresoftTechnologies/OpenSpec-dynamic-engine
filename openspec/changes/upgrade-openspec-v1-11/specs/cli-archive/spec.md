## ADDED Requirements

### Requirement: v1.11 archive에서 팀 Jira 추적 보존
Archive command는 `engine-spec-driven` change를 처리할 때 v1.11의 검증, staging, rollback, Store와 JSON 동작을 유지하면서 팀 Jira archive 이름과 보조 metadata를 SHALL 보존해야 한다.

#### Scenario: Jira key가 branch에 있는 성공적인 archive
- **WHEN** 팀 schema change가 Jira key를 포함한 작업 branch에서 archive된다
- **THEN** destination은 `YYYY-MM-DD_<JIRA-KEY>_<change-name>` 형식을 사용한다
- **AND** archived `.openspec.yaml`에는 Jira key와 branch source가 보존된다
- **AND** main spec 적용과 change 이동은 하나의 안전한 archive 흐름으로 완료된다

#### Scenario: archive 중 파일 이동 실패
- **WHEN** Jira destination을 사용하는 archive가 spec 적용 뒤 최종 이동에 실패한다
- **THEN** 시스템은 v1.11 archive rollback 정책에 따라 main spec과 change 상태를 복구한다

#### Scenario: JSON archive 결과
- **WHEN** 사용자가 JSON 출력으로 팀 schema change를 archive한다
- **THEN** 결과에는 archive destination과 resolve된 Jira 정보를 구조화해 포함한다
- **AND** 사람용 Jira 로그를 JSON stdout에 섞지 않는다

