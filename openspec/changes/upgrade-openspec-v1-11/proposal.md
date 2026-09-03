## Why

현재 팀 OpenSpec은 원본 v1.4.1을 기반으로 하므로 v1.11의 Store, nested capability, 강화된 검증·아카이브·Skill 배포 기능을 사용할 수 없다. 원본 v1.11로 기준을 올리면서 Jira 아카이브, 팀 문서 지침, 검증 정책과 설치 기능을 동일하게 보존하고, 제품 저장소의 기존 capability도 새 경로 규칙으로 이행해야 한다.

## What Changes

- 원본 OpenSpec v1.11.0을 팀 저장소에 통합한다.
- Jira 키 기반 아카이브 이름과 메타데이터, 팀 schema 선택 시의 추가 검증, 한글 문서·TDD 지침을 최신 아키텍처에 맞게 포팅한다.
- 팀 capability 경로를 `대분류/소분류/주제`의 정확한 3-depth nested 경로로 변경하고 각 segment에 kebab-case를 적용한다.
- 팀 CLI 설치와 프로젝트 설정 갱신을 한 흐름으로 제공하고, 공식 npm 업데이트가 팀 커스텀 CLI를 덮어쓰지 않도록 자체 업데이트 경계를 둔다.
- 신규 설치는 `openspec-local-installer`, 기존 팀 설치의 갱신은 `openspec-local-updater`로 역할을 분리하고 AI가 설치 상태에서 확인할 수 없는 입력만 질문한다.
- `engine`과 `ct-maven`의 기존 main spec 및 활성 delta spec을 nested 경로로 이동하고 모든 참조를 갱신한다.
- `engine` 임시 브랜치에서 실제 업그레이드 명령과 신규 nested spec 생성을 검증한다.
- **BREAKING** 팀 schema를 사용하는 신규 capability는 기존 underscore 이름 대신 정확한 3-depth 경로를 사용해야 한다.

## Capabilities

### New Capabilities

- `team/distribution/installation`: 팀에서 승인한 OpenSpec CLI의 신규 설치와 기존 설치 업데이트를 구분하고, 프로젝트 설정 적용, 생성된 Skill 갱신과 버전 확인을 안전한 사용자 흐름으로 제공한다.
- `team/spec/migration`: 기존 underscore capability를 3-depth nested 경로로 안전하게 마이그레이션하고 검증하는 동작을 정의한다.

### Modified Capabilities

- `cli-archive`: v1.11의 transactional, Store-aware, JSON 아카이브와 팀 Jira 키 동작을 함께 제공한다.
- `cli-update`: 공식 배포판 자동 업그레이드와 팀 커스텀 배포판의 프로젝트 지침 갱신을 안전하게 구분한다.
- `cli-validate`: 팀 schema에서 정확한 3-depth capability 경로와 문서 정책을 검증한다.
- `openspec-conventions`: capability 식별자가 specs 루트 기준의 전체 nested 경로라는 최신 규칙에 팀의 3-depth 제약을 추가한다.

## Impact

- `src/core/archive.ts`, Jira 메타데이터, 검증기, spec discovery와 update 흐름이 영향을 받는다.
- 팀 preset과 설치 스크립트, 생성되는 Codex/Agent Skill이 v1.11 형식으로 갱신된다.
- `engine`과 `ct-maven` 저장소의 `openspec/specs`, 활성 change, 관련 문서 경로가 변경된다.
- 기존 archived change는 역사 기록으로 유지하고 main spec 및 활성 delta만 마이그레이션한다.
- 배포·검증에는 Node.js 20.19 이상과 저장소에 고정된 pnpm 버전을 사용한다.
