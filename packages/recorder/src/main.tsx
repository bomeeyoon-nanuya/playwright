/*
  Copyright (c) Microsoft Corporation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import type { CallLog, Mode, Source } from './recorderTypes';
import * as React from 'react';
import { Recorder } from './recorder';
import './recorder.css';

// collapseActions 함수의 로직을 참조한 최적화 함수
const optimizeActions = (actions: string[]): string[] => {
  if (!actions || actions.length <= 1)
    return actions || [];

  const result: string[] = [];

  for (const action of actions) {
    // fill 액션 판별 함수
    const isFillAction = (act: string) => act.includes('.fill(');

    // 선택자 추출 함수
    const getSelectorFromFill = (act: string) => {
      const match = act.match(/await\s+(.*?)\.fill\(/);
      return match ? match[1].trim() : '';
    };

    // 이전 액션 확인
    const lastAction = result[result.length - 1];

    // fill 액션인지 확인
    if (isFillAction(action) && lastAction && isFillAction(lastAction)) {
      // 동일한 선택자인지 확인
      const currentSelector = getSelectorFromFill(action);
      const lastSelector = getSelectorFromFill(lastAction);

      // 같은 선택자에 대한 fill 액션이면 이전 것을 대체
      if (currentSelector && lastSelector && currentSelector === lastSelector) {
        result[result.length - 1] = action;
        continue;
      }
    }

    // 그 외에는 그냥 추가
    result.push(action);
  }

  return result;
};

export const Main: React.FC = ({}) => {
  const [sources, setSources] = React.useState<Source[]>([]);
  const [paused, setPaused] = React.useState(false);
  const [log, setLog] = React.useState(new Map<string, CallLog>());
  const [mode, setMode] = React.useState<Mode>('none');

  React.useLayoutEffect(() => {
    window.playwrightSetMode = setMode;
    window.playwrightSetSources = (sources, primaryPageURL) => {
      let updatedSources = sources;

      setSources(__sources => {
        updatedSources = sources.map(s => {
          const prevSource = __sources.find(prev => prev.id === s.id);

          if (!prevSource)
            return s;

          if (!s.actions || s.actions.length === 0)
            return prevSource;

          const lastAction = s.actions.length > 1 ? s.actions[s.actions.length - 1] : '';

          if (!lastAction)
            return s;

          // 이전 액션에 새 액션 추가
          const allActions = [...(prevSource.actions ?? []), lastAction];

          // collapseActions 로직을 활용한 액션 최적화
          const optimizedActions = optimizeActions(allActions);

          const updatedRevealLine = Math.max(1, optimizedActions.length - 1);

          // 소스코드 재생성
          const lines = s.text.split('\n');

          // 헤더/푸터와 액션 부분 구분
          const header: string[] = [];
          const footer: string[] = [];

          // 테스트 함수 시작 위치
          const testStartIndex = lines.findIndex(line => line.includes('async'));
          if (testStartIndex >= 0) {
            // 헤더는 테스트 함수 시작까지
            for (let i = 0; i <= testStartIndex; i++)
              header.push(lines[i]);


            // 푸터는 마지막 줄(보통 '});')
            footer.push(lines[lines.length - 1]);
          } else {
            // 파서가 테스트 구조를 인식할 수 없는 경우 원래 방식 사용
            const insertPosition = lines.length - 1;
            const INDENT = '  ';
            const trimmedAction = lastAction.trim();
            const formattedAction = trimmedAction.startsWith('await')
              ? `${INDENT}${trimmedAction}`
              : `${INDENT}await ${trimmedAction}`;

            lines.splice(insertPosition, 0, formattedAction);

            return {
              ...s,
              actions: allActions,
              revealLine: updatedRevealLine,
              text: lines.join('\n'),
            };
          }

          // 새 텍스트 구성: 헤더 + 최적화된 액션 + 푸터
          const newLines = [...header];

          // 액션 추가 (들여쓰기 포함)
          const INDENT = '  ';
          optimizedActions.forEach(action => {
            const trimmedAction = action.trim();
            const formattedAction = trimmedAction.startsWith('await')
              ? `${INDENT}${trimmedAction}`
              : `${INDENT}await ${trimmedAction}`;

            newLines.push(formattedAction);
          });

          // 푸터 추가
          newLines.push(...footer);

          return {
            ...s,
            actions: optimizedActions,
            revealLine: updatedRevealLine,
            text: newLines.join('\n'),
          };
        });

        return updatedSources;
      });

      window.playwrightSourcesEchoForTest = updatedSources;
      document.title = primaryPageURL
        ? `Playwright Inspector - ${primaryPageURL}`
        : `Playwright Inspector`;
    };
    window.playwrightSetPaused = setPaused;
    window.playwrightUpdateLogs = callLogs => {
      setLog(log => {
        const newLog = new Map<string, CallLog>(log);
        for (const callLog of callLogs) {
          callLog.reveal = !log.has(callLog.id);
          newLog.set(callLog.id, callLog);
        }
        return newLog;
      });
    };
  }, []);

  return <Recorder sources={sources} paused={paused} log={log} mode={mode} />;
};
