import { useRecoilState, useRecoilValue } from 'recoil';
import {
  todoFilterState,
  searchKeywordState,
  selectedTodoIdState,
} from '../recoil/atoms/todoAtoms';
import { filterStatsState } from '../recoil/selectors/todoSelectors';

/**
 * Todo 필터링 상태만 담당하는 훅
 *
 * Single Responsibility: 필터, 검색어, 선택 상태 관리
 */
export function useTodoFilter() {
  const [filter, setFilter] = useRecoilState(todoFilterState);
  const [searchKeyword, setSearchKeyword] = useRecoilState(searchKeywordState);
  const [selectedTodoId, setSelectedTodoId] =
    useRecoilState(selectedTodoIdState);
  const filterStats = useRecoilValue(filterStatsState);

  const handleSelect = (id: string) => {
    // 이미 선택된 todo를 클릭하면 선택 해제, 아니면 선택
    setSelectedTodoId(selectedTodoId === id ? null : id);
    console.log('선택된 Todo ID:', selectedTodoId === id ? null : id);
  };

  return {
    filter,
    searchKeyword,
    selectedTodoId,
    filterStats,
    setFilter,
    setSearchKeyword,
    handleSelect,
  };
}
