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

import fs from 'fs';

/**
 * 파일 쓰기 작업을 일정 시간 지연시켜 성능을 최적화하는 싱글톤 클래스
 * CLI 실행 시 하나의 인스턴스만 유지합니다.
 */
export class ThrottledFile {
  private static _instance: ThrottledFile | null = null;

  private _file: string | null = null;
  private _timer: NodeJS.Timeout | undefined;
  private _text: string | undefined;
  private _mergedText: string | undefined;

  private constructor() {
    // 비공개 생성자
  }

  /**
   * ThrottledFile의 싱글톤 인스턴스를 반환합니다.
   * CLI 최초 실행 시 인스턴스가 생성됩니다.
   */
  static getInstance(): ThrottledFile {
    if (!ThrottledFile._instance)
      ThrottledFile._instance = new ThrottledFile();

    return ThrottledFile._instance;
  }

  /**
   * 파일 경로를 설정합니다.
   * CLI 실행 시 --output 옵션이 있으면 이 메서드를 호출합니다.
   *
   * @param filePath 출력 파일 경로
   */
  setFilePath(filePath: string | null): void {
    // 이전 내용이 있다면 플러시 후 새 경로 설정
    this.flush();
    this._file = filePath;
  }

  /**
   * 파일에 쓸 내용을 설정합니다.
   * 쓰기 작업은 250ms 동안 지연되며, 같은 시간 내에 여러 호출이 있으면 마지막 내용만 저장됩니다.
   *
   * @param text 파일에 쓸 내용
   */
  setContent(text: string) {
    if (!this._file)
      return; // 파일 경로가 설정되지 않았으면 아무 것도 하지 않음

    this._text = text;
    if (!this._timer)
      this._timer = setTimeout(() => this.flush(), 250);
  }

  setMergedText(text: string) {
    if (!this._file)
      return; // 파일 경로가 설정되지 않았으면 아무 것도 하지 않음

    this._mergedText = text;

    this.flush();

    if (!this._timer)
      this._timer = setTimeout(() => this.flush(), 250);
  }

  /**
   * 대기 중인 내용을 즉시 파일에 쓰고 타이머를 정리합니다.
   */
  flush(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }

    if (this._mergedText && this._file) {
      fs.writeFileSync(this._file, this._mergedText);
      this._mergedText = undefined;
      this._text = undefined;
    }
  }
}
