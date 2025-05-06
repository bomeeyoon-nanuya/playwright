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
import { AssertionSelector } from './AssertionSelector';
import { AssertionParametersForm } from './AssertionParametersForm';
import { EXPECT_CATEGORIES, EXPECT_OPTIONS } from '../constants/playwright-expects';
import type { ElementInfo, ExpectOption } from '../recorderTypes';
import './AssertionManager.css';

interface AssertionManagerProps {
  isOpen: boolean;
  selector: string;
  rawSelector?: string;
  elementInfo?: ElementInfo;
  currentValue?: string;
  elementType?: string;
  onClose: () => void;
  onAddAssertion: (code: string) => void;
}

enum AssertionStep {
  SELECT_OPTION,
  ENTER_PARAMETERS
}

/**
 * 검증 관리 컴포넌트
 * 검증 프로세스의 모든 단계를 관리하고 조정함
 */
export const AssertionManager: React.FC<AssertionManagerProps> = ({
  isOpen,
  selector,
  rawSelector,
  elementInfo,
  currentValue,
  elementType,
  onClose,
  onAddAssertion
}) => {
  const [step, setStep] = React.useState(AssertionStep.SELECT_OPTION);
  const [selectedOption, setSelectedOption] = React.useState<ExpectOption | null>(null);

  // 모달이 열릴 때마다 초기 상태로 리셋
  React.useEffect(() => {
    if (isOpen) {
      setStep(AssertionStep.SELECT_OPTION);
      setSelectedOption(null);
    }
  }, [isOpen]);

  // 검증 옵션 선택 처리
  const handleSelectOption = (option: ExpectOption) => {
    setSelectedOption(option);
    setStep(AssertionStep.ENTER_PARAMETERS);
  };

  // 검증 파라미터 입력 후 제출 처리
  const handleSubmitParams = (params: Record<string, any>) => {
    if (!selectedOption)
      return;

    // 최종 검증 코드 생성
    generateAssertionCode(selectedOption, selector, params)
        .then(code => {
        // 생성된 코드를 상위 컴포넌트로 전달
          onAddAssertion(code);
          onClose();
        });
  };

  // 취소 시 처리
  const handleCancel = () => {
    if (step === AssertionStep.ENTER_PARAMETERS) {
      // 파라미터 입력 단계에서 취소하면 옵션 선택 단계로 돌아감
      setStep(AssertionStep.SELECT_OPTION);
      setSelectedOption(null);
    } else {
      // 옵션 선택 단계에서 취소하면 모달 닫기
      onClose();
    }
  };

  // 검증 코드 생성 함수
  const generateAssertionCode = async (
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

  if (!isOpen)
    return null;

  return (
    <div className='assertion-manager-overlay'>
      <div className='assertion-manager-modal'>
        {step === AssertionStep.SELECT_OPTION ? (
          <AssertionSelector
            categories={EXPECT_CATEGORIES}
            options={EXPECT_OPTIONS}
            onSelectOption={handleSelectOption}
            onCancel={handleCancel}
            elementType={elementType}
          />
        ) : (
          selectedOption && (
            <AssertionParametersForm
              expectOption={selectedOption}
              selector={selector}
              currentValue={currentValue}
              onSubmit={handleSubmitParams}
              onCancel={handleCancel}
            />
          )
        )}
      </div>
    </div>
  );
};
