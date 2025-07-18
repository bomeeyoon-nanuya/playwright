# @shopby Playwright 모노레포 개발/배포 가이드

## 1. 프로젝트 개요

- 이 저장소는 **@shopby 네임스페이스**로 playwright 관련 패키지(코어, 테스트, 브라우저 등)를 커스터마이징/배포하는 모노레포입니다.
- 모든 패키지는 npmjs.com의 [shopby 조직](https://www.npmjs.com/settings/shopby/packages)에 배포됩니다.

---

## 2. 개발 환경 세팅

### 필수 조건
- Node.js 18 이상
- Yarn v1.x
- (권장) VSCode + typescript, eslint, prettier 확장

### 의존성 설치
```sh
yarn install
```

### .npmrc 설정
```ini
@shopby:registry=https://registry.npmjs.org/
```

---

## 3. 로컬 개발 워크플로우

### 전체 패키지 빌드/핫로딩
```sh
yarn dev:ready
```
- 주요 패키지의 TypeScript 빌드가 watch 모드로 동작합니다.
- 코드 수정 시 자동 빌드되어, codegen/test 등에서 바로 반영됩니다.

### playwright 명령어 실행
```sh
yarn playwright codegen
yarn playwright test
```
- 반드시 @shopby 네임스페이스 패키지가 사용되는지 확인하세요.

---

## 4. 버전/의존성/릴리즈 관리 (changesets)

### 변경점 기록
```sh
yarn changeset
```
- 변경된 패키지, 버전 종류(major/minor/patch), 변경 메시지 입력

### 버전/의존성 자동 반영
```sh
yarn changeset version
```

### 전체 배포
```sh
yarn changeset publish
```
- 모든 패키지가 npm에 자동 배포됩니다.

---

## 5. pack/publish 수동 명령어

### 모든 패키지 tarball 생성
```sh
yarn pack:all
```

### 모든 패키지 npm에 업로드
```sh
yarn publish:all
```

---

## 6. 패키지 네임스페이스/의존성 관리 주의사항
- 모든 playwright 관련 패키지는 반드시 `@shopby/` 네임스페이스로 배포해야 합니다.
- 내부 의존성도 반드시 @shopby/로 맞춰야 합니다.
- 버전 업 시, 의존 패키지의 dependencies도 함께 올려야 합니다.
- changesets를 사용하면 의존성 버전도 자동으로 맞춰집니다.

---

## 7. Trouble Shooting & FAQ

### Q. "unknown command 'test'" 오류가 발생해요.
- @shopby/playwright-test 패키지가 정상적으로 배포/설치되어 있는지 확인하세요.
- node_modules/.bin/playwright가 @shopby/playwright-test/bin을 가리키는지 확인하세요.

### Q. 패키지 버전이 꼬여서 publish가 안 돼요.
- `yarn changeset version`으로 모든 패키지 버전/의존성을 동기화하세요.
- 필요시 lockfile, node_modules 삭제 후 재설치하세요.

### Q. npm publish 시 권한 오류가 나요.
- npmjs.com shopby 조직에 퍼블리시 권한이 있는지 확인하세요.
- .npmrc에 registry 설정이 올바른지 확인하세요.

---

## 8. 커밋 컨벤션 (예시)
- 모든 커밋 메시지는 이모지 + 한글 요약 (예: ✨ 신규 기능 추가)
- 예시: `✨ playwright-core 브라우저 지원 추가`

---

## 9. 기타 참고사항
- 새로운 playwright 패키지를 추가할 때도 반드시 @shopby 네임스페이스, 내부 의존성, pack/publish 스크립트, changesets 적용을 맞춰주세요.
- CI/CD, 테스트 자동화 등은 별도 문서 참고

---

문의/기여/이슈는 담당자 또는 shopby 조직 관리자에게 문의하세요.
