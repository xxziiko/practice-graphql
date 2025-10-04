import type { Todo } from '../graphql/__generated__/graphqlType';

/**
 * Todo 필터링 유틸리티 함수
 *
 * 순수 함수: 입력이 같으면 항상 같은 출력
 * 사이드 이펙트 없음, 테스트하기 쉬움
 */
export function filterTodos(
  todos: Todo[],
  filter: string,
  searchKeyword: string
) {
  const filteredTodos = todos.filter(todo => {
    // 검색어 필터링
    if (searchKeyword.trim()) {
      const matchesSearch = todo.title
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      if (!matchesSearch) return false;
    }

    // 완료 상태 필터링
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  return {
    filteredTodos,
    filteredCount: filteredTodos.length,
    totalCount: todos.length,
  };
}
