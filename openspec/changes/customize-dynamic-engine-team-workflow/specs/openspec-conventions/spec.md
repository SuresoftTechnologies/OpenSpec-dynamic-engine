## ADDED Requirements

### Requirement: Team Policy Dynamic Instruction Source
OpenSpec SHALL dynamic-engine 팀별 artifact 작성 및 apply 구현 정책을 기존 config, schema, dynamic instruction 응답을 통해 전달한다.

#### Scenario: Artifact policy source of truth
- **WHEN** repository가 `openspec/config.yaml`의 `context`와 `rules`로 문서 작성 정책을 설정한다
- **THEN** OpenSpec은 artifact 생성 시점의 `openspec instructions <artifact> --json` 응답을 통해 해당 정책을 안내한다
- **AND** generated skill template 본문은 repository별 artifact 정책을 중복으로 hardcode하지 않는다

#### Scenario: Apply policy source of truth
- **WHEN** repository가 project-local schema의 `apply.instruction`으로 구현 정책을 설정한다
- **THEN** OpenSpec은 implementation 시작 시점의 `openspec instructions apply --json` 응답을 통해 해당 정책을 안내한다
- **AND** generated apply skill은 CLI가 반환한 dynamic instruction을 실행 지침으로 사용한다

#### Scenario: Config and schema 변경 반영
- **WHEN** repository의 `openspec/config.yaml` 또는 `openspec/schemas/<name>/schema.yaml` 정책이 변경된다
- **THEN** 다음 `openspec instructions ... --json` 호출은 변경된 정책을 반영한다
- **AND** 사용자는 skill file을 직접 수정하지 않아도 된다

### Requirement: Team Capability Naming Convention
OpenSpec SHALL `_`로 구분된 세 segment로 구성되고 각 segment가 kebab-case인 팀 capability 이름 규칙을 지원한다.

#### Scenario: 팀 capability 이름 허용
- **WHEN** 사용자가 `order-payment_refund-api_fix-timeout` 이름으로 capability를 proposal 또는 spec path에 작성한다
- **THEN** 시스템은 해당 이름을 유효한 capability 이름으로 허용한다
- **AND** `order-payment`, `refund-api`, `fix-timeout`을 `_`로 구분된 kebab-case segment로 처리한다

#### Scenario: 잘못된 팀 capability 이름 거부
- **WHEN** 사용자가 대문자, 공백, 빈 segment, 또는 kebab-case가 아닌 segment를 포함한 팀 형식 capability 이름을 작성하거나 검증한다
- **THEN** 시스템은 해당 capability 이름을 거부한다
- **AND** `order-payment_refund-api_fix-timeout` 예시를 포함한 guidance를 표시한다

### Requirement: Korean OpenSpec Documents
OpenSpec SHALL dynamic-engine config preset이 적용된 repository에서 OpenSpec 문서를 한글로 작성하도록 요구한다.

#### Scenario: 한글 문서 작성
- **WHEN** 사용자가 proposal, design, tasks, spec 문서를 생성하거나 갱신한다
- **THEN** 시스템은 설명 문장과 리뷰 대상 본문을 한글로 작성하도록 안내한다
- **AND** command, path, config key, code identifier, OpenSpec parser keyword는 원문을 허용한다

#### Scenario: 영문 template 잔여 문구 검출
- **WHEN** OpenSpec 문서에 scaffold template의 영문 placeholder 또는 명백한 영문 설명문이 남아 있다
- **THEN** 시스템은 한글 작성을 요구하는 warning 또는 validation issue를 표시한다

### Requirement: Team Apply Implementation Guidance
OpenSpec SHALL dynamic-engine schema preset이 적용된 repository에서 apply 구현 순서를 TDD와 task 완료 기준에 맞게 안내한다.

#### Scenario: TDD 구현 순서 안내
- **WHEN** 사용자가 `openspec instructions apply --json`로 구현 지침을 요청한다
- **AND** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 task 수행 순서를 테스트 우선으로 안내한다
- **AND** 실패하는 테스트를 먼저 작성하도록 안내한다
- **AND** 테스트가 존재한 뒤 구현을 시작하도록 안내한다
- **AND** 구현 전에 테스트 의도와 기대 동작을 정리하도록 안내한다

#### Scenario: 한글 주석 안내
- **WHEN** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 테스트 목적과 동작을 설명하는 한글 주석을 작성하도록 안내한다
- **AND** 중요한 로직과 함수에는 한글 주석을 작성하도록 안내한다

#### Scenario: 테스트 출처 추적 주석 안내
- **WHEN** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 생성되는 테스트 바로 앞에 고정된 문서형 주석을 작성하도록 안내한다
- **AND** 주석은 테스트의 목적, 출처 spec scenario, 기대 동작을 포함하도록 안내한다
- **AND** 출처 spec scenario는 `<spec path> > Requirement: <이름> > Scenario: <이름>` 형식으로 작성하도록 안내한다

#### Scenario: Task 완료 기준 안내
- **WHEN** change가 `engine-spec-driven` schema를 사용한다
- **THEN** 시스템은 구현과 테스트 통과가 끝난 뒤에만 task를 완료 처리하도록 안내한다

### Requirement: Team Jira Archive Naming
OpenSpec SHALL Jira issue key가 확인된 archived change를 `YYYY-MM-DD_<JIRA-KEY>_<change-name>` directory name으로 저장할 수 있다.

#### Scenario: Jira key가 있는 archive naming
- **WHEN** change가 Jira key `CT2606-616`과 연결된 상태로 archive된다
- **THEN** 시스템은 archive directory name을 `YYYY-MM-DD_CT2606-616_<change-name>` 형식으로 만든다
- **AND** 사용자는 archive directory 목록과 파일 검색에서 Jira key로 해당 change를 찾을 수 있다

#### Scenario: Jira key가 없는 archive naming fallback
- **WHEN** Jira key가 확인되지 않았고 팀 정책이 Jira key를 필수로 요구하지 않는다
- **THEN** 시스템은 기존 `YYYY-MM-DD-<change-name>` archive naming으로 fallback할 수 있다
- **AND** archive 작업은 Jira key 부재만으로 실패하지 않는다

### Requirement: Team Jira Auxiliary Metadata
OpenSpec SHALL archive directory name을 primary trace key로 사용하되, change metadata에도 Jira issue key를 보조 정보로 보존할 수 있다.

#### Scenario: Jira metadata 저장
- **WHEN** change가 Jira key `ABC-123`과 연결된다
- **THEN** 시스템은 `.openspec.yaml`의 `jira.key`에 key를 저장할 수 있다
- **AND** `jira.source`에는 `branch`, `prompt` 중 하나로 source를 저장한다

#### Scenario: Jira metadata 검증
- **WHEN** change metadata에 Jira key가 포함되어 있다
- **THEN** 시스템은 기본 `PROJECT-123` style pattern으로 key를 검증한다
- **AND** source가 허용된 값이 아니면 metadata를 거부한다

### Requirement: Minimal Core Change Principle
OpenSpec SHALL 팀 workflow 정책을 기존 extension point에 얹어 원본 코드 변경 범위를 최소화한다.

#### Scenario: 기존 dynamic instruction 경로 활용
- **WHEN** 팀 artifact 또는 apply 정책을 agent에게 전달한다
- **THEN** 시스템은 기존 `openspec instructions ... --json` 응답을 우선 사용한다
- **AND** apply 정책은 새 config parser가 아니라 기존 schema `apply.instruction`을 사용한다
- **AND** 별도 workflow schema engine이나 repository별 script hook을 새로 요구하지 않는다

#### Scenario: 역할 구분
- **WHEN** 팀 정책이 적용된다
- **THEN** config는 artifact context/rules 전달 역할을 한다
- **AND** project-local schema는 apply instruction 전달 역할을 한다
- **AND** validator와 archive CLI는 필요한 최소 enforcement 역할을 한다

#### Scenario: 팀 schema는 기본 schema를 대체하지 않고 확장
- **WHEN** dynamic-engine 팀 schema preset이 built-in `spec-driven` schema와 같은 artifact를 정의한다
- **THEN** preset은 built-in artifact instruction의 기본 작성 지침을 유지한다
- **AND** 팀별 한글 문서, capability naming, TDD, 테스트 추적성 주석 정책은 추가 지시로 분리한다
- **AND** OpenSpec 기본 parser 주의사항과 task tracking 규칙은 팀 정책 때문에 축약되지 않는다

### Requirement: Team Config And Schema Preset Convention
OpenSpec SHALL 팀 정책 preset을 자동 설치 기능이 아니라 복사 가능한 config/schema 예시로 제공할 수 있다.

#### Scenario: dynamic-engine preset manual opt-in
- **WHEN** dynamic-engine 팀 정책을 새 repository에 적용한다
- **THEN** 사용자는 source repository의 `docs/team-config/engine.config.yaml`을 대상 repository의 `openspec/config.yaml`로 복사한다
- **AND** 사용자는 source repository의 `docs/team-config/engine-spec-driven/`을 대상 repository의 `openspec/schemas/engine-spec-driven/`로 복사한다
- **AND** preset은 실제 OpenSpec config/schema key만 포함한다

#### Scenario: No automatic preset install
- **WHEN** 사용자가 `openspec init`, `openspec update`, 또는 skill install을 실행한다
- **THEN** 시스템은 dynamic-engine preset을 자동으로 복사하지 않는다
- **AND** 기존 repository config/schema를 팀 정책으로 자동 변경하지 않는다
