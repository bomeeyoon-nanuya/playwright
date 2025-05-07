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

const fs = require('fs');
const path = require('path');

// 경로 설정
const ROOT = path.join(__dirname, '..', '..', '..');
const SOURCE_RECORDER_PATH = path.join(ROOT, 'packages/playwright-core/lib/vite/recorder');
const TARGET_UI_PATH = path.join(__dirname, '..', 'ui');

// ui 디렉토리가 없으면 생성
if (!fs.existsSync(TARGET_UI_PATH)) {
  fs.mkdirSync(TARGET_UI_PATH, { recursive: true });
}

// 복사 함수
function copyRecursive(source, target) {
  if (fs.lstatSync(source).isDirectory()) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    
    const entries = fs.readdirSync(source);
    for (const entry of entries) {
      const sourcePath = path.join(source, entry);
      const targetPath = path.join(target, entry);
      copyRecursive(sourcePath, targetPath);
    }
  } else {
    fs.copyFileSync(source, target);
  }
}

// UI 파일 복사
console.log(`Copying UI files from ${SOURCE_RECORDER_PATH} to ${TARGET_UI_PATH}`);
copyRecursive(SOURCE_RECORDER_PATH, TARGET_UI_PATH);
console.log('UI files copied successfully!');

// 커스텀 코드젠 파일에 경로 설정
const CUSTOM_CODEGEN_PATH = path.join(__dirname, '..', 'custom-codegen.js');
if (fs.existsSync(CUSTOM_CODEGEN_PATH)) {
  console.log('Updating custom-codegen.js with correct UI paths');
  
  let content = fs.readFileSync(CUSTOM_CODEGEN_PATH, 'utf-8');
  content = content.replace(
    /const\s+RECORDER_UI_PATH\s+=\s+[^;]+;/,
    `const RECORDER_UI_PATH = path.join(__dirname, 'ui');`
  );
  
  fs.writeFileSync(CUSTOM_CODEGEN_PATH, content);
  console.log('custom-codegen.js updated successfully!');
} 