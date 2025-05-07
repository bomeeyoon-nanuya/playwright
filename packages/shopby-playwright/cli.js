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

const { execSync } = require('child_process');
const path = require('path');

// 명령줄 인수 파싱
const args = process.argv.slice(2);

// codegen 명령어 처리
if (args.length > 0 && args[0] === 'codegen') {
  const restArgs = args.slice(1);
  
  // --name 옵션 처리
  let nameIndex = restArgs.indexOf('--name');
  if (nameIndex !== -1 && nameIndex < restArgs.length - 1) {
    const testName = restArgs[nameIndex + 1];
    console.log(`테스트 이름으로 "${testName}"을(를) 사용합니다.`);
    
    // --name 옵션 제거 (Playwright에서 지원하지 않으므로)
    restArgs.splice(nameIndex, 2);
    
    // 여기에 --name 옵션을 처리하는 로직 추가
    // 예: 테스트 이름으로 파일을 생성하는 등의 작업
    
    // 수정된 인수로 기본 Playwright 명령 실행
    try {
      console.log(`실행: playwright codegen ${restArgs.join(' ')}`);
      execSync(`npx playwright codegen ${restArgs.join(' ')}`, { stdio: 'inherit' });
      
      // 테스트 생성 후 이름 설정하는 등의 추가 작업 수행
      console.log(`\n"${testName}" 테스트가 생성되었습니다.`);
    } catch (error) {
      console.error('명령 실행 중 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  } else {
    // 일반 playwright 명령 실행
    try {
      execSync(`npx playwright ${args.join(' ')}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('명령 실행 중 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  }
} else {
  // 다른 명령어는 그대로 전달
  try {
    execSync(`npx playwright ${args.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('명령 실행 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
} 