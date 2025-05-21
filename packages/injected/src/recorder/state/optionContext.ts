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

import type { OptionContextValue } from '../types/waitForOptions.types';

interface OptionContext {
  value: OptionContextValue | null;
  set: (value: OptionContextValue) => void;
  get: () => OptionContextValue | null;
  clear: () => void;
}

/**
 * 옵션 컨텍스트 전역 싱글톤 인스턴스
 *
 * 대기 옵션과 관련된 상태를 관리하며, 컴포넌트 간 데이터 공유를 위해 사용
 */
export const optionContext: OptionContext = {
  value: null,

  /**
   * 컨텍스트 값 설정
   */
  set: (value: OptionContextValue) => {
    optionContext.value = value;
  },

  /**
   * 컨텍스트 값 조회
   */
  get: () => {
    return optionContext.value;
  },

  /**
   * 컨텍스트 초기화
   */
  clear: () => {
    optionContext.value = null;
  },
};
