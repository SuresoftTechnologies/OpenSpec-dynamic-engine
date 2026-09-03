## ADDED Requirements

### Requirement: 팀 3-depth capability 경로 검증
Validate command는 `engine-spec-driven` schema의 main spec과 delta spec capability ID가 정확한 세 개의 kebab-case segment로 구성된 nested 경로인지 SHALL 검증해야 한다.

#### Scenario: 유효한 팀 capability 경로
- **WHEN** capability가 `order-payment/refund-api/timeout-fix` 경로에 있다
- **THEN** validator는 세 segment와 각 kebab-case 형식을 유효하게 처리한다
- **AND** Windows에서도 capability ID는 forward slash 형식으로 보고한다

#### Scenario: legacy underscore 경로
- **WHEN** 마이그레이션 이후 팀 저장소에서 `order-payment_refund-api_timeout-fix` 경로를 검증한다
- **THEN** validator는 새 경로 예시를 포함한 오류를 보고한다

#### Scenario: 깊이가 다른 nested 경로
- **WHEN** capability 경로가 두 개 이하 또는 네 개 이상의 segment를 가진다
- **THEN** validator는 정확한 3-depth 규칙을 만족하지 않는다고 보고한다

