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

// 액션 관련 타입 정의
interface WaitAction {
  name: string;
  selector?: string;
  timeout?: number;
  state?: string;
  signals: any[];
}

// 프레임 관련 타입 정의
interface Frame {
  pageAlias: string;
  framePath: string[];
}

// waitData 타입 정의
interface WaitData extends ExpectOption {
  code: string;
  selector: string;
  waitType?: string;
  action: WaitAction;
  frame: Frame;
}

interface WaitManagerProps {
  isOpen: boolean;
  selector: string;
  rawSelector?: string;
  elementInfo?: any;
  currentValue?: string;
  elementType?: string;
  onClose: () => void;
  onAddWait: (data: WaitData) => void;
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
    if (!selectedOption)
      return;

    // 대기 코드 생성 및 액션 실행
    executeWaitAction(selectedOption, selector, params)
        .then(({ code, action }) => {
        // 프레임 정보 생성
          const frame: Frame = {
            pageAlias: 'page',
            framePath: []
          };

          // 테스트 브라우저에 액션 직접 전송
          window.dispatch({
            event: 'recordInspectorAction',
            params: {
              action,
              frame
            }
          }).catch(() => {
            // 에러 처리
          });

          // 부모 컴포넌트에 대기 데이터 전달 (UI 업데이트용)
          onAddWait({
            ...selectedOption,
            code,
            selector,
            action,
            frame
          });

          // 모달 닫기
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

  // 대기 코드 생성 및 액션 객체 생성 함수
  const executeWaitAction = async (
    option: ExpectOption,
    selector: string,
    params: Record<string, any>
  ): Promise<{ code: string, action: WaitAction }> => {
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

      code = code.replace(/selector/g, selectorValue);
    }

    // 테스트 브라우저용 액션 객체 생성
    const action: WaitAction = {
      name: option.id,           // waitType 대신 id 사용
      selector: selector,        // 선택자 정보
      timeout: params.timeout,   // 타임아웃 값
      state: params.state,       // 상태 (visible, hidden 등)
      signals: []                // 신호 배열
    };

    return { code, action };
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
