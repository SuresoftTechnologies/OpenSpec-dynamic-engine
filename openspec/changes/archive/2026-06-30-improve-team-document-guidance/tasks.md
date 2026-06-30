## 1. 프리셋 지침 강화

- [x] 1.1 `docs/team-config/engine.config.yaml`의 공통 context에 자연스러운 한국어, 두괄식 서술, 짧은 문단 원칙을 추가한다.
- [x] 1.2 `docs/team-config/engine.config.yaml`의 proposal rules에 `Why`, `What Changes`, `Impact` 역할 분리와 중복 방지 지침을 추가한다.
- [x] 1.3 `docs/team-config/engine.config.yaml`의 design/specs/tasks rules에 proposal 문체와 용어를 이어받는 지침을 추가한다.
- [x] 1.4 `docs/team-config/engine-spec-driven/schema.yaml`의 proposal instruction에 두괄식 Why, 자연스러운 한국어, section 중복 방지 지침을 추가한다.
- [x] 1.5 `docs/team-config/engine-spec-driven/schema.yaml`의 design/specs/tasks instruction에 proposal 피드백 전파 지침을 추가한다.

## 2. 테스트 보강

- [x] 2.1 dynamic-engine preset instruction 테스트에 새 문서 품질 marker가 포함되는지 검증한다.
- [x] 2.2 built-in instruction의 핵심 문구가 그대로 유지되는지 기존 테스트 기대값을 보존한다.
- [x] 2.3 generated skill/command template에 팀 정책 문구가 hardcode되지 않는지 기존 minimalism 테스트를 유지한다.

## 3. 검증

- [x] 3.1 `openspec validate improve-team-document-guidance --type change`로 delta spec 구조를 검증한다.
- [x] 3.2 관련 unit test를 실행해 프리셋 instruction과 template minimalism 회귀를 확인한다.
- [x] 3.3 구현 후 task checkbox는 프리셋 변경과 테스트 통과가 끝난 뒤에만 완료 처리한다.
