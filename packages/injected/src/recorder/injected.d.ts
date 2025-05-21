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

/**
 * ParsedSelector 타입 정의
 * 
 * 타입 호환성을 위해 string을 직접 사용
 */
export type ParsedSelector = string;

/**
 * InjectedScript 인터페이스 정의
 * 
 * 브라우저에 주입된 스크립트에 대한 타입 정의입니다.
 */
export interface InjectedScript {
  /**
   * 주입된 스크립트가 실행되는 윈도우 객체
   */
  window: Window;
  
  /**
   * 주입된 스크립트가 속한 문서 객체
   */
  document: Document;
  
  /**
   * 셀렉터를 사용하여 요소를 쿼리
   * 
   * 호환성을 위해 매개변수 타입을 string으로 변경
   */
  querySelector: (selector: string, root: Node, strict: boolean) => Element | undefined;
  
  /**
   * 셀렉터를 사용하여 모든 일치하는 요소를 쿼리
   * 
   * 호환성을 위해 매개변수 타입을 string으로 변경
   */
  querySelectorAll: (selector: string, root: Node) => Element[];
} 