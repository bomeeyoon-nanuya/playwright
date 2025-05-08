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

          const updatedActions = [...(prevSource.actions ?? []), lastAction];
          const updatedRevealLine = Math.max(1, updatedActions.length - 1);

          const lines = prevSource.text.split('\n');
          const insertPosition = lines.length - 1; // 마지막 줄 바로 앞

          // 모든 액션에 일관된 들여쓰기 적용
          const INDENT = '  '; // 표준 들여쓰기 크기 (2칸)
          const trimmedAction = lastAction.trim();
          const formattedAction = trimmedAction.startsWith('await')
            ? `${INDENT}${trimmedAction}`  // await로 시작하는 경우 들여쓰기만 추가
            : `${INDENT}await ${trimmedAction}`; // await가 없는 경우 추가하고 들여쓰기

          lines.splice(insertPosition, 0, formattedAction);

          return {
            ...s,
            actions: updatedActions,
            revealLine: updatedRevealLine,
            text: lines.join('\n'),
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
