## 1. 업스트림 기준선 통합

- [x] 1.1 `v1.11.0` tag를 팀 기능 브랜치에 merge하고 충돌 파일 목록을 확정한다.
- [x] 1.2 원본 v1.11 구현을 기준으로 충돌을 해소하고 package/version/build 설정을 정렬한다.
- [x] 1.3 v1.11에서 제거된 workspace/initiative 및 구형 generated prompt 잔여물을 정리한다.

## 2. 팀 커스텀 기능 포팅

- [x] 2.1 Jira key 해석, archive 이름과 change metadata를 v1.11 transactional archive에 통합한다.
- [x] 2.2 Jira archive의 일반 출력, JSON, Store/root, rollback 동작을 테스트한다.
- [x] 2.3 팀 schema 선택 시 적용되는 validation hook을 v1.11 spec discovery와 archive 내부 검증에 연결한다.
- [x] 2.4 한글 문서, TDD, 한글 주석과 task 완료 정책을 v1.11 config/schema extension point로 옮긴다.

## 3. Nested capability 규칙과 마이그레이션

- [x] 3.1 팀 capability validator를 정확한 `대분류/소분류/주제` 3-depth와 segment별 kebab-case 규칙으로 변경한다.
- [x] 3.2 proposal/spec/apply/archive 지침이 전체 nested capability 경로를 보존하도록 팀 preset을 갱신한다.
- [x] 3.3 legacy underscore main spec과 활성 delta spec을 사전 검증 후 이동하는 dry-run 지원 마이그레이션 도구를 추가한다.
- [x] 3.4 Windows 경로, 잘못된 깊이, 대상 충돌, archived change 보존 회귀 테스트를 추가한다.

## 4. 설치와 자체 업데이트

- [x] 4.1 installer가 package manifest의 고정 pnpm을 사용하고 v1.11에서 제거된 postinstall 우회에 의존하지 않도록 변경한다.
- [x] 4.2 팀 build에서 공식 npm self-upgrade가 커스텀 CLI를 교체하지 않도록 배포판 보호 로직을 추가한다.
- [x] 4.3 installer가 config backup, 팀 preset 적용, Skill 갱신, schema/CLI 검증을 한 번에 수행하도록 갱신한다.
- [x] 4.4 link와 global-copy 설치의 반복 실행, PATH와 실제 실행 버전 검증 테스트를 보강한다.

## 5. 팀 OpenSpec 검증

- [x] 5.1 집중 단위 테스트와 Windows 경로 회귀 테스트를 실행한다.
- [x] 5.2 전체 `pnpm test`, lint와 build를 실행하고 실패를 해소한다.
- [x] 5.3 change artifact strict validation과 구현 일치 검증을 완료한다.

## 6. 제품 저장소 마이그레이션

- [x] 6.1 `engine`의 legacy main spec 3개를 nested 경로로 이동하고 팀 config/schema/Skill을 갱신한다.
- [x] 6.2 `ct-maven`의 legacy main spec 11개와 활성 delta spec 1개를 nested 경로로 이동하고 참조를 갱신한다.
- [x] 6.3 두 제품 저장소에서 전체 spec/change strict validation과 경로 중복 검사를 실행한다.

## 7. 실제 사용자 업그레이드 측정

- [x] 7.1 `engine`의 격리된 임시 브랜치에서 최신 팀 installer의 upgrade 흐름을 실제 실행한다.
- [x] 7.2 임시 change를 생성해 proposal의 capability가 3-depth delta spec으로 생성되는지 확인한다.
- [x] 7.3 생성된 spec을 validate/show하고 시험 파일을 제품 PR에서 제외한다.

## 8. 배포 준비

- [x] 8.1 세 저장소 diff와 사용자 미커밋 파일 비영향을 최종 확인한다.
- [x] 8.2 `feature/WOR-1767-v1.11반영` 브랜치를 각 원격에 push한다.
- [x] 8.3 팀 OpenSpec은 `main`, `engine`과 `ct-maven`은 `master` 대상으로 WOR-1767 PR을 생성한다.

## 9. 설치와 업데이트 Skill 분리

- [x] 9.1 `openspec-local-installer`를 신규 설치 전용으로 좁히고 기존 팀 설치는 updater로 안내하는지 Skill validation으로 확인한다.
- [x] 9.2 `openspec-local-updater`가 기존 설치 방식과 source를 탐색하고 필요한 입력만 질문하도록 구현하며 진단 테스트 통과로 확인한다.
- [x] 9.3 Codex, Claude, shared agents용 Skill 사본을 동기화하고 신규 설치와 기존 업데이트 실제 흐름이 모두 strict validation을 통과하는지 확인한다.
- [x] 9.4 변경을 기존 WOR-1767 브랜치와 PR에 push하고 원격 head commit 갱신으로 확인한다.

## 10. 팀 커스텀 인벤토리와 다음 업스트림 업그레이드

- [x] 10.1 `docs/team-customizations.md`에 기준선과 팀 커스텀 기능별 spec, 정책/config, 구현, 테스트와 충돌 지점을 연결하고 루트 `AGENTS.md`에서 필수 진입점으로 안내한다.
- [x] 10.2 `openspec-upstream-upgrader` Skill이 정확한 upstream ref와 안전한 작업 공간을 확인하고 모든 커스텀 ID의 보존 판정을 요구하도록 구현한다.
- [x] 10.3 Codex, Claude, shared agents용 Skill 사본을 동기화하고 레지스트리 링크와 Skill parity를 자동 검증한다.
- [x] 10.4 전체 build/test/lint와 change strict validation을 실행하고 기존 사용자 설치 updater와의 역할 분리를 확인한다.
- [ ] 10.5 변경을 기존 WOR-1767 브랜치와 PR에 push하고 원격 head commit 갱신으로 확인한다.
