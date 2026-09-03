## Purpose

기존 underscore 형식의 팀 capability를 이력 손상이나 대상 충돌 없이 표준 3-depth nested 경로로 전환한다.

## ADDED Requirements

### Requirement: Legacy capability 경로 변환
마이그레이션 도구와 절차는 `대분류_소분류_주제` legacy ID를 `대분류/소분류/주제` nested ID로 SHALL 변환해야 한다.

#### Scenario: 유효한 legacy main spec
- **WHEN** `openspec/specs/order-payment_refund-api_timeout-fix/spec.md`가 존재한다
- **THEN** 마이그레이션 결과는 `openspec/specs/order-payment/refund-api/timeout-fix/spec.md`에 위치한다
- **AND** spec 본문은 변경하지 않는다

#### Scenario: 활성 delta spec
- **WHEN** 활성 change가 legacy capability delta를 포함한다
- **THEN** delta spec은 main spec과 동일한 nested 상대 경로로 이동한다
- **AND** 해당 change의 명시적 capability 참조도 새 ID로 갱신한다

### Requirement: 충돌 없는 마이그레이션
마이그레이션은 모든 변환을 사전 검증하고 대상 충돌이 있으면 파일을 변경하지 않아야 한다는 원자성 계약을 MUST 지켜야 한다.

#### Scenario: 대상 nested spec이 이미 존재
- **WHEN** legacy ID의 변환 대상에 다른 `spec.md`가 이미 존재한다
- **THEN** 마이그레이션은 충돌 ID와 두 source를 보고한다
- **AND** 어떤 spec도 이동하지 않는다

#### Scenario: 잘못된 legacy ID
- **WHEN** legacy spec ID가 정확한 세 segment 또는 segment별 kebab-case 규칙을 만족하지 않는다
- **THEN** 마이그레이션은 해당 ID를 오류로 보고한다
- **AND** 사용자가 매핑을 수정하기 전에는 이동하지 않는다

### Requirement: Archived change 보존
마이그레이션은 과거 기록인 archived change의 capability 경로를 MUST 변경하지 않아야 한다.

#### Scenario: legacy delta가 archived change에 존재
- **WHEN** `openspec/changes/archive` 아래에 legacy capability delta가 있다
- **THEN** 마이그레이션은 그 파일과 경로를 그대로 유지한다
