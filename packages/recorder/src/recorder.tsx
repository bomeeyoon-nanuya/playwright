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

import type { CallLog, ElementInfo, Mode, Source } from './recorderTypes';
import { CodeMirrorWrapper } from '@web/components/codeMirrorWrapper';
import type { SourceHighlight } from '@web/components/codeMirrorWrapper';
import { SplitView } from '@web/components/splitView';
import { TabbedPane } from '@web/components/tabbedPane';
import { Toolbar } from '@web/components/toolbar';
import { emptySource, SourceChooser } from '@web/components/sourceChooser';
import { ToolbarButton, ToolbarSeparator } from '@web/components/toolbarButton';
import * as React from 'react';
import { CallLogView } from './callLog';
import './recorder.css';
import { asLocator } from '@isomorphic/locatorGenerators';
import { toggleTheme } from '@web/theme';
import { copy, useSetting } from '@web/uiUtils';
import * as yaml from 'yaml';
import { parseAriaSnapshot } from '@isomorphic/ariaSnapshot';
import { AssertionManager } from './components/AssertionManager';
import { WaitManager } from './components/WaitManager';

export interface RecorderProps {
  sources: Source[],
  paused: boolean,
  log: Map<string, CallLog>,
  mode: Mode,
}

export const Recorder: React.FC<RecorderProps> = ({
  sources,
  paused,
  log,
  mode,
}) => {
  const [selectedFileId, setSelectedFileId] = React.useState<string | undefined>();
  const [runningFileId, setRunningFileId] = React.useState<string | undefined>();
  const [selectedTab, setSelectedTab] = useSetting<string>('recorderPropertiesTab', 'log');
  const [ariaSnapshot, setAriaSnapshot] = React.useState<string | undefined>();
  const [ariaSnapshotErrors, setAriaSnapshotErrors] = React.useState<SourceHighlight[]>();

  // 검증 관련 상태
  const [showAssertionManager, setShowAssertionManager] = React.useState(false);
  const [showWaitManager, setShowWaitManager] = React.useState(false);
  const [elementInfo, setElementInfo] = React.useState<ElementInfo | undefined>();
  const [elementContent, setElementContent] = React.useState<string | undefined>();
  const [elementType, setElementType] = React.useState<string | undefined>();
  const [isVerifyingMode, setIsVerifyingMode] = React.useState(false);
  const [isWaitMode, setIsWaitMode] = React.useState(false);

  const fileId = selectedFileId || runningFileId || sources[0]?.id;

  const source = React.useMemo(() => {
    if (fileId) {
      const source = sources.find(s => s.id === fileId);
      if (source)
        return source;
    }
    return emptySource();
  }, [sources, fileId]);

  const [locator, setLocator] = React.useState('');

  // 요소 선택 처리 함수 확장
  window.playwrightElementPicked = (elementInfo: ElementInfo, userGesture?: boolean) => {
    const language = source.language;
    setLocator(asLocator(language, elementInfo.selector));
    setAriaSnapshot(elementInfo.ariaSnapshot);
    setAriaSnapshotErrors([]);

    // 새로운 요소 정보 저장
    setElementInfo(elementInfo);

    // 가능하면 요소 내용과 타입 추출
    extractElementDetails(elementInfo).then(details => {
      setElementContent(details.content);
      setElementType(details.type);
    });

    if (userGesture && selectedTab !== 'locator' && selectedTab !== 'aria')
      setSelectedTab('locator');

    // 검증 모드 처리
    if (isVerifyingMode) {
      setShowAssertionManager(true);
      setIsVerifyingMode(false);
      // 검증 모드 종료 후 recording 모드로 전환
      window.dispatch({
        event: 'setMode',
        params: { mode: 'recording' }
      }).catch(() => {});
    } else if (mode === 'inspecting' && selectedTab === 'aria') {
      // aria 탭 탐색 계속
    } else {
      window.dispatch({
        event: 'setMode',
        params: { mode: mode === 'inspecting' ? 'standby' : 'recording' }
      }).catch(() => {});
    }
  };

  // 요소 정보에서 내용과 타입 추출
  const extractElementDetails = async (info: ElementInfo): Promise<{content?: string, type?: string}> => {
    // 실제 구현에서는 브라우저에서 내용을 가져오는 API 호출이 필요
    // 여기서는 간단한 예시 구현
    return {
      content: '샘플 텍스트 내용',  // 실제로는 요소의 텍스트 내용
      type: 'div'                  // 실제로는 요소의 태그 이름
    };
  };

  window.playwrightSetRunningFile = setRunningFileId;

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'center', inline: 'nearest' });
  }, [messagesEndRef]);


  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'F8':
          event.preventDefault();
          if (paused)
            window.dispatch({ event: 'resume' });
          else
            window.dispatch({ event: 'pause' });
          break;
        case 'F10':
          event.preventDefault();
          if (paused)
            window.dispatch({ event: 'step' });
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [paused]);

  const onEditorChange = React.useCallback((selector: string) => {
    if (mode === 'none' || mode === 'inspecting')
      window.dispatch({ event: 'setMode', params: { mode: 'standby' } });
    setLocator(selector);
    window.dispatch({ event: 'highlightRequested', params: { selector } });
  }, [mode]);

  const onAriaEditorChange = React.useCallback((ariaSnapshot: string) => {
    if (mode === 'none' || mode === 'inspecting')
      window.dispatch({ event: 'setMode', params: { mode: 'standby' } });
    // @ts-ignore
    const { fragment, errors } = parseAriaSnapshot(yaml, ariaSnapshot, { prettyErrors: false });
    const highlights = errors.map(error => {
      const highlight: SourceHighlight = {
        message: error.message,
        line: error.range[1].line,
        column: error.range[1].col,
        type: 'subtle-error',
      };
      return highlight;
    });
    setAriaSnapshotErrors(highlights);
    setAriaSnapshot(ariaSnapshot);
    if (!errors.length)
      window.dispatch({ event: 'highlightRequested', params: { ariaTemplate: fragment } });
  }, [mode]);

  // 검증 시작 함수
  const startVerification = React.useCallback(() => {
    setIsVerifyingMode(true);
    // 검사 모드로 전환
    window.dispatch({
      event: 'setMode',
      params: { mode: 'inspecting' }
    }).catch(() => {});
  }, []);

  // 검증 추가 처리 함수
  const handleAddAssertion = React.useCallback((code: string) => {
    const currentSource = sources.find(s => s.id === fileId);

    if (!currentSource)
      return;

    window.playwrightSetSources([{
      ...currentSource,
      actions: [...(currentSource.actions ?? []), code],
    }]);

    // 검증 UI 닫기
    setShowAssertionManager(false);
  }, [sources, fileId]);

  // 대기 시작 함수
  const startWaiting = React.useCallback(() => {
    setIsWaitMode(true);
    setShowWaitManager(true);
  }, []);

  // 대기 추가 처리 함수
  const handleAddWait = React.useCallback((code: string) => {
    const currentSource = sources.find(s => s.id === fileId);

    if (!currentSource)
      return;

    window.playwrightSetSources([{
      ...currentSource,
      actions: [...(currentSource.actions ?? []), code],
    }]);

    // 대기 UI 닫기
    setShowWaitManager(false);
  }, [sources, fileId]);

  return <div className='recorder'>
    <Toolbar>
      <ToolbarButton icon='circle-large-filled' title='녹화 시작/중지' toggled={mode === 'recording' || mode === 'recording-inspecting' || mode.startsWith('asserting')} onClick={() => {
        window.dispatch({ event: 'setMode', params: { mode: mode === 'none' || mode === 'standby' || mode === 'inspecting' ? 'recording' : 'standby' } });
      }}>녹화</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton icon='inspect' title='요소 선택하기' toggled={mode === 'inspecting' || mode === 'recording-inspecting'} onClick={() => {
        const newMode: any = {
          'inspecting': 'standby',
          'none': 'inspecting',
          'standby': 'inspecting',
          'recording': 'recording-inspecting',
          'recording-inspecting': 'recording',
        };

        // 모든 asserting 모드에 대해 recording-inspecting으로 변경
        if (typeof mode === 'string' && mode.startsWith('asserting'))
          newMode[mode] = 'recording-inspecting';


        window.dispatch({ event: 'setMode', params: { mode: newMode[mode] } }).catch(() => { });
      }}>선택</ToolbarButton>

      {/* 개선된 검증 버튼 */}
      <ToolbarButton
        icon='beaker'
        title='검증 추가 - 요소를 선택한 후 검증 기능을 사용할 수 있습니다'
        toggled={isVerifyingMode}
        onClick={startVerification}>
        검증
      </ToolbarButton>

      {/* 대기 버튼 */}
      <ToolbarButton
        icon='clock'
        title='대기 추가'
        toggled={isWaitMode}
        onClick={startWaiting}>
        대기
      </ToolbarButton>

      <ToolbarSeparator />
      <ToolbarButton icon='files' title='생성된 코드 복사' disabled={!source || !source.text} onClick={() => {
        copy(source.text);
      }}>복사</ToolbarButton>
      <ToolbarButton icon='debug-continue' title='계속 실행 (F8)' ariaLabel='Resume' disabled={!paused} onClick={() => {
        window.dispatch({ event: 'resume' });
      }}>계속</ToolbarButton>
      <ToolbarButton icon='debug-pause' title='일시 중지 (F8)' ariaLabel='Pause' disabled={paused} onClick={() => {
        window.dispatch({ event: 'pause' });
      }}>일시정지</ToolbarButton>
      <ToolbarButton icon='debug-step-over' title='한 단계 실행 (F10)' ariaLabel='Step over' disabled={!paused} onClick={() => {
        window.dispatch({ event: 'step' });
      }}>단계 실행</ToolbarButton>
      <div style={{ flex: 'auto' }}></div>
      <div>대상:</div>
      <SourceChooser fileId={fileId} sources={sources} setFileId={fileId => {
        setSelectedFileId(fileId);
        window.dispatch({ event: 'fileChanged', params: { file: fileId } });
      }} />
      <ToolbarButton icon='clear-all' title='기록된 내용 지우기' disabled={!source || !source.text} onClick={() => {
        window.dispatch({ event: 'clear' });
      }}>초기화</ToolbarButton>
      <ToolbarButton icon='color-mode' title='테마 변경' toggled={false} onClick={() => toggleTheme()}>테마</ToolbarButton>
    </Toolbar>
    <SplitView
      sidebarSize={200}
      main={<CodeMirrorWrapper text={source.text} language={source.language} highlight={source.highlight} revealLine={source.revealLine} readOnly={true} lineNumbers={true} />}
      sidebar={<TabbedPane
        rightToolbar={selectedTab === 'locator' || selectedTab === 'aria' ? [<ToolbarButton key={1} icon='files' title='Copy' onClick={() => copy((selectedTab === 'locator' ? locator : ariaSnapshot) || '')} />] : []}
        tabs={[
          {
            id: 'locator',
            title: '선택자',
            render: () => <CodeMirrorWrapper text={locator} placeholder='선택자를 입력하여 검사' language={source.language} focusOnChange={true} onChange={onEditorChange} wrapLines={true} />
          },
          {
            id: 'log',
            title: '로그',
            render: () => <CallLogView language={source.language} log={Array.from(log.values())} />
          },
          {
            id: 'aria',
            title: 'Aria',
            render: () => <CodeMirrorWrapper text={ariaSnapshot || ''} placeholder='Aria 템플릿을 입력하여 매칭' language={'yaml'} onChange={onAriaEditorChange} highlight={ariaSnapshotErrors} wrapLines={true} />
          },
        ]}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />}
    />

    {/* 검증 매니저 컴포넌트 */}
    <AssertionManager
      isOpen={showAssertionManager}
      selector={locator}
      rawSelector={elementInfo?.selector}
      elementInfo={elementInfo}
      currentValue={elementContent}
      elementType={elementType}
      onClose={() => setShowAssertionManager(false)}
      onAddAssertion={handleAddAssertion}
    />

    {/* 대기 매니저 컴포넌트 */}
    <WaitManager
      isOpen={showWaitManager}
      selector={locator}
      rawSelector={elementInfo?.selector}
      elementInfo={elementInfo}
      currentValue={elementContent}
      elementType={elementType}
      onClose={() => setShowWaitManager(false)}
      onAddWait={handleAddWait}
    />
  </div>;
};
