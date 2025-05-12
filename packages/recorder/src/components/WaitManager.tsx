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
import { WaitOptionSelector } from './WaitOptionSelector';
import { WaitParametersForm } from './WaitParametersForm';
import { WAIT_OPTIONS, WAIT_CATEGORIES } from '../constants/playwright-waits';
import type { ExpectOption } from '../recorderTypes';
import './WaitManager.css';

interface WaitManagerProps {
  isOpen: boolean;
  selector: string;
  rawSelector?: string;
  elementInfo?: any;
  currentValue?: string;
  elementType?: string;
  onClose: () => void;
  onAddWait: (code: string) => void;
}

enum WaitStep {
  SELECT_OPTION,
  ENTER_PARAMETERS
}

/**
 * 대기 관리 컴포넌트
 * 대기 기능의 모든 단계를 관리하고 조정함
 */
export const WaitManager: React.FC<WaitManagerProps> = ({
  isOpen,
  selector,
  rawSelector,
  elementInfo,
  currentValue,
  elementType,
  onClose,
  onAddWait
}) => {
  const [step, setStep] = React.useState(WaitStep.SELECT_OPTION);
  const [selectedOption, setSelectedOption] = React.useState<ExpectOption | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  // 모달이 열릴 때마다 초기 상태로 리셋
  React.useEffect(() => {
    if (isOpen) {
      setStep(WaitStep.SELECT_OPTION);
      setSelectedOption(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  // 대기 옵션 선택 처리
  const handleSelectOption = (option: ExpectOption) => {
    setSelectedOption(option);
    setStep(WaitStep.ENTER_PARAMETERS);
  };

  // 대기 파라미터 입력 후 제출 처리
  const handleSubmitParams = (params: Record<string, any>) => {
    debugger;
    if (!selectedOption)
      return;

    // 최종 대기 코드 생성
    generateWaitCode(selectedOption, selector, params)
        .then(code => {
          console.log(selectedOption);
          console.log(selector);
          console.log(params);

          debugger;
          // 생성된 코드를 상위 컴포넌트로 전달
          onAddWait(code);
          onClose();
        });
  };

  // 취소 시 처리
  const handleCancel = () => {
    if (step === WaitStep.ENTER_PARAMETERS) {
      // 파라미터 입력 단계에서 취소하면 옵션 선택 단계로 돌아감
      setStep(WaitStep.SELECT_OPTION);
      setSelectedOption(null);
    } else {
      // 옵션 선택 단계에서 취소하면 모달 닫기
      onClose();
    }
  };

  // 대기 코드 생성 함수
  const generateWaitCode = async (
    option: ExpectOption,
    selector: string,
    params: Record<string, any>
  ): Promise<string> => {
    let code = option.syntax;

    // 파라미터 값을 코드에 삽입
    if (option.params) {
      option.params.forEach(param => {
        const value = params[param.name];

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

    return code;
  };

  if (!isOpen)
    return null;

  return (
    <div className='wait-manager-overlay'>
      <div className='wait-manager-modal'>
        {step === WaitStep.SELECT_OPTION ? (
          <div className='wait-option-container'>
            <div className='wait-header'>
              <h2>대기 기능 추가</h2>
              <input
                type='text'
                className='search-input'
                placeholder='대기 옵션 검색...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className='close-button' onClick={onClose}>✕</button>
            </div>
            <WaitOptionSelector
              categories={WAIT_CATEGORIES}
              options={WAIT_OPTIONS}
              searchTerm={searchTerm}
              elementType={elementType}
              onSelectOption={handleSelectOption}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          selectedOption && (
            <div className='wait-params-container'>
              <div className='wait-header'>
                <h2>대기 옵션 설정</h2>
                <button className='close-button' onClick={onClose}>✕</button>
              </div>
              <WaitParametersForm
                waitOption={selectedOption}
                selector={selector}
                currentValue={currentValue}
                onSubmit={handleSubmitParams}
                onCancel={handleCancel}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};
