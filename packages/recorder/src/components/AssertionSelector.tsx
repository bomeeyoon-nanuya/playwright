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

import * as React from 'react';
import type { ExpectCategory, ExpectOption } from '../recorderTypes';
import './AssertionSelector.css';

interface AssertionSelectorProps {
  categories: ExpectCategory[];
  options: ExpectOption[];
  onSelectOption: (option: ExpectOption) => void;
  onCancel: () => void;
  elementType?: string; // 선택된 요소 타입 (input, button 등)
}

/**
 * 검증 옵션 선택 컴포넌트
 */
export const AssertionSelector: React.FC<AssertionSelectorProps> = ({
  categories,
  options,
  onSelectOption,
  onCancel,
  elementType
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>(categories[0]?.id || '');
  const [searchTerm, setSearchTerm] = React.useState('');

  // 선택된 요소 타입에 맞는 추천 옵션
  const getRecommendedOptions = (): ExpectOption[] => {
    if (!elementType)
      return [];

    const recommendationMap: Record<string, string[]> = {
      'input': ['toHaveValue', 'toBeEditable', 'toBeEnabled'],
      'button': ['toBeEnabled', 'toBeDisabled', 'toHaveText'],
      'a': ['toHaveAttribute', 'toHaveText', 'toContainText'],
      'checkbox': ['toBeChecked', 'toBeEnabled'],
      'select': ['toHaveValues', 'toBeEnabled'],
      'textarea': ['toHaveValue', 'toBeEditable'],
      'img': ['toBeVisible', 'toHaveAttribute'],
      'div': ['toBeVisible', 'toHaveText', 'toContainText'],
      'span': ['toBeVisible', 'toHaveText', 'toContainText'],
      'table': ['toBeVisible', 'toHaveCount'],
      'tr': ['toBeVisible', 'toHaveCount'],
      'td': ['toBeVisible', 'toHaveText']
    };

    const recommendedIds = recommendationMap[elementType] || ['toBeVisible', 'toHaveText'];
    return options.filter(option => recommendedIds.includes(option.id));
  };

  // 추천 옵션 목록
  const recommendedOptions = React.useMemo(() => getRecommendedOptions(), [elementType, options]);

  // 카테고리별 옵션 필터링
  const filteredOptions = React.useMemo(() => {
    let filtered = options.filter(option => option.category === selectedCategory);

    // 검색어가 있는 경우 추가 필터링
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
          option =>
            option.name.toLowerCase().includes(lowerSearchTerm) ||
          option.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return filtered;
  }, [options, selectedCategory, searchTerm]);

  return (
    <div className='assertion-selector'>
      <div className='selector-header'>
        <h3>검증 유형 선택</h3>
        <input
          type='text'
          className='search-input'
          placeholder='검증 옵션 검색...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className='close-button' onClick={onCancel}>×</button>
      </div>

      {/* 추천 옵션 섹션 */}
      {recommendedOptions.length > 0 && (
        <div className='recommended-section'>
          <h4>이 요소에 추천되는 검증</h4>
          <div className='option-grid'>
            {recommendedOptions.map(option => (
              <div
                key={option.id}
                className='option-card recommended'
                onClick={() => onSelectOption(option)}
              >
                <div className='option-icon'>{getIconForOption(option.id)}</div>
                <div className='option-details'>
                  <div className='option-name'>{option.name}</div>
                  <div className='option-description'>{option.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className='category-tabs'>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 옵션 그리드 */}
      <div className='options-container'>
        {filteredOptions.length === 0 ? (
          <div className='no-options'>
            {searchTerm
              ? '검색 결과가 없습니다.'
              : '이 카테고리에 옵션이 없습니다.'}
          </div>
        ) : (
          <div className='option-grid'>
            {filteredOptions.map(option => (
              <div
                key={option.id}
                className='option-card'
                onClick={() => onSelectOption(option)}
              >
                <div className='option-icon'>{getIconForOption(option.id)}</div>
                <div className='option-details'>
                  <div className='option-name'>{option.name}</div>
                  <div className='option-description'>{option.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='selector-footer'>
        <button className='cancel-button' onClick={onCancel}>취소</button>
      </div>
    </div>
  );
};

// 옵션 아이콘 가져오기
const getIconForOption = (optionId: string): string => {
  const iconMap: Record<string, string> = {
    // 가시성 관련
    'toBeVisible': '👁️',
    'toBeHidden': '🙈',
    'toHaveCount': '🔢',

    // 콘텐츠 관련
    'toHaveText': '📝',
    'toContainText': '🔍',
    'toHaveValue': '💯',
    'toBeEmpty': '🈳',

    // 속성 관련
    'toHaveAttribute': '🏷️',
    'toHaveClass': '🏷️',
    'toHaveCSS': '🎨',
    'toHaveId': '🆔',

    // 상태 관련
    'toBeChecked': '✅',
    'toBeDisabled': '🚫',
    'toBeEnabled': '✓',
    'toBeEditable': '✏️',
    'toBeFocused': '🎯',

    // 페이지 관련
    'toHaveURL': '🔗',
    'toHaveTitle': '📑',

    // 레이아웃 관련
    'toBeInViewport': '📱',

    // 접근성 관련
    'toHaveAccessibleName': '♿',
    'toHaveAccessibleDescription': '📢',
    'toHaveRole': '👤',

    // 고급 관련
    'toHaveValues': '📋',
    'toHaveScreenshot': '📸',
    'toPassAxe': '♿',
    'softAssertion': '🧩'
  };

  return iconMap[optionId] || '❓';
};
