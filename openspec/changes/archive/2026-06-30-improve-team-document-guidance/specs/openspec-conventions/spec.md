## MODIFIED Requirements

### Requirement: Korean OpenSpec Documents
OpenSpec SHALL dynamic-engine config preset이 적용된 repository에서 OpenSpec 문서를 한글로 작성하도록 요구한다.

#### Scenario: 한글 문서 작성
- **WHEN** 사용자가 proposal, design, tasks, spec 문서를 생성하거나 갱신한다
- **THEN** 시스템은 설명 문장과 리뷰 대상 본문을 한글로 작성하도록 안내한다
- **AND** command, path, config key, code identifier, OpenSpec parser keyword는 원문을 허용한다

#### Scenario: 자연스러운 한국어 문체
- **WHEN** 사용자가 proposal, design, tasks, spec 문서를 생성하거나 갱신한다
- **THEN** 시스템은 영문을 직역한 듯한 번역투를 피하고 사람이 읽기 쉬운 자연스러운 한국어로 작성하도록 안내한다
- **AND** 시스템은 문장을 짧게 유지하고 한 문단에 여러 논점을 섞지 않도록 안내한다

#### Scenario: Proposal Why 두괄식 작성
- **WHEN** 사용자가 proposal의 `Why` section을 생성하거나 갱신한다
- **THEN** 시스템은 첫 문장에 변경의 결론과 필요한 이유를 먼저 쓰도록 안내한다
- **AND** 시스템은 배경 설명과 세부 근거를 그 뒤에 배치하도록 안내한다

#### Scenario: Proposal section 역할 분리
- **WHEN** 사용자가 proposal의 `What Changes`와 `Impact` section을 생성하거나 갱신한다
- **THEN** 시스템은 `What Changes`에는 변경될 동작, 산출물, 검증 방식만 쓰도록 안내한다
- **AND** 시스템은 `Impact`에는 영향 범위, 바뀌지 않는 것, 운영/테스트 영향만 쓰도록 안내한다
- **AND** 시스템은 두 section에 같은 내용을 반복하지 않도록 안내한다

#### Scenario: Proposal 피드백의 문서 묶음 적용
- **WHEN** proposal에 대해 문체, 구조, 용어 피드백이 제기된다
- **THEN** 시스템은 같은 change의 design, specs, tasks에도 같은 기준을 적용하도록 안내한다
- **AND** 시스템은 proposal에서 정한 핵심 용어와 문제 정의를 다른 artifact가 이어받도록 안내한다

#### Scenario: 영문 template 잔여 문구 검출
- **WHEN** OpenSpec 문서에 scaffold template의 영문 placeholder 또는 명백한 영문 설명문이 남아 있다
- **THEN** 시스템은 한글 작성을 요구하는 warning 또는 validation issue를 표시한다

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

#### Scenario: 문서 품질 정책은 프리셋 지침으로 추가
- **WHEN** dynamic-engine 팀이 자연스러운 한국어, 두괄식 Why, section 중복 방지 같은 문서 품질 정책을 강화한다
- **THEN** 시스템은 해당 정책을 config `context`/`rules`와 project-local schema artifact instruction에 추가 지침으로 둔다
- **AND** generated workflow skill template에는 repository별 문서 품질 문구를 hardcode하지 않는다
- **AND** 기존 `spec-driven` schema의 artifact instruction은 변경하지 않는다
