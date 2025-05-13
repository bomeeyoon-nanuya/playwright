/*
  Copyright (c) Microsoft Corporation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import type { Language } from '../../playwright-core/src/utils/isomorphic/locatorGenerators';
import type { AriaTemplateNode } from '@isomorphic/ariaSnapshot';

export type Point = { x: number; y: number };

// 기본 검증 모드
export type BasicAssertMode =
  | 'assertingVisibility'  // 요소가 화면에 보이는지 확인
  | 'assertingText'        // 요소의 텍스트 내용 확인
  | 'assertingValue'       // 입력 요소의 값 확인
  | 'assertingSnapshot';   // 요소의 스냅샷 확인

// DOM 상태 검증 모드
export type DOMAssertMode =
  | 'assertingChecked'        // 체크박스가 체크되어 있는지 확인
  | 'assertingDisabled'       // 요소가 비활성화되어 있는지 확인
  | 'assertingEditable'       // 요소가 편집 가능한지 확인
  | 'assertingEmpty'          // 요소가 비어있는지 확인
  | 'assertingEnabled'        // 요소가 활성화되어 있는지 확인
  | 'assertingFocused'        // 요소가 포커스 되어 있는지 확인
  | 'assertingHidden';        // 요소가 숨겨져 있는지 확인

// 요소 속성 검증 모드
export type AttributeAssertMode =
  | 'assertingAttribute'      // 요소의 특정 속성 값 확인
  | 'assertingClass'          // 요소의 클래스 확인
  | 'assertingCount'          // 특정 선택자와 일치하는 요소 개수 확인
  | 'assertingCSS'            // 요소의 CSS 스타일 속성 확인
  | 'assertingId'             // 요소의 ID 확인
  | 'assertingJSProperty';    // 요소의 JavaScript 속성 확인

// 접근성 검증 모드
export type AccessibilityAssertMode =
  | 'assertingAccessibleName'        // 요소의 접근 가능한 이름 확인
  | 'assertingAccessibleDescription' // 요소의 접근 가능한 설명 확인
  | 'assertingRole';                 // 요소의 ARIA 역할 확인

// 페이지 검증 모드
export type PageAssertMode =
  | 'assertingTitle'         // 페이지 제목 확인
  | 'assertingURL';          // 페이지 URL 확인

// 레이아웃 검증 모드
export type LayoutAssertMode =
  | 'assertingInViewport'    // 요소가 뷰포트 내에 있는지 확인
  | 'assertingLayout';       // 요소의 레이아웃(위치, 크기) 확인

// 복합 검증 모드
export type ComplexAssertMode =
  | 'assertingContainText'   // 요소가 특정 텍스트를 포함하는지 확인
  | 'assertingSelect'        // 선택 요소의 선택된 값 확인
  | 'assertingBusiness';     // 비즈니스 규칙에 따른 복합 검증

// 모든 검증 모드를 결합
export type AssertMode = 
  | BasicAssertMode
  | DOMAssertMode
  | AttributeAssertMode
  | AccessibilityAssertMode
  | PageAssertMode
  | LayoutAssertMode
  | ComplexAssertMode;

// 표준 모드
export type StandardMode =
  | 'inspecting'
  | 'recording'
  | 'none'
  | 'recording-inspecting'
  | 'standby';

// 모든 가능한 모드의 조합
export type Mode = StandardMode | AssertMode;

export type ElementInfo = {
  selector: string;
  ariaSnapshot: string;
};

export type EventData = {
  event:
    | 'clear'
    | 'resume'
    | 'step'
    | 'pause'
    | 'setMode'
    | 'highlightRequested'
    | 'fileChanged'
    | 'addCode'; // 코드 추가 이벤트 추가
  params: any;
};

export type OverlayState = {
  offsetX: number;
};

export type UIState = {
  mode: Mode;
  actionPoint?: Point;
  actionSelector?: string;
  ariaTemplate?: AriaTemplateNode;
  language: Language;
  testIdAttributeName: string;
  overlay: OverlayState;
};

export type CallLogStatus = 'in-progress' | 'done' | 'error' | 'paused';

export type CallLog = {
  id: string;
  title: string;
  messages: string[];
  status: CallLogStatus;
  error?: string;
  reveal?: boolean;
  duration?: number;
  params: {
    url?: string;
    selector?: string;
  };
};

export type SourceHighlight = {
  line: number;
  type: 'running' | 'paused' | 'error';
};

export type Source = {
  isRecorded: boolean;
  id: string;
  label: string;
  text: string;
  language: Language;
  highlight: SourceHighlight[];
  revealLine?: number;
  // used to group the language generators
  group?: string;
  header?: string;
  footer?: string;
  actions?: string[];
  code?: string;
};

// 검증 옵션과 관련된 타입 정의
export interface ExpectParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'selector' | 'array' | 'regexp';
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface ExpectOption {
  id: string;
  name: string; 
  description: string;
  syntax: string;
  category: string;
  params?: ExpectParam[];
  waitType?: string; // 대기 타입 (waitForSelector, waitForTimeout 등)
}

export interface ExpectCategory {
  id: string;
  name: string;
  description: string;
}

declare global {
  interface Window {
    playwrightSetMode: (mode: Mode) => void;
    playwrightSetPaused: (paused: boolean) => void;
    playwrightSetSources: (sources: Source[], options?: {
      primaryPageURL?: string;
      preserveSources?: boolean;
    }) => void;
    playwrightSetOverlayVisible: (visible: boolean) => void;
    playwrightUpdateLogs: (callLogs: CallLog[]) => void;
    playwrightSetRunningFile: (file: string | undefined) => void;
    playwrightElementPicked: (elementInfo: ElementInfo, userGesture?: boolean) => void;
    playwrightSourcesEchoForTest: Source[];
    dispatch(data: any): Promise<void>;
  }
}
