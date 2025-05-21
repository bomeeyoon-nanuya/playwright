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
 * 스타일을 HTML 요소에 적용하는 함수
 */
export function applyStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key as any] = value;
  });
}

/**
 * 선택자에 해당하는 HTML 요소 생성
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tagName: K,
  styles?: Record<string, string>,
  attributes?: Record<string, string>,
  textContent?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (styles)
    applyStyles(element, styles);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (textContent)
    element.textContent = textContent;

  return element;
}

/**
 * 요소에 자식 요소 추가
 */
export function appendChildren(parent: HTMLElement, children: (Node | string)[]): HTMLElement {
  children.forEach(child => {
    if (typeof child === 'string')
      parent.appendChild(parent.ownerDocument.createTextNode(child));
    else
      parent.appendChild(child);

  });
  return parent;
}
