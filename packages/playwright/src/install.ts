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

import { installBrowsersForNpmInstall } from '@shopby/playwright-core/lib/server/registry/index';

try {
  // npm이 설치 중인 경우 브라우저를 자동으로 설치합니다
  installBrowsersForNpmInstall(['chromium', 'firefox', 'webkit']).catch(() => {});
} catch (e) {
  // 개발 환경에서는 무시합니다
}
