# ShopBy Playwright

ShopBy Playwright는 Playwright 기반의 웹 자동화 테스트 라이브러리입니다.

## 설치 방법

```bash
# npm 사용
npm install shopby-playwright

# yarn 사용
yarn add shopby-playwright
```

## 기본 사용법

### CommonJS 환경

```javascript
const { createShopByPlaywright, BROWSER_TYPES } = require('shopby-playwright');

async function run() {
  // 인스턴스 생성
  const shopby = createShopByPlaywright({
    browserOptions: {
      headless: false, // 브라우저 UI 표시
      slowMo: 50 // 동작 속도 조절 (ms)
    }
  });

  try {
    // 브라우저 실행
    await shopby.launch();
    
    // 웹사이트 방문
    await shopby.goto('https://www.example.com');
    
    // 여기에 테스트 코드 작성
    // ...
    
  } finally {
    // 브라우저 종료
    await shopby.close();
  }
}

run().catch(console.error);
```

### ESM 환경

```javascript
import { createShopByPlaywright, BROWSER_TYPES } from 'shopby-playwright';

async function run() {
  const shopby = createShopByPlaywright();
  
  try {
    await shopby.launch();
    await shopby.goto('https://www.example.com');
    
    // 테스트 코드
    
  } finally {
    await shopby.close();
  }
}

run().catch(console.error);
```

## 직접 클래스 사용

```javascript
import { ShopByPlaywright } from 'shopby-playwright';

const shopby = new ShopByPlaywright({
  browserType: 'chromium',
  browserOptions: {
    headless: false
  }
});

// 사용법은 위와 동일합니다
```

## 라이선스

Apache-2.0 