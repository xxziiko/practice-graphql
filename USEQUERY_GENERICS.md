# useQuery 제네릭 타입 완벽 가이드

> 실무에서 사용하는 `useQuery<TData, TVariables>` 제네릭 패턴 완전 분석

## 📋 목차

1. [기본 구조](#기본-구조)
2. [실무 코드 분석](#실무-코드-분석)
3. [제네릭 각 인자의 의미](#제네릭-각-인자의-의미)
4. [패턴별 사용법](#패턴별-사용법)
5. [실전 예제](#실전-예제)

---

## 기본 구조

```typescript
useQuery<TData, TVariables>(query, options)
//       ↑       ↑
//       |       └─ 두 번째: Variables 타입 (선택)
//       └───────── 첫 번째: Response 타입 (필수)
```

### Apollo Client 공식 타입 정의

```typescript
function useQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>
): QueryResult<TData, TVariables>;
```

---

## 실무 코드 분석

### 실무에서 보는 코드

```typescript
const { loading, error, data } = useQuery<
  Pick<Query, 'recommendProducts'>,        // 👈 첫 번째 제네릭
  additionalRecommendProductsVariables     // 👈 두 번째 제네릭
>(ADDITIONAL_RECOMMEND_PRODUCTS, {
  variables: {
    kind: kind || 'LessPrice',
  },
});
```

---

## 제네릭 각 인자의 의미

### 1️⃣ 첫 번째 제네릭: `TData` (Response 타입)

**역할**: **서버에서 받을 응답 데이터의 타입**

```typescript
Pick<Query, 'recommendProducts'>
```

#### 왜 Pick을 쓰나?

```typescript
// Query 타입 전체
type Query = {
  todos: Todo[];
  user: User;
  posts: Post[];
  recommendProducts: Product[];  // 👈 이 필드만 필요
  // ... 수십 개의 다른 필드들
}

// Pick으로 필요한 필드만 선택
Pick<Query, 'recommendProducts'>
// ↓ 결과
{
  recommendProducts: Product[]
}
```

**장점:**
- ✅ Query 전체가 아닌 **특정 필드만** 선택
- ✅ 어떤 GraphQL 필드를 사용하는지 **명확히 표현**
- ✅ 코드 **가독성 향상**
- ✅ 타입 **안전성 보장**

#### data 객체 타입 추론

```typescript
const { data } = useQuery<Pick<Query, 'recommendProducts'>>(...);

// data의 타입이 자동으로 추론됨
data.recommendProducts  // ✅ Product[] 타입
data.otherField         // ❌ 타입 에러!
```

---

### 2️⃣ 두 번째 제네릭: `TVariables` (Variables 타입)

**역할**: **요청 시 전달할 변수의 타입**

```typescript
additionalRecommendProductsVariables
```

#### Codegen이 자동 생성한 타입

```typescript
// __generated__/graphqlType.ts
export type additionalRecommendProductsVariables = Exact<{
  kind: Scalars['String']['input'];
}>;

// 실제 타입
type additionalRecommendProductsVariables = {
  kind: string;
}
```

#### variables 객체 타입 체크

```typescript
useQuery<TData, additionalRecommendProductsVariables>(QUERY, {
  variables: {
    kind: 'LessPrice',     // ✅ 타입 체크 통과
    // wrongField: 'test'  // ❌ 타입 에러 발생!
  }
});
```

**장점:**
- ✅ 변수 오타 방지
- ✅ 필수 변수 누락 방지
- ✅ IDE 자동완성 지원
- ✅ 리팩토링 안전성

---

## 패턴별 사용법

### 패턴 1: Variables가 없는 경우

#### GraphQL Query

```graphql
query GetTodos {
  todos {
    id
    title
    completed
  }
}
```

#### TypeScript 사용

```typescript
const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);
//                                                              ↑
//                                        Variables 타입 생략 가능
```

**생성된 Variables 타입:**

```typescript
export type GetTodosVariables = Exact<{ [key: string]: never }>;
// 빈 객체 타입
```

---

### 패턴 2: Variables가 있는 경우 (실무 표준)

#### GraphQL Query

```graphql
query GetTodo($id: ID!) {
  todo(id: $id) {
    id
    title
    completed
  }
}
```

#### TypeScript 사용

```typescript
const { loading, error, data } = useQuery<
  Pick<Query, 'todo'>,     // 👈 Response 타입
  GetTodoVariables         // 👈 Variables 타입
>(GET_TODO, {
  variables: {
    id: todoId             // ✅ 타입 체크됨
  }
});
```

**생성된 Variables 타입:**

```typescript
export type GetTodoVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

// 실제 타입
type GetTodoVariables = {
  id: string;
}
```

---

### 패턴 3: 여러 Variables가 있는 경우

#### GraphQL Query

```graphql
query SearchProducts(
  $keyword: String!
  $category: String
  $minPrice: Int
  $maxPrice: Int
) {
  searchProducts(
    keyword: $keyword
    category: $category
    minPrice: $minPrice
    maxPrice: $maxPrice
  ) {
    id
    name
    price
  }
}
```

#### TypeScript 사용

```typescript
const { loading, error, data } = useQuery<
  Pick<Query, 'searchProducts'>,
  SearchProductsVariables
>(SEARCH_PRODUCTS, {
  variables: {
    keyword: searchTerm,        // ✅ 필수 (String!)
    category: selectedCategory, // ✅ 선택 (String)
    minPrice: 10000,            // ✅ 선택 (Int)
    maxPrice: 50000,            // ✅ 선택 (Int)
  }
});
```

**생성된 Variables 타입:**

```typescript
export type SearchProductsVariables = Exact<{
  keyword: Scalars['String']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  minPrice?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
}>;
```

---

## 실전 예제

### 예제 1: 변수 없는 Query

```typescript
// src/components/TodoList.tsx
import { useQuery } from '@apollo/client';
import { GET_TODOS } from '../graphql/queries';
import type { Query } from '../graphql/__generated__/graphqlType';

export default function TodoList() {
  const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error.message}</p>;

  return (
    <ul>
      {data?.todos.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

---

### 예제 2: 변수 있는 Query (실무 패턴)

```typescript
// src/components/TodoDetail.tsx
import { useQuery } from '@apollo/client';
import { GET_TODO } from '../graphql/queries';
import type {
  Query,
  GetTodoVariables
} from '../graphql/__generated__/graphqlType';

export default function TodoDetail({ todoId }: { todoId: string }) {
  // 실무 패턴: 두 제네릭 모두 명시
  const { loading, error, data } = useQuery<
    Pick<Query, 'todo'>,     // Response 타입
    GetTodoVariables         // Variables 타입
  >(GET_TODO, {
    variables: {
      id: todoId,            // ✅ 타입 체크됨
    },
  });

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error.message}</p>;
  if (!data?.todo) return <p>할일을 찾을 수 없습니다.</p>;

  return (
    <div>
      <h2>{data.todo.title}</h2>
      <p>완료 여부: {data.todo.completed ? '✅' : '⬜'}</p>
    </div>
  );
}
```

---

### 예제 3: 동적 Variables

```typescript
// src/components/ProductSearch.tsx
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_PRODUCTS } from '../graphql/queries';
import type {
  Query,
  SearchProductsVariables
} from '../graphql/__generated__/graphqlType';

export default function ProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string | undefined>();

  const { loading, error, data } = useQuery<
    Pick<Query, 'searchProducts'>,
    SearchProductsVariables
  >(SEARCH_PRODUCTS, {
    variables: {
      keyword,              // ✅ 필수 변수
      category,             // ✅ 선택 변수
    },
    skip: !keyword,         // keyword 없으면 요청 안 함
  });

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="검색어 입력"
      />
      <select onChange={(e) => setCategory(e.target.value || undefined)}>
        <option value="">전체</option>
        <option value="electronics">전자제품</option>
        <option value="clothing">의류</option>
      </select>

      {loading && <p>검색 중...</p>}
      {error && <p>에러: {error.message}</p>}
      {data?.searchProducts.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## 비교표

### 현재 프로젝트 vs 실무 코드

| 항목 | 현재 프로젝트 | 실무 코드 |
|------|--------------|----------|
| **Query** | `GET_TODOS` (변수 없음) | `ADDITIONAL_RECOMMEND_PRODUCTS` (변수 있음) |
| **제네릭 개수** | 1개 | 2개 |
| **Response 타입** | `Pick<Query, 'todos'>` | `Pick<Query, 'recommendProducts'>` |
| **Variables 타입** | ❌ 없음 | ✅ `additionalRecommendProductsVariables` |
| **variables 옵션** | ❌ 없음 | ✅ `{ kind: 'LessPrice' }` |

### 코드 비교

```typescript
// 현재 프로젝트 (변수 없음)
const { data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

// 실무 코드 (변수 있음)
const { data } = useQuery<
  Pick<Query, 'recommendProducts'>,
  additionalRecommendProductsVariables
>(ADDITIONAL_RECOMMEND_PRODUCTS, {
  variables: { kind: 'LessPrice' }
});
```

---

## 타입 안전성 비교

### ❌ 타입 없이 사용 (비추천)

```typescript
const { data } = useQuery(GET_TODO, {
  variables: {
    id: '123',
    wrongField: 'test',  // ❌ 에러 감지 안 됨
  }
});

data.todo.wrongField;    // ❌ 에러 감지 안 됨
```

### ✅ 타입과 함께 사용 (실무 표준)

```typescript
const { data } = useQuery<
  Pick<Query, 'todo'>,
  GetTodoVariables
>(GET_TODO, {
  variables: {
    id: '123',
    // wrongField: 'test',  // ✅ 타입 에러 발생!
  }
});

// data.todo.wrongField;    // ✅ 타입 에러 발생!
data.todo.title;            // ✅ 정상 동작
```

---

## 실무 팁

### 1. 항상 두 제네릭 모두 명시하기

```typescript
// ❌ 좋지 않음
const { data } = useQuery(GET_USER, { variables: { id: '123' } });

// ✅ 좋음
const { data } = useQuery<Pick<Query, 'user'>, GetUserVariables>(
  GET_USER,
  { variables: { id: '123' } }
);
```

### 2. Pick 패턴 일관성 유지

```typescript
// ❌ 나쁜 예
const { data } = useQuery<GetUserQuery>(GET_USER);

// ✅ 좋은 예
const { data } = useQuery<Pick<Query, 'user'>>(GET_USER);
```

### 3. Variables가 선택적일 때

```typescript
// Variables가 모두 optional인 경우
const { data } = useQuery<
  Pick<Query, 'products'>,
  GetProductsVariables
>(GET_PRODUCTS, {
  variables: {
    category: selectedCategory,  // undefined 가능
  },
});
```

### 4. skip 옵션 활용

```typescript
const { data } = useQuery<Pick<Query, 'user'>, GetUserVariables>(
  GET_USER,
  {
    variables: { id: userId },
    skip: !userId,  // userId가 없으면 요청 안 함
  }
);
```

---

## 정리

### useQuery 제네릭 구조

```typescript
useQuery<TData, TVariables>(query, options)
```

| 제네릭 | 의미 | 예시 | 필수 여부 |
|--------|------|------|----------|
| **TData** | Response 타입 | `Pick<Query, 'todos'>` | 필수 (권장) |
| **TVariables** | Variables 타입 | `GetTodosVariables` | 선택 (변수 있으면 필수) |

### 실무 권장 패턴

```typescript
// 변수 없는 경우
useQuery<Pick<Query, 'fieldName'>>(QUERY)

// 변수 있는 경우
useQuery<Pick<Query, 'fieldName'>, FieldNameVariables>(
  QUERY,
  { variables: { ... } }
)
```

---

**작성일**: 2025-10-05
**버전**: 1.0.0
**기준**: Apollo Client v3 + GraphQL Code Generator v6
