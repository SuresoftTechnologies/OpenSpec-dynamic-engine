## MODIFIED Requirements

### Requirement: Team Capability Naming Convention
OpenSpec SHALL `/`로 구분된 세 segment로 구성되고 각 segment가 kebab-case인 팀 capability 경로 규칙을 지원한다.

#### Scenario: 팀 capability 경로 허용
- **WHEN** 사용자가 `order-payment/refund-api/timeout-fix` ID로 capability를 proposal 또는 spec path에 작성한다
- **THEN** 시스템은 해당 ID를 유효한 capability 경로로 허용한다
- **AND** main spec은 `openspec/specs/order-payment/refund-api/timeout-fix/spec.md`에 위치한다
- **AND** delta spec은 change의 `specs/order-payment/refund-api/timeout-fix/spec.md`에 위치한다

#### Scenario: 잘못된 팀 capability 경로 거부
- **WHEN** 사용자가 대문자, 공백, 빈 segment, underscore 구분자, 또는 정확히 세 개가 아닌 segment를 포함한 팀 capability를 작성하거나 검증한다
- **THEN** 시스템은 해당 capability 경로를 거부한다
- **AND** `대분류/소분류/주제` 규칙과 `order-payment/refund-api/timeout-fix` 예시를 포함한 guidance를 표시한다
