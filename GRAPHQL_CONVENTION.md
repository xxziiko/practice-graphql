# GraphQL 코드 컨벤션

> 실무 환경에서 사용하는 GraphQL Code Generator 기반 타입 안전 개발 가이드

## 📋 목차

1. [Code Generator 설정](#1-code-generator-설정)
2. [파일 구조](#2-파일-구조)
3. [Query 작성 규칙](#3-query-작성-규칙)
4. [Mutation 작성 규칙](#4-mutation-작성-규칙)
5. [타입 사용 규칙](#5-타입-사용-규칙)
6. [네이밍 컨벤션](#6-네이밍-컨벤션)
7. [실전 예제](#7-실전-예제)

---

## 1. Code Generator 설정

### 필수 설정 (codegen.ts)

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://api.example.com/graphql', // API 엔드포인트
  documents: './src/**/*.ts',
  config: {
    preResolveTypes: true,        // ✅ 타입 중복 제거
    namingConvention: 'keep',     // ✅ 스키마 이름 유지
    omitOperationSuffix: true,    // ✅ Query/Mutation 접미사 제거
    avoidOptionals: {
      field: true,                // ✅ Optional → Nullable
    },
    skipTypeNameForRoot: true,    // ✅ Root __typename 제거
    scalars: {                    // ✅ 커스텀 Scalar 매핑
      Long: 'number',
      DateTime: 'string',
    },
  },
  generates: {
    './src/graphql/__generated__/graphqlType.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        {
          add: {
            content: `/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.`,
          },
        },
      ],
    },
  },
};

export default config;
```

### 주요 설정 설명

| 옵션 | 역할 | 예시 |
|------|------|------|
| `preResolveTypes` | 중복 타입 사전 해결 | 타입 재사용 최적화 |
| `namingConvention: 'keep'` | 스키마 이름 그대로 유지 | `UserProfile` → `UserProfile` |
| `omitOperationSuffix` | 접미사 제거 | `GetUserQuery` → `GetUser` |
| `avoidOptionals` | Nullable 타입 처리 | `field?` → `field \| null` |
| `skipTypeNameForRoot` | Root 타입 정리 | `__typename` 제거 |

---

## 2. 파일 구조

```
src/
├── graphql/
│   ├── __generated__/
│   │   └── graphqlType.ts          # 🤖 자동 생성 (수정 금지)
│   ├── queries.ts                  # ✍️ Query 정의
│   ├── mutations.ts                # ✍️ Mutation 정의
│   └── schema.graphql              # 📄 스키마 파일 (옵션)
└── components/
    └── UserProfile.tsx             # 🎨 컴포넌트
```

### 파일별 역할

- **`__generated__/graphqlType.ts`**: Codegen이 자동 생성한 타입 (절대 수정 금지)
- **`queries.ts`**: 모든 Query 정의
- **`mutations.ts`**: 모든 Mutation 정의
- **컴포넌트**: 생성된 타입을 import하여 사용

---

## 3. Query 작성 규칙

### ✅ 올바른 예시

```typescript
// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      completed
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;
```

### 📌 Query 네이밍 규칙

1. **상수명**: `GET_` 접두사 + 대문자 스네이크 케이스
   - ✅ `GET_TODOS`, `GET_USER_PROFILE`
   - ❌ `getTodos`, `fetchUser`

2. **Operation 이름**: PascalCase
   - ✅ `query GetTodos`, `query GetUserProfile`
   - ❌ `query get_todos`, `query getUserProfile`

---

## 4. Mutation 작성 규칙

### ✅ 올바른 예시

```typescript
// src/graphql/mutations.ts
import { gql } from '@apollo/client';

export const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    addTodo(title: $title) {
      id
      title
      completed
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
    }
  }
`;
```

### 📌 Mutation 네이밍 규칙

1. **상수명**: 동사 + 대문자 스네이크 케이스
   - ✅ `ADD_TODO`, `UPDATE_USER`, `DELETE_POST`
   - ❌ `addTodo`, `userUpdate`

2. **Operation 이름**: 동사 + PascalCase
   - ✅ `mutation AddTodo`, `mutation UpdateUser`
   - ❌ `mutation add_todo`, `mutation Update_User`

---

## 5. 타입 사용 규칙

### Query 타입 사용

**실무 패턴: `Pick<Query, 'fieldName'>`**

```typescript
import { useQuery } from '@apollo/client';
import { GET_TODOS } from '../graphql/queries';
import type { Query } from '../graphql/__generated__/graphqlType';

function TodoList() {
  // ✅ Pick 패턴 사용
  const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

  // data.todos의 타입이 자동 추론됨
  return (
    <div>
      {data?.todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}
```

**왜 Pick을 사용하나?**
- Query 전체가 아닌 **특정 필드만 선택**
- 어떤 GraphQL 필드를 사용하는지 **명확히 표현**
- 코드 **가독성 향상**

### Mutation 타입 사용

**실무 패턴: Operation 이름 그대로 (접미사 제거)**

```typescript
import { useMutation } from '@apollo/client';
import { ADD_TODO } from '../graphql/mutations';
import type {
  AddTodo,           // ✅ omitOperationSuffix로 생성됨
  AddTodoVariables
} from '../graphql/__generated__/graphqlType';

function TodoForm() {
  // ✅ 접미사 없는 타입 사용
  const [addTodo] = useMutation<AddTodo, AddTodoVariables>(ADD_TODO);

  const handleSubmit = async (title: string) => {
    await addTodo({
      variables: { title }  // 타입 안전하게 체크됨
    });
  };
}
```

### ❌ 잘못된 예시

```typescript
// ❌ Query 전체 타입 사용
const { data } = useQuery<GetTodosQuery>(GET_TODOS);

// ❌ any 타입 사용
const { data } = useQuery(GET_TODOS);

// ❌ 수동 타입 정의
const { data } = useQuery<{ todos: Todo[] }>(GET_TODOS);
```

---

## 6. 네이밍 컨벤션

### Operation 이름 작성 규칙

| 타입 | 패턴 | 예시 |
|------|------|------|
| **Query - 단일 조회** | `Get` + 리소스 | `GetUser`, `GetPost` |
| **Query - 목록 조회** | `Get` + 리소스 복수형 | `GetUsers`, `GetTodos` |
| **Query - 검색** | `Search` + 리소스 | `SearchProducts` |
| **Mutation - 생성** | `Add` / `Create` | `AddTodo`, `CreateUser` |
| **Mutation - 수정** | `Update` | `UpdateUser` |
| **Mutation - 삭제** | `Delete` / `Remove` | `DeleteTodo` |
| **Mutation - 토글** | `Toggle` | `ToggleTodo` |

### 변수명 규칙

```typescript
// ✅ 좋은 예시
const GET_USER_BY_ID = gql`
  query GetUserById($userId: ID!) {
    user(id: $userId) {
      id
      name
    }
  }
`;

// ✅ 좋은 예시 - Input 타입
const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
    }
  }
`;
```

---

## 7. 실전 예제

### 전체 워크플로우

#### 1단계: Query/Mutation 작성

```typescript
// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      completed
    }
  }
`;
```

#### 2단계: Codegen 실행

```bash
pnpm codegen
```

생성된 타입:
```typescript
// src/graphql/__generated__/graphqlType.ts (자동 생성)
export type GetTodos = {
  todos: Array<{
    id: string;
    title: string;
    completed: boolean
  }>
};
```

#### 3단계: 컴포넌트에서 사용

```typescript
// src/components/TodoList.tsx
import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS } from '../graphql/queries';
import { TOGGLE_TODO } from '../graphql/mutations';
import type {
  Query,
  ToggleTodo,
  ToggleTodoVariables
} from '../graphql/__generated__/graphqlType';

export default function TodoList() {
  // Query: Pick 패턴
  const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

  // Mutation: 접미사 제거된 타입
  const [toggleTodo] = useMutation<ToggleTodo, ToggleTodoVariables>(
    TOGGLE_TODO
  );

  const handleToggle = async (id: string) => {
    await toggleTodo({
      variables: { id } // ✅ 타입 체크됨
    });
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error.message}</p>;

  return (
    <div>
      {data?.todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo.id)}
          />
          <span>{todo.title}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 📚 추가 자료

### 주요 명령어

```bash
# Codegen 실행
pnpm codegen

# Watch 모드 (개발 시 유용)
pnpm codegen:watch

# 빌드 시 자동 실행
pnpm build
```

### 참고 링크

- [GraphQL Code Generator 공식 문서](https://the-guild.dev/graphql/codegen)
- [typescript-operations 플러그인](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-operations)
- [Apollo Client 타입 가이드](https://www.apollographql.com/docs/react/development-testing/static-typing/)

---

## ✅ 체크리스트

실무 투입 전 확인사항:

- [ ] `codegen.ts`에 필수 설정이 모두 있는가?
- [ ] Query는 `Pick<Query, 'field'>` 패턴을 사용하는가?
- [ ] Mutation은 접미사 없는 타입(`AddTodo`)을 사용하는가?
- [ ] Operation 이름이 네이밍 규칙을 따르는가?
- [ ] `__generated__` 폴더를 수정하지 않았는가?
- [ ] 타입 import 경로가 정확한가? (`__generated__/graphqlType`)

---

**작성일**: 2025-10-05
**버전**: 1.0.0
**기준**: GraphQL Code Generator v6 + Apollo Client v3
