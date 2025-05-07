# 🎭 Shopby Playwright Core

Shopby에서 커스터마이징한 Playwright의 핵심 라이브러리입니다.

## 소개

Shopby Playwright Core는 Microsoft의 Playwright Core를 기반으로 SHOPBY 서비스에 최적화된 브라우저 자동화 엔진입니다. 주로 `shopby-playwright` 패키지의 의존성으로 사용되지만, 필요한 경우 직접 사용할 수도 있습니다.

## 설치 방법

```bash
# npm을 통한 설치
npm install shopby-playwright-core

# yarn을 통한 설치
yarn add shopby-playwright-core
```

## 주요 특징

- Shopby UI에 최적화된 UI 컴포넌트
- 브라우저 자동화를 위한 핵심 API 제공

## 직접 사용하기

일반적으로는 상위 패키지인 `shopby-playwright`를 통해 사용하는 것을 권장하지만, 필요한 경우 직접 사용할 수 있습니다:

```javascript
const { chromium } = require('shopby-playwright-core');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://sample.shopby.co.kr');
  
  // 브라우저 스크린샷 찍기
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
})();
```

