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

import { ELEMENT_SELECT_STYLES } from '../styles/waitForOptions.styles';
import { TIMEOUT } from '../constants/waitForOptions.constants';
import { showWaitForDialog } from '../utils/waitForUtils';
import { applyStyles } from '../utils/domUtils';
import { optionContext } from '../state/optionContext';

import type { ElementWaitHandlerOptions, WaitState } from '../types/waitForOptions.types';
import type { Recorder } from '../recorder';

/**
 * 요소 선택 모드 컴포넌트 핸들러 생성 함수
 * 요소 선택을 위한 UI를 생성하고, 이벤트 핸들러를 설정
 */
export function createElementWaitHandler(options: ElementWaitHandlerOptions): () => void {
  return () => handleElementWait(options);
}

/**
 * 요소 선택 후 처리를 담당하는 핸들러
 */
export function handleElementWait(options: ElementWaitHandlerOptions): void {
  const { container, recorder } = options;

  if (!recorder)
    return;


  const injectedScript = recorder.injectedScript;
  const root = container.getRootNode() as Document;
  const picker = root.querySelector('.pick-locator') as HTMLButtonElement;

  if (!picker)
    return;

  // 요소 선택 모드 설명 및 안내 표시
  const instructionsContainer = injectedScript.document.createElement('div');
  applyStyles(instructionsContainer, ELEMENT_SELECT_STYLES.INSTRUCTIONS_CONTAINER);

  const headerContainer = injectedScript.document.createElement('div');
  applyStyles(headerContainer, ELEMENT_SELECT_STYLES.HEADER_CONTAINER);

  const icon = injectedScript.document.createElement('span');
  applyStyles(icon, ELEMENT_SELECT_STYLES.ICON);
  icon.textContent = '🔍';
  headerContainer.appendChild(icon);

  const headerText = injectedScript.document.createElement('span');
  applyStyles(headerText, ELEMENT_SELECT_STYLES.HEADER_TEXT);
  headerText.textContent = '요소 선택 모드';
  headerContainer.appendChild(headerText);

  instructionsContainer.appendChild(headerContainer);

  const instructionText = injectedScript.document.createElement('p');
  applyStyles(instructionText, ELEMENT_SELECT_STYLES.INSTRUCTION_TEXT);
  instructionText.textContent = '페이지에서 대기할 요소를 클릭하세요.';
  instructionsContainer.appendChild(instructionText);

  // 컨테이너 스타일링
  applyStyles(container, ELEMENT_SELECT_STYLES.CONTAINER);

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

      // 선택된 셀렉터를 콜백을 통해 전달
      if (options.onElementSelected)
        options.onElementSelected(selectedSelector);

    } catch (err) {
      // 오류 발생 시 조용히 처리
    }
  };
}

/**
 * 요소 선택 후 처리 핸들러
 */
export function handleElementSelection(selector: string, recorder: Recorder, waitState: WaitState): void {
  // optionContext에 값 세팅
  if (optionContext && optionContext.value) {
    // 선택된 셀렉터 저장
    optionContext.value.selector = selector;

    // 상태 업데이트 (필요한 경우)
    if (optionContext.value.onWaitStateChange)
      optionContext.value.onWaitStateChange(waitState);

    // 요소 선택 완료 후 대화상자를 다시 표시하여 UI 업데이트
    setTimeout(() => {
      showWaitForDialog(recorder);
    }, TIMEOUT.ELEMENT_PICKED_DELAY);
  }
}
