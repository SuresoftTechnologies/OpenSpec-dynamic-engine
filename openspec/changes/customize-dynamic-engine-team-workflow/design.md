## Context

OpenSpec에는 이미 팀 정책을 실을 수 있는 지점이 있습니다.
- `openspec/config.yaml`: repository별 schema, context, artifact rules를 선언하는 위치.
- `openspec/schemas/<name>/schema.yaml`: project-local workflow schema를 정의하는 위치.
- schema의 `apply.instruction`: `openspec instructions apply --json`가 반환하는 apply 구현 지침.
- `openspec instructions <artifact> --json`: agent가 artifact 작성 전에 호출하는 동적 지침.
- `openspec instructions apply --json`: agent가 task 구현 전에 호출하는 동적 지침.
- validator: 생성된 proposal/spec artifact의 규칙 위반을 보고하는 위치.
- archive CLI: 완료된 change를 archive directory와 metadata로 확정하는 위치.

이 변경은 새 `team.apply` config 스위치나 별도 policy text loader를 만들지 않고, 현재 구현되어 있는 project-local schema와 `apply.instruction`을 사용해 dynamic-engine 팀 apply 정책을 전달합니다.

## Goals / Non-Goals

**Goals:**
- dynamic-engine 팀 capability naming, 한글 문서 작성, apply TDD/한글 주석/task 완료 timing, Jira archive tracking을 일관되게 적용합니다.
- artifact 작성 정책은 기존 `openspec/config.yaml`의 `context`/`rules`와 필요한 validation으로 전달합니다.
- apply 구현 정책은 project-local schema의 `apply.instruction`에 직접 작성하고, 기존 `openspec instructions apply --json` 응답으로 전달합니다.
- Jira archive tracking은 archive CLI에서 처리하고, archive skill은 CLI 동작을 따르도록 최소 안내합니다.
- dynamic-engine 팀에서 바로 복사해 사용할 수 있는 config/schema preset을 repository에 제공합니다.
- 원본 OpenSpec 변경은 기존 옵션으로 처리할 수 없는 validation/archive 영역으로 제한합니다.

**Non-Goals:**
- Jira API를 호출하거나 issue 존재 여부를 원격 검증하지 않습니다.
- TDD 수행 여부나 한글 주석 존재 여부를 정적 분석으로 강제하지 않습니다.
- `team.apply.tdd`, `team.apply.comments`, `team.apply.taskCompletion` 같은 새 config parser를 만들지 않습니다.
- config가 별도 policy text file을 지정하고 CLI가 이를 읽는 새 loader를 만들지 않습니다.
- `openspec init`, `openspec update`, skill install 과정에서 팀 preset을 자동 복사하거나 기존 config를 덮어쓰지 않습니다.
- 기존 capability 이름이나 기존 archive directory를 migration하지 않습니다.

## Decisions

**Config preset**
- `engine.config.yaml`은 현재 구현된 project config 옵션만 사용합니다.
- `schema`는 dynamic-engine 팀 schema preset인 `engine-spec-driven`을 가리킵니다.
- `context`에는 팀 공통 배경 정책을 작성합니다.
- `rules`에는 proposal, specs, design, tasks artifact별 한글 문서 작성과 capability naming guidance를 작성합니다.
- 새 `team.apply` field는 사용하지 않습니다.

**Project-local schema preset**
- `engine-spec-driven` schema preset은 built-in `spec-driven` schema를 기반으로 합니다.
- proposal/specs/design/tasks artifact 구조, template 참조, artifact instruction의 기본 골자는 기존 `spec-driven` 흐름을 유지합니다.
- built-in `spec-driven` instruction에 있는 parser 주의사항, capability/spec 작성 규칙, `MODIFIED` requirement workflow, task checkbox tracking 규칙, task verifiability guidance는 축약하지 않습니다.
- dynamic-engine 팀 지시는 각 artifact instruction 끝의 명확한 추가 section으로 덧붙입니다.
- 팀 추가 section은 한글 문서 작성, `대기능_중기능_소기능` capability naming, 테스트 우선 task 작성처럼 팀 정책에 해당하는 내용만 포함합니다.
- `apply.instruction`에 dynamic-engine 팀 구현 원칙을 직접 작성합니다.
- `apply.instruction`도 built-in apply instruction의 기본 진행 문장인 context file 확인, pending task 처리, blocker 시 중단/확인 원칙을 유지한 뒤 팀 구현 원칙을 덧붙입니다.
- 포함할 apply 원칙:
  - 실패하는 테스트를 먼저 작성합니다.
  - 테스트가 존재한 뒤 구현을 시작합니다.
  - 구현 전에 테스트 의도와 기대 동작을 정리합니다.
  - 테스트 목적과 동작을 설명하는 한글 주석을 작성합니다.
  - 중요한 로직과 함수에는 한글 주석을 작성합니다.
  - 구현과 테스트 통과가 끝난 뒤에만 task를 완료 처리합니다.

**Artifact instruction 정책**
- 한글 문서 작성 정책은 `config.yaml`의 `context`/`rules`에 작성합니다.
- 팀 capability naming 정책은 proposal/specs rules에 작성하고, validator가 위반을 보고합니다.
- 문서 언어 검증은 첫 단계에서 명백한 영문 scaffold placeholder를 warning으로 보고하는 수준으로 제한합니다.

**Apply instruction 정책**
- apply skill은 기존처럼 `openspec instructions apply --change "<name>" --json`를 호출합니다.
- CLI는 현재 구현된 흐름대로 schema의 `apply.instruction`을 반환합니다.
- dynamic-engine 팀 정책 문구는 `engine-spec-driven/schema.yaml`의 `apply.instruction`에 저장됩니다.
- 이 방식은 apply 정책을 위해 OpenSpec CLI에 새 config field나 guidance file resolution을 추가하지 않습니다.
- 테스트 생성 시 각 테스트 바로 앞에 고정된 문서형 주석 형식을 작성하도록 안내합니다.
- 주석은 테스트 목적, 출처 spec scenario, 기대 동작을 포함합니다.
- 출처는 `<spec path> > Requirement: <이름> > Scenario: <이름>` 형식으로 작성해 spec에서 테스트까지 추적할 수 있게 합니다.
- 권장 주석 형식:
  ```ts
  /**
   * 테스트 의도:
   * - 목적: <이 테스트가 보호하는 사용자/시스템 계약>
   * - 출처: <spec path> > Requirement: <이름> > Scenario: <이름>
   * - 기대 동작: <검증되는 최종 관찰 결과>
   */
  ```

**Generated skill/template 최소화**
- generated apply/propose skill 및 command template에는 repository별 팀 정책을 hardcode하지 않습니다.
- 대신 기존 흐름처럼 `openspec instructions ... --json` 응답의 `instruction`, `context`, `rules`를 따르도록 유지합니다.
- archive skill에는 CLI archive가 Jira key resolution과 metadata 기록을 처리한다는 최소 안내만 둡니다.

**Jira archive tracking**
- archive 시점에만 Jira key를 resolve합니다.
- resolution 순서:
  1. 현재 Git branch에서 기본 `PROJECT-123` style key 추출.
  2. 팀 archive 정책이 Jira key를 필수로 요구하면 prompt로 입력 요청.
  3. 필수가 아니고 key가 없으면 기존 `YYYY-MM-DD-<change-name>` naming으로 fallback.
- Jira key가 있으면 archive directory name은 `YYYY-MM-DD_<JIRA-KEY>_<change-name>` 형식을 사용합니다.
- 가능하면 `.openspec.yaml`에 `jira.key`, `jira.source: branch | prompt`를 보조 metadata로 기록합니다.
- `.openspec.yaml`의 기존 Jira metadata는 archive key의 입력 source로 사용하지 않습니다.

**dynamic-engine 팀 preset**
- repository에 `docs/team-config/engine.config.yaml` 파일을 추가합니다.
- repository에 `docs/team-config/engine-spec-driven/` schema preset directory를 추가합니다.
- 대상 repository에는 다음 위치로 복사합니다.
  - `docs/team-config/engine.config.yaml` -> `openspec/config.yaml`
  - `docs/team-config/engine-spec-driven/` -> `openspec/schemas/engine-spec-driven/`
- preset은 자동 설치 기능이 아니라 수동 opt-in 파일입니다.

## Risks / Trade-offs

**Risk:** built-in `spec-driven` schema가 업데이트되면 engine schema preset도 따라 갱신해야 할 수 있습니다.
Mitigation: preset은 built-in schema 구조를 최대한 그대로 유지하고, 차이는 `apply.instruction`과 팀 guidance에 집중합니다.

**Risk:** apply 정책이 config가 아니라 schema에 있어 처음에는 위치가 낯설 수 있습니다.
Mitigation: `engine.config.yaml`에서 `schema: engine-spec-driven`을 명시하고, preset 문서에 복사 위치를 함께 안내합니다.

**Risk:** branch에서 Jira key를 추출할 때 false positive가 생길 수 있습니다.
Mitigation: 기본 `PROJECT-123` style pattern만 사용하고, metadata에 source를 기록합니다.

**Risk:** archive naming 변경은 기존 날짜 기반 archive path와 다릅니다.
Mitigation: 팀 archive 정책이 설정된 경우에만 적용하고, Jira key가 없고 필수가 아니면 기존 naming으로 fallback합니다.

## Migration Plan

- 기존 repository는 `engine` preset을 복사하지 않으면 기존 동작을 유지합니다.
- dynamic-engine 팀 repository는 `engine.config.yaml`을 `openspec/config.yaml`로 복사합니다.
- dynamic-engine 팀 repository는 `engine-spec-driven` schema preset을 `openspec/schemas/engine-spec-driven/`로 복사합니다.
- 기존 generated skill은 `openspec update` 후에도 범용 orchestration 흐름을 유지합니다.
- 기존 active/archived changes와 capability directory는 migration하지 않습니다.
