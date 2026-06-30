## Why

이 변경은 dynamic-engine 팀 프리셋이 처음부터 읽기 쉬운 한국어 OpenSpec 문서를 만들도록 작성 지침을 강화한다.
지금은 한글 작성 규칙은 있지만 두괄식 Why, 자연스러운 문체, `What Changes`와 `Impact`의 역할 구분이 약해 Proposal 단계에서 같은 피드백이 반복된다.

## What Changes

- dynamic-engine config preset에 자연스러운 한국어, 두괄식 서술, 짧은 문단 작성 원칙을 추가한다.
- `engine-spec-driven` schema preset의 artifact별 추가 지침을 강화한다.
- Proposal 지침은 `Why` 첫 문장에 결론과 이유를 먼저 쓰도록 안내한다.
- Proposal 지침은 `What Changes`에는 변경 내용을, `Impact`에는 영향 범위와 바뀌지 않는 것을 쓰도록 역할을 나눈다.
- Design, Specs, Tasks 지침은 Proposal에서 정한 문체와 용어를 이어받고 문체 피드백을 다른 문서에도 적용하도록 안내한다.
- 프리셋 지침이 built-in artifact instruction을 대체하지 않고 추가 지침으로 유지되는지 테스트한다.

## Capabilities

### New Capabilities

### Modified Capabilities
- `config-loading`: dynamic-engine config/schema preset이 문서 품질 지침을 포함해야 한다.
- `cli-artifact-workflow`: `openspec instructions` 응답이 강화된 팀 artifact 작성 지침을 전달해야 한다.
- `openspec-conventions`: dynamic-engine 팀 문서 작성 규약에 자연스러운 한국어, 두괄식 Why, section 중복 방지 원칙을 추가한다.

## Impact

- 바뀌는 범위는 `docs/team-config`의 dynamic-engine 프리셋, 관련 OpenSpec spec, 그리고 프리셋 instruction 테스트다.
- 제품 런타임 동작, parser, artifact graph, generated skill template 구조는 바꾸지 않는다.
- 기존 OpenSpec 기본 schema와 workflow skill의 원래 동작은 유지한다.
- 이미 생성된 변경 문서는 자동으로 다시 작성되지 않는다. 새 지침은 이후 `openspec instructions ... --json`을 따르는 생성/갱신 작업부터 적용된다.
