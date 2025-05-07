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

const { chromium } = require('playwright-core');

/**
 * 지원하는 브라우저 타입 목록
 */
const BROWSER_TYPES = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  WEBKIT: 'webkit',
};

/**
 * 기본 브라우저 구성 옵션
 */
const DEFAULT_BROWSER_OPTIONS = {
  headless: true,
  slowMo: 0,
};

/**
 * ShopBy 테스트 도구 클래스
 */
class ShopByPlaywright {
  /**
   * ShopByPlaywright 인스턴스를 생성합니다
   * @param {Object} config - 설정 객체
   */
  constructor(config = {}) {
    this.config = {
      browserType: BROWSER_TYPES.CHROMIUM,
      browserOptions: { ...DEFAULT_BROWSER_OPTIONS },
      ...config,
    };
    
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * 브라우저를 시작합니다
   * @returns {Promise<void>}
   */
  async launch() {
    this.browser = await chromium.launch(this.config.browserOptions);
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    return this;
  }

  /**
   * 지정된 URL로 이동합니다
   * @param {string} url - 탐색할 URL
   * @returns {Promise<void>}
   */
  async goto(url) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. launch() 메서드를 먼저 호출하세요.');
    }
    
    await this.page.goto(url);
    return this;
  }

  /**
   * 브라우저를 종료합니다
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  /**
   * 라이브러리 버전을 반환합니다
   * @returns {string} 패키지 버전
   */
  getVersion() {
    return require('./package.json').version;
  }
}

// 상수 익스포트
module.exports.BROWSER_TYPES = BROWSER_TYPES;
module.exports.DEFAULT_BROWSER_OPTIONS = DEFAULT_BROWSER_OPTIONS;

// 클래스 익스포트
module.exports.ShopByPlaywright = ShopByPlaywright;

// 팩토리 함수 익스포트
module.exports.createShopByPlaywright = (config) => new ShopByPlaywright(config); 