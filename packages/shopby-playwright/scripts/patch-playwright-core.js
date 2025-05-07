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
const { execSync } = require('child_process');

// 현재 postinstall 스크립트가 실행되는 위치
const CURRENT_DIR = process.cwd();

// node_modules의 playwright-core 위치
let PLAYWRIGHT_CORE_PATH;

// 이 패키지가 직접 설치된 경우
if (fs.existsSync(path.join(CURRENT_DIR, 'node_modules', 'playwright-core'))) {
  PLAYWRIGHT_CORE_PATH = path.join(CURRENT_DIR, 'node_modules', 'playwright-core');
} 
// 이 패키지가 다른 프로젝트의 의존성으로 설치된 경우
else if (fs.existsSync(path.join(CURRENT_DIR, '..', '..', 'node_modules', 'playwright-core'))) {
  PLAYWRIGHT_CORE_PATH = path.join(CURRENT_DIR, '..', '..', 'node_modules', 'playwright-core');
}
// 경로를 찾을 수 없는 경우
else {
  console.warn('playwright-core를 찾을 수 없습니다. 패치를 적용할 수 없습니다.');
  process.exit(0);
}

// Recorder UI 파일 경로 찾기
function findRecorderPaths() {
  console.log('Recorder UI 경로를 찾는 중...');
  
  // 알려진 경로 목록
  const possiblePaths = [
    // npm package 구조
    path.join(PLAYWRIGHT_CORE_PATH, 'lib', 'vite', 'recorder'),
    // GitHub 저장소 구조
    path.join(PLAYWRIGHT_CORE_PATH, 'packages', 'playwright-core', 'src', 'vite', 'recorder'),
    path.join(PLAYWRIGHT_CORE_PATH, 'src', 'vite', 'recorder'),
    // 다른 가능한 구조
    path.join(PLAYWRIGHT_CORE_PATH, 'packages', 'recorder'),
    path.join(PLAYWRIGHT_CORE_PATH, 'packages', 'playwright-core', 'src', 'server', 'recorder'),
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      console.log(`Recorder UI 경로를 찾았습니다: ${testPath}`);
      return testPath;
    }
  }
  
  // find 명령어로 모든 recorder 디렉토리 찾기
  try {
    console.log('find 명령어로 모든 recorder 디렉토리 찾는 중...');
    const findCommand = `find "${PLAYWRIGHT_CORE_PATH}" -name recorder -type d`;
    const recorderDirs = execSync(findCommand).toString().trim().split('\n');
    console.log('찾은 recorder 디렉토리:', recorderDirs);
    
    // UI 파일이 있는 디렉토리 찾기
    for (const dir of recorderDirs) {
      if (fs.existsSync(path.join(dir, 'index.html'))) {
        console.log(`UI 파일이 있는 Recorder 디렉토리를 찾았습니다: ${dir}`);
        return dir;
      }
    }
  } catch (error) {
    console.warn('find 명령어 실행 중 오류 발생:', error.message);
  }
  
  return null;
}

// Recorder UI 경로 찾기
const RECORDER_PATH = findRecorderPaths();

// 커스텀 UI 파일 경로
const CUSTOM_UI_PATH = path.join(__dirname, '..', 'ui');

// Recorder 디렉토리가 존재하는지 확인
if (!RECORDER_PATH) {
  console.warn('Recorder UI 경로를 찾을 수 없습니다.');
  console.warn('playwright-core 디렉토리 구조:');
  
  // playwright-core 구조 출력
  if (fs.existsSync(PLAYWRIGHT_CORE_PATH)) {
    const dirs = fs.readdirSync(PLAYWRIGHT_CORE_PATH);
    console.warn('루트 디렉토리:', dirs);
    
    if (fs.existsSync(path.join(PLAYWRIGHT_CORE_PATH, 'packages', 'playwright-core'))) {
      const pkgDirs = fs.readdirSync(path.join(PLAYWRIGHT_CORE_PATH, 'packages', 'playwright-core'));
      console.warn('packages/playwright-core 디렉토리:', pkgDirs);
      
      if (fs.existsSync(path.join(PLAYWRIGHT_CORE_PATH, 'packages', 'playwright-core', 'src'))) {
        const srcDirs = fs.readdirSync(path.join(PLAYWRIGHT_CORE_PATH, 'packages', 'playwright-core', 'src'));
        console.warn('packages/playwright-core/src 디렉토리:', srcDirs);
      }
    }
  }
  
  process.exit(0);
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
    // 파일이 이미 존재하면 백업
    if (fs.existsSync(target)) {
      const backupPath = `${target}.original`;
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(target, backupPath);
        console.log(`원본 파일 백업: ${target} -> ${backupPath}`);
      }
    }
    
    // 새 파일 복사
    fs.copyFileSync(source, target);
  }
}

// 패치 실행
console.log('ShopBy 커스텀 Playwright UI 패치를 적용합니다...');
console.log(`패치 대상: ${RECORDER_PATH}`);
console.log(`패치 소스: ${CUSTOM_UI_PATH}`);

// 커스텀 UI 파일들을 타겟 디렉토리에 복사
copyRecursive(CUSTOM_UI_PATH, RECORDER_PATH);

console.log('패치가 성공적으로 적용되었습니다!');
console.log('이제 shopby-playwright 명령어를 사용하면 커스텀 UI가 표시됩니다.'); 