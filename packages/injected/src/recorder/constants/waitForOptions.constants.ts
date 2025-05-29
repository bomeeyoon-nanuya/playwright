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
 * 대기 상태 타입 정의
 */
export const WAIT_STATE = {
  ELEMENT: 'element',
  NAVIGATION: 'navigation',
  NETWORK: 'network',
  REMOVED: 'removed',
  TIMEOUT: 'timeout',
  PAGE_LOAD: 'pageLoad',
} as const;

/**
 * 페이지 로드 상태 옵션
 */
export const PAGE_LOAD_STATE = {
  LOAD: 'load',
  DOM_CONTENT_LOADED: 'domcontentloaded',
  NETWORK_IDLE: 'networkidle',
} as const;

/**
 * 타임아웃 프리셋 값 (밀리초)
 */
export const TIMEOUT_PRESETS = [
  { value: 1000, label: '1초' },
  { value: 3000, label: '3초' },
  { value: 5000, label: '5초' },
  { value: 10000, label: '10초' },
  { value: 30000, label: '30초' },
  { value: 0, label: '사용 안함' }
];

/**
 * 대기 옵션 목록
 */
export const WAIT_OPTIONS = [
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
 * waitUntil 옵션
 */
export const WAIT_UNTIL_OPTIONS = [
  { value: 'networkidle', label: 'networkidle - 네트워크 요청이 없는 상태' },
  { value: 'commit', label: 'commit - 모든 네트워크 요청이 완료된 후' },
  { value: 'load', label: 'load - 페이지 로드 완료' },
  { value: 'domcontentloaded', label: 'domcontentloaded - DOM 로드 완료' },
];

/**
 * 시간 관련 상수
 */
export const TIMEOUT = {
  RESET_BUTTON: 2000, // 버튼 상태 복원 시간
  DIALOG_SHOW_DELAY: 100, // 대화 상자 표시 지연 시간
  ELEMENT_PICKED_DELAY: 10 // 요소 선택 후 대화 상자 다시 표시 지연 시간
};
