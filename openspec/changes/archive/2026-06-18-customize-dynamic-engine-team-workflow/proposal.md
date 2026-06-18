## Why

dynamic-engine 팀에서 OpenSpec을 사용할 때 반복되는 문서 작성 규칙, apply 구현 원칙, Jira 추적 규칙을 일관되게 적용해야 합니다. 단, 원본 OpenSpec 코드 변경은 최소화해야 하므로 이미 구현된 `openspec/config.yaml`, project-local schema, `openspec instructions ... --json`, archive CLI 경로를 우선 활용합니다.

## What Changes

**팀 capability 이름 규칙**
- From: capability 이름은 기본 kebab-case convention만 따릅니다.
- To: 팀 정책이 설정된 repository에서는 `대기능_중기능_소기능` 형식을 proposal `Capabilities`와 spec directory name에 안내하고 검증합니다.
- Reason: 대기능, 중기능, 소기능을 capability 이름에 일관되게 담아 review와 검색성을 높여야 합니다.
- Impact: artifact 작성 guidance와 validation에만 필요한 최소 변경을 추가합니다.

**OpenSpec 문서 한글 작성**
- From: 문서 언어 정책은 repository별로 선언되지 않습니다.
- To: `openspec/config.yaml`의 기존 `context`/`rules`를 이용해 proposal, design, tasks, specs 작성 시 한글 문서 작성 정책을 전달합니다.
- Reason: 팀 리뷰와 유지보수 문맥에서 문서 이해 비용을 낮춰야 합니다.
- Impact: command, code, config key, path, OpenSpec parser keyword는 원문을 유지할 수 있습니다.

**Apply TDD 및 한글 주석 정책**
- From: apply skill은 `openspec instructions apply --json`가 반환하는 schema apply instruction을 따릅니다.
- To: dynamic-engine 팀용 project-local schema의 `apply.instruction`에 TDD, 한글 주석, 테스트 의도/출처/기대 동작 주석 형식, task 완료 timing 정책을 직접 작성합니다.
- Reason: 현재 OpenSpec에 이미 구현된 schema apply instruction mechanism을 사용하면 새 `team.apply` config parser나 별도 guidance loader를 만들 필요가 없습니다.
- Impact: apply 정책은 custom schema preset을 복사한 repository에서 `openspec instructions apply --json` 응답에 그대로 포함되며, 생성된 테스트는 어떤 spec scenario에서 비롯되었는지 추적할 수 있습니다.

**Jira 이슈 추적**
- From: archive directory name은 Jira issue와 직접 연결되지 않고, change metadata에도 Jira 보조 정보가 없습니다.
- To: 팀 Jira/archive 정책이 설정된 경우 archive 시점에 branch 또는 prompt에서 Jira key를 resolve하고, archive directory name과 `.openspec.yaml` 보조 metadata에 반영합니다.
- Reason: 완료된 change를 Jira issue key로 검색하고 추적할 수 있어야 합니다.
- Impact: Jira API 연동은 하지 않고, 기본 `PROJECT-123` style key 형식만 검증합니다.

**dynamic-engine 팀 preset**
- From: 팀 정책을 새 repository에 적용하려면 사용자가 `config.yaml`, rules, schema apply instruction 구조를 직접 기억해 작성해야 합니다.
- To: 현재 repository에 복사 가능한 dynamic-engine 팀용 `config.yaml` preset과 `engine-spec-driven` schema preset을 제공합니다.
- Reason: 팀 정책 적용 실수를 줄이면서도 `openspec init` 기본 동작과 원본 OpenSpec code path 변경은 최소화해야 합니다.
- Impact: preset은 수동 opt-in 예시 파일이며, install/init/update 과정에서 자동으로 복사하거나 기존 config를 덮어쓰지 않습니다.

**기본 schema instruction 보존**
- From: `engine-spec-driven` schema preset의 artifact instruction이 built-in `spec-driven` schema보다 축약되어 기본 작성 지침 일부가 빠질 수 있습니다.
- To: `engine-spec-driven` schema preset은 built-in `spec-driven`의 proposal/specs/design/tasks/apply instruction 골자를 유지하고, dynamic-engine 팀 지시는 additive section으로 덧붙입니다.
- Reason: 팀 정책을 추가하더라도 OpenSpec 기본 품질 장치와 parser 주의사항, task tracking 규칙을 잃지 않아야 합니다.
- Impact: schema preset 유지보수 시 built-in `spec-driven`과의 drift를 쉽게 검토할 수 있고, 팀 지시는 별도 추가 문단으로 식별됩니다.

**최소 변경 원칙**
- From: 팀 정책을 generated skill/template 본문이나 새 `team.apply` config parser에 직접 크게 삽입하면 원본 OpenSpec과의 diff가 커질 수 있습니다.
- To: apply 정책은 기존 project-local schema의 `apply.instruction`을 사용하고, 새 코드 변경은 capability naming validation과 Jira archive tracking처럼 기존 옵션만으로 처리할 수 없는 부분에 집중합니다.
- Reason: 원본 OpenSpec 업데이트와의 충돌 가능성을 줄여야 합니다.
- Impact: 새 plugin/hook system, 새 workflow schema engine, 별도 policy text loader는 만들지 않습니다.

## Capabilities

### New Capabilities

### Modified Capabilities
- `config-loading`: 기존 `schema`, `context`, `rules` 옵션을 이용하는 dynamic-engine preset 사용 방식을 정의합니다.
- `cli-artifact-workflow`: artifact instructions가 기존 config context/rules와 필요한 validation을 통해 팀 문서 정책을 노출하도록 정리합니다.
- `cli-archive`: Jira key 기반 archive naming과 보조 metadata 기록을 지원합니다.
- `openspec-conventions`: 팀 정책의 source of truth, 적용 위치, 최소 변경 원칙을 정의합니다.
- `opsx-archive-skill`: archive skill이 CLI의 Jira archive 동작을 따르도록 안내합니다.

## Impact

- 영향받는 코드:
  - Capability naming/document language validation.
  - Archive command의 Jira key resolution, archive path naming, metadata write.
  - Generated skill/command template은 CLI dynamic instruction을 따르는 최소 문구만 유지.
- 영향받지 않는 코드:
  - `team.apply.tdd` 같은 새 project config parser.
  - apply instruction 전용 외부 policy file loader.
- 영향받는 문서/예시:
  - `docs/team-config/engine.config.yaml` 복사용 config preset.
  - `docs/team-config/engine-spec-driven/` 복사용 schema preset.
- 영향받는 테스트:
  - Capability naming/document language validation tests.
  - Archive command Jira naming and metadata tests.
  - Schema preset apply instruction regression tests.
  - Skill/template regression tests.
