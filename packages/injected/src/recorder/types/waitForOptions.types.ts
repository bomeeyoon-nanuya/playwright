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

import { PAGE_LOAD_STATE } from '../constants/waitForOptions.constants';

import type { Recorder } from '../recorder';

/**
 * 대기 상태 타입
 */
export type WaitState = 'element' | 'navigation' | 'network' | 'removed' | 'timeout' | 'pageLoad';

/**
 * 페이지 로드 상태 타입 정의
 */
export type PageLoadState = typeof PAGE_LOAD_STATE[keyof typeof PAGE_LOAD_STATE];

/**
 * 대기 옵션 인터페이스
 */
export interface WaitForOptions {
  waitState: WaitState;
  timeout: number;
  selector?: string;
  url?: string;
  predicate?: string;
  waitUntil?: string;
}

/**
 * 옵션 컨텍스트 값 타입
 */
export interface OptionContextValue {
  recorder?: Recorder;
  waitState?: WaitState;
  currentTimeout?: number;
  container?: HTMLElement;
  selector?: string;
  url?: string;
  waitUntil?: string;
  onWaitStateChange?: (waitState: WaitState) => void;
  onTimeoutChange?: (timeout: number) => void;
  onUrlChange?: (url: string) => void;
  onWaitUntilChange?: (waitUntil: string) => void;
}

/**
 * 섹션 렌더링을 위한 테스트 함수 옵션 타입
 */
export interface TestFnOptions {
  recorder: Recorder;
  container: HTMLElement;
  waitState: WaitState;
  currentTimeout?: number;
  onTimeoutChange?: (timeout: number) => void;
  url?: string;
  onUrlChange?: (url: string) => void;
  waitUntil?: string;
  onWaitUntilChange?: (waitUntil: string) => void;
}

/**
 * 요소 대기 핸들러 옵션 타입
 */
export interface ElementWaitHandlerOptions {
  container: HTMLElement;
  recorder: Recorder;
  waitState: WaitState;
  currentTimeout: number;
  onElementSelected?: (selector: string) => void;
}

/**
 * 대기 옵션 컨텐츠 생성 파라미터 타입
 */
export interface CreateWaitOptionsContentParams {
  document: Document;
  currentWaitState: WaitState | null;
  currentTimeout: number;
  onWaitStateChange: (waitState: WaitState) => void;
  onTimeoutChange: (timeout: number) => void;
  recorder: Recorder;
}

/**
 * 왼쪽 섹션 옵션 타입
 */
export interface LeftSectionOptions {
  document: Document;
  currentWaitState: WaitState | null;
  activeTimeout: number;
  onOptionSelect: (waitState: WaitState) => void;
}

/**
 * UI 컴포넌트 스타일 적용 함수 타입
 */
export type ApplyStylesFn = (element: HTMLElement, styles: Record<string, string>) => void;
