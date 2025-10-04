import { useMutation } from '@apollo/client';
import { TOGGLE_TODO, DELETE_TODO } from '../graphql/mutations';
import { GET_TODOS } from '../graphql/queries';
import type {
  ToggleTodo,
  ToggleTodoVariables,
  DeleteTodo,
  DeleteTodoVariables,
  Query,
  Todo,
} from '../graphql/__generated__/graphqlType';

/**
 * Todo 뮤테이션만 담당하는 훅
 *
 * Single Responsibility: 서버에 todos 데이터 변경하기
 */
export function useTodoMutations() {
  const [toggleTodo] = useMutation<ToggleTodo, ToggleTodoVariables>(
    TOGGLE_TODO,
    {
      update: (cache, { data }) => {
        if (data?.toggleTodo) {
          // 캐시에서 기존 데이터 읽기
          const existingTodos = cache.readQuery<Pick<Query, 'todos'>>({
            query: GET_TODOS,
          });

          if (existingTodos) {
            // 토글된 todo 업데이트
            const updatedTodos = existingTodos.todos.map((todo: Todo) =>
              todo.id === data.toggleTodo.id
                ? { ...todo, completed: data.toggleTodo.completed }
                : todo
            );

            // 캐시에 업데이트된 데이터 쓰기
            cache.writeQuery({
              query: GET_TODOS,
              data: {
                todos: updatedTodos,
              },
            });
          }
        }
      },
    }
  );

  const [deleteTodo] = useMutation<DeleteTodo, DeleteTodoVariables>(
    DELETE_TODO,
    {
      update: (cache, { data }) => {
        if (data?.deleteTodo) {
          // 캐시에서 기존 데이터 읽기
          const existingTodos = cache.readQuery<Pick<Query, 'todos'>>({
            query: GET_TODOS,
          });

          if (existingTodos) {
            // 삭제된 todo 제외하고 새로운 배열 생성
            const updatedTodos = existingTodos.todos.filter(
              (todo: Todo) => todo.id !== data.deleteTodo
            );

            // 캐시에 업데이트된 데이터 쓰기
            cache.writeQuery({
              query: GET_TODOS,
              data: {
                todos: updatedTodos,
              },
            });
          }
        }
      },
    }
  );

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo({ variables: { id } });
    } catch (error) {
      console.error('TODO 토글 실패:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo({ variables: { id } });
    } catch (error) {
      console.error('TODO 삭제 실패:', error);
      throw error;
    }
  };

  return {
    handleToggle,
    handleDelete,
  };
}
