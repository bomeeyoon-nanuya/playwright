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
import './WaitOptionSelector.css';

interface WaitOptionSelectorProps {
  options: ExpectOption[];
  categories: ExpectCategory[];
  searchTerm: string;
  elementType?: string;
  onSelectOption: (option: ExpectOption) => void;
  onCancel: () => void;
}

/**
 * 대기 옵션 선택 컴포넌트
 */
export const WaitOptionSelector: React.FC<WaitOptionSelectorProps> = ({
  options,
  categories,
  searchTerm,
  elementType,
  onSelectOption,
  onCancel
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>(categories[0]?.id || '');

  // 선택된 요소 타입에 맞는 추천 옵션
  const getRecommendedOptions = (): ExpectOption[] => {
    if (!elementType)
      return [];

    const recommendationMap: Record<string, string[]> = {
      'input': ['waitForVisible', 'waitForEnabled', 'waitForEditable'],
      'button': ['waitForVisible', 'waitForEnabled'],
      'a': ['waitForVisible', 'waitForSelector'],
      'select': ['waitForVisible', 'waitForEnabled'],
      'form': ['waitForSelector'],
      'div': ['waitForVisible', 'waitForSelector'],
      'table': ['waitForVisible', 'waitForSelector'],
    };

    const recommendedIds = recommendationMap[elementType] || ['waitForVisible', 'waitForSelector'];
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
    <div className='wait-option-selector'>
      {/* 추천 옵션 섹션 */}
      {recommendedOptions.length > 0 && (
        <div className='recommended-section'>
          <h4>이 요소에 추천되는 대기</h4>
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
    </div>
  );
};

// 옵션 아이콘 가져오기
const getIconForOption = (optionId: string): string => {
  const iconMap: Record<string, string> = {
    // 가시성 관련
    'waitForVisible': '👁️',
    'waitForHidden': '🙈',
    'waitForSelector': '🔍',

    // 상태 관련
    'waitForEnabled': '✓',
    'waitForDisabled': '🚫',
    'waitForEditable': '✏️',

    // 페이지 관련
    'waitForDOMContentLoaded': '📄',
    'waitForLoad': '📑',
    'waitForURL': '🔗',

    // 네트워크 관련
    'waitForNetworkIdle': '📶',
    'waitForResponse': '📥',
    'waitForRequest': '📤',

    // 고급 관련
    'waitForTimeout': '⏱️',
    'waitForFunction': '🧩',
  };

  return iconMap[optionId] || '⌛';
};
