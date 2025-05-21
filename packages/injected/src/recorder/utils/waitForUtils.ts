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

import { WAIT_STATE, TIMEOUT } from '../constants/waitForOptions.constants';

import type { InjectedScript } from '../injected';
import type { Recorder } from '../recorder';
import type { WaitState } from '../types/waitForOptions.types';

/**
 * WaitForTool에 있는 정적 플래그를 리셋
 * 해당 플래그는 모달 표시 시 체크되는 값
 */
export function resetWaitForDialogState(injectedScript: InjectedScript): void {
  // 글로벌 플래그를 통해 WaitForTool._isAnyDialogShowing를 리셋합니다
  (injectedScript.window as any).__pw_resetWaitDialogState = true;
}

/**
 * 클릭된 요소에서 가장 가까운 선택자에 해당하는 부모 요소 찾기
 */
export function findClosestElement(element: HTMLElement, selector: string): HTMLElement | null {
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
 * WaitForDialog를 표시하는 함수
 */
export function showWaitForDialog(recorder: Recorder): void {
  // 현재 WaitingFor 상태가 아닌 경우에만 모드 변경
  if (recorder.state.mode !== 'waitingFor')
    recorder.setMode('waitingFor');

  // WaitForTool._isAnyDialogShowing 플래그 초기화
  resetWaitForDialogState(recorder.injectedScript);

  // WaitForTool 인스턴스에 접근하여 showDialog 메서드 호출
  setTimeout(() => {
    // waitFor 툴바 버튼을 트리거하여 툴을 활성화
    const waitForToggle = recorder.injectedScript.document.querySelector('x-pw-tool-item.wait-for');
    if (waitForToggle && waitForToggle instanceof HTMLElement) {
      // waitingFor 모드로 들어가도록 함
      waitForToggle.click();

      // 모드 변경이 적용된 후 WaitForTool 인스턴스에 직접 명령을 전달
      setTimeout(() => {
        const waitForTool = getWaitForToolInstance(recorder);
        if (waitForTool)
          waitForTool.showDialog();

      }, TIMEOUT.DIALOG_SHOW_DELAY);
    }
  }, 0);
}

/**
 * Recorder 객체에서 WaitForTool 인스턴스에 접근하는 헬퍼 함수
 */
export function getWaitForToolInstance(recorder: Recorder): any {
  // 모든 툴에 접근
  const tools = (recorder as any)._tools;
  if (tools && tools.waitingFor)
    return tools.waitingFor;

  return null;
}

/**
 * 요소 선택 후 처리를 담당하는 핸들러
 */
export function handleElementSelection(selector: string, recorder: Recorder, waitState: WaitState): void {
  if (recorder) {
    // 약간의 지연 후 모달 표시
    setTimeout(() => {
      showWaitForDialog(recorder);
    }, TIMEOUT.ELEMENT_PICKED_DELAY);
  }
}

/**
 * 스타일을 HTML 요소에 적용하는 유틸리티 함수
 */
export function applyStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key as any] = value;
  });
}

/**
 * 선택된 셀렉터로 테스트 코드를 생성하는 함수
 */
export function generateTestCode(
  selector: string,
  timeout: number,
  waitState: WaitState,
  waitUntil: string = 'networkidle'
): string {
  switch (waitState) {
    case WAIT_STATE.ELEMENT:
      return `await page.waitForSelector('${selector}', { state: 'visible', timeout: ${timeout} });`;
    case WAIT_STATE.REMOVED:
      return `await page.waitForSelector('${selector}', { state: 'hidden', timeout: ${timeout} });`;
    case WAIT_STATE.NAVIGATION:
      if (selector && selector.trim() !== '')
        return `await page.waitForNavigation({ url: '${selector}', waitUntil: '${waitUntil}', timeout: ${timeout} });`;
      else
        return `await page.waitForNavigation({ waitUntil: '${waitUntil}', timeout: ${timeout} });`;
    case WAIT_STATE.NETWORK:
      return `await page.waitForResponse(response => response.url().includes('/api'), { timeout: ${timeout} });`;
    case WAIT_STATE.TIMEOUT:
      return `await page.waitForTimeout(${timeout});`;
    case WAIT_STATE.PAGE_LOAD:
      return `await page.waitForLoadState('load', { timeout: ${timeout} });`;
    default:
      return `await page.waitForSelector('${selector}', { state: 'visible', timeout: ${timeout} });`;
  }
}

/**
 * 레코더에 대기 동작 기록하는 함수
 */
export function recordWaitAction(
  recorder: Recorder,
  waitState: WaitState,
  selector: string,
  timeout: number,
  waitUntil: string = 'networkidle'
): void {
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
            waitUntil
          },
          signals: []
        };

        // URL이 지정된 경우에만 추가
        if (selector && selector.trim() !== '')
          action.options.url = selector;

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
    // error 처리
  }
}
