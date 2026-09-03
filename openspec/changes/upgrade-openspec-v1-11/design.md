## Context

팀 저장소는 원본 OpenSpec v1.4.1에서 분기해 Jira 아카이브, `engine-spec-driven` 스키마, 한글 문서/TDD 지침, 팀 capability 검증과 로컬 설치 스크립트를 추가했다. 원본 v1.11은 nested capability discovery, transactional archive, Store-aware root, operation guidance, Skill 기반 도구 통합과 업데이트 확인을 도입했기 때문에 기존 커스텀 코드를 그대로 덮어쓰면 안전성 개선을 잃거나 공식 패키지가 팀 CLI를 교체할 수 있다.

제품 저장소 `engine`에는 legacy main spec 3개, `ct-maven`에는 legacy main spec 11개와 활성 delta spec 1개가 있다. `ct-maven`의 기존 checkout에는 별도 미커밋 작업이 있으므로 `origin/master` 기반 worktree에서 마이그레이션한다.

## Goals / Non-Goals

**Goals:**

- v1.11.0을 기준선으로 삼고 최신 원본 동작과 테스트를 유지한다.
- 팀 커스텀 기능을 v1.11의 extension point와 트랜잭션 경계에 맞게 포팅한다.
- 팀 capability를 정확한 3-depth `대기능/중기능/소기능` 경로로 생성하고 검증한다.
- 제품 저장소의 main spec과 활성 delta spec을 결정적으로 이동한다.
- 한 명령으로 팀 CLI build/link, 팀 config 적용, Skill 갱신과 검증을 수행한다.
- `engine`의 격리된 임시 브랜치에서 실제 사용자 업그레이드와 신규 nested spec 생성을 검증한다.

**Non-Goals:**

- archived change의 역사적 spec 경로를 다시 작성하지 않는다.
- Store 베타 기능을 제품 저장소 운영 모델로 즉시 전환하지 않는다.
- 사내 npm registry나 별도 package scope를 이번 변경에서 새로 구축하지 않는다.
- 제품 코드나 Maven 동작은 변경하지 않는다.

## Decisions

### v1.11.0 tag를 merge 기준선으로 사용

팀 커밋을 새 원본 위에 다시 작성하는 rebase보다 `v1.11.0` tag를 merge한다. 기존 팀 변경의 이력과 원본 업그레이드 경계를 보존하고, 이후 원본 릴리스 병합도 같은 방식으로 반복할 수 있기 때문이다. 충돌은 원본 v1.11 구현을 우선한 뒤 팀 기능을 최신 구조에 다시 연결한다.

### 팀 정책은 공개 extension point를 우선 사용

문서 품질 규칙은 `config.yaml`의 `context`와 artifact `rules`에 유지한다. 구현·아카이브 단계 지침은 v1.11의 `operations.apply.guidance`와 `operations.archive.guidance`로 이동한다. capability 형식과 Jira 필수 동작처럼 강제가 필요한 항목만 validator와 archive 명령에 남긴다.

### capability ID는 specs 루트 기준 전체 상대 경로

팀 schema에서 신규 capability ID는 정확히 세 segment를 가진 POSIX 형식 문자열로 다룬다.

```text
<대기능>/<중기능>/<소기능>
```

각 segment는 lowercase kebab-case다. 파일 시스템 접근은 `path` API를 사용하고 사용자 출력과 ID 비교에서만 `/`로 정규화한다. main spec과 delta spec은 동일한 capability 상대 경로를 사용한다.

### 마이그레이션은 main spec과 활성 delta만 원자적으로 이동

legacy ID `a_b_c`는 `a/b/c`로 일대일 변환한다. 실행 전에 전체 변환표, 잘못된 legacy 이름, 대상 충돌과 중복 ID를 검사한다. 문제가 하나라도 있으면 파일을 이동하지 않는다. main spec과 활성 delta spec의 경로 및 명시적 참조를 같은 커밋에서 갱신한다. archived change는 보존한다.

### 설치와 프로젝트 갱신을 팀 스크립트가 통제

개발·검증 단계에서는 source `link` 설치를 유지하되 저장소 `packageManager`에 고정된 pnpm을 사용한다. installer는 공식 update check를 비활성화한 환경에서 대상 프로젝트의 `openspec update`를 실행하고, config를 백업·적용한 뒤 schema와 생성물을 검증한다. 공식 npm 최신 버전은 정보로만 다루며 팀 CLI를 자동 교체하지 않는다.

### Jira는 v1.11 archive 트랜잭션 안에서 처리

Jira key 해석과 메타데이터 준비는 archive destination 확정 전에 수행한다. 실제 change와 metadata 이동은 v1.11의 staging/rollback 경계를 따른다. Store를 대상으로 하더라도 Jira branch는 사용자가 명령을 시작한 작업 저장소에서 조회한다. JSON 모드에서는 구조화된 Jira 필드를 출력하고 stdout에 사람용 로그를 섞지 않는다.

## Risks / Trade-offs

- [원본과 팀 코드의 병합 충돌] → 원본 테스트를 먼저 복구하고 팀 기능별 집중 테스트를 추가한다.
- [동일 의미의 flat/nested spec 중복] → 마이그레이션 전 충돌 검사를 하고 제품 저장소에서는 한 번에 전체 main spec을 이동한다.
- [활성 delta가 이전 main 경로를 계속 참조] → `ct-maven`의 활성 delta를 main spec과 함께 이동하고 archive 전 검증한다.
- [공식 self-update가 커스텀 기능을 제거] → 팀 빌드를 식별하고 공식 자동 업그레이드를 비활성화하며 installer subprocess에도 비활성화 환경을 전달한다.
- [config 덮어쓰기로 프로젝트 문맥 손실] → timestamp backup을 만들고 적용 전후 diff와 검증 결과를 남긴다.
- [Windows와 POSIX 경로 차이] → 파일 접근에는 Node path API, capability ID에는 forward slash를 사용하고 Windows 회귀 테스트를 둔다.
- [ct-maven 사용자 작업 오염] → 기존 checkout은 그대로 두고 `origin/master` 기반 전용 worktree에서만 변경한다.

## Migration Plan

1. 팀 OpenSpec 브랜치에서 v1.11.0을 merge하고 원본 테스트를 통과시킨다.
2. Jira, 팀 validation, preset, installer를 최신 구조에 포팅한다.
3. `engine`과 `ct-maven`의 legacy spec 변환표를 검증하고 기능 브랜치에서 이동한다.
4. 최신 팀 CLI를 build/link한 뒤 두 저장소에 팀 config와 Skill을 갱신한다.
5. 격리된 `engine` 임시 브랜치에서 upgrade 명령을 실행하고 신규 change/spec이 3-depth로 생성되는지 확인한다.
6. 각 저장소의 strict validation과 Git diff를 확인한 뒤 기능 브랜치를 push하고 기본 브랜치 대상 PR을 생성한다.

롤백은 제품 저장소에서는 기능 브랜치 폐기, 팀 CLI에서는 이전 팀 tag 재설치로 수행한다. installer가 만든 config backup은 검증 실패 시 복구에 사용한다.

## Open Questions

- 사내 npm registry와 별도 package scope 도입은 이번 source-link 기반 업그레이드가 안정화된 다음 배포 개선으로 다룬다.
