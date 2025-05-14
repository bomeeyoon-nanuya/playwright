/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 이 파일은 JSX 형태로 표현된 코드입니다.
 * 실제로는 TypeScript로 실행되며, JSX는 가독성을 위한 표현 방식입니다.
 */

// WaitForTool에서 사용할 WAIT_STATE 타입
export const WAIT_STATE = {
  ELEMENT: 'element',
  NAVIGATION: 'navigation',
  NETWORK: 'network',
  REMOVED: 'removed',
  TIMEOUT: 'timeout',
  PAGE_LOAD: 'pageLoad',
} as const;

// 페이지 로드 상태 옵션
export const PAGE_LOAD_STATE = {
  LOAD: 'load',
  DOM_CONTENT_LOADED: 'domcontentloaded',
  NETWORK_IDLE: 'networkidle',
} as const;

export type PageLoadState = typeof PAGE_LOAD_STATE[keyof typeof PAGE_LOAD_STATE];
export type WaitState = typeof WAIT_STATE[keyof typeof WAIT_STATE];

// 인터페이스 정의
export interface WaitForOptions {
  waitState: WaitState;
  timeout: number;
  selector?: string;
  url?: string;
  predicate?: string;
}

// 대기 옵션들 정의
const waitOptions = [
  {
    id: WAIT_STATE.ELEMENT,
    label: '요소 표시 대기',
    description: '특정 요소가 나타날 때까지',
    icon: '🔍'
  },
  {
    id: WAIT_STATE.NAVIGATION,
    label: '페이지 이동 대기',
    description: '페이지 로딩이 완료될 때까지',
    icon: '🌐'
  },
  {
    id: WAIT_STATE.NETWORK,
    label: 'API 요청 대기',
    description: '네트워크 요청이 완료될 때까지',
    icon: '📡'
  },
  {
    id: WAIT_STATE.REMOVED,
    label: '요소 제거 대기',
    description: '특정 요소가 사라질 때까지',
    icon: '🗑️'
  },
  {
    id: WAIT_STATE.TIMEOUT,
    label: '시간 지연 대기',
    description: '지정된 시간(ms)만큼',
    icon: '⏱️'
  }
];

/**
 * 대기 옵션 UI를 생성하는 함수
 */
export function createWaitOptionsContent({
  document,
  currentWaitState,
  currentTimeout,
  onWaitStateChange,
  onTimeoutChange
}: {
  document: Document;
  currentWaitState: WaitState;
  currentTimeout: number;
  onWaitStateChange: (state: WaitState) => void;
  onTimeoutChange: (timeout: number) => void;
}): HTMLElement {
  // 최상위 컨테이너
  const content = document.createElement('div');
  content.classList.add('wait-options-container');
  content.style.padding = '16px';
  content.style.maxWidth = '520px';
  content.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  // 1. 헤더 섹션 - JSX 형태로 표현하면:
  // <div style={{ marginBottom: '20px' }}>
  //   <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>
  //     테스트 실행 시 특정 조건이 만족될 때까지 기다리도록 설정합니다.
  //   </p>
  // </div>
  const headerSection = document.createElement('div');
  headerSection.style.marginBottom = '20px';

  const description = document.createElement('p');
  description.textContent = '테스트 실행 시 특정 조건이 만족될 때까지\n기다리도록 설정합니다.';
  description.style.margin = '0';
  description.style.fontSize = '14px';
  description.style.color = '#4b5563';
  description.style.lineHeight = '1.5';
  headerSection.appendChild(description);

  content.appendChild(headerSection);

  // 2. 옵션 섹션 - JSX 형태로 표현하면:
  // <div
  //   style={{
  //     marginBottom: '24px',
  //     display: 'grid',
  //     gridTemplateColumns: '1fr 1fr',
  //     gap: '12px'
  //   }}
  //   onClick={handleOptionClick}
  // >
  //   {waitOptions.map(option => (...))}
  // </div>
  const optionsSection = document.createElement('div');
  optionsSection.style.marginBottom = '24px';
  optionsSection.style.display = 'grid';
  optionsSection.style.gridTemplateColumns = '1fr 1fr';
  optionsSection.style.gap = '12px';

  // 각 대기 옵션 생성
  waitOptions.forEach(option => {
    // 옵션 카드 JSX 표현:
    // <div
    //   className="wait-option-card"
    //   data-wait-state={option.id}
    //   style={{ ... }}
    // >
    //   {/* ... */}
    // </div>
    const optionCard = document.createElement('div');
    optionCard.classList.add('wait-option-card');
    optionCard.dataset.waitState = option.id; // 데이터 속성 추가
    optionCard.style.padding = '14px';
    optionCard.style.borderRadius = '8px';
    optionCard.style.border = '1px solid #e5e7eb';
    optionCard.style.cursor = 'pointer';
    optionCard.style.transition = 'all 0.2s ease';
    optionCard.style.display = 'flex';
    optionCard.style.flexDirection = 'column';
    optionCard.style.alignItems = 'center';
    optionCard.style.gap = '12px';
    optionCard.style.backgroundColor = option.id === currentWaitState ? '#f0f7ff' : '#ffffff';
    optionCard.style.borderColor = option.id === currentWaitState ? '#3b82f6' : '#e5e7eb';
    optionCard.style.boxShadow = option.id === currentWaitState ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none';

    // 아이콘 컨테이너
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('wait-option-icon');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '36px';
    iconContainer.style.height = '36px';
    iconContainer.style.borderRadius = '6px';
    iconContainer.style.backgroundColor = option.id === currentWaitState ? '#e0edff' : '#f9fafb';
    iconContainer.style.color = option.id === currentWaitState ? '#2563eb' : '#6b7280';
    iconContainer.style.fontSize = '22px';
    iconContainer.textContent = option.icon;
    optionCard.appendChild(iconContainer);

    // 텍스트 컨테이너
    const textContainer = document.createElement('div');
    textContainer.classList.add('wait-option-text');
    textContainer.style.flex = '1';

    const labelElement = document.createElement('div');
    labelElement.classList.add('wait-option-label');
    labelElement.textContent = option.label;
    labelElement.style.fontWeight = '500';
    labelElement.style.fontSize = '14px';
    labelElement.style.color = option.id === currentWaitState ? '#1f2937' : '#374151';
    labelElement.style.marginBottom = '4px';
    textContainer.appendChild(labelElement);

    const descElement = document.createElement('div');
    descElement.classList.add('wait-option-desc');
    descElement.textContent = option.description;
    descElement.style.fontSize = '12px';
    descElement.style.color = option.id === currentWaitState ? '#4b5563' : '#6b7280';
    textContainer.appendChild(descElement);

    optionCard.appendChild(textContainer);

    // 선택 표시 (라디오 버튼 스타일)
    const radioIndicator = document.createElement('div');
    radioIndicator.classList.add('wait-option-radio');
    radioIndicator.style.width = '18px';
    radioIndicator.style.height = '18px';
    radioIndicator.style.borderRadius = '50%';
    radioIndicator.style.border = '2px solid ' + (option.id === currentWaitState ? '#3b82f6' : '#d1d5db');
    radioIndicator.style.display = 'flex';
    radioIndicator.style.alignItems = 'center';
    radioIndicator.style.justifyContent = 'center';

    if (option.id === currentWaitState) {
      const innerDot = document.createElement('div');
      innerDot.classList.add('wait-option-radio-dot');
      innerDot.style.width = '10px';
      innerDot.style.height = '10px';
      innerDot.style.borderRadius = '50%';
      innerDot.style.backgroundColor = '#3b82f6';
      radioIndicator.appendChild(innerDot);
    }

    optionCard.appendChild(radioIndicator);
    optionsSection.appendChild(optionCard);
  });

  // 이벤트 위임(Event Delegation) 패턴 사용
  optionsSection.addEventListener('click', event => {
    // 클릭된 요소가 카드인지 확인
    const optionCard = findClosestElement(event.target as HTMLElement, '.wait-option-card');
    if (!optionCard)
      return;

    // 선택된 대기 상태 ID 가져오기
    const waitStateId = optionCard.dataset.waitState as WaitState;
    if (!waitStateId)
      return;

    // 모든 카드 스타일 초기화
    resetAllOptionCards(optionsSection);

    // 선택된 카드 스타일 적용
    highlightSelectedCard(optionCard as HTMLElement);

    // 상태 변경 콜백 호출
    onWaitStateChange(waitStateId);
  });

  content.appendChild(optionsSection);

  // 3. 타임아웃 설정 섹션 - JSX 형태로 표현하면:
  // <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
  //   {/* 타이틀 */}
  //   {/* 입력 영역 */}
  //   {/* 도움말 */}
  // </div>
  const timeoutSection = document.createElement('div');
  timeoutSection.style.padding = '16px';
  timeoutSection.style.backgroundColor = '#f8fafc';
  timeoutSection.style.borderRadius = '8px';
  timeoutSection.style.border = '1px solid #e2e8f0';

  // 타이틀 컨테이너
  const timeoutTitleContainer = document.createElement('div');
  timeoutTitleContainer.style.display = 'flex';
  timeoutTitleContainer.style.alignItems = 'center';
  timeoutTitleContainer.style.marginBottom = '12px';

  const timeoutIcon = document.createElement('div');
  timeoutIcon.textContent = '⏱️';
  timeoutIcon.style.fontSize = '20px';
  timeoutIcon.style.marginRight = '8px';
  timeoutTitleContainer.appendChild(timeoutIcon);

  const timeoutTitle = document.createElement('div');
  timeoutTitle.textContent = '대기 시간 설정';
  timeoutTitle.style.fontWeight = '500';
  timeoutTitle.style.fontSize = '15px';
  timeoutTitle.style.color = '#0f172a';
  timeoutTitleContainer.appendChild(timeoutTitle);

  timeoutSection.appendChild(timeoutTitleContainer);

  // 입력 영역
  const inputContainer = document.createElement('div');
  inputContainer.style.marginBottom = '8px';

  const labelAndUnitContainer = document.createElement('div');
  labelAndUnitContainer.style.display = 'flex';
  labelAndUnitContainer.style.justifyContent = 'space-between';
  labelAndUnitContainer.style.marginBottom = '6px';

  const inputLabel = document.createElement('label');
  inputLabel.textContent = '시간 (밀리초)';
  inputLabel.style.fontSize = '13px';
  inputLabel.style.color = '#4b5563';
  labelAndUnitContainer.appendChild(inputLabel);

  const unitLabel = document.createElement('div');
  unitLabel.textContent = '1000ms = 1초';
  unitLabel.style.fontSize = '13px';
  unitLabel.style.color = '#6b7280';
  labelAndUnitContainer.appendChild(unitLabel);

  inputContainer.appendChild(labelAndUnitContainer);

  // 입력 필드와 버튼 그룹
  const inputGroup = document.createElement('div');
  inputGroup.style.display = 'flex';
  inputGroup.style.position = 'relative';

  const timeoutInput = document.createElement('input');
  timeoutInput.type = 'number';
  timeoutInput.value = String(currentTimeout);
  timeoutInput.min = '100';
  timeoutInput.step = '500';
  timeoutInput.style.width = '100%';
  timeoutInput.style.padding = '10px 12px';
  timeoutInput.style.borderRadius = '6px';
  timeoutInput.style.border = '1px solid #d1d5db';
  timeoutInput.style.fontSize = '14px';
  timeoutInput.style.backgroundColor = '#ffffff';
  timeoutInput.style.outline = 'none';
  timeoutInput.style.transition = 'border-color 0.2s ease';

  timeoutInput.addEventListener('focus', () => {
    timeoutInput.style.borderColor = '#3b82f6';
    timeoutInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
  });

  timeoutInput.addEventListener('blur', () => {
    timeoutInput.style.borderColor = '#d1d5db';
    timeoutInput.style.boxShadow = 'none';
  });

  timeoutInput.addEventListener('input', e => {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0)
      onTimeoutChange(value);

  });

  inputGroup.appendChild(timeoutInput);

  // 빠른 시간 선택 버튼들
  const quickTimeButtons = [
    { value: 1000, label: '1초' },
    { value: 3000, label: '3초' },
    { value: 5000, label: '5초' },
    { value: 10000, label: '10초' }
  ];

  const quickButtonsContainer = document.createElement('div');
  quickButtonsContainer.style.display = 'flex';
  quickButtonsContainer.style.marginTop = '8px';
  quickButtonsContainer.style.gap = '8px';

  // 빠른 선택 버튼 클릭 이벤트 핸들러
  const handleQuickButtonClick = (button: HTMLButtonElement, value: number) => {
    // 모든 버튼 스타일 초기화
    quickButtonsContainer.querySelectorAll('button').forEach(b => {
      const btnEl = b as HTMLElement;
      btnEl.style.backgroundColor = '#f9fafb';
      btnEl.style.color = '#4b5563';
      btnEl.style.fontWeight = 'normal';
    });

    // 선택된 버튼 강조
    button.style.backgroundColor = '#e0edff';
    button.style.color = '#2563eb';
    button.style.fontWeight = '500';

    // 값 설정
    onTimeoutChange(value);
    timeoutInput.value = String(value);
  };

  quickTimeButtons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.label;
    button.style.padding = '6px 10px';
    button.style.fontSize = '12px';
    button.style.borderRadius = '4px';
    button.style.border = '1px solid #d1d5db';
    button.style.backgroundColor = currentTimeout === btn.value ? '#e0edff' : '#f9fafb';
    button.style.color = currentTimeout === btn.value ? '#2563eb' : '#4b5563';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.2s ease';
    button.style.fontWeight = currentTimeout === btn.value ? '500' : 'normal';

    button.addEventListener('mouseover', () => {
      if (currentTimeout !== btn.value)
        button.style.backgroundColor = '#f3f4f6';
    });

    button.addEventListener('mouseout', () => {
      if (currentTimeout !== btn.value)
        button.style.backgroundColor = '#f9fafb';
    });

    button.addEventListener('click', () => {
      handleQuickButtonClick(button, btn.value);
    });

    quickButtonsContainer.appendChild(button);
  });

  inputContainer.appendChild(inputGroup);
  inputContainer.appendChild(quickButtonsContainer);

  timeoutSection.appendChild(inputContainer);

  // 도움말 텍스트
  const helpText = document.createElement('div');
  helpText.textContent = '일반적으로 5-30초(5000-30000 밀리초) 사이의 값을 권장합니다.';
  helpText.style.fontSize = '12px';
  helpText.style.color = '#64748b';
  helpText.style.marginTop = '8px';
  timeoutSection.appendChild(helpText);

  content.appendChild(timeoutSection);

  return content;
}

/**
 * 헬퍼 함수: 클릭된 요소에서 가장 가까운 선택자에 해당하는 부모 요소 찾기
 */
function findClosestElement(element: HTMLElement, selector: string): HTMLElement | null {
  if (element.matches(selector))
    return element;

  let parent = element.parentElement;
  while (parent) {
    if (parent.matches(selector))
      return parent;
    parent = parent.parentElement;
  }

  return null;
}

/**
 * 헬퍼 함수: 모든 옵션 카드 스타일 초기화
 */
function resetAllOptionCards(optionsSection: HTMLElement) {
  optionsSection.querySelectorAll('.wait-option-card').forEach(card => {
    const c = card as HTMLElement;
    c.style.backgroundColor = '#ffffff';
    c.style.borderColor = '#e5e7eb';
    c.style.boxShadow = 'none';

    // 아이콘 초기화
    const iconEl = c.querySelector('.wait-option-icon') as HTMLElement;
    if (iconEl) {
      iconEl.style.backgroundColor = '#f9fafb';
      iconEl.style.color = '#6b7280';
    }

    // 텍스트 초기화
    const labelEl = c.querySelector('.wait-option-label') as HTMLElement;
    if (labelEl)
      labelEl.style.color = '#374151';

    const descEl = c.querySelector('.wait-option-desc') as HTMLElement;
    if (descEl)
      descEl.style.color = '#6b7280';

    // 라디오 버튼 초기화
    const radioEl = c.querySelector('.wait-option-radio') as HTMLElement;
    if (radioEl) {
      radioEl.style.border = '2px solid #d1d5db';
      // 내부 점만 제거하고 라디오 버튼 자체는 유지
      const dot = radioEl.querySelector('.wait-option-radio-dot');
      if (dot)
        dot.remove();
    }
  });
}

/**
 * 헬퍼 함수: 선택된 카드 강조
 */
function highlightSelectedCard(optionCard: HTMLElement) {
  // 선택된 옵션 강조
  optionCard.style.backgroundColor = '#f0f7ff';
  optionCard.style.borderColor = '#3b82f6';
  optionCard.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';

  // 아이콘 컨테이너 강조
  const iconEl = optionCard.querySelector('.wait-option-icon') as HTMLElement;
  if (iconEl) {
    iconEl.style.backgroundColor = '#e0edff';
    iconEl.style.color = '#2563eb';
  }

  // 라벨 강조
  const labelEl = optionCard.querySelector('.wait-option-label') as HTMLElement;
  if (labelEl)
    labelEl.style.color = '#1f2937';

  // 설명 강조
  const descEl = optionCard.querySelector('.wait-option-desc') as HTMLElement;
  if (descEl)
    descEl.style.color = '#4b5563';

  // 라디오 버튼 강조
  const radioEl = optionCard.querySelector('.wait-option-radio') as HTMLElement;
  if (radioEl) {
    radioEl.style.border = '2px solid #3b82f6';

    // 내부 점 추가 (이미 있는 경우는 그대로 둠)
    if (!radioEl.querySelector('.wait-option-radio-dot')) {
      const innerDot = document.createElement('div');
      innerDot.classList.add('wait-option-radio-dot');
      innerDot.style.width = '10px';
      innerDot.style.height = '10px';
      innerDot.style.borderRadius = '50%';
      innerDot.style.backgroundColor = '#3b82f6';
      radioEl.appendChild(innerDot);
    }
  }
}
