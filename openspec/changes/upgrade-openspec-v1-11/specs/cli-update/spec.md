## ADDED Requirements

### Requirement: 팀 CLI에서 안전한 update
팀 OpenSpec CLI의 update 흐름은 프로젝트의 관리 대상 Skill을 갱신하면서 공식 배포판으로 팀 실행 파일을 자동 교체하지 않도록 MUST 보호해야 한다.

#### Scenario: 팀 installer가 update 실행
- **WHEN** 팀 installer가 대상 저장소의 생성된 Skill을 갱신한다
- **THEN** update는 현재 팀 빌드의 template을 사용한다
- **AND** 공식 npm registry를 통한 자동 self-upgrade를 수행하지 않는다

#### Scenario: 새 공식 버전 존재
- **WHEN** 공식 npm에 팀 기반 버전보다 새로운 OpenSpec이 존재한다
- **THEN** 팀 사용자는 팀 승인 절차 없이 공식 패키지로 자동 전환되지 않는다
