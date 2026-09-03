## Purpose

팀 승인 OpenSpec CLI의 신규 설치와 기존 설치 업데이트를 구분하고, 프로젝트별 팀 설정 적용, 생성물 갱신과 검증을 재현 가능한 사용자 흐름으로 제공한다.

## ADDED Requirements

### Requirement: 팀 OpenSpec 원클릭 설치

팀 installer는 사용자가 하나의 명령으로 승인된 팀 OpenSpec CLI를 설치하고 대상 저장소에 팀 설정을 적용할 수 있도록 SHALL 제공해야 한다.

#### Scenario: 대상 저장소를 지정한 최초 설치

- **WHEN** 사용자가 팀 OpenSpec source와 대상 저장소를 지정해 installer를 실행한다
- **THEN** installer는 요구 Node와 고정된 package manager를 확인하고 CLI를 build/install한다
- **AND** 대상 저장소에 팀 config와 schema를 적용한다
- **AND** 생성된 Agent/Skill 파일을 현재 CLI 기준으로 갱신한다
- **AND** 최종 CLI 버전, 실행 파일 경로와 검증 결과를 표시한다

#### Scenario: 기존 팀 설치가 감지된 신규 설치 요청

- **WHEN** installer skill이 이미 설치된 `suresoft-dynamic-engine` 배포판을 확인한다
- **THEN** 신규 설치 명령을 실행하지 않고 updater skill로 전환한다
- **AND** 기존 설치에서 확인할 수 있는 정보를 사용자에게 다시 묻지 않는다

### Requirement: 기존 팀 설치 업데이트

팀 updater는 이전 팀 OpenSpec 설치의 상태를 읽기 전용으로 확인하고 현재 source checkout으로 재설치하는 흐름을 SHALL 제공해야 한다.

#### Scenario: link 설치 자동 탐색

- **WHEN** 기존 전역 package가 팀 source repository에 연결된 link 설치다
- **THEN** updater는 설치 버전, 설치 방식, 실행 파일과 source repository를 자동으로 확인한다
- **AND** 사용자가 별도로 요청하지 않으면 기존 설치 방식을 유지한다

#### Scenario: target이 지정되지 않은 업데이트 요청

- **WHEN** updater가 source와 설치 방식을 확인했지만 대상 프로젝트를 확인할 수 없다
- **THEN** CLI만 업데이트할지 프로젝트 config와 Skill도 갱신할지 사용자에게 묻는다

#### Scenario: 업데이트 실행

- **WHEN** 필요한 입력과 source checkout이 확정되어 updater가 팀 설치 스크립트를 실행한다
- **THEN** 현재 source 버전으로 CLI를 build/install한다
- **AND** target이 있으면 팀 config, schema와 생성된 Skill을 갱신한다
- **AND** 이전 버전과 새 버전, source commit, 실행 경로와 검증 결과를 표시한다

### Requirement: 업데이트 전 source와 spec 보호

팀 updater는 source checkout과 대상 spec을 변경하기 전에 보존 상태와 적용 범위를 SHALL 확인해야 한다.

#### Scenario: source가 fast-forward할 수 없는 상태

- **WHEN** source checkout에 미커밋 변경이 있거나 tracking branch가 분기되었다
- **THEN** updater는 stash, reset, branch 전환 또는 충돌 해소를 자동으로 수행하지 않는다
- **AND** 현재 상태와 사용자의 결정이 필요한 항목을 표시한다

#### Scenario: legacy spec 경로가 발견된 target

- **WHEN** 대상 저장소의 dry-run에서 legacy underscore spec 경로가 발견된다
- **THEN** updater는 전체 변환표와 target Git 상태를 먼저 표시한다
- **AND** 명시적 migration 요청이나 사용자 승인 전에는 spec을 이동하지 않는다

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
