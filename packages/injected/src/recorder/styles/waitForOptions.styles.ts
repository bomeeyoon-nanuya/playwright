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

/**
 * 컨테이너 스타일
 */
export const CONTAINER_STYLES = {
  MAIN: {
    width: '100%',
    display: 'flex',
    gap: '20px',
    maxHeight: '80vh',
    overflow: 'auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  LEFT_SECTION: {
    flex: '0 0 280px',
    display: 'flex',
    flexDirection: 'column'
  },
  RIGHT_SECTION: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb'
  }
};

/**
 * 컴포넌트 스타일
 */
export const COMPONENT_STYLES = {
  // 결과 컨테이너
  RESULT_CONTAINER: {
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bae6fd',
    margin: '16px'
  },
  // 성공 헤더 아이콘
  SUCCESS_ICON: {
    fontSize: '20px',
    marginRight: '8px'
  },
  // 성공 헤더 텍스트
  SUCCESS_TEXT: {
    fontWeight: '500',
    fontSize: '15px',
    color: '#0c4a6e'
  },
  // 셀렉터 컨테이너
  SELECTOR_CONTAINER: {
    fontFamily: 'monospace',
    background: '#fff',
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '12px',
    wordBreak: 'break-all'
  },
  // 코드 헤딩
  CODE_HEADING: {
    fontSize: '15px',
    fontWeight: '500',
    marginTop: '16px',
    marginBottom: '8px'
  },
  // 코드 블록
  CODE_BLOCK: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: '12px',
    borderRadius: '6px',
    overflow: 'auto',
    margin: '0',
    overflowX: 'scroll',
    whiteSpace: 'nowrap'
  },
  // 코드 설명
  CODE_DESCRIPTION: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px'
  },
  // 버튼 컨테이너
  BUTTON_CONTAINER: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px'
  },
  // 복사 버튼
  COPY_BUTTON: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  // 성공 버튼
  SUCCESS_BUTTON: {
    backgroundColor: '#10b981'
  }
};

/**
 * 옵션 카드 스타일
 */
export const CARD_STYLES = {
  // 옵션 카드 (기본)
  OPTION_CARD: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    boxShadow: 'none'
  },
  // 옵션 카드 (선택됨)
  OPTION_CARD_SELECTED: {
    backgroundColor: '#f0f7ff',
    borderColor: '#3b82f6',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  // 아이콘 컨테이너 (기본)
  ICON_CONTAINER: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    fontSize: '22px'
  },
  // 아이콘 컨테이너 (선택됨)
  ICON_CONTAINER_SELECTED: {
    backgroundColor: '#e0edff',
    color: '#2563eb'
  },
  // 옵션 라벨 (기본)
  OPTION_LABEL: {
    fontWeight: '500',
    fontSize: '14px',
    color: '#374151',
    marginBottom: '2px'
  },
  // 옵션 라벨 (선택됨)
  OPTION_LABEL_SELECTED: {
    color: '#1f2937'
  },
  // 옵션 설명 (기본)
  OPTION_DESC: {
    fontSize: '12px',
    color: '#6b7280'
  },
  // 옵션 설명 (선택됨)
  OPTION_DESC_SELECTED: {
    color: '#4b5563'
  },
  // 라디오 버튼 (기본)
  RADIO_BUTTON: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid #d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  // 라디오 버튼 (선택됨)
  RADIO_BUTTON_SELECTED: {
    border: '2px solid #3b82f6'
  },
  // 라디오 버튼 내부 점
  RADIO_DOT: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6'
  }
};

/**
 * 타임아웃 섹션 스타일
 */
export const TIMEOUT_STYLES = {
  // 타임아웃 섹션
  CONTAINER: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  // 타이틀 컨테이너
  TITLE_CONTAINER: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px'
  },
  // 타임아웃 아이콘
  ICON: {
    fontSize: '20px',
    marginRight: '8px'
  },
  // 타임아웃 타이틀
  TITLE: {
    fontWeight: '500',
    fontSize: '15px',
    color: '#0f172a'
  },
  // 입력 컨테이너
  INPUT_CONTAINER: {
    marginBottom: '8px'
  },
  // 라벨과 단위 컨테이너
  LABEL_UNIT_CONTAINER: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },
  // 입력 라벨
  INPUT_LABEL: {
    fontSize: '13px',
    color: '#4b5563'
  },
  // 단위 라벨
  UNIT_LABEL: {
    fontSize: '13px',
    color: '#6b7280'
  },
  // 입력 그룹
  INPUT_GROUP: {
    display: 'flex',
    position: 'relative'
  },
  // 시간 입력 필드
  TIME_INPUT: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  // 빠른 버튼 컨테이너
  QUICK_BUTTONS_CONTAINER: {
    display: 'flex',
    marginTop: '8px',
    gap: '8px'
  },
  // 빠른 시간 버튼 (기본)
  QUICK_BUTTON: {
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    backgroundColor: '#f9fafb',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 'normal'
  },
  // 빠른 시간 버튼 (선택됨)
  QUICK_BUTTON_SELECTED: {
    backgroundColor: '#e0edff',
    color: '#2563eb',
    fontWeight: '500'
  },
  // 도움말 텍스트
  HELP_TEXT: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px'
  }
};

/**
 * 안내 메시지 스타일
 */
export const PLACEHOLDER_STYLES = {
  // 메인 컨테이너
  CONTAINER: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px 20px',
    textAlign: 'center'
  },
  // 아이콘
  ICON: {
    fontSize: '32px',
    marginBottom: '16px'
  },
  // 제목 텍스트
  TITLE: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4b5563'
  },
  // 설명 텍스트
  DESCRIPTION: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '12px'
  }
};

/**
 * 요소 선택 모드 스타일
 */
export const ELEMENT_SELECT_STYLES = {
  // 모드 안내 컨테이너
  INSTRUCTIONS_CONTAINER: {
    padding: '16px',
    backgroundColor: '#fffbeb',
    borderRadius: '8px',
    border: '1px solid #fef3c7',
    marginBottom: '16px'
  },
  // 헤더 컨테이너
  HEADER_CONTAINER: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px'
  },
  // 아이콘
  ICON: {
    fontSize: '20px',
    marginRight: '8px'
  },
  // 헤더 텍스트
  HEADER_TEXT: {
    fontWeight: '500',
    fontSize: '15px',
    color: '#92400e'
  },
  // 안내 문구
  INSTRUCTION_TEXT: {
    margin: '0',
    fontSize: '13px',
    color: '#92400e'
  },
  // 요소 선택 컨테이너
  CONTAINER: {
    padding: '0',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }
};

/**
 * 섹션 컨텐츠 스타일
 */
export const SECTION_STYLES = {
  // 섹션 컨테이너 (모든 옵션 공통)
  CONTAINER: {
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bae6fd'
  },
  // 섹션 헤더
  HEADER: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    color: '#0c4a6e'
  },
  // 섹션 설명
  DESCRIPTION: {
    marginBottom: '16px',
    fontSize: '14px',
    color: '#334155'
  },
  // 입력 컨테이너
  INPUT_CONTAINER: {
    marginBottom: '16px'
  },
  // 라벨
  LABEL: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '8px'
  },
  // 텍스트 입력
  TEXT_INPUT: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  // 드롭다운 선택
  SELECT: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    appearance: 'auto'
  },
  // 정보 텍스트
  INFO_TEXT: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  },
  // 코드 컨테이너
  CODE_CONTAINER: {
    marginBottom: '16px'
  },
  // 버튼 컨테이너
  BUTTON_CONTAINER: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px'
  },
  // 에러 메시지
  ERROR_MESSAGE: {
    padding: '16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    marginBottom: '16px'
  }
};
