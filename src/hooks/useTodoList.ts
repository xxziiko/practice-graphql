import { useTodoData } from './useTodoData';
import { useTodoMutations } from './useTodoMutations';
import { useTodoFilter } from './useTodoFilter';
import { filterTodos } from '../utils/todoFiltering';

/**
 * TodoList 비즈니스 로직을 조합하는 메인 훅
 *
 * Composition Pattern: 각각의 단일 책임 훅들을 조합
 */
export function useTodoList() {
  const { loading, error, todos } = useTodoData();
  const { handleToggle, handleDelete } = useTodoMutations();
  const {
    filter,
    searchKeyword,
    selectedTodoId,
    filterStats,
    setFilter,
    setSearchKeyword,
    handleSelect,
  } = useTodoFilter();

  const { filteredTodos, filteredCount, totalCount } = filterTodos(
    todos,
    filter,
    searchKeyword
  );

  return {
    // 데이터
    loading,
    error,
    todos,
    filteredTodos,

    // Recoil 상태
    filter,
    searchKeyword,
    selectedTodoId,
    filterStats,

    // 상태 업데이트 함수
    setFilter,
    setSearchKeyword,

    // 이벤트 핸들러
    handleToggle,
    handleDelete,
    handleSelect,

    // 계산된 값들
    totalCount,
    filteredCount,
  };
}
