# ShopBy Playwright 패키지 빌드 가이드

## 로컬 개발 환경에서 빌드하기

```bash
# 프로젝트 루트 디렉토리에서 실행
npm run build
```

## 패키지 생성하기

```bash
# 프로젝트 루트 디렉토리에서 실행
# 방법 1: 직접 출력 경로 지정
node utils/pack_package.js shopby-playwright ./shopby-playwright-1.0.0.tgz

# 방법 2: 임시 디렉토리에 생성
mkdir -p dist
node utils/pack_package.js shopby-playwright ./dist/shopby-playwright-1.0.0.tgz
```

위 명령어를 실행하면 `shopby-playwright-1.0.0.tgz` 파일이 생성됩니다.

## 로컬에서 패키지 테스트하기

다른 프로젝트에서 로컬 패키지를 테스트하려면:

```bash
# npm 사용
npm install /path/to/playwright/shopby-playwright-1.0.0.tgz

# yarn 사용
yarn add /path/to/playwright/shopby-playwright-1.0.0.tgz
```

## npm에 배포하기

배포 전에 package.json에 있는 정보가 올바른지 확인하세요:
- name: "shopby-playwright"
- version: (원하는 버전)
- description: (적절한 설명)
- author: (작성자 정보)
- repository/homepage URL이 올바른지 확인

```bash
# npm에 로그인
npm login

# 배포하기
cd packages/shopby-playwright
npm publish
```

npm publish 명령을 실행하면 패키지가 npm 레지스트리에 공개됩니다.

## yarn에 배포하기

yarn은 npm 레지스트리를 사용하기 때문에 위와 동일한 방법으로 패키지를 배포할 수 있습니다.

```bash
# 배포하기
cd packages/shopby-playwright
npm publish
```

배포 후에는 다음과 같이 설치할 수 있습니다:

```bash
# npm 사용
npm install shopby-playwright

# yarn 사용
yarn add shopby-playwright
``` 