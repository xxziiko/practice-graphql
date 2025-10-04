import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS } from '../graphql/queries';
import type {
  Query,
  ToggleTodo,
  ToggleTodoVariables,
  DeleteTodo,
  DeleteTodoVariables,
} from '../graphql/__generated__/graphqlType';
import { TOGGLE_TODO, DELETE_TODO } from '../graphql/mutations';

export default function TodoListWithCodegen() {
  // 실무 패턴: Query는 Pick<Query, 'fieldName'>으로 특정 필드만 선택
  const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

  // 실무 패턴: Mutation은 omitOperationSuffix로 생성된 타입 사용
  // ToggleTodoMutation -> ToggleTodo (접미사 제거)
  const [toggleTodo] = useMutation<ToggleTodo, ToggleTodoVariables>(
    TOGGLE_TODO
  );

  const [deleteTodo] = useMutation<DeleteTodo, DeleteTodoVariables>(
    DELETE_TODO,
    {
      refetchQueries: [{ query: GET_TODOS }],
    }
  );
  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo({
        variables: { id },
      });
    } catch (error) {
      console.error('TODO 토글 실패:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo({
        variables: { id },
      });
    } catch (error) {
      console.error('TODO 삭제 실패:', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>📝 할일 목록 (Code Generator 버전)</h2>

      {data?.todos?.map(
        (todo: { id: string; title: string; completed: boolean }) => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #ddd',
              marginBottom: '10px',
              borderRadius: '4px',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
              style={{ marginRight: '10px' }}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                opacity: todo.completed ? 0.6 : 1,
              }}
            >
              {todo.title}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              삭제
            </button>
          </div>
        )
      )}
    </div>
  );
}
