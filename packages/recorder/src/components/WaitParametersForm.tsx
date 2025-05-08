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
import type { ExpectOption } from '../recorderTypes';
import './WaitParametersForm.css';

interface WaitParametersFormProps {
  waitOption: ExpectOption;
  selector: string;
  currentValue?: string;
  onSubmit: (params: Record<string, any>) => void;
  onCancel: () => void;
}

export const WaitParametersForm: React.FC<WaitParametersFormProps> = ({
  waitOption,
  selector,
  currentValue,
  onSubmit,
  onCancel
}) => {
  const [paramValues, setParamValues] = React.useState<Record<string, any>>({});
  const [previewCode, setPreviewCode] = React.useState<string>('');

  // 컴포넌트 마운트 시 기본값으로 초기화
  React.useEffect(() => {
    const defaultValues: Record<string, any> = {};
    waitOption.params?.forEach(param => {
      // 선택자 파라미터가 있는 경우 기본값으로 현재 선택자 설정
      if (param.name === 'selector' && selector)
        defaultValues[param.name] = selector;
      // currentValue가 있고 관련 파라미터가 있다면 사용
      else if ((param.name === 'text' || param.name === 'value') && currentValue)
        defaultValues[param.name] = currentValue;
      else if (param.defaultValue !== undefined)
        defaultValues[param.name] = param.defaultValue;
      else if (param.type === 'number')
        defaultValues[param.name] = 0;
      else if (param.type === 'string')
        defaultValues[param.name] = '';
    });
    setParamValues(defaultValues);
  }, [waitOption, selector, currentValue]);

  // 코드 미리보기 업데이트
  React.useEffect(() => {
    updatePreviewCode();
  }, [paramValues]);

  // 파라미터 값 변경 핸들러
  const handleParamChange = (name: string, value: any) => {
    setParamValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 코드 미리보기 생성
  const updatePreviewCode = () => {
    let code = waitOption.syntax;

    // 파라미터 값 삽입
    if (waitOption.params) {
      waitOption.params.forEach(param => {
        const value = paramValues[param.name];

        if (value !== undefined) {
          let formattedValue;

          // 값 타입에 따른 포맷팅
          switch (param.type) {
            case 'string':
              formattedValue = `'${value}'`;
              break;
            case 'selector':
              // 선택자 타입 특별 처리
              if (param.name === 'selector') {
                if (value.startsWith('page.') ||
                    value.startsWith('getBy') ||
                    value.startsWith('locator(') ||
                    value.startsWith('frameLocator('))
                  formattedValue = value;
                else
                  formattedValue = `'${value}'`;
              } else {
                formattedValue = `'${value}'`;
              }
              break;
            case 'number':
              formattedValue = value;
              break;
            default:
              formattedValue = value;
          }

          code = code.replace(new RegExp(`${param.name};`, 'g'), `${formattedValue};`);
          code = code.replace(new RegExp(`${param.name}\\)`, 'g'), `${formattedValue})`);
        }
      });
    }

    // 선택자 관련 처리 (waitForSelector 등에 사용)
    if (code.includes('selector') && selector) {
      // 선택자 타입에 따른 처리
      let selectorValue;
      if (selector.startsWith('page.') ||
          selector.startsWith('getBy') ||
          selector.startsWith('locator(') ||
          selector.startsWith('frameLocator('))
        selectorValue = selector;
      else
        selectorValue = `'${selector}'`;

      code = code.replace('selector', selectorValue);
    }

    setPreviewCode(code);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(paramValues);
  };

  return (
    <div className='wait-parameters-form'>
      <div className='wait-option-header'>
        <h3>{waitOption.name}</h3>
        <p>{waitOption.description}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='param-form-container'>
          {waitOption.params?.map(param => (
            <div key={param.name} className='param-input-group'>
              <label htmlFor={param.name}>
                {param.name}
                {param.required && <span className='required-indicator'>*</span>}
              </label>
              {param.type === 'number' ? (
                <input
                  type='number'
                  id={param.name}
                  value={paramValues[param.name] || 0}
                  onChange={e => handleParamChange(param.name, parseInt(e.target.value, 10))}
                  required={param.required}
                  className='param-input'
                />
              ) : (
                <input
                  type='text'
                  id={param.name}
                  value={paramValues[param.name] || ''}
                  onChange={e => handleParamChange(param.name, e.target.value)}
                  required={param.required}
                  className='param-input'
                />
              )}
              {param.description && (
                <div className='param-description'>{param.description}</div>
              )}
            </div>
          ))}
        </div>

        <div className='code-preview-container'>
          <h4>생성될 코드</h4>
          <pre className='code-preview'>{previewCode}</pre>
        </div>

        <div className='button-container'>
          <button type='button' className='cancel-button' onClick={onCancel}>취소</button>
          <button type='submit' className='submit-button'>추가</button>
        </div>
      </form>
    </div>
  );
};
