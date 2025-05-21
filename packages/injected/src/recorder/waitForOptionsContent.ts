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

import {
  CONTAINER_STYLES,
  SECTION_STYLES,
  COMPONENT_STYLES
} from './styles/waitForOptions.styles';
import { WAIT_STATE, WAIT_UNTIL_OPTIONS } from './constants/waitForOptions.constants';
import {
  createLeftSection,
  createRightSection,
  createPlaceholderContainer,
  createSelectedElementResult
} from './components/waitForComponents';
import { createElementWaitHandler, handleElementSelection } from './components/elementWaitComponent';
import { applyStyles } from './utils/domUtils';
import { recordWaitAction, generateTestCode } from './utils/waitForUtils';
import { optionContext } from './state/optionContext';

import type { CreateWaitOptionsContentParams, WaitState } from './types/waitForOptions.types';
import type { Recorder } from './recorder';

/**
 * 대기 옵션 UI 컨텐츠 생성
 */
export function createWaitOptionsContent(params: CreateWaitOptionsContentParams): HTMLElement {
  const { document, currentWaitState, currentTimeout: initialTimeout, onWaitStateChange, onTimeoutChange, recorder } = params;

  // 현재 타임아웃 값 (공통 상태)
  let currentTimeout = initialTimeout;

  // 코드 블록 요소 참조 저장 (각 유형별로 생성될 코드 블록 엘리먼트)
  const codeBlockElements: Record<WaitState, HTMLPreElement | null> = {
    element: null,
    removed: null,
    navigation: null,
    network: null,
    timeout: null,
    pageLoad: null
  };

  // 선택된 셀렉터 저장 (요소 대기 관련)
  let selectedElementSelector: string | null = null;
  let selectedRemovedSelector: string | null = null;

  // URL 패턴, waitUntil 값 저장 (네비게이션 대기 관련)
  let navigationUrl = recorder.injectedScript.window.location.href;
  let navigationWaitUntil = 'networkidle';

  // API 요청 URL 패턴 저장 (네트워크 대기 관련)
  let networkUrlPattern = '/api';

  // 현재 선택된 대기 상태
  let activeWaitState = currentWaitState;

  // 메인 컨테이너 생성
  const container = document.createElement('div');
  applyStyles(container, CONTAINER_STYLES.MAIN);

  // 컨텍스트 설정
  optionContext.set({
    recorder,
    waitState: currentWaitState || undefined,
    currentTimeout,
    // 중요: 이 핸들러는 왼쪽 "대기 시간 설정" 섹션에서 시간 변경 시 호출됨
    onTimeoutChange: newTimeout => {
      // 타임아웃 값 업데이트
      currentTimeout = newTimeout;

      // 옵션 컨텍스트의 currentTimeout 값도 업데이트
      if (optionContext.value)
        optionContext.value.currentTimeout = newTimeout;

      // 상위 컴포넌트에 알림
      onTimeoutChange(newTimeout);

      // 현재 활성화된 대기 상태에 따라 코드 블록 업데이트
      updateCodeBlockForCurrentState(newTimeout);
    },
    onWaitStateChange
  });

  // 현재 대기 상태에 맞는 코드 블록 업데이트 함수
  function updateCodeBlockForCurrentState(timeout: number): void {
    // 활성화된 대기 상태가 없으면 반환
    if (!activeWaitState)
      return;

    // 현재 활성화된 대기 상태에 해당하는 코드 블록 요소
    const codeBlock = codeBlockElements[activeWaitState];
    if (!codeBlock)
      return;

    // 선택된 대기 유형에 따라 적절한 코드 생성
    let code = '';

    switch (activeWaitState) {
      case WAIT_STATE.ELEMENT:
        if (selectedElementSelector)
          code = generateTestCode(selectedElementSelector, timeout, WAIT_STATE.ELEMENT);

        break;

      case WAIT_STATE.REMOVED:
        if (selectedRemovedSelector)
          code = generateTestCode(selectedRemovedSelector, timeout, WAIT_STATE.REMOVED);

        break;

      case WAIT_STATE.NAVIGATION:
        code = generateTestCode(navigationUrl, timeout, WAIT_STATE.NAVIGATION, navigationWaitUntil);
        break;

      case WAIT_STATE.NETWORK:
        code = `await page.waitForResponse(response => response.url().includes('${networkUrlPattern}'), { timeout: ${timeout} });`;
        break;

      case WAIT_STATE.TIMEOUT:
        code = `await page.waitForTimeout(${timeout});`;
        break;

      case WAIT_STATE.PAGE_LOAD:
        code = `await page.waitForLoadState('load', { timeout: ${timeout} });`;
        break;
    }

    // 코드가 생성되었으면 코드 블록 업데이트
    if (code)
      codeBlock.textContent = code;

  }

  // 왼쪽 섹션 생성
  const leftSection = createLeftSection({
    document,
    currentWaitState,
    activeTimeout: currentTimeout,
    onOptionSelect: handleOptionSelect
  });

  // 오른쪽 섹션 생성
  const rightSection = createRightSection(document);

  // 초기 컨텐츠 설정
  if (currentWaitState) {
    updateRightSectionContent(rightSection, currentWaitState, currentTimeout, recorder);
  } else {
    // 기본 안내 메시지 표시
    rightSection.appendChild(createPlaceholderContainer(document));
  }

  // 컨테이너에 섹션 추가
  container.appendChild(leftSection);
  container.appendChild(rightSection);

  /**
   * 옵션 선택 핸들러
   */
  function handleOptionSelect(waitState: WaitState): void {
    // 활성화된 대기 상태 업데이트
    activeWaitState = waitState;

    // 대기 상태 변경 콜백 호출
    onWaitStateChange(waitState);

    // 오른쪽 섹션 내용 업데이트
    updateRightSectionContent(rightSection, waitState, currentTimeout, recorder);
  }

  /**
   * 오른쪽 섹션 컨텐츠 업데이트
   */
  function updateRightSectionContent(
    container: HTMLElement,
    waitState: WaitState,
    timeout: number,
    recorder: Recorder
  ): void {
    // 컨테이너 초기화
    container.innerHTML = '';

    // 타임아웃 값 업데이트 (WaitForTool 클래스 인스턴스에서 사용)
    optionContext.get()?.onTimeoutChange?.(timeout);

    // 선택된 대기 유형에 따라 다른 컨텐츠 표시
    switch (waitState) {
      case WAIT_STATE.ELEMENT:
        createElementWaitSection(container, timeout, recorder);
        break;
      case WAIT_STATE.REMOVED:
        createRemovedElementWaitSection(container, timeout, recorder);
        break;
      case WAIT_STATE.NAVIGATION:
        createNavigationWaitSection(container, timeout, recorder);
        break;
      case WAIT_STATE.NETWORK:
        createNetworkWaitSection(container, timeout, recorder);
        break;
      case WAIT_STATE.TIMEOUT:
        createTimeoutWaitSection(container, timeout, recorder);
        break;
      case WAIT_STATE.PAGE_LOAD:
        createPageLoadWaitSection(container, timeout, recorder);
        break;
      default:
        container.appendChild(createPlaceholderContainer(recorder.injectedScript.document));
    }
  }

  /**
   * 요소 대기 섹션 생성
   */
  function createElementWaitSection(container: HTMLElement, timeout: number, recorder: Recorder): void {
    const injectedScript = recorder.injectedScript;
    const doc = injectedScript.document;

    // 섹션 생성
    const section = doc.createElement('div');
    applyStyles(section, SECTION_STYLES.CONTAINER);

    // 헤더
    const header = doc.createElement('h3');
    applyStyles(header, SECTION_STYLES.HEADER);
    header.textContent = '요소 표시 대기';
    section.appendChild(header);

    // 설명
    const description = doc.createElement('p');
    applyStyles(description, SECTION_STYLES.DESCRIPTION);
    description.textContent = '페이지에서 특정 요소가 표시될 때까지 대기합니다. 아래 버튼을 클릭하여 요소를 선택하세요.';
    section.appendChild(description);

    // 요소 선택 버튼
    const elementPickerContainer = doc.createElement('div');
    section.appendChild(elementPickerContainer);

    // 요소 선택 핸들러 설정
    const elementWaitHandler = createElementWaitHandler({
      container: elementPickerContainer,
      recorder,
      waitState: WAIT_STATE.ELEMENT,
      currentTimeout: timeout,
      onElementSelected: (selector: string) => {
        // 선택된 요소 셀렉터 저장
        selectedElementSelector = selector;

        handleElementSelection(selector, recorder, WAIT_STATE.ELEMENT);

        // 선택 후 결과 표시
        if (selector) {
          // 기존 결과 제거
          const previousResult = section.querySelector('.result-container');
          if (previousResult)
            section.removeChild(previousResult);

          // 최신 타임아웃 값 가져오기
          const currentTimeout = optionContext.get()?.currentTimeout || timeout;

          // 새 결과 추가
          const resultElement = createSelectedElementResult(
              selector,
              currentTimeout,
              injectedScript,
              WAIT_STATE.ELEMENT,
              recorder
          );

          // 코드 블록 참조 저장
          const codeBlock = resultElement.querySelector('pre');
          if (codeBlock && codeBlock instanceof HTMLPreElement)
            codeBlockElements[WAIT_STATE.ELEMENT] = codeBlock;

          section.appendChild(resultElement);
        }
      }
    });

    // 핸들러 실행 및 초기 UI 설정
    elementWaitHandler();

    container.appendChild(section);
  }

  /**
   * 요소 제거 대기 섹션 생성
   */
  function createRemovedElementWaitSection(container: HTMLElement, timeout: number, recorder: Recorder): void {
    const injectedScript = recorder.injectedScript;
    const doc = injectedScript.document;

    // 섹션 생성
    const section = doc.createElement('div');
    applyStyles(section, SECTION_STYLES.CONTAINER);

    // 헤더
    const header = doc.createElement('h3');
    applyStyles(header, SECTION_STYLES.HEADER);
    header.textContent = '요소 제거 대기';
    section.appendChild(header);

    // 설명
    const description = doc.createElement('p');
    applyStyles(description, SECTION_STYLES.DESCRIPTION);
    description.textContent = '페이지에서 특정 요소가 사라질 때까지 대기합니다. 아래 버튼을 클릭하여 요소를 선택하세요.';
    section.appendChild(description);

    // 요소 선택 버튼
    const elementPickerContainer = doc.createElement('div');
    section.appendChild(elementPickerContainer);

    // 요소 선택 핸들러 설정
    const elementWaitHandler = createElementWaitHandler({
      container: elementPickerContainer,
      recorder,
      waitState: WAIT_STATE.REMOVED,
      currentTimeout: timeout,
      onElementSelected: (selector: string) => {
        // 선택된 제거 요소 셀렉터 저장
        selectedRemovedSelector = selector;

        handleElementSelection(selector, recorder, WAIT_STATE.REMOVED);

        // 선택 후 결과 표시
        if (selector) {
          // 기존 결과 제거
          const previousResult = section.querySelector('.result-container');
          if (previousResult)
            section.removeChild(previousResult);

          // 최신 타임아웃 값 가져오기
          const currentTimeout = optionContext.get()?.currentTimeout || timeout;

          // 새 결과 추가
          const resultElement = createSelectedElementResult(
              selector,
              currentTimeout,
              injectedScript,
              WAIT_STATE.REMOVED,
              recorder
          );

          // 코드 블록 참조 저장
          const codeBlock = resultElement.querySelector('pre');
          if (codeBlock && codeBlock instanceof HTMLPreElement)
            codeBlockElements[WAIT_STATE.REMOVED] = codeBlock;

          section.appendChild(resultElement);
        }
      }
    });

    // 핸들러 실행 및 초기 UI 설정
    elementWaitHandler();

    container.appendChild(section);
  }

  /**
   * 네비게이션 대기 섹션 생성
   */
  function createNavigationWaitSection(container: HTMLElement, timeout: number, recorder: Recorder): void {
    const injectedScript = recorder.injectedScript;
    const doc = injectedScript.document;

    // 섹션 생성
    const section = doc.createElement('div');
    applyStyles(section, SECTION_STYLES.CONTAINER);

    // 헤더
    const header = doc.createElement('h3');
    applyStyles(header, SECTION_STYLES.HEADER);
    header.textContent = '페이지 이동 대기';
    section.appendChild(header);

    // 설명
    const description = doc.createElement('p');
    applyStyles(description, SECTION_STYLES.DESCRIPTION);
    description.textContent = '페이지 이동이 완료될 때까지 대기합니다. URL 패턴을 선택적으로 지정할 수 있습니다.';
    section.appendChild(description);

    // 현재 URL 가져오기
    const currentUrl = injectedScript.window.location.href;
    navigationUrl = currentUrl;

    // URL 입력 컨테이너
    const urlInputContainer = doc.createElement('div');
    applyStyles(urlInputContainer, SECTION_STYLES.INPUT_CONTAINER);

    // URL 라벨
    const urlLabel = doc.createElement('label');
    applyStyles(urlLabel, SECTION_STYLES.LABEL);
    urlLabel.textContent = 'URL 패턴 (선택사항)';
    urlInputContainer.appendChild(urlLabel);

    // URL 입력 필드
    const urlInput = doc.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = '예: https://example.com/page*';
    // 컨텍스트에 URL이 있으면 사용, 없으면 현재 URL 사용
    urlInput.value = navigationUrl;
    applyStyles(urlInput, SECTION_STYLES.TEXT_INPUT);
    urlInputContainer.appendChild(urlInput);

    // 정보 텍스트
    const urlInfo = doc.createElement('div');
    applyStyles(urlInfo, SECTION_STYLES.INFO_TEXT);
    urlInfo.textContent = '와일드카드(*) 사용 가능. 비워두면 모든 네비게이션에 대기합니다.';
    urlInputContainer.appendChild(urlInfo);

    section.appendChild(urlInputContainer);

    // waitUntil 옵션 선택 컨테이너
    const waitUntilContainer = doc.createElement('div');
    applyStyles(waitUntilContainer, SECTION_STYLES.INPUT_CONTAINER);

    // waitUntil 라벨
    const waitUntilLabel = doc.createElement('label');
    applyStyles(waitUntilLabel, SECTION_STYLES.LABEL);
    waitUntilLabel.textContent = '대기 시점';
    waitUntilContainer.appendChild(waitUntilLabel);

    // waitUntil 드롭다운
    const waitUntilSelect = doc.createElement('select');
    applyStyles(waitUntilSelect, SECTION_STYLES.SELECT);

    // waitUntil 옵션 추가
    WAIT_UNTIL_OPTIONS.forEach(option => {
      const optionElement = doc.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;

      // 기존 선택값이 있으면 설정
      if (navigationWaitUntil === option.value)
        optionElement.selected = true;

      waitUntilSelect.appendChild(optionElement);
    });

    waitUntilContainer.appendChild(waitUntilSelect);
    section.appendChild(waitUntilContainer);

    // 코드 블록 생성
    const codeContainer = doc.createElement('div');
    applyStyles(codeContainer, SECTION_STYLES.CODE_CONTAINER);

    // 코드 헤더
    const codeHeader = doc.createElement('p');
    applyStyles(codeHeader, COMPONENT_STYLES.CODE_HEADING);
    codeHeader.textContent = '생성될 테스트 코드';
    codeContainer.appendChild(codeHeader);

    // 코드 미리보기
    const codeBlock = doc.createElement('pre');
    applyStyles(codeBlock, COMPONENT_STYLES.CODE_BLOCK);

    // 코드 생성 및 표시
    const code = generateTestCode(urlInput.value, timeout, WAIT_STATE.NAVIGATION, waitUntilSelect.value);
    codeBlock.textContent = code;

    // 코드 블록 참조 저장
    codeBlockElements[WAIT_STATE.NAVIGATION] = codeBlock;

    codeContainer.appendChild(codeBlock);
    section.appendChild(codeContainer);

    // 사용 버튼 컨테이너
    const buttonContainer = doc.createElement('div');
    applyStyles(buttonContainer, SECTION_STYLES.BUTTON_CONTAINER);

    // 사용 버튼
    const useButton = doc.createElement('button');
    applyStyles(useButton, COMPONENT_STYLES.COPY_BUTTON);
    useButton.textContent = '사용하기';

    useButton.addEventListener('click', () => {
      // 버튼 상태 변경
      useButton.textContent = '추가됨 ✓';
      useButton.style.backgroundColor = COMPONENT_STYLES.SUCCESS_BUTTON.backgroundColor;

      // 최신 타임아웃 값 가져오기
      const currentTimeout = optionContext.get()?.currentTimeout || timeout;

      // 액션 기록
      recordWaitAction(
          recorder,
          WAIT_STATE.NAVIGATION,
          urlInput.value,
          currentTimeout,
          waitUntilSelect.value
      );

      // 버튼 상태 복구
      setTimeout(() => {
        useButton.textContent = '사용하기';
        useButton.style.backgroundColor = COMPONENT_STYLES.COPY_BUTTON.backgroundColor;
      }, 2000);
    });

    buttonContainer.appendChild(useButton);
    section.appendChild(buttonContainer);

    // URL 또는 waitUntil이 변경되면 코드 블록 업데이트 및 상태 저장
    urlInput.addEventListener('input', () => {
      navigationUrl = urlInput.value;
      updateCodeBlockForCurrentState(currentTimeout);
    });

    waitUntilSelect.addEventListener('change', () => {
      navigationWaitUntil = waitUntilSelect.value;
      updateCodeBlockForCurrentState(currentTimeout);
    });

    container.appendChild(section);
  }

  /**
   * 네트워크 대기 섹션 생성
   */
  function createNetworkWaitSection(container: HTMLElement, timeout: number, recorder: Recorder): void {
    const injectedScript = recorder.injectedScript;
    const doc = injectedScript.document;

    // 섹션 생성
    const section = doc.createElement('div');
    applyStyles(section, SECTION_STYLES.CONTAINER);

    // 헤더
    const header = doc.createElement('h3');
    applyStyles(header, SECTION_STYLES.HEADER);
    header.textContent = 'API 요청 대기';
    section.appendChild(header);

    // 설명
    const description = doc.createElement('p');
    applyStyles(description, SECTION_STYLES.DESCRIPTION);
    description.textContent = '특정 API 요청이 완료될 때까지 대기합니다. API 경로를 포함한 URL의 일부를 입력하세요.';
    section.appendChild(description);

    // URL 패턴 입력 컨테이너
    const urlPatternContainer = doc.createElement('div');
    applyStyles(urlPatternContainer, SECTION_STYLES.INPUT_CONTAINER);

    // URL 패턴 라벨
    const urlPatternLabel = doc.createElement('label');
    applyStyles(urlPatternLabel, SECTION_STYLES.LABEL);
    urlPatternLabel.textContent = 'URL 패턴 (API 경로)';
    urlPatternContainer.appendChild(urlPatternLabel);

    // URL 패턴 입력 필드
    const urlPatternInput = doc.createElement('input');
    urlPatternInput.type = 'text';
    urlPatternInput.placeholder = '예: /api/users 또는 api.example.com';
    urlPatternInput.value = networkUrlPattern;
    applyStyles(urlPatternInput, SECTION_STYLES.TEXT_INPUT);
    urlPatternContainer.appendChild(urlPatternInput);

    section.appendChild(urlPatternContainer);

    // 코드 블록 생성
    const codeContainer = doc.createElement('div');
    applyStyles(codeContainer, SECTION_STYLES.CODE_CONTAINER);

    // 코드 헤더
    const codeHeader = doc.createElement('p');
    applyStyles(codeHeader, COMPONENT_STYLES.CODE_HEADING);
    codeHeader.textContent = '생성될 테스트 코드';
    codeContainer.appendChild(codeHeader);

    // 코드 미리보기
    const codeBlock = doc.createElement('pre');
    applyStyles(codeBlock, COMPONENT_STYLES.CODE_BLOCK);

    // 코드 생성 및 표시
    codeBlock.textContent = `await page.waitForResponse(response => response.url().includes('${urlPatternInput.value}'), { timeout: ${timeout} });`;

    // 코드 블록 참조 저장
    codeBlockElements[WAIT_STATE.NETWORK] = codeBlock;

    codeContainer.appendChild(codeBlock);
    section.appendChild(codeContainer);

    // 사용 버튼 컨테이너
    const buttonContainer = doc.createElement('div');
    applyStyles(buttonContainer, SECTION_STYLES.BUTTON_CONTAINER);

    // 사용 버튼
    const useButton = doc.createElement('button');
    applyStyles(useButton, COMPONENT_STYLES.COPY_BUTTON);
    useButton.textContent = '사용하기';

    useButton.addEventListener('click', () => {
      // 버튼 상태 변경
      useButton.textContent = '추가됨 ✓';
      useButton.style.backgroundColor = COMPONENT_STYLES.SUCCESS_BUTTON.backgroundColor;

      // 최신 타임아웃 값 가져오기
      const currentTimeout = optionContext.get()?.currentTimeout || timeout;

      // 액션 기록
      recordWaitAction(
          recorder,
          WAIT_STATE.NETWORK,
          urlPatternInput.value,
          currentTimeout
      );

      // 버튼 상태 복구
      setTimeout(() => {
        useButton.textContent = '사용하기';
        useButton.style.backgroundColor = COMPONENT_STYLES.COPY_BUTTON.backgroundColor;
      }, 2000);
    });

    buttonContainer.appendChild(useButton);
    section.appendChild(buttonContainer);

    // URL 패턴 변경 시 상태 업데이트
    urlPatternInput.addEventListener('input', () => {
      networkUrlPattern = urlPatternInput.value;
      updateCodeBlockForCurrentState(currentTimeout);
    });

    container.appendChild(section);
  }

  /**
   * 타임아웃 대기 섹션 생성
   */
  function createTimeoutWaitSection(container: HTMLElement, timeout: number, recorder: Recorder): void {
    const injectedScript = recorder.injectedScript;
    const doc = injectedScript.document;

    // 섹션 생성
    const section = doc.createElement('div');
    applyStyles(section, SECTION_STYLES.CONTAINER);

    // 헤더
    const header = doc.createElement('h3');
    applyStyles(header, SECTION_STYLES.HEADER);
    header.textContent = '시간 지연 대기';
    section.appendChild(header);

    // 설명
    const description = doc.createElement('p');
    applyStyles(description, SECTION_STYLES.DESCRIPTION);
    description.textContent = '지정된 시간(밀리초)만큼 실행을 일시 중지합니다. 좌측에서 시간을 조정할 수 있습니다.';
    section.appendChild(description);

    // 코드 블록 생성
    const codeContainer = doc.createElement('div');
    applyStyles(codeContainer, SECTION_STYLES.CODE_CONTAINER);

    // 코드 헤더
    const codeHeader = doc.createElement('p');
    applyStyles(codeHeader, COMPONENT_STYLES.CODE_HEADING);
    codeHeader.textContent = '생성될 테스트 코드';
    codeContainer.appendChild(codeHeader);

    // 코드 미리보기
    const codeBlock = doc.createElement('pre');
    applyStyles(codeBlock, COMPONENT_STYLES.CODE_BLOCK);

    // 코드 생성 및 표시
    codeBlock.textContent = `await page.waitForTimeout(${timeout});`;

    // 코드 블록 참조 저장
    codeBlockElements[WAIT_STATE.TIMEOUT] = codeBlock;

    codeContainer.appendChild(codeBlock);

    // 코드 설명
    const codeDescription = doc.createElement('p');
    applyStyles(codeDescription, COMPONENT_STYLES.CODE_DESCRIPTION);
    codeDescription.textContent = '주의: 시간 지연은 안정적인 테스트 방법이 아닙니다. 가능하면 요소나 상태 기반 대기를 사용하세요.';
    codeContainer.appendChild(codeDescription);

    section.appendChild(codeContainer);

    // 사용 버튼 컨테이너
    const buttonContainer = doc.createElement('div');
    applyStyles(buttonContainer, SECTION_STYLES.BUTTON_CONTAINER);

    // 사용 버튼
    const useButton = doc.createElement('button');
    applyStyles(useButton, COMPONENT_STYLES.COPY_BUTTON);
    useButton.textContent = '사용하기';

    useButton.addEventListener('click', () => {
      // 버튼 상태 변경
      useButton.textContent = '추가됨 ✓';
      useButton.style.backgroundColor = COMPONENT_STYLES.SUCCESS_BUTTON.backgroundColor;

      // 최신 타임아웃 값 가져오기
      const currentTimeout = optionContext.get()?.currentTimeout || timeout;

      // 액션 기록
      recordWaitAction(
          recorder,
          WAIT_STATE.TIMEOUT,
          '',
          currentTimeout
      );

      // 버튼 상태 복구
      setTimeout(() => {
        useButton.textContent = '사용하기';
        useButton.style.backgroundColor = COMPONENT_STYLES.COPY_BUTTON.backgroundColor;
      }, 2000);
    });

    buttonContainer.appendChild(useButton);
    section.appendChild(buttonContainer);

    container.appendChild(section);
  }

  /**
   * 페이지 로드 대기 섹션 생성
   */
  function createPageLoadWaitSection(container: HTMLElement, timeout: number, recorder: Recorder): void {
    const injectedScript = recorder.injectedScript;
    const doc = injectedScript.document;

    // 섹션 생성
    const section = doc.createElement('div');
    applyStyles(section, SECTION_STYLES.CONTAINER);

    // 헤더
    const header = doc.createElement('h3');
    applyStyles(header, SECTION_STYLES.HEADER);
    header.textContent = '페이지 로드 대기';
    section.appendChild(header);

    // 설명
    const description = doc.createElement('p');
    applyStyles(description, SECTION_STYLES.DESCRIPTION);
    description.textContent = '페이지 로드 상태까지 대기합니다. 페이지 이동 후 자동으로 대기하고 싶을 때 사용하세요.';
    section.appendChild(description);

    // 코드 블록 생성
    const codeContainer = doc.createElement('div');
    applyStyles(codeContainer, SECTION_STYLES.CODE_CONTAINER);

    // 코드 헤더
    const codeHeader = doc.createElement('p');
    applyStyles(codeHeader, COMPONENT_STYLES.CODE_HEADING);
    codeHeader.textContent = '생성될 테스트 코드';
    codeContainer.appendChild(codeHeader);

    // 코드 미리보기
    const codeBlock = doc.createElement('pre');
    applyStyles(codeBlock, COMPONENT_STYLES.CODE_BLOCK);

    // 코드 생성 및 표시
    codeBlock.textContent = `await page.waitForLoadState('load', { timeout: ${timeout} });`;

    // 코드 블록 참조 저장
    codeBlockElements[WAIT_STATE.PAGE_LOAD] = codeBlock;

    codeContainer.appendChild(codeBlock);
    section.appendChild(codeContainer);

    // 사용 버튼 컨테이너
    const buttonContainer = doc.createElement('div');
    applyStyles(buttonContainer, SECTION_STYLES.BUTTON_CONTAINER);

    // 사용 버튼
    const useButton = doc.createElement('button');
    applyStyles(useButton, COMPONENT_STYLES.COPY_BUTTON);
    useButton.textContent = '사용하기';

    useButton.addEventListener('click', () => {
      // 버튼 상태 변경
      useButton.textContent = '추가됨 ✓';
      useButton.style.backgroundColor = COMPONENT_STYLES.SUCCESS_BUTTON.backgroundColor;

      // 최신 타임아웃 값 가져오기
      const currentTimeout = optionContext.get()?.currentTimeout || timeout;

      // 액션 기록
      recordWaitAction(
          recorder,
          WAIT_STATE.PAGE_LOAD,
          '',
          currentTimeout
      );

      // 버튼 상태 복구
      setTimeout(() => {
        useButton.textContent = '사용하기';
        useButton.style.backgroundColor = COMPONENT_STYLES.COPY_BUTTON.backgroundColor;
      }, 2000);
    });

    buttonContainer.appendChild(useButton);
    section.appendChild(buttonContainer);

    container.appendChild(section);
  }

  return container;
}
