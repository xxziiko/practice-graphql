import { selector } from 'recoil';
import { todoFilterState, searchKeywordState } from '../atoms/todoAtoms';

/**
 * Recoil Selector: Derived State (파생 상태)
 *
 * Selector란?
 * - 다른 atom이나 selector를 기반으로 계산된 값
 * - Pure Function (순수 함수)
 * - 자동으로 캐싱됨
 * - 의존하는 atom이 변경될 때만 재계산
 */

/**
 * 필터 정보 텍스트
 *
 * 사용 예: "전체 할일 보기" / "완료된 할일 보기"
 */
export const filterTextState = selector<string>({
  key: 'filterTextState',
  get: ({ get }) => {
    const filter = get(todoFilterState); // ✅ atom 값 읽기

    switch (filter) {
      case 'all':
        return '전체 할일';
      case 'active':
        return '진행 중인 할일';
      case 'completed':
        return '완료된 할일';
      default:
        return '전체 할일';
    }
  },
});

/**
 * 검색 활성화 여부
 *
 * 검색어가 있으면 true
 */
export const isSearchActiveState = selector<boolean>({
  key: 'isSearchActiveState',
  get: ({ get }) => {
    const keyword = get(searchKeywordState);
    return keyword.trim().length > 0;
  },
});

/**
 * 필터 통계
 *
 * 실무 패턴: 여러 atom을 조합한 복잡한 로직
 */
export const filterStatsState = selector({
  key: 'filterStatsState',
  get: ({ get }) => {
    const filter = get(todoFilterState);
    const keyword = get(searchKeywordState);
    const isSearching = get(isSearchActiveState);

    return {
      currentFilter: filter,
      searchKeyword: keyword,
      isSearching,
      displayText: isSearching
        ? `"${keyword}" 검색 결과`
        : get(filterTextState),
    };
  },
});
