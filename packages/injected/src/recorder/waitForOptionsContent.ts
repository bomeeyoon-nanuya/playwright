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

// Recorder 타입을 사용하기 위한 import 추가
import type { Recorder } from './recorder';
import type { InjectedScript } from '../injectedScript';

/**
 * 지정한 태그명을 가진 부모 요소를 탐색하여 반환합니다.
 *
 * @param element 시작 요소
 * @param tagName 찾을 커스텀 태그 이름 (예: 'x-test-element')
 * @returns 가장 가까운 커스텀 태그 부모 또는 null
 */
export const findParentByTagName = (element: Element | null, tagName: string): Element | null => {
  let current = element?.parentElement;
  const normalized = tagName.toUpperCase();
  while (current) {
    if (current.tagName === normalized)
      return current;

    current = current.parentElement;
  }
  return null;
};

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

/**
 * 요소 선택 이벤트 핸들러 타입 정의
 */
export interface ElementWaitOptions {
  container: HTMLElement;
  currentTimeout?: number;
  onElementSelected?: (selector: string) => void;
  recorder: Recorder; // Recorder 인스턴스가 필수
}

/**
 * WaitForTool에 있는 정적 플래그를 리셋합니다.
 * 해당 플래그는 모달 표시 시 체크되는 값입니다.
 */
export function resetWaitForDialogState(injectedScript: InjectedScript) {
  // 글로벌 플래그를 통해 WaitForTool._isAnyDialogShowing를 리셋합니다
  (injectedScript.window as any).__pw_resetWaitDialogState = true;
}

/**
 * WaitForTool 인스턴스를 직접 통해 대화상자를 표시하는 함수
 */
export function showWaitForDialog(recorder: Recorder) {
  // 현재 WaitingFor 상태가 아닌 경우에만 모드 변경
  if (recorder.state.mode !== 'waitingFor')
    recorder.setMode('waitingFor');

  // WaitForTool._isAnyDialogShowing 플래그 초기화
  resetWaitForDialogState(recorder.injectedScript);

  // 특수 방법으로 WaitForTool 인스턴스에 접근하여 showDialog 메서드 호출
  setTimeout(() => {
    // waitFor 툴바 버튼을 트리거하여 툴을 활성화
    const waitForToggle = recorder.injectedScript.document.querySelector('x-pw-tool-item.wait-for');
    if (waitForToggle && waitForToggle instanceof HTMLElement) {
      // 한 번 클릭하여 waitingFor 모드로 들어가도록 함
      waitForToggle.click();

      // 모드 변경이 적용된 후 WaitForTool 인스턴스에 직접 명령을 전달
      setTimeout(() => {
        const waitForTool = getWaitForToolInstance(recorder);
        if (waitForTool) {
          // 모달 표시 메서드 호출
          waitForTool.showDialog();
        }
      }, 100);
    }
  }, 0);
}

/**
 * Recorder 객체에서 WaitForTool 인스턴스에 접근하는 헬퍼 함수
 */
function getWaitForToolInstance(recorder: Recorder): any {
  // 모든 툴에 접근
  const tools = (recorder as any)._tools;
  if (tools && tools.waitingFor)
    return tools.waitingFor;

  return null;
}

/**
 * 요소 선택 후 처리를 담당하는 핸들러
 */
export function handleElementWait(options: ElementWaitOptions): void {
  const { container, recorder } = options;

  if (!recorder) {
    // 에러 대신 조용히 반환
    return;
  }

  const injectedScript = recorder.injectedScript;
  const root = container.getRootNode() as Document;
  const picker = root.querySelector('.pick-locator') as HTMLButtonElement;

  if (!picker)
    return;

  // 요소 선택 모드 설명 및 안내 표시
  const instructionsContainer = injectedScript.document.createElement('div');
  instructionsContainer.style.padding = '16px';
  instructionsContainer.style.backgroundColor = '#fffbeb';
  instructionsContainer.style.borderRadius = '8px';
  instructionsContainer.style.border = '1px solid #fef3c7';
  instructionsContainer.style.marginBottom = '16px';

  instructionsContainer.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 20px; margin-right: 8px;">🔍</span>
      <span style="font-weight: 500; font-size: 15px; color: '#92400e';">요소 선택 모드</span>
    </div>
    <p style="margin: 0; font-size: 13px; color: '#92400e';">
      페이지에서 대기할 요소를 클릭하세요.
    </p>
  `;

  // 컨테이너 스타일링
  container.style.padding = '0';
  container.style.backgroundColor = '#f9fafb';
  container.style.borderRadius = '8px';
  container.style.border = '1px solid #e5e7eb';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';

  // 기존 내용 제거 후 안내 메시지 표시
  container.innerHTML = '';
  container.appendChild(instructionsContainer);

  // 요소 선택 모드 활성화
  picker.click();

  // 요소 선택 완료 시 전달받는 이벤트 추가
  (injectedScript.window as any).__pw_recorderElementPicked = (elementInfo: { selector: string }) => {
    try {
      // 선택된 셀렉터 저장
      const selectedSelector = elementInfo.selector;

      // 글로벌 핸들러 제거
      delete (injectedScript.window as any).__pw_recorderElementPicked;

      // 가장 중요한 부분: 선택된 셀렉터를 즉시 콜백을 통해 전달
      if (options.onElementSelected)
        options.onElementSelected(selectedSelector);


      // 약간의 지연 후 모달 표시 (onElementSelected가 optionContext를 업데이트한 후)
      setTimeout(() => {
        showWaitForDialog(recorder);
      }, 100);
    } catch (err) {
      // 오류 발생 시 조용히 처리
    }
  };
}

/**
 * 대기 옵션들 정의
 */
const waitOptions = [
  {
    id: WAIT_STATE.ELEMENT,
    label: '요소 표시 대기',
    description: '특정 요소가 화면에 표시될 때까지 대기',
    icon: '🔍'
  },
  {
    id: WAIT_STATE.REMOVED,
    label: '요소 제거 대기',
    description: '특정 요소가 화면에서 사라질 때까지 대기',
    icon: '🗑️'
  },
  {
    id: WAIT_STATE.NAVIGATION,
    label: '페이지 이동 대기',
    description: '페이지 이동이 완료될 때까지 대기',
    icon: '🌐'
  },
  {
    id: WAIT_STATE.NETWORK,
    label: 'API 요청 대기',
    description: '네트워크 응답이 완료될 때까지 대기',
    icon: '📡'
  },
  {
    id: WAIT_STATE.TIMEOUT,
    label: '시간 지연 대기',
    description: '지정된 시간(밀리초)만큼 대기',
    icon: '⏱️'
  },
  {
    id: WAIT_STATE.PAGE_LOAD,
    label: '페이지 로드 대기',
    description: '페이지 로드 상태(load)까지 대기',
    icon: '📄'
  }
];

/**
 * 빠른 시간 버튼 클릭 핸들러
 */
function handleQuickButtonClick(button: HTMLButtonElement, value: number, onTimeoutChange: (timeout: number) => void, quickButtonsContainer: HTMLElement) {
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
      // InjectedScript.document를 바로 사용할 수 없으므로 optionCard가 속한 document 객체 사용
      const innerDot = optionCard.ownerDocument.createElement('div');
      innerDot.classList.add('wait-option-radio-dot');
      innerDot.style.width = '10px';
      innerDot.style.height = '10px';
      innerDot.style.borderRadius = '50%';
      innerDot.style.backgroundColor = '#3b82f6';
      radioEl.appendChild(innerDot);
    }
  }
}

/**
 * 옵션 컨텍스트의 값 타입 정의
 */
interface OptionContextValue {
  recorder?: Recorder;
  container?: HTMLElement;
  waitState?: WaitState;
  currentTimeout?: number;
  onTimeoutChange?: (timeout: number) => void;
  onWaitStateChange?: (state: WaitState) => void;
  selector?: string;
}

/**
 * 옵션 컨텍스트 인터페이스 정의
 */
interface OptionContext {
  value: OptionContextValue | null;
  set: (value: OptionContextValue) => void;
  get: () => OptionContextValue | null;
  clear: () => void;
}

const optionContext: OptionContext = {
  value: null,
  set: value => {
    optionContext.value = value;
  },
  get: () => {
    return optionContext.value;
  },
  clear: () => {
    optionContext.value = null;
  },
};

/**
 * 상수 정의
 */
const STYLES = {
  RESULT_CONTAINER: {
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bae6fd',
    margin: '16px'
  },
  SUCCESS_ICON: {
    fontSize: '20px',
    marginRight: '8px'
  },
  SUCCESS_TEXT: {
    fontWeight: '500',
    fontSize: '15px',
    color: '#0c4a6e'
  },
  SELECTOR_CONTAINER: {
    fontFamily: 'monospace',
    background: '#fff',
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '12px',
    wordBreak: 'break-all'
  },
  CODE_HEADING: {
    fontSize: '15px',
    fontWeight: '500',
    marginTop: '16px',
    marginBottom: '8px'
  },
  CODE_BLOCK: {
    background: '#1e293b',
    color: '#e2e8f0',
    padding: '12px',
    borderRadius: '6px',
    overflow: 'auto',
    margin: '0'
  },
  CODE_DESCRIPTION: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px'
  },
  BUTTON_CONTAINER: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px'
  },
  COPY_BUTTON: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  SUCCESS_BUTTON: {
    backgroundColor: '#10b981'
  }
};

// 요소 표시 대기 관련 텍스트
const ELEMENT_WAIT_TEXT = {
  SUCCESS_MESSAGE: '요소가 선택되었습니다',
  BUTTON_COPY: '사용하기',
  BUTTON_COPIED: '추가됨 ✓',
  CODE_HEADING: '생성된 테스트 코드',
  CODE_DESCRIPTION: '이 코드는 해당 요소가 화면에 나타날 때까지 대기합니다.'
};

// 요소 제거 대기 관련 텍스트
const REMOVED_WAIT_TEXT = {
  SUCCESS_MESSAGE: '요소가 선택되었습니다',
  BUTTON_COPY: '사용하기',
  BUTTON_COPIED: '추가됨 ✓',
  CODE_HEADING: '생성된 테스트 코드',
  CODE_DESCRIPTION: '이 코드는 해당 요소가 화면에서 사라질 때까지 대기합니다.'
};

const TIMEOUT = {
  RESET_BUTTON: 2000
};

/**
 * 코드 스타일 설정을 위한 상수
 */
const CODE_DISPLAY_STYLE = {
  backgroundColor: '#1e293b',
  color: '#e2e8f0',
  padding: '12px',
  borderRadius: '6px',
  overflowX: 'scroll',
  margin: '0',
  whiteSpace: 'nowrap'
};

/**
 * 선택된 셀렉터로 테스트 코드를 생성하는 순수 함수
 */
const generateTestCode = (selector: string, timeout: number, waitState: WaitState): string => {
  switch (waitState) {
    case WAIT_STATE.ELEMENT:
      return `await page.waitForSelector('${selector}', { state: 'visible', timeout: ${timeout} });`;
    case WAIT_STATE.REMOVED:
      return `await page.waitForSelector('${selector}', { state: 'hidden', timeout: ${timeout} });`;
    case WAIT_STATE.NAVIGATION:
      return `await page.waitForNavigation({ waitUntil: 'load', timeout: ${timeout} });`;
    case WAIT_STATE.NETWORK:
      return `await page.waitForResponse(response => response.url().includes('/api'), { timeout: ${timeout} });`;
    case WAIT_STATE.TIMEOUT:
      return `await page.waitForTimeout(${timeout});`;
    case WAIT_STATE.PAGE_LOAD:
      return `await page.waitForLoadState('load', { timeout: ${timeout} });`;
    default:
      return `await page.waitForSelector('${selector}', { state: 'visible', timeout: ${timeout} });`;
  }
};

/**
 * 선택자 정보를 보여주는 컨테이너 요소 생성
 */
const createSelectorDisplay = (selector: string, injectedScript: InjectedScript): HTMLDivElement => {
  const container = injectedScript.document.createElement('div');
  applyStyles(container, STYLES.SELECTOR_CONTAINER);
  container.textContent = selector;
  return container;
};

/**
 * 성공 헤더 요소 생성
 */
const createSuccessHeader = (injectedScript: InjectedScript, waitState: WaitState): HTMLDivElement => {
  const header = injectedScript.document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '12px';

  const icon = injectedScript.document.createElement('span');
  applyStyles(icon, STYLES.SUCCESS_ICON);
  icon.textContent = '✅';

  const text = injectedScript.document.createElement('span');
  applyStyles(text, STYLES.SUCCESS_TEXT);

  // 대기 상태에 따라 텍스트 설정
  const textContent = waitState === WAIT_STATE.REMOVED
    ? REMOVED_WAIT_TEXT.SUCCESS_MESSAGE
    : ELEMENT_WAIT_TEXT.SUCCESS_MESSAGE;

  text.textContent = textContent;

  header.appendChild(icon);
  header.appendChild(text);
  return header;
};

/**
 * 코드 블록 요소 생성
 */
const createCodeBlock = (testCode: string, injectedScript: InjectedScript, waitState: WaitState): HTMLElement => {
  const container = injectedScript.document.createElement('div');

  const heading = injectedScript.document.createElement('p');
  applyStyles(heading, STYLES.CODE_HEADING);

  // 대기 상태에 따라 텍스트 설정
  const headingText = waitState === WAIT_STATE.REMOVED
    ? REMOVED_WAIT_TEXT.CODE_HEADING
    : ELEMENT_WAIT_TEXT.CODE_HEADING;

  heading.textContent = headingText;

  const codeBlock = injectedScript.document.createElement('pre');
  applyStyles(codeBlock, {
    ...STYLES.CODE_BLOCK,
    overflowX: 'scroll',
    whiteSpace: 'nowrap'
  });
  codeBlock.textContent = testCode;

  const description = injectedScript.document.createElement('p');
  applyStyles(description, STYLES.CODE_DESCRIPTION);

  // 대기 상태에 따라 텍스트 설정
  const descriptionText = waitState === WAIT_STATE.REMOVED
    ? REMOVED_WAIT_TEXT.CODE_DESCRIPTION
    : ELEMENT_WAIT_TEXT.CODE_DESCRIPTION;

  description.textContent = descriptionText;

  container.appendChild(heading);
  container.appendChild(codeBlock);
  container.appendChild(description);

  return container;
};

/**
 * 레코더에 대기 동작 기록하는 함수
 */
const recordWaitAction = (recorder: Recorder, waitState: WaitState, selector: string, timeout: number): void => {
  if (!recorder)
    return;

  try {
    // 인스펙터에서 인식 가능한 표준 액션 형식으로 변환
    let action: any;

    switch (waitState) {
      case WAIT_STATE.ELEMENT:
        action = {
          name: 'waitForSelector',
          selector: selector || 'body',
          options: {
            state: 'visible',
            timeout
          },
          signals: []
        };
        break;
      case WAIT_STATE.REMOVED:
        action = {
          name: 'waitForSelector',
          selector: selector || 'body',
          options: {
            state: 'hidden',
            timeout
          },
          signals: []
        };
        break;
      case WAIT_STATE.NAVIGATION:
        action = {
          name: 'waitForNavigation',
          options: {
            timeout,
            waitUntil: 'load'
          },
          signals: []
        };
        break;
      case WAIT_STATE.NETWORK:
        action = {
          name: 'waitForResponse',
          url: '**/api/**',
          options: {
            timeout
          },
          signals: [],
          predicateText: "response => response.url().includes('/api')"
        };
        break;
      case WAIT_STATE.TIMEOUT:
        action = {
          name: 'waitForTimeout',
          options: {
            timeout
          },
          signals: []
        };
        break;
      case WAIT_STATE.PAGE_LOAD:
        action = {
          name: 'waitForLoadState',
          options: {
            timeout,
            state: 'load'
          },
          signals: []
        };
        break;
      default:
        // 기본 액션은 waitForSelector
        action = {
          name: 'waitForSelector',
          selector: selector || 'body',
          options: {
            state: 'visible',
            timeout
          },
          signals: []
        };
    }

    // 액션 기록
    recorder.recordAction(action);
    recorder.setMode('recording');
    recorder.overlay?.flashToolSucceeded('waitingFor');

  } catch (e) {
    // 에러 발생 시 조용히 처리
  }
};

/**
 * 스타일을 HTML 요소에 적용하는 유틸리티 함수
 */
const applyStyles = (element: HTMLElement, styles: Record<string, string>): void => {
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key as any] = value;
  });
};

/**
 * 사용 버튼 요소 생성 및 이벤트 설정
 */
const createUseButton = (
  selector: string,
  timeout: number,
  waitState: WaitState,
  injectedScript: InjectedScript,
  recorder: Recorder
): HTMLDivElement => {
  const buttonContainer = injectedScript.document.createElement('div');
  applyStyles(buttonContainer, STYLES.BUTTON_CONTAINER);

  const useButton = injectedScript.document.createElement('button');
  applyStyles(useButton, STYLES.COPY_BUTTON);

  // 대기 상태에 따라 텍스트 설정
  const buttonText = waitState === WAIT_STATE.REMOVED
    ? REMOVED_WAIT_TEXT.BUTTON_COPY
    : ELEMENT_WAIT_TEXT.BUTTON_COPY;

  useButton.textContent = buttonText;

  useButton.addEventListener('click', () => {
    try {
      // 버튼 상태 변경
      const originalText = useButton.textContent;

      // 대기 상태에 따라 텍스트 설정
      const copiedText = waitState === WAIT_STATE.REMOVED
        ? REMOVED_WAIT_TEXT.BUTTON_COPIED
        : ELEMENT_WAIT_TEXT.BUTTON_COPIED;

      useButton.textContent = copiedText;
      useButton.style.backgroundColor = STYLES.SUCCESS_BUTTON.backgroundColor;

      // 통일된 함수 사용
      recordWaitAction(recorder, waitState, selector, timeout);

      // 버튼 상태 복구
      setTimeout(() => {
        useButton.textContent = originalText;
        useButton.style.backgroundColor = STYLES.COPY_BUTTON.backgroundColor;
      }, TIMEOUT.RESET_BUTTON);
    } catch (e) {
      // 예외 처리
    }
  });

  buttonContainer.appendChild(useButton);
  return buttonContainer;
};

/**
 * 선택된 요소 결과 컨테이너 생성
 */
const createSelectedElementResult = (
  selector: string,
  timeout: number,
  injectedScript: InjectedScript,
  waitState: WaitState,
  recorder: Recorder
): HTMLDivElement => {
  const resultDiv = injectedScript.document.createElement('div');
  applyStyles(resultDiv, STYLES.RESULT_CONTAINER);

  const testCode = generateTestCode(selector, timeout, waitState);

  resultDiv.appendChild(createSuccessHeader(injectedScript, waitState));
  resultDiv.appendChild(createSelectorDisplay(selector, injectedScript));
  resultDiv.appendChild(createCodeBlock(testCode, injectedScript, waitState));
  resultDiv.appendChild(createUseButton(selector, timeout, waitState, injectedScript, recorder));

  return resultDiv;
};

/**
 * 오른쪽 섹션 UI 업데이트 함수
 */
const updateRightSectionUI = (
  rightSection: HTMLElement,
  optionContext: { value: OptionContextValue | null },
  currentTimeout: number,
  placeholderContainer: HTMLElement,
  injectedScript: InjectedScript,
  recorder: Recorder
): void => {
  rightSection.innerHTML = ''; // 기존 내용 초기화

  // null 체크 추가
  if (!optionContext.value) {
    rightSection.appendChild(placeholderContainer);
    return;
  }

  const hasValidSelector = optionContext.value.selector;
  const waitState = optionContext.value.waitState;

  if (hasValidSelector && waitState && (waitState === WAIT_STATE.ELEMENT || waitState === WAIT_STATE.REMOVED)) {
    // 선택된 요소의 정보를 보여줌
    const resultElement = createSelectedElementResult(
        hasValidSelector,
        currentTimeout,
        injectedScript,
        waitState,
        recorder
    );
    rightSection.appendChild(resultElement);
  } else {
    // 안내 메시지 표시
    rightSection.appendChild(placeholderContainer);
  }
};

/**
 * 대기 옵션 UI를 생성하는 함수
 */
export function createWaitOptionsContent({
  document,
  currentWaitState,
  currentTimeout,
  onWaitStateChange,
  onTimeoutChange,
  recorder
}: {
  document: Document;
  currentWaitState: WaitState | null;
  currentTimeout: number;
  onWaitStateChange: (state: WaitState) => void;
  onTimeoutChange: (timeout: number) => void;
  recorder: Recorder;
}): HTMLElement {
  // 최상위 컨테이너
  const content = document.createElement('div');
  content.classList.add('wait-options-container');
  content.style.width = '100%'; // 전체 너비 사용
  content.style.display = 'flex'; // 가로형 레이아웃으로 변경
  content.style.gap = '20px'; // 좌우 영역 사이 간격
  content.style.maxHeight = '80vh'; // 최대 높이 제한
  content.style.overflow = 'auto'; // 내용이 많을 경우 스크롤 가능하도록
  content.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  // 1. 왼쪽 영역 (옵션 선택 영역)
  const leftSection = document.createElement('div');
  leftSection.style.flex = '0 0 280px'; // 왼쪽 영역 너비 고정
  leftSection.style.display = 'flex';
  leftSection.style.flexDirection = 'column';

  // 헤더 섹션
  const headerSection = document.createElement('div');
  headerSection.style.marginBottom = '20px';
  leftSection.appendChild(headerSection);

  // 옵션 선택 영역
  const optionsSection = document.createElement('div');
  optionsSection.style.marginBottom = '24px';
  optionsSection.style.display = 'flex';
  optionsSection.style.flexDirection = 'column'; // 세로로 옵션 나열
  optionsSection.style.gap = '8px';

  // 각 대기 옵션 생성 - 초기에는 어떤 옵션도 선택하지 않음
  waitOptions.forEach(option => {
    // 옵션 카드 생성
    const optionCard = document.createElement('div');
    optionCard.classList.add('wait-option-card');
    optionCard.dataset.waitState = option.id; // 데이터 속성 추가
    optionCard.style.padding = '12px';
    optionCard.style.borderRadius = '8px';
    optionCard.style.border = '1px solid #e5e7eb';
    optionCard.style.cursor = 'pointer';
    optionCard.style.transition = 'all 0.2s ease';
    optionCard.style.display = 'flex';
    optionCard.style.alignItems = 'center';
    optionCard.style.gap = '12px';
    // 초기에는 어떤 옵션도 선택되지 않도록 설정
    optionCard.style.backgroundColor = '#ffffff';
    optionCard.style.borderColor = '#e5e7eb';
    optionCard.style.boxShadow = 'none';

    // 아이콘 컨테이너
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('wait-option-icon');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '36px';
    iconContainer.style.height = '36px';
    iconContainer.style.borderRadius = '6px';
    iconContainer.style.backgroundColor = '#f9fafb';
    iconContainer.style.color = '#6b7280';
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
    labelElement.style.color = '#374151';
    labelElement.style.marginBottom = '2px';
    textContainer.appendChild(labelElement);

    const descElement = document.createElement('div');
    descElement.classList.add('wait-option-desc');
    descElement.textContent = option.description;
    descElement.style.fontSize = '12px';
    descElement.style.color = '#6b7280';
    textContainer.appendChild(descElement);

    optionCard.appendChild(textContainer);

    // 선택 표시 (라디오 버튼 스타일)
    const radioIndicator = document.createElement('div');
    radioIndicator.classList.add('wait-option-radio');
    radioIndicator.style.width = '18px';
    radioIndicator.style.height = '18px';
    radioIndicator.style.borderRadius = '50%';
    radioIndicator.style.border = '2px solid #d1d5db';
    radioIndicator.style.display = 'flex';
    radioIndicator.style.alignItems = 'center';
    radioIndicator.style.justifyContent = 'center';

    optionCard.appendChild(radioIndicator);
    optionsSection.appendChild(optionCard);
  });

  leftSection.appendChild(optionsSection);

  // 타임아웃 설정 섹션
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
      handleQuickButtonClick(button, btn.value, onTimeoutChange, quickButtonsContainer);
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

  leftSection.appendChild(timeoutSection);

  // 2. 오른쪽 영역 (결과 표시 영역)
  const rightSection = document.createElement('div');
  rightSection.id = 'wait-options-right-section';
  rightSection.style.flex = '1'; // 남은 공간 모두 차지
  rightSection.style.display = 'flex';
  rightSection.style.flexDirection = 'column';
  rightSection.style.minWidth = '300px'; // 최소 너비 설정
  rightSection.style.border = '1px solid #e5e7eb';
  rightSection.style.borderRadius = '8px';
  rightSection.style.backgroundColor = '#f9fafb';

  // 초기 안내 메시지 표시 (항상 보이도록)
  const placeholderContainer = document.createElement('div');
  placeholderContainer.style.display = 'flex';
  placeholderContainer.style.flexDirection = 'column';
  placeholderContainer.style.alignItems = 'center';
  placeholderContainer.style.justifyContent = 'center';
  placeholderContainer.style.height = '100%';
  placeholderContainer.style.padding = '40px 20px';
  placeholderContainer.style.textAlign = 'center';

  const placeholderIcon = document.createElement('div');
  placeholderIcon.textContent = '👈';
  placeholderIcon.style.fontSize = '32px';
  placeholderIcon.style.marginBottom = '16px';
  placeholderContainer.appendChild(placeholderIcon);

  const placeholderText = document.createElement('div');
  placeholderText.textContent = '왼쪽에서 대기 옵션을 선택해주세요';
  placeholderText.style.fontSize = '16px';
  placeholderText.style.fontWeight = '500';
  placeholderText.style.color = '#4b5563';
  placeholderContainer.appendChild(placeholderText);

  const placeholderDesc = document.createElement('div');
  placeholderDesc.textContent = '각 옵션을 선택하면 해당 옵션에 대한 설정을 할 수 있습니다.';
  placeholderDesc.style.fontSize = '14px';
  placeholderDesc.style.color = '#6b7280';
  placeholderDesc.style.marginTop = '12px';
  placeholderContainer.appendChild(placeholderDesc);

  // 오른쪽 섹션 UI 업데이트
  updateRightSectionUI(rightSection, optionContext, currentTimeout, placeholderContainer, recorder.injectedScript, recorder);

  // 컨테이너에 좌우 섹션 추가
  content.appendChild(leftSection);
  content.appendChild(rightSection);

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


    // 오른쪽 섹션 초기화
    rightSection.innerHTML = '';

    optionContext.set({
      recorder,
      container: rightSection,
      waitState: waitStateId,
      currentTimeout,
      onTimeoutChange,
    });

    // 상세 옵션 컨텐츠
    testFn({
      recorder,
      container: rightSection, // 오른쪽 섹션에 결과 표시
      waitState: waitStateId,
      currentTimeout,
      onTimeoutChange,
    });
  });

  return content;
}

/**
 * 테스트 기능 구현 함수
 */
function testFn(options: {
  recorder: Recorder;
  container: HTMLElement;
  waitState: WaitState;
  currentTimeout?: number;
  onTimeoutChange?: (timeout: number) => void;
}) {
  // 컨테이너를 초기화하여 이전 내용 제거
  options.container.innerHTML = '';

  // 문서의 소유자로부터 document 객체를 얻음 (InjectedScript 사용하지 않음)
  const doc = options.container.ownerDocument;

  // 레코더 인스턴스 참조 - window에 저장된 특수 변수 사용
  // 타입 단언을 통해 접근
  const _injectedRecorder = options.recorder;

  switch (options.waitState) {
    case WAIT_STATE.ELEMENT:
    case WAIT_STATE.REMOVED:
      if (_injectedRecorder) {
        // 레코더가 있는 경우 handleElementWait 호출
        handleElementWait({
          container: options.container,
          currentTimeout: options.currentTimeout,
          onElementSelected: selector => {
            // optionContext에 값 세팅
            if (optionContext && optionContext.value) {
              // 선택된 셀렉터 저장
              optionContext.value.selector = selector;

              // 상태 업데이트 (필요한 경우)
              if (optionContext.value.onWaitStateChange)
                optionContext.value.onWaitStateChange(options.waitState);

              // 요소 선택 완료 후 대화상자를 다시 표시하여 UI 업데이트
              setTimeout(() => {
                showWaitForDialog(_injectedRecorder);
              }, 10);
            }
          },
          recorder: _injectedRecorder
        });
      } else {
        // 레코더가 없는 경우 - 대체 UI 표시
        const errorMsg = doc.createElement('div');
        errorMsg.style.padding = '16px';
        errorMsg.style.backgroundColor = '#fee2e2';
        errorMsg.style.color = '#991b1b';
        errorMsg.style.borderRadius = '8px';
        errorMsg.style.border = '1px solid #fecaca';
        errorMsg.style.marginBottom = '16px';
        errorMsg.textContent = '요소 선택을 위한 레코더를 찾을 수 없습니다.';
        options.container.appendChild(errorMsg);
      }
      break;
    case WAIT_STATE.NAVIGATION:
      // 네비게이션 대기 기능 구현
      const navigationContent = doc.createElement('div');
      navigationContent.style.padding = '16px';
      navigationContent.style.backgroundColor = '#f0f9ff';
      navigationContent.style.borderRadius = '8px';
      navigationContent.style.border = '1px solid #bae6fd';

      const navCode = generateTestCode('', options.currentTimeout || 5000, WAIT_STATE.NAVIGATION);

      navigationContent.innerHTML = `
        <h3 style="margin-top: 0; font-size: 16px; color: #0c4a6e;">페이지 이동 대기</h3>
        <p style="margin-bottom: 16px; font-size: 14px; color: #334155;">
          페이지 이동이 완료될 때까지 대기합니다.
        </p>
        <pre style="background-color: ${CODE_DISPLAY_STYLE.backgroundColor}; color: ${CODE_DISPLAY_STYLE.color}; padding: ${CODE_DISPLAY_STYLE.padding}; border-radius: ${CODE_DISPLAY_STYLE.borderRadius}; overflow-x: ${CODE_DISPLAY_STYLE.overflowX}; white-space: ${CODE_DISPLAY_STYLE.whiteSpace};">${navCode}</pre>
      `;

      // 사용하기 버튼 추가
      const navBtnContainer = doc.createElement('div');
      navBtnContainer.style.display = 'flex';
      navBtnContainer.style.justifyContent = 'center';
      navBtnContainer.style.marginTop = '16px';

      const navBtn = doc.createElement('button');
      navBtn.textContent = '사용하기';
      navBtn.style.padding = '8px 16px';
      navBtn.style.backgroundColor = '#3b82f6';
      navBtn.style.color = '#ffffff';
      navBtn.style.border = 'none';
      navBtn.style.borderRadius = '6px';
      navBtn.style.fontWeight = '500';
      navBtn.style.cursor = 'pointer';
      navBtn.style.fontSize = '14px';
      navBtn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';

      navBtn.addEventListener('click', () => {
        try {
          // recordWaitAction 함수 사용 - 옵션 전달
          recordWaitAction(
              _injectedRecorder,
              WAIT_STATE.NAVIGATION,
              '',
              options.currentTimeout || 5000
          );

          // 버튼 상태 변경
          navBtn.textContent = '추가됨 ✓';
          navBtn.style.backgroundColor = '#10b981';

          // 원래 상태로 복구
          setTimeout(() => {
            navBtn.textContent = '사용하기';
            navBtn.style.backgroundColor = '#3b82f6';
          }, 2000);
        } catch (e) {
          // 에러 발생 시 조용히 처리
        }
      });

      navBtnContainer.appendChild(navBtn);
      navigationContent.appendChild(navBtnContainer);
      options.container.appendChild(navigationContent);
      break;
    case WAIT_STATE.NETWORK:
      // 네트워크 요청 대기 기능 구현
      const networkContent = doc.createElement('div');
      networkContent.style.padding = '16px';
      networkContent.style.backgroundColor = '#f0f9ff';
      networkContent.style.borderRadius = '8px';
      networkContent.style.border = '1px solid #bae6fd';

      const netCode = generateTestCode('', options.currentTimeout || 5000, WAIT_STATE.NETWORK);

      networkContent.innerHTML = `
        <h3 style="margin-top: 0; font-size: 16px; color: #0c4a6e;">API 요청 대기</h3>
        <p style="margin-bottom: 16px; font-size: 14px; color: #334155;">
          특정 API 요청이 완료될 때까지 대기합니다.
        </p>
        <pre style="background-color: ${CODE_DISPLAY_STYLE.backgroundColor}; color: ${CODE_DISPLAY_STYLE.color}; padding: ${CODE_DISPLAY_STYLE.padding}; border-radius: ${CODE_DISPLAY_STYLE.borderRadius}; overflow-x: ${CODE_DISPLAY_STYLE.overflowX}; white-space: ${CODE_DISPLAY_STYLE.whiteSpace};">${netCode}</pre>
      `;

      // 사용하기 버튼 추가
      const netBtnContainer = doc.createElement('div');
      netBtnContainer.style.display = 'flex';
      netBtnContainer.style.justifyContent = 'center';
      netBtnContainer.style.marginTop = '16px';

      const netBtn = doc.createElement('button');
      netBtn.textContent = '사용하기';
      netBtn.style.padding = '8px 16px';
      netBtn.style.backgroundColor = '#3b82f6';
      netBtn.style.color = '#ffffff';
      netBtn.style.border = 'none';
      netBtn.style.borderRadius = '6px';
      netBtn.style.fontWeight = '500';
      netBtn.style.cursor = 'pointer';
      netBtn.style.fontSize = '14px';
      netBtn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';

      netBtn.addEventListener('click', () => {
        try {
          // recordWaitAction 함수 사용 - 옵션 전달
          recordWaitAction(
              _injectedRecorder,
              WAIT_STATE.NETWORK,
              '',
              options.currentTimeout || 5000
          );

          // 버튼 상태 변경
          netBtn.textContent = '추가됨 ✓';
          netBtn.style.backgroundColor = '#10b981';

          // 원래 상태로 복구
          setTimeout(() => {
            netBtn.textContent = '사용하기';
            netBtn.style.backgroundColor = '#3b82f6';
          }, 2000);
        } catch (e) {
          // 에러 발생 시 조용히 처리
        }
      });

      netBtnContainer.appendChild(netBtn);
      networkContent.appendChild(netBtnContainer);
      options.container.appendChild(networkContent);
      break;
    case WAIT_STATE.TIMEOUT:
      // 시간 지연 대기 기능 구현
      const timeoutContent = doc.createElement('div');
      timeoutContent.style.padding = '16px';
      timeoutContent.style.backgroundColor = '#f0f9ff';
      timeoutContent.style.borderRadius = '8px';
      timeoutContent.style.border = '1px solid #bae6fd';

      const timeoutCode = generateTestCode('', options.currentTimeout || 5000, WAIT_STATE.TIMEOUT);

      timeoutContent.innerHTML = `
        <h3 style="margin-top: 0; font-size: 16px; color: #0c4a6e;">시간 지연 대기</h3>
        <p style="margin-bottom: 16px; font-size: 14px; color: #334155;">
          지정된 시간(밀리초)동안 실행을 지연합니다.
        </p>
        <pre style="background-color: ${CODE_DISPLAY_STYLE.backgroundColor}; color: ${CODE_DISPLAY_STYLE.color}; padding: ${CODE_DISPLAY_STYLE.padding}; border-radius: ${CODE_DISPLAY_STYLE.borderRadius}; overflow-x: ${CODE_DISPLAY_STYLE.overflowX}; white-space: ${CODE_DISPLAY_STYLE.whiteSpace};">${timeoutCode}</pre>
      `;

      // 사용하기 버튼 추가
      const timeoutBtnContainer = doc.createElement('div');
      timeoutBtnContainer.style.display = 'flex';
      timeoutBtnContainer.style.justifyContent = 'center';
      timeoutBtnContainer.style.marginTop = '16px';

      const timeoutBtn = doc.createElement('button');
      timeoutBtn.textContent = '사용하기';
      timeoutBtn.style.padding = '8px 16px';
      timeoutBtn.style.backgroundColor = '#3b82f6';
      timeoutBtn.style.color = '#ffffff';
      timeoutBtn.style.border = 'none';
      timeoutBtn.style.borderRadius = '6px';
      timeoutBtn.style.fontWeight = '500';
      timeoutBtn.style.cursor = 'pointer';
      timeoutBtn.style.fontSize = '14px';
      timeoutBtn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';

      timeoutBtn.addEventListener('click', () => {
        try {
          // recordWaitAction 함수 사용 - 옵션 전달
          recordWaitAction(
              _injectedRecorder,
              WAIT_STATE.TIMEOUT,
              '',
              options.currentTimeout || 5000
          );

          // 버튼 상태 변경
          timeoutBtn.textContent = '추가됨 ✓';
          timeoutBtn.style.backgroundColor = '#10b981';

          // 원래 상태로 복구
          setTimeout(() => {
            timeoutBtn.textContent = '사용하기';
            timeoutBtn.style.backgroundColor = '#3b82f6';
          }, 2000);
        } catch (e) {
          // 에러 발생 시 조용히 처리
        }
      });

      timeoutBtnContainer.appendChild(timeoutBtn);
      timeoutContent.appendChild(timeoutBtnContainer);
      options.container.appendChild(timeoutContent);
      break;
    case WAIT_STATE.PAGE_LOAD:
      // 페이지 로드 대기 기능 구현
      const pageLoadContent = doc.createElement('div');
      pageLoadContent.style.padding = '16px';
      pageLoadContent.style.backgroundColor = '#f0f9ff';
      pageLoadContent.style.borderRadius = '8px';
      pageLoadContent.style.border = '1px solid #bae6fd';

      const pageLoadCode = generateTestCode('', options.currentTimeout || 5000, WAIT_STATE.PAGE_LOAD);

      pageLoadContent.innerHTML = `
        <h3 style="margin-top: 0; font-size: 16px; color: #0c4a6e;">페이지 로드 대기</h3>
        <p style="margin-bottom: 16px; font-size: 14px; color: #334155;">
          페이지 로드 상태가 완료될 때까지 대기합니다.
        </p>
        <pre style="background-color: ${CODE_DISPLAY_STYLE.backgroundColor}; color: ${CODE_DISPLAY_STYLE.color}; padding: ${CODE_DISPLAY_STYLE.padding}; border-radius: ${CODE_DISPLAY_STYLE.borderRadius}; overflow-x: ${CODE_DISPLAY_STYLE.overflowX}; white-space: ${CODE_DISPLAY_STYLE.whiteSpace};">${pageLoadCode}</pre>
      `;

      // 사용하기 버튼 추가
      const pageLoadBtnContainer = doc.createElement('div');
      pageLoadBtnContainer.style.display = 'flex';
      pageLoadBtnContainer.style.justifyContent = 'center';
      pageLoadBtnContainer.style.marginTop = '16px';

      const pageLoadBtn = doc.createElement('button');
      pageLoadBtn.textContent = '사용하기';
      pageLoadBtn.style.padding = '8px 16px';
      pageLoadBtn.style.backgroundColor = '#3b82f6';
      pageLoadBtn.style.color = '#ffffff';
      pageLoadBtn.style.border = 'none';
      pageLoadBtn.style.borderRadius = '6px';
      pageLoadBtn.style.fontWeight = '500';
      pageLoadBtn.style.cursor = 'pointer';
      pageLoadBtn.style.fontSize = '14px';
      pageLoadBtn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';

      pageLoadBtn.addEventListener('click', () => {
        try {
          // recordWaitAction 함수 사용 - 옵션 전달
          recordWaitAction(
              _injectedRecorder,
              WAIT_STATE.PAGE_LOAD,
              '',
              options.currentTimeout || 5000
          );

          // 버튼 상태 변경
          pageLoadBtn.textContent = '추가됨 ✓';
          pageLoadBtn.style.backgroundColor = '#10b981';

          // 원래 상태로 복구
          setTimeout(() => {
            pageLoadBtn.textContent = '사용하기';
            pageLoadBtn.style.backgroundColor = '#3b82f6';
          }, 2000);
        } catch (e) {
          // 에러 발생 시 조용히 처리
        }
      });

      pageLoadBtnContainer.appendChild(pageLoadBtn);
      pageLoadContent.appendChild(pageLoadBtnContainer);
      options.container.appendChild(pageLoadContent);
      break;
    default:
      break;
  }
}
