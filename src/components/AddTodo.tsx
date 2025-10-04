import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_TODO } from '../graphql/mutations';
import { GET_TODOS } from '../graphql/queries';

export default function AddTodo() {
  const [title, setTitle] = useState('');
  const [addTodo, { loading }] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addTodo({ variables: { title } });
      setTitle('');
    } catch (error) {
      console.error('TODO 추가 실패:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="새 할일을 입력하세요..."
        disabled={loading}
        style={{
          padding: '8px 12px',
          fontSize: '14px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginRight: '8px',
          width: '300px',
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {loading ? '추가 중...' : '추가'}
      </button>
    </form>
  );
}
