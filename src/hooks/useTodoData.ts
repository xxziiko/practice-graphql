import { useQuery } from '@apollo/client';
import { GET_TODOS } from '../graphql/queries';
import type { Query } from '../graphql/__generated__/graphqlType';

/**
 * Todo 데이터 조회만 담당하는 훅
 *
 * Single Responsibility: 서버에서 todos 데이터 가져오기
 */
export function useTodoData() {
  const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

  return {
    loading,
    error,
    todos: data?.todos || [],
  };
}
