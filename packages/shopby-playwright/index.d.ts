/**
 * Copyright (c) ShopBy.
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

import { Page, Browser, BrowserContext } from 'playwright-core';

export interface BrowserTypes {
  CHROMIUM: string;
  FIREFOX: string;
  WEBKIT: string;
}

export interface BrowserOptions {
  headless?: boolean;
  slowMo?: number;
  [key: string]: any;
}

export interface ShopByConfig {
  browserType?: string;
  browserOptions?: BrowserOptions;
  [key: string]: any;
}

export declare const BROWSER_TYPES: BrowserTypes;
export declare const DEFAULT_BROWSER_OPTIONS: BrowserOptions;

export declare class ShopByPlaywright {
  config: ShopByConfig;
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;

  constructor(config?: ShopByConfig);
  
  /**
   * 브라우저를 시작합니다
   * @returns Promise<ShopByPlaywright>
   */
  launch(): Promise<ShopByPlaywright>;
  
  /**
   * 지정된 URL로 이동합니다
   * @param url 탐색할 URL
   * @returns Promise<ShopByPlaywright>
   */
  goto(url: string): Promise<ShopByPlaywright>;
  
  /**
   * 브라우저를 종료합니다
   * @returns Promise<void>
   */
  close(): Promise<void>;
  
  /**
   * 라이브러리 버전을 반환합니다
   * @returns string 패키지 버전
   */
  getVersion(): string;
}

/**
 * ShopByPlaywright 인스턴스를 생성합니다
 * @param config 설정 객체
 * @returns ShopByPlaywright 인스턴스
 */
export declare function createShopByPlaywright(config?: ShopByConfig): ShopByPlaywright; 