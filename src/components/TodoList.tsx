import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS } from '../graphql/queries';
import { TOGGLE_TODO, DELETE_TODO } from '../graphql/mutations';
import type { TodosData } from '../types/todo';
import AddTodo from './AddTodo';

export default function TodoList() {
  const { loading, error, data } = useQuery<TodosData>(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>📝 할일 목록</h2>

      <AddTodo />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data?.todos.map(todo => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo({ variables: { id: todo.id } })}
              style={{ marginRight: '12px', cursor: 'pointer' }}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#6c757d' : '#000',
              }}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo({ variables: { id: todo.id } })}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      {data?.todos.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6c757d' }}>
          할일이 없습니다. 새로운 할일을 추가해보세요!
        </p>
      )}
    </div>
  );
}
