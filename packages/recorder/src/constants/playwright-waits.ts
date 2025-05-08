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

import type { ExpectCategory, ExpectOption } from '../recorderTypes';

export const WAIT_CATEGORIES: ExpectCategory[] = [
  { id: 'visibility', name: '가시성', description: '요소의 가시성 관련 대기' },
  { id: 'content', name: '콘텐츠', description: '콘텐츠 로드 관련 대기' },
  { id: 'state', name: '상태', description: '요소 상태 관련 대기' },
  { id: 'page', name: '페이지', description: '페이지 로드 관련 대기' },
  { id: 'network', name: '네트워크', description: '네트워크 요청 관련 대기' },
  { id: 'advanced', name: '고급', description: '고급 대기 옵션' },
];

export const WAIT_OPTIONS: ExpectOption[] = [
  // 가시성 대기
  {
    id: 'waitForVisible',
    name: '요소 표시 대기',
    description: '요소가 화면에 보일 때까지 대기합니다',
    syntax: 'await page.waitForSelector(selector, { state: "visible" });',
    category: 'visibility',
  },
  {
    id: 'waitForHidden',
    name: '요소 숨김 대기',
    description: '요소가 화면에서 사라질 때까지 대기합니다',
    syntax: 'await page.waitForSelector(selector, { state: "hidden" });',
    category: 'visibility',
  },
  {
    id: 'waitForSelector',
    name: '요소 존재 대기',
    description: '요소가 DOM에 존재할 때까지 대기합니다',
    syntax: 'await page.waitForSelector(selector);',
    category: 'visibility',
  },

  // 상태 대기
  {
    id: 'waitForEnabled',
    name: '요소 활성화 대기',
    description: '요소가 활성화될 때까지 대기합니다',
    syntax: 'await page.waitForSelector(selector, { state: "enabled" });',
    category: 'state',
  },
  {
    id: 'waitForDisabled',
    name: '요소 비활성화 대기',
    description: '요소가 비활성화될 때까지 대기합니다',
    syntax: 'await page.locator(selector).waitFor({ state: "disabled" });',
    category: 'state',
  },
  {
    id: 'waitForEditable',
    name: '요소 편집 가능 대기',
    description: '요소가 편집 가능한 상태가 될 때까지 대기합니다',
    syntax: 'await page.locator(selector).waitFor({ state: "editable" });',
    category: 'state',
  },

  // 페이지 대기
  {
    id: 'waitForDOMContentLoaded',
    name: 'DOM 로드 대기',
    description: '페이지의 DOM이 로드될 때까지 대기합니다',
    syntax: 'await page.waitForLoadState("domcontentloaded");',
    category: 'page',
  },
  {
    id: 'waitForLoad',
    name: '페이지 로드 대기',
    description: '페이지가 완전히 로드될 때까지 대기합니다',
    syntax: 'await page.waitForLoadState("load");',
    category: 'page',
  },
  {
    id: 'waitForURL',
    name: 'URL 변경 대기',
    description: '특정 URL로 이동할 때까지 대기합니다',
    syntax: 'await page.waitForURL(url);',
    category: 'page',
    params: [
      {
        name: 'url',
        type: 'string',
        required: true,
        description: '대기할 URL (정확한 URL 또는 정규식)',
      }
    ]
  },

  // 네트워크 대기
  {
    id: 'waitForNetworkIdle',
    name: '네트워크 유휴 대기',
    description: '네트워크 요청이 없는 상태가 될 때까지 대기합니다',
    syntax: 'await page.waitForLoadState("networkidle");',
    category: 'network',
  },
  {
    id: 'waitForResponse',
    name: '응답 대기',
    description: '특정 URL에 대한 응답을 받을 때까지 대기합니다',
    syntax: 'await page.waitForResponse(urlOrPredicate);',
    category: 'network',
    params: [
      {
        name: 'urlOrPredicate',
        type: 'string',
        required: true,
        description: '대기할 URL 또는 조건',
      }
    ]
  },
  {
    id: 'waitForRequest',
    name: '요청 대기',
    description: '특정 URL에 대한 요청이 발생할 때까지 대기합니다',
    syntax: 'await page.waitForRequest(urlOrPredicate);',
    category: 'network',
    params: [
      {
        name: 'urlOrPredicate',
        type: 'string',
        required: true,
        description: '대기할 URL 또는 조건',
      }
    ]
  },

  // 고급 대기
  {
    id: 'waitForTimeout',
    name: '시간 대기',
    description: '지정된 시간(밀리초) 동안 대기합니다',
    syntax: 'await page.waitForTimeout(timeout);',
    category: 'advanced',
    params: [
      {
        name: 'timeout',
        type: 'number',
        required: true,
        description: '대기할 시간(밀리초)',
        defaultValue: 1000
      }
    ]
  },
  {
    id: 'waitForFunction',
    name: '함수 실행 대기',
    description: '자바스크립트 함수가 참을 반환할 때까지 대기합니다',
    syntax: 'await page.waitForFunction(() => condition);',
    category: 'advanced',
    params: [
      {
        name: 'condition',
        type: 'string',
        required: true,
        description: '자바스크립트 조건식',
        defaultValue: 'document.querySelector(".ready") !== null'
      }
    ]
  },
];
