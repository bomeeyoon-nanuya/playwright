#!/usr/bin/env node
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

// 브라우저가 설치되어 있지 않을 때 자동으로 설치
try {
  const { existsSync } = require('fs');
  const { execSync } = require('child_process');
  const path = require('path');
  const os = require('os');
  
  const browserDir = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  
  // 하나라도 브라우저가 설치되어 있지 않으면 모든 브라우저 설치
  const browsers = ['chromium', 'firefox', 'webkit'];
  const isBrowsersInstalled = browsers.every(browser => {
    const browserPattern = `${browser}-*`;
    const browserPath = path.join(browserDir, browserPattern);
    return existsSync(browserPath);
  });
  
  if (!isBrowsersInstalled) {
    execSync('npx @shopby/playwright-core install', { stdio: 'inherit' });
  }
} catch (e) {
  console.error('브라우저 설치 확인 중 오류가 발생했습니다:', e);
}

const { program } = require('./lib/program');
program.parse(process.argv);
