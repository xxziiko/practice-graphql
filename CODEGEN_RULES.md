# GraphQL Codegen 타입 생성 규칙

> GraphQL Code Generator가 어떤 규칙으로 TypeScript 타입을 생성하는지 상세 가이드

## 📋 목차

1. [전체 흐름](#전체-흐름)
2. [스키마 → 기본 타입 생성](#1️⃣-스키마--기본-타입-생성)
3. [Query/Mutation → Root 타입 생성](#2️⃣-querymutation--root-타입-생성)
4. [Mutation Arguments → Args 타입 생성](#3️⃣-mutation-arguments--args-타입-생성)
5. [Operation → 개별 타입 생성](#4️⃣-operation--개별-타입-생성-핵심)
6. [주요 설정별 영향](#-주요-설정별-영향)
7. [실무 팁](#-실무-팁)

---

## 전체 흐름

```
┌─────────────────┐
│  schema.graphql │ ──┐
└─────────────────┘   │
                      ├──> GraphQL Codegen
┌─────────────────┐   │
│  queries.ts     │ ──┤
│  mutations.ts   │ ──┘
└─────────────────┘

         ↓

┌─────────────────────────────────────┐
│  __generated__/graphqlType.ts       │
├─────────────────────────────────────┤
│ 1. Utility Types (Maybe, Exact...)  │
│ 2. Scalars 매핑                     │
│ 3. Schema 타입 (Todo, Query...)     │
│ 4. Arguments 타입 (MutationArgs)    │
│ 5. Operation 타입 (GetTodos...)     │
│ 6. Variables 타입 (GetTodosVars)    │
└─────────────────────────────────────┘
```

---

## 1️⃣ 스키마 → 기본 타입 생성

### Input: GraphQL Schema

```graphql
type Todo {
  id: ID!
  title: String!
  completed: Boolean!
  createdAt: String!
  updatedAt: String!
}
```

### Output: TypeScript 타입

```typescript
export type Todo = {
  __typename?: 'Todo';      // skipTypeNameForRoot: false면 생성
  completed: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};
```

### 생성 규칙

| 항목 | 규칙 |
|------|------|
| **타입명** | GraphQL 타입명 그대로 사용 (`namingConvention: 'keep'`) |
| **필드 순서** | 알파벳 순서로 자동 정렬 |
| **Scalar 매핑** | `Scalars[타입]['output']` 형태 |
| **`__typename`** | `skipTypeNameForRoot: false`면 포함 |

---

## 2️⃣ Query/Mutation → Root 타입 생성

### Input: GraphQL Schema

```graphql
type Query {
  todos: [Todo!]!
  user(id: ID!): User
}

type Mutation {
  addTodo(title: String!): Todo!
  toggleTodo(id: ID!): Todo!
  deleteTodo(id: ID!): ID!
}
```

### Output: TypeScript 타입

```typescript
export type Query = {
  __typename?: 'Query';
  todos: Array<Todo>;      // [Todo!]! → Array<Todo>
  user: User | null;       // User → User | null
};

export type Mutation = {
  __typename?: 'Mutation';
  addTodo: Todo;           // Todo! → Todo
  toggleTodo: Todo;
  deleteTodo: Scalars['ID']['output'];
};
```

### 변환 규칙

| GraphQL | TypeScript |
|---------|------------|
| `[Todo!]!` | `Array<Todo>` |
| `Todo!` | `Todo` |
| `Todo` | `Todo \| null` (nullable) |
| `ID!` | `Scalars['ID']['output']` |

**중요**: Non-null (`!`)은 제거됨 (`avoidOptionals: { field: true }` 설정 때문)

---

## 3️⃣ Mutation Arguments → Args 타입 생성

### Input: GraphQL Schema

```graphql
type Mutation {
  addTodo(title: String!): Todo!
  updateTodo(id: ID!, input: UpdateTodoInput!): Todo!
}
```

### Output: TypeScript 타입

```typescript
export type MutationaddTodoArgs = {
  title: Scalars['String']['input'];  // input 방향
};

export type MutationupdateTodoArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTodoInput;
};
```

### 네이밍 규칙

```
Mutation + [필드명] + Args
```

**예시:**
- `addTodo` → `MutationaddTodoArgs`
- `updateTodo` → `MutationupdateTodoArgs`
- `deleteTodo` → `MutationdeleteTodoArgs`

**주의**: `namingConvention: 'keep'`이므로 camelCase 유지

---

## 4️⃣ Operation → 개별 타입 생성 (핵심!)

### Input: Query 정의

```typescript
// src/graphql/queries.ts
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

### Output: Variables 타입

```typescript
export type GetTodosVariables = Exact<{ [key: string]: never }>;
```

**규칙:**
- 변수가 없으면 `{ [key: string]: never }` (빈 객체)
- 변수가 있으면 해당 변수 타입 생성

### Output: Response 타입

```typescript
export type GetTodos = {  // ✅ omitOperationSuffix: true
  todos: Array<{
    __typename?: 'Todo';
    id: string;            // Scalars['ID'] → string 변환
    title: string;
    completed: boolean;
  }>;
};
```

### 네이밍 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| **Response 타입** | Operation 이름 그대로 | `GetTodos` |
| **Variables 타입** | Operation 이름 + `Variables` | `GetTodosVariables` |

**중요**: `omitOperationSuffix: true`이므로 `Query`/`Mutation` 접미사 제거

---

## 5️⃣ Mutation Operation 타입 생성

### Input: Mutation 정의

```typescript
// src/graphql/mutations.ts
export const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    addTodo(title: $title) {
      id
      title
      completed
    }
  }
`;
```

### Output: Variables 타입

```typescript
export type AddTodoVariables = Exact<{
  title: Scalars['String']['input'];  // ✅ input 방향
}>;
```

**규칙:**
- 변수가 있으면 `Exact<{...}>` 래퍼로 감쌈
- Input은 `Scalars[타입]['input']` 사용

### Output: Response 타입

```typescript
export type AddTodo = {  // ✅ omitOperationSuffix: true
  addTodo: {
    __typename?: 'Todo';
    id: string;
    title: string;
    completed: boolean;
  };
};
```

**중요**: 요청한 필드만 타입에 포함됨!

```typescript
// createdAt, updatedAt는 요청 안 했으므로 타입에 없음 ❌
```

---

## 🔍 주요 설정별 영향

### 1. `omitOperationSuffix`

Operation 이름에서 `Query`/`Mutation` 접미사를 제거할지 결정

```typescript
// omitOperationSuffix: false (기본값)
export type GetTodosQuery = { ... }
export type AddTodoMutation = { ... }

// omitOperationSuffix: true ✅ (실무 설정)
export type GetTodos = { ... }
export type AddTodo = { ... }
```

**실무 권장**: `true` (간결한 타입명)

---

### 2. `namingConvention`

타입명 변환 규칙 설정

```typescript
// namingConvention: 'change-case-all' (기본값)
export type GetTodosQuery = { ... }

// namingConvention: 'keep' ✅ (실무 설정)
export type GetTodos = { ... }  // Operation 이름 그대로
export type Todo = { ... }      // 스키마 이름 그대로
```

**실무 권장**: `'keep'` (스키마와 일관성 유지)

---

### 3. `avoidOptionals`

Optional (`?`) vs Nullable (`| null`) 선택

```typescript
// avoidOptionals: { field: false } (기본값)
export type Todo = {
  id?: string;        // optional
  title?: string;
}

// avoidOptionals: { field: true } ✅ (실무 설정)
export type Todo = {
  id: string;         // required (nullable 아님)
  title: string;
}
```

**실무 권장**: `{ field: true }` (명확한 타입)

---

### 4. `preResolveTypes`

중복 타입 최적화 여부

```typescript
// preResolveTypes: false (기본값)
export type GetTodos = {
  todos: Array<{
    id: string;
    title: string;
  }>;
};

export type AddTodo = {
  addTodo: {
    id: string;      // 중복 정의
    title: string;
  };
};

// preResolveTypes: true ✅ (실무 설정)
export type TodoFragment = {
  id: string;
  title: string;
};

export type GetTodos = {
  todos: Array<TodoFragment>;  // ✅ 타입 재사용
};

export type AddTodo = {
  addTodo: TodoFragment;       // ✅ 타입 재사용
};
```

**실무 권장**: `true` (타입 중복 제거, 번들 크기 감소)

---

### 5. `skipTypeNameForRoot`

Root 타입(`Query`, `Mutation`)에서 `__typename` 제거

```typescript
// skipTypeNameForRoot: false (기본값)
export type Query = {
  __typename?: 'Query';  // 포함
  todos: Array<Todo>;
};

// skipTypeNameForRoot: true ✅ (실무 설정)
export type Query = {
  // __typename 제거
  todos: Array<Todo>;
};
```

**실무 권장**: `true` (불필요한 필드 제거)

---

### 6. `scalars`

커스텀 Scalar 타입 매핑

```typescript
// scalars 설정 없음 (기본값)
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  DateTime: { input: any; output: any };  // ❌ any
  Long: { input: any; output: any };      // ❌ any
};

// scalars 설정 ✅ (실무 설정)
scalars: {
  DateTime: 'string',
  Long: 'number'
}

export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  DateTime: { input: string; output: string };  // ✅ string
  Long: { input: number; output: number };      // ✅ number
};
```

**실무 권장**: 프로젝트에 맞는 Scalar 매핑 정의

---

## ✨ 실무 팁

### 1. Operation 이름이 타입 이름이 됨

```typescript
// ✅ 좋은 예시
query GetUserProfile { ... }  → export type GetUserProfile = { ... }
mutation UpdateUser { ... }   → export type UpdateUser = { ... }

// ❌ 나쁜 예시
query getUserProfile { ... }  → export type getUserProfile = { ... }
mutation update_user { ... }  → export type update_user = { ... }
```

**규칙**: **PascalCase**로 Operation 이름 작성

---

### 2. 요청한 필드만 타입에 포함

```graphql
type Todo {
  id: ID!
  title: String!
  completed: Boolean!
  createdAt: String!
  updatedAt: String!
}

query GetTodos {
  todos {
    id         # ✅ 타입에 포함
    title      # ✅ 타입에 포함
    # completed는 요청 안 함 ❌ 타입에 없음
    # createdAt는 요청 안 함 ❌ 타입에 없음
  }
}
```

생성된 타입:
```typescript
export type GetTodos = {
  todos: Array<{
    id: string;      // ✅
    title: string;   // ✅
    // completed, createdAt, updatedAt 없음 ❌
  }>;
};
```

**중요**: 필요한 필드만 요청하면 타입도 최소화됨!

---

### 3. Scalar 타입 커스텀 매핑

```typescript
// codegen.ts
scalars: {
  DateTime: 'string',    // DateTime → string
  Long: 'number',        // Long → number
  JSON: 'any',           // JSON → any
  Upload: 'File'         // Upload → File
}
```

**실무에서 자주 사용하는 매핑:**
- `DateTime` → `string` (ISO 8601 문자열)
- `Long` → `number` (큰 숫자)
- `JSON` → `Record<string, any>` (JSON 객체)

---

### 4. Input/Output 방향성

```typescript
export type Scalars = {
  ID: { input: string; output: string };
  //     ↑ Variables용  ↑ Response용
};
```

**사용 예시:**
```typescript
// Variables (input)
export type AddTodoVariables = {
  title: Scalars['String']['input'];  // input 방향
};

// Response (output)
export type Todo = {
  id: Scalars['ID']['output'];        // output 방향
};
```

---

### 5. Fragment 활용

```typescript
// Fragment 정의
const TODO_FRAGMENT = gql`
  fragment TodoFields on Todo {
    id
    title
    completed
  }
`;

// Query에서 Fragment 사용
const GET_TODOS = gql`
  query GetTodos {
    todos {
      ...TodoFields
    }
  }
  ${TODO_FRAGMENT}
`;
```

생성된 타입:
```typescript
export type TodoFieldsFragment = {  // Fragment 타입 자동 생성
  id: string;
  title: string;
  completed: boolean;
};

export type GetTodos = {
  todos: Array<TodoFieldsFragment>;  // Fragment 타입 재사용
};
```

**장점**: 타입 재사용, 일관성 유지

---

## 📊 생성 순서 요약

```
1. Utility Types 생성
   ↓
2. Scalars 매핑
   ↓
3. Schema 타입 생성 (Todo, User...)
   ↓
4. Root 타입 생성 (Query, Mutation)
   ↓
5. Arguments 타입 생성 (MutationArgs)
   ↓
6. Operation Variables 타입 생성
   ↓
7. Operation Response 타입 생성
```

---

## 🎯 실무 체크리스트

생성된 타입 확인 시:

- [ ] Operation 이름이 타입명과 일치하는가?
- [ ] `omitOperationSuffix`로 접미사가 제거되었는가?
- [ ] 요청한 필드만 타입에 포함되었는가?
- [ ] Variables 타입이 올바르게 생성되었는가?
- [ ] Scalar 타입이 의도대로 매핑되었는가?
- [ ] Fragment 타입이 재사용되고 있는가?

---

**작성일**: 2025-10-05
**버전**: 1.0.0
**기준**: GraphQL Code Generator v6 + typescript-operations plugin
