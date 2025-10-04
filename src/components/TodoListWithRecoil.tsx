import { useTodoList } from '../hooks/useTodoList';

/**
 * Recoil + GraphQL 통합 컴포넌트
 *
 * 실무 패턴:
 * - 커스텀 훅으로 비즈니스 로직 분리
 * - 컴포넌트는 UI 렌더링에만 집중
 * - GraphQL: 서버 데이터 관리 (todos 목록)
 * - Recoil: 클라이언트 상태 관리 (필터, 검색어, 선택 등)
 */
export default function TodoListWithRecoil() {
  const {
    // 데이터
    loading,
    error,
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
  } = useTodoList();

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
            onChange={e => setSearchKeyword(e.target.value)}
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
          현재 보기: <strong>{filterStats.displayText}</strong> ({filteredCount}
          개)
        </div>
      </div>

      {/* Todo 목록 */}
      {filteredTodos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>
          {searchKeyword ? '검색 결과가 없습니다.' : '할일이 없습니다.'}
        </p>
      ) : (
        filteredTodos.map(todo => {
          const isSelected = selectedTodoId === todo.id;

          return (
            <div
              key={todo.id}
              onClick={() => handleSelect(todo.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                border: isSelected ? '2px solid #007bff' : '1px solid #ddd',
                marginBottom: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#e3f2fd' : 'white',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 2px 8px rgba(0, 123, 255, 0.2)'
                  : 'none',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f9f9f9';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={e => {
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
                onClick={e => {
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
          );
        })
      )}

      {/* 선택된 Todo 정보 표시 */}
      {selectedTodoId && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #007bff',
            borderRadius: '8px',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
            🎯 선택된 Todo
          </h4>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>ID:</strong> {selectedTodoId}
          </p>
          {(() => {
            const selectedTodo = filteredTodos.find(
              todo => todo.id === selectedTodoId
            );
            return selectedTodo ? (
              <>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                  <strong>제목:</strong> {selectedTodo.title}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                  <strong>완료 상태:</strong>{' '}
                  {selectedTodo.completed ? '✅ 완료' : '⏳ 진행 중'}
                </p>
              </>
            ) : (
              <p
                style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}
              >
                선택된 todo가 필터링에서 제외되었습니다.
              </p>
            );
          })()}
        </div>
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
              totalTodos: totalCount,
              filteredCount: filteredCount,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
