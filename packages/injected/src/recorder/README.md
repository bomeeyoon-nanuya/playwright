# Playwright Recorder 대기 옵션 모듈

## 개요

Playwright 레코더의 대기 옵션 기능을 구현한 모듈입니다. 이 모듈은 테스트 레코딩 중 사용자가 다양한 종류의 대기 조건을 설정할 수 있도록 UI를 제공합니다.

## 기능

- 요소 표시 대기: 특정 요소가 화면에 표시될 때까지 대기
- 요소 제거 대기: 특정 요소가 화면에서 사라질 때까지 대기
- 페이지 이동 대기: 페이지 이동이 완료될 때까지 대기
- API 요청 대기: 특정 네트워크 요청이 완료될 때까지 대기
- 시간 지연 대기: 지정된 시간(밀리초)만큼 대기
- 페이지 로드 대기: 페이지 로드 상태(load)까지 대기

## 파일 구조

```
packages/injected/src/recorder/
├── constants/
│   └── waitForOptions.constants.ts  # 상수 정의
├── types/
│   └── waitForOptions.types.ts      # 타입 정의
├── utils/
│   ├── domUtils.ts                  # DOM 관련 유틸리티
│   └── waitForUtils.ts              # 대기 관련 유틸리티
├── components/
│   ├── elementWaitComponent.ts      # 요소 대기 컴포넌트
│   └── waitForComponents.ts         # 대기 옵션 UI 컴포넌트
├── styles/
│   └── waitForOptions.styles.ts     # 스타일 정의
├── state/
│   └── optionContext.ts             # 상태 관리
└── waitForOptionsContent.ts         # 메인 모듈
```

## 사용 방법

메인 모듈의 `createWaitOptionsContent` 함수를 호출하여 UI를 생성하고 필요한 파라미터를 전달합니다:

```typescript
const waitOptionsUI = createWaitOptionsContent({
  document,
  currentWaitState: null,
  currentTimeout: 5000,
  onWaitStateChange: (state) => { /* 상태 변경 처리 */ },
  onTimeoutChange: (timeout) => { /* 타임아웃 변경 처리 */ },
  recorder: recorderInstance
});

// UI를 DOM에 추가
container.appendChild(waitOptionsUI);
``` 