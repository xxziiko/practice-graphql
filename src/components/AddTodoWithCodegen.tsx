import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_TODO } from '../graphql/mutations';
import { GET_TODOS } from '../graphql/queries';

export default function AddTodoWithCodegen() {
  const [title, setTitle] = useState('');
  const [addTodo, { loading }] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addTodo({
        variables: { title: title.trim() },
      });
      setTitle('');
    } catch (error) {
      console.error('TODO 추가 실패:', error);
    }
  };

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
      }}
    >
      <h3>➕ 새 할일 추가 (Code Generator 버전)</h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
      >
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="새 할일을 입력하세요..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? '추가 중...' : '추가'}
        </button>
      </form>
    </div>
  );
}
