import { useQuery, useMutation } from '@apollo/client';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { GET_TODOS } from '../graphql/queries';
import { TOGGLE_TODO, DELETE_TODO } from '../graphql/mutations';
import type {
  Query,
  ToggleTodo,
  ToggleTodoVariables,
  DeleteTodo,
  DeleteTodoVariables,
} from '../graphql/__generated__/graphqlType';
import {
  todoFilterState,
  searchKeywordState,
  selectedTodoIdState,
} from '../recoil/atoms/todoAtoms';
import { filterStatsState } from '../recoil/selectors/todoSelectors';

/**
 * Recoil + GraphQL 통합 컴포넌트
 *
 * 실무 패턴:
 * - GraphQL: 서버 데이터 관리 (todos 목록)
 * - Recoil: 클라이언트 상태 관리 (필터, 검색어, 선택 등)
 */
export default function TodoListWithRecoil() {
  // ═══════════════════════════════════════════════════════════
  // 1. GraphQL: 서버 데이터 조회
  // ═══════════════════════════════════════════════════════════
  const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

  const [toggleTodo] = useMutation<ToggleTodo, ToggleTodoVariables>(
    TOGGLE_TODO
  );

  const [deleteTodo] = useMutation<DeleteTodo, DeleteTodoVariables>(
    DELETE_TODO,
    {
      refetchQueries: [{ query: GET_TODOS }],
    }
  );

  // ═══════════════════════════════════════════════════════════
  // 2. Recoil: 클라이언트 상태 관리
  // ═══════════════════════════════════════════════════════════

  /**
   * useRecoilState: atom 읽기 + 쓰기 (useState와 동일)
   */
  const [filter, setFilter] = useRecoilState(todoFilterState);
  const [searchKeyword, setSearchKeyword] = useRecoilState(searchKeywordState);

  /**
   * useRecoilValue: atom/selector 읽기만 (값만 필요할 때)
   */
  const filterStats = useRecoilValue(filterStatsState);

  /**
   * useSetRecoilState: atom 쓰기만 (setter만 필요할 때)
   */
  const setSelectedTodoId = useSetRecoilState(selectedTodoIdState);

  // ═══════════════════════════════════════════════════════════
  // 3. 비즈니스 로직
  // ═══════════════════════════════════════════════════════════

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo({ variables: { id } });
    } catch (error) {
      console.error('TODO 토글 실패:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo({ variables: { id } });
    } catch (error) {
      console.error('TODO 삭제 실패:', error);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedTodoId(id);
    console.log('선택된 Todo ID:', id);
  };

  // ═══════════════════════════════════════════════════════════
  // 4. 데이터 필터링 (Recoil 상태 기반)
  // ═══════════════════════════════════════════════════════════

  const filteredTodos = data?.todos.filter((todo) => {
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

  // ═══════════════════════════════════════════════════════════
  // 5. UI 렌더링
  // ═══════════════════════════════════════════════════════════

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📝 할일 목록 (Recoil + GraphQL)</h2>

      {/* 필터 컨트롤 */}
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <strong>🔍 검색:</strong>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="할일 검색..."
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '200px',
            }}
          />
        </div>

        <div>
          <strong>📊 필터:</strong>
          <button
            onClick={() => setFilter('all')}
            style={{
              marginLeft: '10px',
              padding: '5px 15px',
              backgroundColor: filter === 'all' ? '#007bff' : '#e0e0e0',
              color: filter === 'all' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('active')}
            style={{
              marginLeft: '5px',
              padding: '5px 15px',
              backgroundColor: filter === 'active' ? '#28a745' : '#e0e0e0',
              color: filter === 'active' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            진행중
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              marginLeft: '5px',
              padding: '5px 15px',
              backgroundColor: filter === 'completed' ? '#6c757d' : '#e0e0e0',
              color: filter === 'completed' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            완료
          </button>
        </div>

        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          현재 보기: <strong>{filterStats.displayText}</strong> (
          {filteredTodos?.length || 0}개)
        </div>
      </div>

      {/* Todo 목록 */}
      {filteredTodos?.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>
          {searchKeyword
            ? '검색 결과가 없습니다.'
            : '할일이 없습니다.'}
        </p>
      ) : (
        filteredTodos?.map((todo) => (
          <div
            key={todo.id}
            onClick={() => handleSelect(todo.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #ddd',
              marginBottom: '10px',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: 'white',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#f9f9f9')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'white')
            }
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => {
                e.stopPropagation();
                handleToggle(todo.id);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(todo.id);
              }}
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
        ))
      )}

      {/* Recoil 상태 디버깅 */}
      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
        }}
      >
        <h3>🔧 Recoil 상태 (디버깅용)</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(
            {
              filter,
              searchKeyword,
              filterStats,
              totalTodos: data?.todos.length,
              filteredCount: filteredTodos?.length,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
