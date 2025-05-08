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

export const EXPECT_CATEGORIES: ExpectCategory[] = [
  { id: 'visibility', name: '가시성', description: '요소의 가시성 관련 검증' },
  { id: 'content', name: '콘텐츠', description: '요소 콘텐츠 관련 검증' },
  { id: 'attributes', name: '속성', description: '요소 속성 관련 검증' },
  { id: 'state', name: '상태', description: '요소 상태 관련 검증' },
  { id: 'page', name: '페이지', description: '페이지 관련 검증' },
  { id: 'layout', name: '레이아웃', description: '레이아웃 관련 검증' },
  { id: 'accessibility', name: '접근성', description: '접근성 관련 검증' },
  { id: 'advanced', name: '고급', description: '고급 검증 옵션' },
];

export const EXPECT_OPTIONS: ExpectOption[] = [
  // 가시성 검증
  {
    id: 'toBeVisible',
    name: '요소 표시 확인',
    description: '요소가 화면에 보이는지 확인합니다',
    syntax: 'await expect(locator).toBeVisible();',
    category: 'visibility',
  },
  {
    id: 'toBeHidden',
    name: '요소 숨김 확인',
    description: '요소가 화면에 보이지 않는지 확인합니다',
    syntax: 'await expect(locator).toBeHidden();',
    category: 'visibility',
  },
  {
    id: 'toHaveCount',
    name: '요소 개수 확인',
    description: '선택자와 일치하는 요소 개수를 확인합니다',
    syntax: 'await expect(locator).toHaveCount(count);',
    category: 'visibility',
    params: [
      {
        name: 'count',
        type: 'number',
        required: true,
        description: '기대하는 요소 개수',
        defaultValue: 1
      }
    ]
  },

  // 콘텐츠 검증
  {
    id: 'toHaveText',
    name: '텍스트 일치 확인',
    description: '요소가 특정 텍스트와 정확히 일치하는지 확인합니다',
    syntax: 'await expect(locator).toHaveText(text);',
    category: 'content',
    params: [
      {
        name: 'text',
        type: 'string',
        required: true,
        description: '기대하는 텍스트 (정확히 일치)',
      }
    ]
  },
  {
    id: 'toContainText',
    name: '텍스트 포함 확인',
    description: '요소가 특정 텍스트를 포함하는지 확인합니다',
    syntax: 'await expect(locator).toContainText(text);',
    category: 'content',
    params: [
      {
        name: 'text',
        type: 'string',
        required: true,
        description: '요소에 포함되어야 하는 텍스트',
      }
    ]
  },
  {
    id: 'toHaveValue',
    name: '입력값 확인',
    description: '입력 요소의 값을 확인합니다',
    syntax: 'await expect(locator).toHaveValue(value);',
    category: 'content',
    params: [
      {
        name: 'value',
        type: 'string',
        required: true,
        description: '기대하는 입력값',
      }
    ]
  },
  {
    id: 'toBeEmpty',
    name: '요소 비어있음 확인',
    description: '요소가 비어있는지 확인합니다',
    syntax: 'await expect(locator).toBeEmpty();',
    category: 'content',
  },

  // 속성 검증
  {
    id: 'toHaveAttribute',
    name: '속성 확인',
    description: '요소가 특정 속성을 가지고 있는지 확인합니다',
    syntax: 'await expect(locator).toHaveAttribute(name, value);',
    category: 'attributes',
    params: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: '속성 이름',
      },
      {
        name: 'value',
        type: 'string',
        required: true,
        description: '기대하는 속성 값',
      }
    ]
  },
  {
    id: 'toHaveClass',
    name: '클래스 확인',
    description: '요소가 특정 클래스를 가지고 있는지 확인합니다',
    syntax: 'await expect(locator).toHaveClass(className);',
    category: 'attributes',
    params: [
      {
        name: 'className',
        type: 'string',
        required: true,
        description: '기대하는 클래스명',
      }
    ]
  },
  {
    id: 'toHaveCSS',
    name: 'CSS 속성 확인',
    description: '요소가 특정 CSS 속성 값을 가지고 있는지 확인합니다',
    syntax: 'await expect(locator).toHaveCSS(name, value);',
    category: 'attributes',
    params: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'CSS 속성 이름',
      },
      {
        name: 'value',
        type: 'string',
        required: true,
        description: '기대하는 CSS 값',
      }
    ]
  },
  {
    id: 'toHaveId',
    name: 'ID 확인',
    description: '요소가 특정 ID를 가지고 있는지 확인합니다',
    syntax: 'await expect(locator).toHaveId(id);',
    category: 'attributes',
    params: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: '기대하는 ID 값',
      }
    ]
  },

  // 상태 검증
  {
    id: 'toBeChecked',
    name: '체크 상태 확인',
    description: '체크박스나 라디오 버튼이 선택되어 있는지 확인합니다',
    syntax: 'await expect(locator).toBeChecked();',
    category: 'state',
  },
  {
    id: 'toBeDisabled',
    name: '비활성화 상태 확인',
    description: '요소가 비활성화되어 있는지 확인합니다',
    syntax: 'await expect(locator).toBeDisabled();',
    category: 'state',
  },
  {
    id: 'toBeEnabled',
    name: '활성화 상태 확인',
    description: '요소가 활성화되어 있는지 확인합니다',
    syntax: 'await expect(locator).toBeEnabled();',
    category: 'state',
  },
  {
    id: 'toBeEditable',
    name: '편집 가능 상태 확인',
    description: '요소가 편집 가능한 상태인지 확인합니다',
    syntax: 'await expect(locator).toBeEditable();',
    category: 'state',
  },
  {
    id: 'toBeFocused',
    name: '포커스 상태 확인',
    description: '요소가 포커스되어 있는지 확인합니다',
    syntax: 'await expect(locator).toBeFocused();',
    category: 'state',
  },

  // 페이지 검증
  {
    id: 'toHaveURL',
    name: 'URL 확인',
    description: '현재 페이지의 URL을 확인합니다',
    syntax: 'await expect(page).toHaveURL(url);',
    category: 'page',
    params: [
      {
        name: 'url',
        type: 'string',
        required: true,
        description: '기대하는 URL (정확한 값 또는 정규식)',
      }
    ]
  },
  {
    id: 'toHaveTitle',
    name: '페이지 제목 확인',
    description: '현재 페이지의 제목을 확인합니다',
    syntax: 'await expect(page).toHaveTitle(title);',
    category: 'page',
    params: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: '기대하는 페이지 제목',
      }
    ]
  },

  // 레이아웃 검증
  {
    id: 'toBeInViewport',
    name: '뷰포트 내 확인',
    description: '요소가 뷰포트 내에 있는지 확인합니다',
    syntax: 'await expect(locator).toBeInViewport();',
    category: 'layout',
  },

  // 접근성 검증
  {
    id: 'toHaveAccessibleName',
    name: '접근성 이름 확인',
    description: '요소의 접근 가능한 이름을 확인합니다',
    syntax: 'await expect(locator).toHaveAccessibleName(name);',
    category: 'accessibility',
    params: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: '기대하는 접근성 이름',
      }
    ]
  },
  {
    id: 'toHaveAccessibleDescription',
    name: '접근성 설명 확인',
    description: '요소의 접근 가능한 설명을 확인합니다',
    syntax: 'await expect(locator).toHaveAccessibleDescription(description);',
    category: 'accessibility',
    params: [
      {
        name: 'description',
        type: 'string',
        required: true,
        description: '기대하는 접근성 설명',
      }
    ]
  },
  {
    id: 'toHaveRole',
    name: 'ARIA 역할 확인',
    description: '요소의 ARIA 역할을 확인합니다',
    syntax: 'await expect(locator).toHaveRole(role);',
    category: 'accessibility',
    params: [
      {
        name: 'role',
        type: 'string',
        required: true,
        description: '기대하는 ARIA 역할',
      }
    ]
  },

  // 고급 검증
  {
    id: 'toHaveValues',
    name: '선택 옵션 확인',
    description: '선택(select) 요소의 선택된 옵션들을 확인합니다',
    syntax: 'await expect(locator).toHaveValues(values);',
    category: 'advanced',
    params: [
      {
        name: 'values',
        type: 'array',
        required: true,
        description: '기대하는 값 배열',
      }
    ]
  },
  {
    id: 'toHaveScreenshot',
    name: '스크린샷 일치 확인',
    description: '요소의 스크린샷이 기대하는 이미지와 일치하는지 확인합니다',
    syntax: 'await expect(locator).toHaveScreenshot(name);',
    category: 'advanced',
    params: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: '스크린샷 이름 (저장 경로)',
      }
    ]
  },
  {
    id: 'toPassAxe',
    name: '접근성 규칙 검사',
    description: 'Axe 접근성 규칙을 검사합니다 (axe 플러그인 필요)',
    syntax: 'await expect(locator).toPassAxe();',
    category: 'advanced',
  },
  {
    id: 'softAssertion',
    name: '소프트 어설션',
    description: '테스트를 중단하지 않고 검증 실패를 기록합니다',
    syntax: 'await expect.soft(locator).assertion;',
    category: 'advanced',
  }
];

// 대기 관련 구문
export const WAIT_OPTIONS: ExpectOption[] = [
  {
    id: 'waitForSelector',
    name: '요소 대기',
    description: '요소가 나타날 때까지 대기합니다',
    syntax: 'await page.waitForSelector(selector);',
    category: 'wait',
    params: [
      {
        name: 'selector',
        type: 'selector',
        required: true,
        description: '대기할 요소 선택자',
      }
    ]
  },
  {
    id: 'waitForTimeout',
    name: '시간 대기',
    description: '지정된 시간(밀리초) 동안 대기합니다',
    syntax: 'await page.waitForTimeout(timeout);',
    category: 'wait',
    params: [
      {
        name: 'timeout',
        type: 'number',
        required: true,
        description: '대기 시간(밀리초)',
        defaultValue: 1000
      }
    ]
  },
  {
    id: 'waitForLoadState',
    name: '페이지 로드 대기',
    description: '페이지가 특정 로드 상태에 도달할 때까지 대기합니다',
    syntax: 'await page.waitForLoadState(state);',
    category: 'wait',
    params: [
      {
        name: 'state',
        type: 'string',
        required: true,
        description: '대기할 로드 상태(load, domcontentloaded, networkidle)',
        defaultValue: 'load'
      }
    ]
  },
  {
    id: 'waitForNavigation',
    name: '네비게이션 대기',
    description: '페이지 네비게이션이 완료될 때까지 대기합니다',
    syntax: 'await page.waitForNavigation();',
    category: 'wait'
  },
  {
    id: 'waitForFunction',
    name: '함수 대기',
    description: '특정 자바스크립트 함수가 true를 반환할 때까지 대기합니다',
    syntax: 'await page.waitForFunction(() => { return document.querySelectorAll(selector).length > 0; });',
    category: 'wait',
    params: [
      {
        name: 'selector',
        type: 'selector',
        required: true,
        description: '대기할 요소 선택자',
      }
    ]
  }
];
