## Purpose

팀 승인 OpenSpec CLI의 설치, 프로젝트별 팀 설정 적용, 생성물 갱신과 검증을 한 번의 재현 가능한 사용자 흐름으로 제공한다.

## ADDED Requirements

### Requirement: 팀 OpenSpec 원클릭 설치
팀 installer는 사용자가 하나의 명령으로 승인된 팀 OpenSpec CLI를 설치하고 대상 저장소에 팀 설정을 적용할 수 있도록 SHALL 제공해야 한다.

#### Scenario: 대상 저장소를 지정한 최초 설치
- **WHEN** 사용자가 팀 OpenSpec source와 대상 저장소를 지정해 installer를 실행한다
- **THEN** installer는 요구 Node와 고정된 package manager를 확인하고 CLI를 build/install한다
- **AND** 대상 저장소에 팀 config와 schema를 적용한다
- **AND** 생성된 Agent/Skill 파일을 현재 CLI 기준으로 갱신한다
- **AND** 최종 CLI 버전, 실행 파일 경로와 검증 결과를 표시한다

#### Scenario: 동일 명령 재실행
- **WHEN** 사용자가 이미 설치된 같은 팀 버전과 대상 저장소에 installer를 다시 실행한다
- **THEN** installer는 기존 사용자 파일을 손상하지 않고 같은 최종 상태를 만든다
- **AND** 변경할 내용과 그대로 유지한 내용을 구분해 표시한다

### Requirement: 팀 설정의 안전한 적용
팀 installer는 기존 프로젝트 설정을 추적 가능한 방식으로 보존하면서 팀 preset을 SHALL 적용해야 한다.

#### Scenario: 기존 config가 있는 저장소
- **WHEN** 대상 저장소에 `openspec/config.yaml`이 이미 존재한다
- **THEN** installer는 변경 전 내용이 다를 때만 timestamp가 포함된 backup을 만든다
- **AND** 적용 후 `engine-spec-driven` schema와 프로젝트 설정을 검증한다

### Requirement: 팀 배포판 업데이트 경계
팀 OpenSpec 배포판은 공식 npm 최신 버전 확인으로 팀 커스텀 CLI가 자동 교체되지 않도록 MUST 보호해야 한다.

#### Scenario: 프로젝트 Skill 갱신
- **WHEN** installer가 대상 저장소에서 `openspec update`를 실행한다
- **THEN** 현재 설치된 팀 CLI가 프로젝트 생성물을 갱신한다
- **AND** 공식 npm 패키지 자동 설치나 교체는 수행하지 않는다
