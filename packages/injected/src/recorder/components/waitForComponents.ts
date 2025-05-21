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
  COMPONENT_STYLES,
  CONTAINER_STYLES,
  PLACEHOLDER_STYLES,
  CARD_STYLES,
  TIMEOUT_STYLES
} from '../styles/waitForOptions.styles';
import { WAIT_OPTIONS, TIMEOUT_PRESETS } from '../constants/waitForOptions.constants';
import { applyStyles } from '../utils/domUtils';
import { recordWaitAction, generateTestCode } from '../utils/waitForUtils';
import { optionContext } from '../state/optionContext';

import type { WaitState, LeftSectionOptions } from '../types/waitForOptions.types';
import type { InjectedScript } from '../injected';
import type { Recorder } from '../recorder';

/**
 * 선택된 요소 결과 컨테이너 생성
 */
export function createSelectedElementResult(
  selector: string,
  timeout: number,
  injectedScript: InjectedScript,
  waitState: WaitState,
  recorder: Recorder,
  onTimeoutChange?: (newTimeout: number) => void
): HTMLDivElement {
  const resultDiv = injectedScript.document.createElement('div');
  applyStyles(resultDiv, COMPONENT_STYLES.RESULT_CONTAINER);

  const testCode = generateTestCode(
      selector,
      timeout,
      waitState,
      optionContext.value?.waitUntil || 'networkidle'
  );

  resultDiv.appendChild(createSuccessHeader(injectedScript, waitState));
  resultDiv.appendChild(createSelectorDisplay(selector, injectedScript));

  // 코드 블록 생성
  const codeBlockElement = createCodeBlock(testCode, injectedScript, waitState);
  resultDiv.appendChild(codeBlockElement);

  // 중요: 파라미터로 받은 onTimeoutChange 핸들러가 있으면 글로벌 업데이트 등록
  if (onTimeoutChange && optionContext.value) {
    // 기존 핸들러 저장
    const originalTimeoutChange = optionContext.value.onTimeoutChange;

    // 새 핸들러 설정
    optionContext.value.onTimeoutChange = (newTimeout: number) => {
      // 원래 핸들러 호출
      if (originalTimeoutChange)
        originalTimeoutChange(newTimeout);

      // 전달받은 커스텀 핸들러 호출
      onTimeoutChange(newTimeout);
    };
  }

  resultDiv.appendChild(createUseButton(selector, timeout, waitState, injectedScript, recorder));

  return resultDiv;
}

/**
 * 성공 헤더 요소 생성
 */
export function createSuccessHeader(injectedScript: InjectedScript, waitState: WaitState): HTMLDivElement {
  const header = injectedScript.document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '12px';

  const icon = injectedScript.document.createElement('span');
  applyStyles(icon, COMPONENT_STYLES.SUCCESS_ICON);
  icon.textContent = '✅';

  const text = injectedScript.document.createElement('span');
  applyStyles(text, COMPONENT_STYLES.SUCCESS_TEXT);
  text.textContent = '요소가 선택되었습니다';

  header.appendChild(icon);
  header.appendChild(text);
  return header;
}

/**
 * 선택자 정보를 보여주는 컨테이너 요소 생성
 */
export function createSelectorDisplay(selector: string, injectedScript: InjectedScript): HTMLDivElement {
  const container = injectedScript.document.createElement('div');
  applyStyles(container, COMPONENT_STYLES.SELECTOR_CONTAINER);
  container.textContent = selector;
  return container;
}

/**
 * 코드 블록 요소 생성
 */
export function createCodeBlock(testCode: string, injectedScript: InjectedScript, waitState: WaitState): HTMLElement {
  const container = injectedScript.document.createElement('div');

  const heading = injectedScript.document.createElement('p');
  applyStyles(heading, COMPONENT_STYLES.CODE_HEADING);
  heading.textContent = '생성된 테스트 코드';

  const codeBlock = injectedScript.document.createElement('pre');
  applyStyles(codeBlock, COMPONENT_STYLES.CODE_BLOCK);
  codeBlock.textContent = testCode;

  const description = injectedScript.document.createElement('p');
  applyStyles(description, COMPONENT_STYLES.CODE_DESCRIPTION);

  if (waitState === 'removed')
    description.textContent = '이 코드는 해당 요소가 화면에서 사라질 때까지 대기합니다.';
  else
    description.textContent = '이 코드는 해당 요소가 화면에 나타날 때까지 대기합니다.';


  container.appendChild(heading);
  container.appendChild(codeBlock);
  container.appendChild(description);

  return container;
}

/**
 * 사용 버튼 요소 생성 및 이벤트 설정
 */
export function createUseButton(
  selector: string,
  timeout: number,
  waitState: WaitState,
  injectedScript: InjectedScript,
  recorder: Recorder
): HTMLDivElement {
  const buttonContainer = injectedScript.document.createElement('div');
  applyStyles(buttonContainer, COMPONENT_STYLES.BUTTON_CONTAINER);

  const useButton = injectedScript.document.createElement('button');
  applyStyles(useButton, COMPONENT_STYLES.COPY_BUTTON);
  useButton.textContent = '사용하기';

  useButton.addEventListener('click', () => {
    try {
      // 버튼 상태 변경
      const originalText = useButton.textContent;
      useButton.textContent = '추가됨 ✓';
      useButton.style.backgroundColor = COMPONENT_STYLES.SUCCESS_BUTTON.backgroundColor;

      // 현재 컨텍스트에서 최신 타임아웃 값 가져오기
      const currentTimeout = optionContext.value?.currentTimeout || timeout;

      // 액션 기록
      recordWaitAction(
          recorder,
          waitState,
          selector,
          currentTimeout,
          optionContext.value?.waitUntil || 'networkidle'
      );

      // 버튼 상태 복구
      setTimeout(() => {
        useButton.textContent = originalText;
        useButton.style.backgroundColor = COMPONENT_STYLES.COPY_BUTTON.backgroundColor;
      }, 2000);
    } catch (e) {
      // error 처리
    }
  });

  buttonContainer.appendChild(useButton);
  return buttonContainer;
}

/**
 * 안내 메시지 컨테이너 생성
 */
export function createPlaceholderContainer(document: Document): HTMLDivElement {
  const container = document.createElement('div');
  applyStyles(container, PLACEHOLDER_STYLES.CONTAINER);

  const icon = document.createElement('div');
  applyStyles(icon, PLACEHOLDER_STYLES.ICON);
  icon.textContent = '👈';
  container.appendChild(icon);

  const title = document.createElement('div');
  applyStyles(title, PLACEHOLDER_STYLES.TITLE);
  title.textContent = '왼쪽에서 대기 옵션을 선택해주세요';
  container.appendChild(title);

  const description = document.createElement('div');
  applyStyles(description, PLACEHOLDER_STYLES.DESCRIPTION);
  description.textContent = '각 옵션을 선택하면 해당 옵션에 대한 설정을 할 수 있습니다.';
  container.appendChild(description);

  return container;
}

/**
 * 왼쪽 섹션 컴포넌트 생성
 */
export function createLeftSection(options: LeftSectionOptions): HTMLDivElement {
  const { document, currentWaitState, activeTimeout, onOptionSelect } = options;

  const leftSection = document.createElement('div');
  applyStyles(leftSection, CONTAINER_STYLES.LEFT_SECTION);

  // 헤더 섹션
  const headerSection = document.createElement('div');
  headerSection.style.marginBottom = '20px';
  leftSection.appendChild(headerSection);

  // 옵션 선택 영역
  const optionsSection = document.createElement('div');
  optionsSection.style.marginBottom = '24px';
  optionsSection.style.display = 'flex';
  optionsSection.style.flexDirection = 'column';
  optionsSection.style.gap = '8px';

  // 각 대기 옵션 카드 생성
  WAIT_OPTIONS.forEach(option => {
    const optionCard = document.createElement('div');
    optionCard.classList.add('wait-option-card');
    optionCard.dataset.waitState = option.id;
    applyStyles(optionCard, CARD_STYLES.OPTION_CARD);

    // 현재 선택된 옵션인 경우 스타일 적용
    if (currentWaitState && currentWaitState === option.id)
      applyStyles(optionCard, CARD_STYLES.OPTION_CARD_SELECTED);


    // 아이콘 컨테이너
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('wait-option-icon');
    applyStyles(iconContainer, CARD_STYLES.ICON_CONTAINER);

    if (currentWaitState && currentWaitState === option.id)
      applyStyles(iconContainer, CARD_STYLES.ICON_CONTAINER_SELECTED);


    iconContainer.textContent = option.icon;
    optionCard.appendChild(iconContainer);

    // 텍스트 컨테이너
    const textContainer = document.createElement('div');
    textContainer.classList.add('wait-option-text');
    textContainer.style.flex = '1';

    // 라벨
    const labelElement = document.createElement('div');
    labelElement.classList.add('wait-option-label');
    applyStyles(labelElement, CARD_STYLES.OPTION_LABEL);

    if (currentWaitState && currentWaitState === option.id)
      applyStyles(labelElement, CARD_STYLES.OPTION_LABEL_SELECTED);


    labelElement.textContent = option.label;
    textContainer.appendChild(labelElement);

    // 설명
    const descElement = document.createElement('div');
    descElement.classList.add('wait-option-desc');
    applyStyles(descElement, CARD_STYLES.OPTION_DESC);

    if (currentWaitState && currentWaitState === option.id)
      applyStyles(descElement, CARD_STYLES.OPTION_DESC_SELECTED);


    descElement.textContent = option.description;
    textContainer.appendChild(descElement);

    optionCard.appendChild(textContainer);

    // 라디오 버튼
    const radioIndicator = document.createElement('div');
    radioIndicator.classList.add('wait-option-radio');
    applyStyles(radioIndicator, CARD_STYLES.RADIO_BUTTON);

    if (currentWaitState && currentWaitState === option.id) {
      applyStyles(radioIndicator, CARD_STYLES.RADIO_BUTTON_SELECTED);

      // 내부 점 추가
      const innerDot = document.createElement('div');
      innerDot.classList.add('wait-option-radio-dot');
      applyStyles(innerDot, CARD_STYLES.RADIO_DOT);
      radioIndicator.appendChild(innerDot);
    }

    optionCard.appendChild(radioIndicator);
    optionsSection.appendChild(optionCard);

    // 클릭 이벤트 추가
    optionCard.addEventListener('click', () => {
      onOptionSelect(option.id as WaitState);
    });
  });

  leftSection.appendChild(optionsSection);

  // 타임아웃 섹션 추가
  leftSection.appendChild(createTimeoutSection(document, activeTimeout));

  return leftSection;
}

/**
 * 타임아웃 설정 섹션 생성
 */
function createTimeoutSection(document: Document, activeTimeout: number): HTMLDivElement {
  const timeoutSection = document.createElement('div');
  applyStyles(timeoutSection, TIMEOUT_STYLES.CONTAINER);

  // 타이틀 컨테이너
  const titleContainer = document.createElement('div');
  applyStyles(titleContainer, TIMEOUT_STYLES.TITLE_CONTAINER);

  const timeoutIcon = document.createElement('div');
  applyStyles(timeoutIcon, TIMEOUT_STYLES.ICON);
  timeoutIcon.textContent = '⏱️';
  titleContainer.appendChild(timeoutIcon);

  const timeoutTitle = document.createElement('div');
  applyStyles(timeoutTitle, TIMEOUT_STYLES.TITLE);
  timeoutTitle.textContent = '대기 시간 설정';
  titleContainer.appendChild(timeoutTitle);

  timeoutSection.appendChild(titleContainer);

  // 입력 영역
  const inputContainer = document.createElement('div');
  applyStyles(inputContainer, TIMEOUT_STYLES.INPUT_CONTAINER);

  // 라벨과 단위 컨테이너
  const labelUnitContainer = document.createElement('div');
  applyStyles(labelUnitContainer, TIMEOUT_STYLES.LABEL_UNIT_CONTAINER);

  const inputLabel = document.createElement('label');
  applyStyles(inputLabel, TIMEOUT_STYLES.INPUT_LABEL);
  inputLabel.textContent = '시간 (밀리초)';
  labelUnitContainer.appendChild(inputLabel);

  const unitLabel = document.createElement('div');
  applyStyles(unitLabel, TIMEOUT_STYLES.UNIT_LABEL);
  unitLabel.textContent = '1000ms = 1초';
  labelUnitContainer.appendChild(unitLabel);

  inputContainer.appendChild(labelUnitContainer);

  // 입력 필드
  const inputGroup = document.createElement('div');
  applyStyles(inputGroup, TIMEOUT_STYLES.INPUT_GROUP);

  const timeoutInput = document.createElement('input');
  timeoutInput.type = 'number';
  timeoutInput.value = String(activeTimeout);
  timeoutInput.min = '100';
  timeoutInput.step = '500';
  applyStyles(timeoutInput, TIMEOUT_STYLES.TIME_INPUT);
  inputGroup.appendChild(timeoutInput);
  inputContainer.appendChild(inputGroup);

  // 타임아웃 변경 이벤트 처리
  timeoutInput.addEventListener('input', () => {
    const newTimeout = parseInt(timeoutInput.value, 10);
    if (!isNaN(newTimeout) && newTimeout >= 100 && optionContext.value?.onTimeoutChange) {
      optionContext.value.onTimeoutChange(newTimeout);

      // 빠른 선택 버튼 상태 업데이트
      const allButtons = quickButtonsContainer.querySelectorAll('button');
      allButtons.forEach(btn => {
        applyStyles(btn, TIMEOUT_STYLES.QUICK_BUTTON);
      });

      // 일치하는 프리셋이 있으면 해당 버튼 강조
      const matchedPreset = TIMEOUT_PRESETS.find(preset => preset.value === newTimeout);
      if (matchedPreset) {
        const index = TIMEOUT_PRESETS.indexOf(matchedPreset);
        const button = allButtons[index];
        if (button)
          applyStyles(button, TIMEOUT_STYLES.QUICK_BUTTON_SELECTED);

      }
    }
  });

  // 빠른 시간 선택 버튼 영역
  const quickButtonsContainer = document.createElement('div');
  applyStyles(quickButtonsContainer, TIMEOUT_STYLES.QUICK_BUTTONS_CONTAINER);

  // 빠른 버튼 생성
  TIMEOUT_PRESETS.forEach(preset => {
    const button = document.createElement('button');
    button.textContent = preset.label;
    applyStyles(button, TIMEOUT_STYLES.QUICK_BUTTON);

    if (activeTimeout === preset.value)
      applyStyles(button, TIMEOUT_STYLES.QUICK_BUTTON_SELECTED);

    // 버튼 클릭 이벤트 처리
    button.addEventListener('click', () => {
      // 입력 필드 값 변경
      timeoutInput.value = String(preset.value);

      // 모든 버튼 스타일 초기화
      const allButtons = quickButtonsContainer.querySelectorAll('button');
      allButtons.forEach(btn => {
        applyStyles(btn, TIMEOUT_STYLES.QUICK_BUTTON);
      });

      // 선택된 버튼 스타일 적용
      applyStyles(button, TIMEOUT_STYLES.QUICK_BUTTON_SELECTED);

      // 컨텍스트에 타임아웃 값 업데이트
      if (optionContext.value?.onTimeoutChange)
        optionContext.value.onTimeoutChange(preset.value);

    });

    quickButtonsContainer.appendChild(button);
  });

  inputContainer.appendChild(quickButtonsContainer);
  timeoutSection.appendChild(inputContainer);

  // 도움말 텍스트
  const helpText = document.createElement('div');
  applyStyles(helpText, TIMEOUT_STYLES.HELP_TEXT);
  helpText.textContent = '일반적으로 5-30초(5000-30000 밀리초) 사이의 값을 권장합니다.';
  timeoutSection.appendChild(helpText);

  return timeoutSection;
}

/**
 * 오른쪽 섹션 컴포넌트 생성
 */
export function createRightSection(document: Document): HTMLDivElement {
  const rightSection = document.createElement('div');
  rightSection.id = 'wait-options-right-section';
  applyStyles(rightSection, CONTAINER_STYLES.RIGHT_SECTION);
  return rightSection;
}
