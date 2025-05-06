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
import type { ExpectOption, ExpectParam } from '../recorderTypes';
import './AssertionParametersForm.css';

interface AssertionParametersFormProps {
  expectOption: ExpectOption;
  selector: string;
  currentValue?: string;
  onSubmit: (params: Record<string, any>) => void;
  onCancel: () => void;
}

/**
 * 검증 매개변수 입력 폼 컴포넌트
 */
export const AssertionParametersForm: React.FC<AssertionParametersFormProps> = ({
  expectOption,
  selector,
  currentValue,
  onSubmit,
  onCancel
}) => {
  // 폼 제출 시 전달할 파라미터 상태 관리
  const [params, setParams] = React.useState<Record<string, any>>({});
  // 현재 값 사용 여부 상태
  const [useCurrentValue, setUseCurrentValue] = React.useState(!!currentValue);

  // 폼 초기화
  React.useEffect(() => {
    const initialParams: Record<string, any> = {};

    if (expectOption.params) {
      expectOption.params.forEach(param => {
        // 기본값 설정
        if (param.defaultValue !== undefined)
          initialParams[param.name] = param.defaultValue;
        else if (param.name === 'text' && currentValue && useCurrentValue)
          initialParams[param.name] = currentValue;

      });
    }

    setParams(initialParams);
  }, [expectOption, currentValue, useCurrentValue]);

  // 입력값 변경 핸들러
  const handleInputChange = (param: ExpectParam, value: any) => {
    setParams(prev => ({
      ...prev,
      [param.name]: value
    }));
  };

  // 현재 값 사용 토글 핸들러
  const handleUseCurrentValueChange = () => {
    setUseCurrentValue(prev => !prev);

    if (!useCurrentValue && currentValue) {
      // 현재 값 사용을 선택한 경우, 해당 값으로 text 파라미터 업데이트
      const textParam = expectOption.params?.find(p => p.name === 'text');
      if (textParam) {
        setParams(prev => ({
          ...prev,
          text: currentValue
        }));
      }
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
  };

  // 파라미터 입력 필드 렌더링
  const renderParamInput = (param: ExpectParam) => {
    const value = params[param.name] !== undefined ? params[param.name] : '';

    switch (param.type) {
      case 'string':
        return (
          <input
            type='text'
            value={value}
            onChange={e => handleInputChange(param, e.target.value)}
            required={param.required}
            placeholder={param.description}
            className='param-input'
          />
        );

      case 'number':
        return (
          <input
            type='number'
            value={value}
            onChange={e => handleInputChange(param, parseInt(e.target.value, 10))}
            required={param.required}
            placeholder={param.description}
            className='param-input'
          />
        );

      case 'boolean':
        return (
          <div className='checkbox-container'>
            <input
              type='checkbox'
              checked={!!value}
              onChange={e => handleInputChange(param, e.target.checked)}
              id={`param-${param.name}`}
              className='param-checkbox'
            />
            <label htmlFor={`param-${param.name}`}>{param.description}</label>
          </div>
        );

      case 'array':
        return (
          <input
            type='text'
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={e => handleInputChange(param, e.target.value.split(',').map(v => v.trim()))}
            required={param.required}
            placeholder={`${param.description} (쉼표로 구분)`}
            className='param-input'
          />
        );

      case 'regexp':
        return (
          <div className='regexp-container'>
            <span className='regexp-prefix'>/</span>
            <input
              type='text'
              value={value}
              onChange={e => handleInputChange(param, e.target.value)}
              required={param.required}
              placeholder={param.description}
              className='param-input regexp-input'
            />
            <span className='regexp-suffix'>/</span>
          </div>
        );

      case 'selector':
        return (
          <input
            type='text'
            value={value || selector}
            onChange={e => handleInputChange(param, e.target.value)}
            required={param.required}
            placeholder={param.description}
            className='param-input'
            disabled={true}
          />
        );

      default:
        return (
          <input
            type='text'
            value={value}
            onChange={e => handleInputChange(param, e.target.value)}
            required={param.required}
            placeholder={param.description}
            className='param-input'
          />
        );
    }
  };

  // 코드 미리보기 생성
  const generateCodePreview = () => {
    let code = expectOption.syntax;

    // 파라미터 값을 코드에 삽입
    if (expectOption.params) {
      expectOption.params.forEach(param => {
        const value = params[param.name];

        if (value !== undefined) {
          let formattedValue;

          // 값 타입에 따른 포맷팅
          switch (param.type) {
            case 'string':
              formattedValue = `'${value}'`;
              break;
            case 'regexp':
              formattedValue = `/${value}/`;
              break;
            case 'array':
              formattedValue = Array.isArray(value)
                ? `[${value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')}]`
                : `['${value}']`;
              break;
            case 'boolean':
            case 'number':
            default:
              formattedValue = value;
          }

          code = code.replace(`${param.name}`, formattedValue);
        }
      });
    }

    // locator 부분 치환 - 선택자 유형에 따라 적절하게 처리
    // Playwright 선택자 패턴 식별
    let locatorReplacement: string;

    // 'page.'로 시작하는 경우 (이미 완전한 선택자)
    if (selector.startsWith('page.'))
      locatorReplacement = selector;

    // getByRole, getByText 등으로 시작하는 경우
    else if (selector.startsWith('getBy') || selector.startsWith('locator(') || selector.startsWith('frameLocator('))
      locatorReplacement = `page.${selector}`;

    // 기본 CSS/XPath 선택자인 경우
    else
      locatorReplacement = `page.locator('${selector}')`;


    code = code.replace('locator', locatorReplacement);

    return code;
  };

  return (
    <div className='assertion-parameters-form'>
      <h3 className='form-title'>{expectOption.name}</h3>
      <p className='form-description'>{expectOption.description}</p>

      <form onSubmit={handleSubmit}>
        {/* 선택된 셀렉터 표시 */}
        <div className='form-group'>
          <label className='param-label'>선택된 요소:</label>
          <div className='selector-display'>{selector}</div>
        </div>

        {/* 현재 요소 값 표시 및 사용 옵션 */}
        {currentValue && expectOption.params?.some(p => p.name === 'text') && (
          <div className='form-group'>
            <label className='param-label'>현재 값:</label>
            <div className='current-value-container'>
              <input
                type='text'
                className='current-value-input'
                value={useCurrentValue ? params.text || currentValue : currentValue}
                onChange={e => {
                  // 현재 값이 수정되면 자동으로 "현재 값 사용하기"를 활성화
                  if (!useCurrentValue)
                    setUseCurrentValue(true);

                  // text 파라미터 업데이트
                  setParams(prev => ({
                    ...prev,
                    text: e.target.value
                  }));
                }}
              />
              <div className='use-current-value'>
                <input
                  type='checkbox'
                  checked={useCurrentValue}
                  onChange={handleUseCurrentValueChange}
                  id='use-current-value'
                />
                <label htmlFor='use-current-value'>현재 값 사용하기</label>
              </div>
            </div>
          </div>
        )}

        {/* 파라미터 입력 필드 */}
        {expectOption.params?.map(param => (
          <div className='form-group' key={param.name}>
            <label className='param-label' htmlFor={`param-${param.name}`}>
              {param.description}
              {param.required && <span className='required'>*</span>}
            </label>
            {renderParamInput(param)}
          </div>
        ))}

        {/* 코드 미리보기 */}
        <div className='code-preview'>
          <h4>코드 미리보기:</h4>
          <pre>{generateCodePreview()}</pre>
        </div>

        {/* 버튼 그룹 */}
        <div className='form-buttons'>
          <button type='button' className='cancel-button' onClick={onCancel}>
            취소
          </button>
          <button type='submit' className='submit-button'>
            검증 추가하기
          </button>
        </div>
      </form>
    </div>
  );
};
