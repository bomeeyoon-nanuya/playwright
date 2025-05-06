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
    window.playwrightSetSources = (sources, options) => {
      let preserveAssertions = false;
      let primaryPageURL: string | undefined;

      if (options) {
        if (typeof options === 'string')
          primaryPageURL = options;
        else if (typeof options === 'object' && 'preserveAssertions' in options)
          preserveAssertions = !!options.preserveAssertions;

      }

      if (preserveAssertions) {
        setSources(prevSources => {
          if (!prevSources.length)
            return sources;

          return sources.map(newSource => {
            const prevSource = prevSources.find(p => p.id === newSource.id);
            if (!prevSource)
              return newSource;

            return mergeSourceCodes(prevSource, newSource);
          });
        });
      } else {
        setSources(sources);
      }

      window.playwrightSourcesEchoForTest = sources;
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

const mergeSourceCodes = (prevSource: Source, newSource: Source): Source => {
  if (!prevSource.text || !newSource.text)
    return newSource;

  const prevLines = prevSource.text.split('\n');
  const newLines = newSource.text.split('\n');

  let prevClosingIndex = -1;
  let newClosingIndex = -1;

  for (let i = prevLines.length - 1; i >= 0; i--) {
    if (prevLines[i].includes('});')) {
      prevClosingIndex = i;
      break;
    }
  }

  for (let i = newLines.length - 1; i >= 0; i--) {
    if (newLines[i].includes('});')) {
      newClosingIndex = i;
      break;
    }
  }

  if (prevClosingIndex === -1 || newClosingIndex === -1)
    return newSource;

  const commands: Array<{line: string; isAssertion: boolean; lineNumber: number}> = [];

  for (let i = 0; i < prevClosingIndex; i++) {
    const line = prevLines[i].trim();
    if ((line.includes('expect(') || line.includes('.expect(')) &&
        (line.includes('.to') || line.includes('.not.to'))) {
      commands.push({
        line: prevLines[i],
        isAssertion: true,
        lineNumber: i
      });
    } else if (line.startsWith('await page.') && line.endsWith(');')) {
      commands.push({
        line: prevLines[i],
        isAssertion: false,
        lineNumber: i
      });
    }
  }

  const newCommands: Array<{line: string; lineNumber: number}> = [];

  for (let i = 0; i < newClosingIndex; i++) {
    const line = newLines[i].trim();
    if (line.startsWith('await page.') && !line.includes('expect(') && line.endsWith(');')) {
      newCommands.push({
        line: newLines[i],
        lineNumber: i
      });
    }
  }

  const result: string[] = [];

  for (let i = 0; i < newLines.length; i++) {
    if (i < newCommands[0]?.lineNumber || newCommands.length === 0)
      result.push(newLines[i]);
    else
      break;

  }

  let newCommandIndex = 0;

  for (const cmd of commands) {
    if (!cmd.isAssertion && newCommandIndex < newCommands.length) {
      result.push(newCommands[newCommandIndex].line);
      newCommandIndex++;
    } else if (cmd.isAssertion) {
      result.push(cmd.line);
    }
  }

  while (newCommandIndex < newCommands.length) {
    result.push(newCommands[newCommandIndex].line);
    newCommandIndex++;
  }

  for (let i = newClosingIndex; i < newLines.length; i++)
    result.push(newLines[i]);


  return {
    ...newSource,
    text: result.join('\n'),
    highlight: commands.some(cmd => cmd.isAssertion)
      ? [...(newSource.highlight || []), { line: newClosingIndex - 1, type: 'running' }]
      : newSource.highlight
  };
};
