import { atom } from 'recoil';

/**
 * Recoil Atom: 필터 상태
 *
 * Atom이란?
 * - Recoil의 가장 기본 상태 단위
 * - 컴포넌트가 구독할 수 있는 상태
 * - atom이 업데이트되면 구독하는 모든 컴포넌트가 리렌더링됨
 */
export const todoFilterState = atom<'all' | 'active' | 'completed'>({
  key: 'todoFilterState', // ✅ 전역적으로 유니크한 key
  default: 'all', // ✅ 기본값
});

/**
 * Recoil Atom: 검색어 상태
 */
export const searchKeywordState = atom<string>({
  key: 'searchKeywordState',
  default: '',
});

/**
 * Recoil Atom: 선택된 Todo ID
 *
 * 실무 패턴: null 허용 타입
 */
export const selectedTodoIdState = atom<string | null>({
  key: 'selectedTodoIdState',
  default: null,
});

/**
 * Recoil Atom: 로딩 상태
 *
 * GraphQL loading과 별개로 앱 전역 로딩 상태 관리
 */
export const isLoadingState = atom<boolean>({
  key: 'isLoadingState',
  default: false,
});
