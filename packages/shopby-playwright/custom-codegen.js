#!/usr/bin/env node

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
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const childProcess = require('child_process');

// Recorder UI 경로 설정
const RECORDER_UI_PATH = path.join(__dirname, 'ui');

// 명령행 인수 파싱
const args = process.argv.slice(2);
let url = args[args.length - 1];
if (!url.startsWith('http://') && !url.startsWith('https://')) {
  url = 'https://' + url;
}

// 테스트 이름 (환경 변수에서 가져옴)
const testName = process.env.SHOPBY_PLAYWRIGHT_TEST_NAME || 'default-test';

// 현재 디렉토리
const currentDir = process.cwd();

// 파일 저장 경로
const outputFile = path.join(currentDir, `${testName}.spec.js`);

// 커스텀 UI가 존재하는지 확인
const hasCustomUI = fs.existsSync(path.join(RECORDER_UI_PATH, 'index.html'));

async function run() {
  console.log(`ShopBy 커스텀 코드젠 시작: URL=${url}, 테스트이름=${testName}`);

  if (hasCustomUI) {
    // 커스텀 UI 사용 - 이 부분은 원래 playwright 프로젝트의 코드젠 구현과 비슷하게 해야 함
    console.log('사용자 지정 UI를 사용하여 코드젠 실행...');
    
    // 원래 Playwright의 코드젠 명령을 실행하되 UI 경로를 우리 것으로 재정의
    // 환경 변수를 통해 우리 custom UI가 사용되도록 설정
    const env = {
      ...process.env,
      SHOPBY_USE_CUSTOM_RECORDER: 'true', 
      SHOPBY_CUSTOM_RECORDER_PATH: RECORDER_UI_PATH,
      SHOPBY_TEST_NAME: testName
    };
    
    try {
      const cmd = `npx playwright codegen --save-storage=${testName}.json ${url}`;
      console.log(`실행: ${cmd}`);
      
      const process = childProcess.spawn('npx', ['playwright', 'codegen', `--save-storage=${testName}.json`, url], { 
        stdio: 'inherit',
        env,
        shell: true
      });
      
      await new Promise((resolve) => {
        process.on('close', (code) => {
          console.log(`코드젠 프로세스 종료: 종료 코드 ${code}`);
          resolve();
        });
      });
      
      console.log(`\n"${testName}" 테스트가 생성되었습니다.`);
    } catch (error) {
      console.error('명령 실행 중 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  } else {
    // 커스텀 UI가 없으면 기본 기능만 수행
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('커스텀 Recorder UI를 찾을 수 없어 기본 브라우저만 시작합니다.');
    
    await page.goto(url);
    
    console.log('브라우저가 시작되었습니다. 테스트를 진행하세요. 종료하려면 브라우저를 닫으세요.');
    
    await browser.waitForEvent('disconnected');
    
    // 테스트 파일 생성
    const exampleTest = `
// ${testName}.spec.js
// 자동 생성된 테스트: ${new Date().toISOString()}

const { test, expect } = require('@playwright/test');

test('${testName}', async ({ page }) => {
  await page.goto('${url}');
  
  // 여기에 테스트 단계가 추가됩니다.
  
  console.log('테스트 완료: ${testName}');
});
`;

    fs.writeFileSync(outputFile, exampleTest);
    console.log(`테스트 파일이 생성되었습니다: ${outputFile}`);
  }
}

// 스크립트 실행
run().catch(error => {
  console.error('오류 발생:', error);
  process.exit(1);
}); 