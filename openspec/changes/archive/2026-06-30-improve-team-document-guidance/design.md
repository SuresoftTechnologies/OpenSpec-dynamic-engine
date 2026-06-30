## Context

dynamic-engine 팀 프리셋은 이미 `docs/team-config/engine.config.yaml`과 `docs/team-config/engine-spec-driven/schema.yaml`을 통해 한글 문서 작성, 팀 capability naming, TDD apply 지침을 전달한다.
문제는 지침이 "한글로 작성한다" 수준에 머물러 문서 품질까지 충분히 이끌지 못한다는 점이다.

피드백은 Proposal에서 가장 자주 나온다.
Proposal은 리뷰어가 처음 읽는 문서이고, 이후 Design, Specs, Tasks 문서의 문체와 용어도 여기서 결정된다.
따라서 Proposal 지침을 가장 구체적으로 강화하고, 나머지 artifact에는 Proposal에서 정한 문체와 용어를 이어받으라는 규칙을 둔다.

## Goals / Non-Goals

**Goals:**
- dynamic-engine 팀 프리셋만 강화한다.
- built-in `spec-driven` 지침과 기존 workflow skill 동작은 유지한다.
- 자연스러운 한국어, 두괄식 Why, 짧은 문단, section 간 역할 분리를 artifact instruction과 config rules에 추가한다.
- instruction 강화가 실제 CLI 응답에 드러나는지 테스트로 고정한다.

**Non-Goals:**
- 새 parser, validator, lint rule을 만들지 않는다.
- 생성된 문서의 품질을 자동 채점하지 않는다.
- 기존 active change 문서를 자동으로 재작성하지 않는다.
- generated skill template에 팀 문구를 하드코딩하지 않는다.

## Decisions

1. 프리셋 schema instruction을 주 전달 경로로 쓴다.

`docs/team-config/engine-spec-driven/schema.yaml`은 artifact별 기본 instruction 뒤에 `Dynamic-engine team additional guidance`를 이미 갖고 있다.
여기에 문서 품질 지침을 추가하면 기존 지침을 대체하지 않고 덧붙이는 현재 구조를 유지할 수 있다.

대안은 workflow skill 템플릿에 팀 문체 규칙을 넣는 것이다.
하지만 이 방식은 repository별 정책을 generated template에 hardcode하지 않는 현재 원칙과 충돌한다.

2. config preset rules에도 같은 원칙을 요약해 둔다.

`docs/team-config/engine.config.yaml`의 `context`와 `rules`는 `openspec instructions ... --json` 응답의 별도 field로 전달된다.
schema instruction만 보는 agent와 config rules까지 보는 agent의 편차를 줄이기 위해, 핵심 문체 원칙은 양쪽에 모두 둔다.

3. Proposal은 구체적으로, 나머지 artifact는 전파 규칙으로 안내한다.

Proposal에는 `Why`, `What Changes`, `Impact`의 역할을 직접 적는다.
Design, Specs, Tasks에는 Proposal에서 정한 용어와 문체를 이어받고, Proposal에 대한 문체 피드백을 다른 문서에도 적용하라는 지침을 둔다.
이렇게 하면 중복 지침을 줄이면서도 전체 문서 묶음의 톤을 맞출 수 있다.

4. 테스트는 instruction 문자열 존재와 기존 지침 보존을 확인한다.

이 변경은 프롬프트 품질 개선이므로, 핵심 검증은 instruction에 새 policy marker가 포함되는지 확인하는 것이다.
동시에 built-in instruction의 주요 문구가 계속 남아 있는지 확인해 기존 동작을 보호한다.

## Risks / Trade-offs

- 지침이 길어져 agent가 일부를 놓칠 수 있다. -> 문체 규칙은 짧고 행동 가능한 문장으로 작성한다.
- 같은 규칙이 schema와 config에 중복될 수 있다. -> schema에는 artifact별 상세 지침을, config에는 짧은 공통 제약을 둔다.
- 품질은 확률적이다. -> 자동 품질 채점 대신 생성 지침과 회귀 테스트를 먼저 강화하고, 필요할 때 별도 validation change로 확장한다.

## Migration Plan

1. `docs/team-config/engine.config.yaml`의 공통 context와 artifact별 rules를 갱신한다.
2. `docs/team-config/engine-spec-driven/schema.yaml`의 Proposal, Specs, Design, Tasks 추가 지침을 갱신한다.
3. 필요한 경우 team preset instruction 테스트에 새 policy marker를 추가한다.
4. `openspec instructions ... --json` 기반 테스트와 관련 unit test를 실행한다.

## Open Questions

- 템플릿 HTML placeholder 주석까지 한국어로 바꿀지 여부는 구현 중 결정한다.
  프롬프트 추가만으로 충분하면 템플릿 변경은 후순위로 둔다.
