## Purpose

새로운 공식 OpenSpec 버전을 팀 저장소에 통합할 때 팀 커스텀 기능의 근거와 검증 지점을 빠짐없이 발견하고 보존한다.

## ADDED Requirements

### Requirement: 지속 가능한 팀 커스텀 레지스트리

팀 저장소는 각 커스텀 기능의 안정된 ID, 사용자 계약, authoritative spec, 정책/config, 구현 지점, 회귀 테스트와 예상 업스트림 충돌 지점을 연결하는 레지스트리를 SHALL 제공해야 한다.

#### Scenario: 다음 업스트림 업그레이드 조사

- **WHEN** 유지보수자나 AI가 새로운 공식 OpenSpec 버전과 팀 저장소를 비교한다
- **THEN** 루트 Agent 지침은 팀 커스텀 레지스트리를 첫 번째 보존 기준으로 안내한다
- **AND** 레지스트리의 링크를 따라 각 기능의 요구사항, 구현과 회귀 테스트를 확인할 수 있다

#### Scenario: 상세 계약의 변경

- **WHEN** 팀 커스텀 기능의 동작이나 구현 지점이 변경된다
- **THEN** 상세 동작은 해당 OpenSpec main spec에 기록한다
- **AND** 레지스트리는 변경된 근거와 검증 지점을 가리키도록 같은 change에서 갱신한다

### Requirement: 레지스트리 기반 업스트림 업그레이드

팀의 업스트림 업그레이드 흐름은 사용자가 선택한 공식 ref와 팀 기준선을 비교하고 레지스트리의 모든 커스텀 기능에 대한 보존 판정을 SHALL 남겨야 한다.

#### Scenario: 업스트림 변경 분석

- **WHEN** 사용자가 정확한 upstream tag 또는 ref를 선택한다
- **THEN** upgrader는 현재 기준선부터 선택한 ref까지의 변경과 팀 커스텀 구현 지점을 비교한다
- **AND** 각 커스텀 ID를 `preserved`, `adapted`, `removed`, `not-applicable` 중 하나로 분류한다
- **AND** 근거가 없는 기능 누락을 성공으로 처리하지 않는다

#### Scenario: 커스텀 기능 제거 가능성

- **WHEN** 새 업스트림 구조에서 팀 기능을 그대로 유지할 수 없거나 제거 후보로 판정된다
- **THEN** upgrader는 사용자 영향과 대안을 보고한다
- **AND** 명시적 사용자 승인 전에는 해당 기능을 제거하지 않는다

#### Scenario: 기준선 갱신

- **WHEN** 업스트림 통합, 팀 기능 포팅과 전체 검증이 모두 성공한다
- **THEN** 레지스트리의 공식 upstream 기준선과 관련 업그레이드 기록을 갱신한다
- **AND** 사용자 설치 갱신은 별도 `openspec-local-updater` 흐름으로 수행한다

### Requirement: 업그레이드 작업 상태 보호

업스트림 upgrader는 사용자의 기존 작업과 미병합 변경 기록을 보존하는 범위에서만 자동 작업을 SHALL 수행해야 한다.

#### Scenario: source checkout이 안전하지 않음

- **WHEN** checkout에 미커밋 변경, branch divergence 또는 확인되지 않은 upstream ref가 있다
- **THEN** upgrader는 merge, rebase, reset, stash 또는 branch 전환을 자동 수행하지 않는다
- **AND** 안전한 전용 branch 또는 worktree를 준비하는 데 필요한 사용자 결정을 요청한다

#### Scenario: 업그레이드 PR이 아직 미병합

- **WHEN** 업그레이드 구현과 검증은 완료됐지만 관련 PR이 아직 병합되지 않았다
- **THEN** 완료 change는 active 상태로 유지한다
- **AND** PR 병합을 확인한 뒤 archive하여 delta spec을 main spec으로 승격한다
