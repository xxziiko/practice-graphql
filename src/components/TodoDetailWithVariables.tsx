import { useQuery } from '@apollo/client';
import { GET_TODO } from '../graphql/queries';
import type {
  Query,
  GetTodoVariables,
} from '../graphql/__generated__/graphqlType';

/**
 * 실무 패턴: Variables가 있는 Query 사용 예제
 *
 * useQuery<TData, TVariables> 제네릭 설명:
 * - TData: 응답 데이터의 타입 (Pick<Query, 'fieldName'>)
 * - TVariables: 요청 변수의 타입 (GetTodoVariables)
 */
export default function TodoDetailWithVariables({ todoId }: { todoId: string }) {
  // 실무 패턴: 두 개의 제네릭 타입 모두 명시
  const { loading, error, data } = useQuery<
    Pick<Query, 'todo'>,     // 👈 첫 번째: Response 타입
    GetTodoVariables         // 👈 두 번째: Variables 타입
  >(GET_TODO, {
    variables: {
      id: todoId,            // ✅ 타입 체크됨
    },
  });

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;
  if (!data?.todo) return <p>할일을 찾을 수 없습니다.</p>;

  const { todo } = data;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>📝 할일 상세</h2>
      <div
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <strong>ID:</strong> {todo.id}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>제목:</strong> {todo.title}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>완료 여부:</strong>{' '}
          {todo.completed ? '✅ 완료' : '⬜ 미완료'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>생성일:</strong> {todo.createdAt}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>수정일:</strong> {todo.updatedAt}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h3>💡 실무 패턴 설명</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
{`useQuery<
  Pick<Query, 'todo'>,  // Response 타입
  GetTodoVariables      // Variables 타입
>(GET_TODO, {
  variables: { id }     // 타입 체크됨
})`}
        </pre>
        <ul style={{ fontSize: '14px', marginTop: '10px' }}>
          <li><strong>첫 번째 제네릭:</strong> 응답 데이터 타입 (Pick으로 필드 선택)</li>
          <li><strong>두 번째 제네릭:</strong> 요청 변수 타입 (Codegen 자동 생성)</li>
          <li><strong>variables:</strong> 타입 안전하게 변수 전달</li>
        </ul>
      </div>
    </div>
  );
}
