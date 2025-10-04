# Recoil 상태 관리 컨벤션

> 실무에서 사용하는 Recoil + GraphQL 통합 패턴 완벽 가이드

## 📋 목차

1. [Recoil 기초 개념](#1-recoil-기초-개념)
2. [파일 구조](#2-파일-구조)
3. [Atom 작성 규칙](#3-atom-작성-규칙)
4. [Selector 작성 규칙](#4-selector-작성-규칙)
5. [Hooks 사용 규칙](#5-hooks-사용-규칙)
6. [GraphQL과 Recoil 통합](#6-graphql과-recoil-통합)
7. [네이밍 컨벤션](#7-네이밍-컨벤션)
8. [실전 예제](#8-실전-예제)

---

## 1. Recoil 기초 개념

### Recoil이란?

- React를 위한 **상태 관리 라이브러리**
- Facebook(Meta)에서 개발
- React의 Hook 패턴과 유사한 API
- **Atom** + **Selector** 구조

### 핵심 개념

```
┌─────────────┐
│   Atom      │  ← 기본 상태 단위 (읽기/쓰기 가능)
└─────────────┘
       ↓
┌─────────────┐
│  Selector   │  ← 파생 상태 (계산된 값, 읽기 전용)
└─────────────┘
       ↓
┌─────────────┐
│ Component   │  ← atom/selector 구독
└─────────────┘
```

### Atom vs Selector

| 항목     | Atom            | Selector                |
| -------- | --------------- | ----------------------- |
| **역할** | 기본 상태 저장  | 계산된 값 (파생 상태)   |
| **읽기** | ✅ 가능         | ✅ 가능                 |
| **쓰기** | ✅ 가능         | ❌ 불가능 (읽기 전용)   |
| **예시** | `filter: 'all'` | `filteredTodos: Todo[]` |

---

## 2. 파일 구조

```
src/
├── recoil/
│   ├── atoms/
│   │   ├── todoAtoms.ts        # Todo 관련 atom
│   │   ├── userAtoms.ts        # User 관련 atom
│   │   └── index.ts            # export 모음
│   ├── selectors/
│   │   ├── todoSelectors.ts    # Todo 관련 selector
│   │   ├── userSelectors.ts    # User 관련 selector
│   │   └── index.ts            # export 모음
│   └── hooks/                  # 커스텀 Recoil hooks (선택)
│       └── useTodoFilter.ts
└── components/
    └── TodoList.tsx
```

### 파일 분리 기준

- **atoms/**: 도메인별로 분리 (todo, user, product 등)
- **selectors/**: atoms와 동일한 도메인으로 분리
- **hooks/**: 복잡한 로직을 감싼 커스텀 hook (선택 사항)

---

## 3. Atom 작성 규칙

### 기본 구조

```typescript
import { atom } from 'recoil';

export const [atomName] = atom<[Type]>({
  key: '[uniqueKey]', // 전역적으로 유니크한 문자열
  default: [초기값], // 기본값
});
```

### ✅ 올바른 예시

```typescript
// src/recoil/atoms/todoAtoms.ts
import { atom } from 'recoil';

/**
 * Todo 필터 상태
 */
export const todoFilterState = atom<'all' | 'active' | 'completed'>({
  key: 'todoFilterState', // ✅ atom 이름과 동일
  default: 'all',
});

/**
 * 검색어 상태
 */
export const searchKeywordState = atom<string>({
  key: 'searchKeywordState',
  default: '',
});

/**
 * 선택된 Todo ID
 */
export const selectedTodoIdState = atom<string | null>({
  key: 'selectedTodoIdState',
  default: null, // ✅ nullable 타입
});
```

### 네이밍 규칙

| 패턴                   | 예시                             |
| ---------------------- | -------------------------------- |
| **상태 + State**       | `filterState`, `todoFilterState` |
| **is + 상태 + State**  | `isLoadingState`, `isOpenState`  |
| **has + 상태 + State** | `hasErrorState`                  |

### 타입 정의

```typescript
// ✅ Union 타입
atom<'all' | 'active' | 'completed'>({ ... })

// ✅ Object 타입
atom<{ id: string; name: string }>({ ... })

// ✅ Array 타입
atom<string[]>({ ... })

// ✅ Nullable
atom<string | null>({ ... })

// ✅ Generic 타입 (GraphQL 타입 재사용)
import type { Todo } from '../graphql/__generated__/graphqlType';
atom<Todo[]>({ ... })
```

---

## 4. Selector 작성 규칙

### 기본 구조

```typescript
import { selector } from 'recoil';

export const [selectorName] = selector<[ReturnType]>({
  key: '[uniqueKey]',
  get: ({ get }) => {
    const value = get(someAtom); // atom 읽기
    return computedValue; // 계산된 값 반환
  },
});
```

### ✅ 올바른 예시

```typescript
// src/recoil/selectors/todoSelectors.ts
import { selector } from 'recoil';
import { todoFilterState, searchKeywordState } from '../atoms/todoAtoms';

/**
 * 필터 텍스트 (파생 상태)
 */
export const filterTextState = selector<string>({
  key: 'filterTextState',
  get: ({ get }) => {
    const filter = get(todoFilterState); // ✅ atom 읽기

    switch (filter) {
      case 'all':
        return '전체 할일';
      case 'active':
        return '진행 중인 할일';
      case 'completed':
        return '완료된 할일';
      default:
        return '전체 할일';
    }
  },
});

/**
 * 검색 활성화 여부
 */
export const isSearchActiveState = selector<boolean>({
  key: 'isSearchActiveState',
  get: ({ get }) => {
    const keyword = get(searchKeywordState);
    return keyword.trim().length > 0;
  },
});

/**
 * 여러 atom 조합 예시
 */
export const filterStatsState = selector({
  key: 'filterStatsState',
  get: ({ get }) => {
    const filter = get(todoFilterState);
    const keyword = get(searchKeywordState);
    const isSearching = get(isSearchActiveState); // ✅ selector도 읽기 가능

    return {
      currentFilter: filter,
      searchKeyword: keyword,
      isSearching,
      displayText: isSearching ? `"${keyword}" 검색 결과` : `${filter} 할일`,
    };
  },
});
```

### Selector 특징

1. **Pure Function**: 부수 효과 없어야 함
2. **자동 캐싱**: 의존하는 atom이 변경될 때만 재계산
3. **체이닝 가능**: selector가 다른 selector를 읽을 수 있음

---

## 5. Hooks 사용 규칙

### Recoil Hooks 종류

| Hook                  | 역할        | 반환값              | 사용 시점          |
| --------------------- | ----------- | ------------------- | ------------------ |
| `useRecoilState`      | 읽기 + 쓰기 | `[value, setValue]` | useState처럼 사용  |
| `useRecoilValue`      | 읽기만      | `value`             | 값만 필요할 때     |
| `useSetRecoilState`   | 쓰기만      | `setValue`          | setter만 필요할 때 |
| `useResetRecoilState` | 초기화      | `reset`             | 기본값으로 리셋    |

### ✅ 올바른 사용 예시

```typescript
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,
} from 'recoil';
import { todoFilterState, searchKeywordState } from '../recoil/atoms/todoAtoms';
import { filterStatsState } from '../recoil/selectors/todoSelectors';

function TodoList() {
  // ══════════════════════════════════════════════════════
  // 1. useRecoilState (읽기 + 쓰기)
  // ══════════════════════════════════════════════════════
  const [filter, setFilter] = useRecoilState(todoFilterState);
  // useState와 동일한 사용법
  // ✅ 값도 사용하고, 변경도 해야 할 때

  // ══════════════════════════════════════════════════════
  // 2. useRecoilValue (읽기만)
  // ══════════════════════════════════════════════════════
  const filterStats = useRecoilValue(filterStatsState);
  // ✅ 값만 읽고, 변경은 안 할 때
  // ✅ selector는 보통 읽기 전용이므로 이 hook 사용

  // ══════════════════════════════════════════════════════
  // 3. useSetRecoilState (쓰기만)
  // ══════════════════════════════════════════════════════
  const setSearchKeyword = useSetRecoilState(searchKeywordState);
  // ✅ setter만 필요할 때 (값은 사용 안 함)
  // ✅ 불필요한 리렌더링 방지

  // ══════════════════════════════════════════════════════
  // 4. useResetRecoilState (초기화)
  // ══════════════════════════════════════════════════════
  const resetFilter = useResetRecoilState(todoFilterState);
  // ✅ 기본값으로 리셋할 때

  return (
    <div>
      <button onClick={() => setFilter('all')}>전체</button>
      <button onClick={() => resetFilter()}>필터 초기화</button>
      <p>{filterStats.displayText}</p>
    </div>
  );
}
```

### Hook 선택 기준

```typescript
// ❌ 나쁜 예: 값만 필요한데 useRecoilState 사용
const [filter, setFilter] = useRecoilState(todoFilterState);
// setter를 안 쓰는데도 가져옴 (불필요)

// ✅ 좋은 예: 값만 필요하면 useRecoilValue
const filter = useRecoilValue(todoFilterState);

// ❌ 나쁜 예: setter만 필요한데 useRecoilState 사용
const [keyword, setKeyword] = useRecoilState(searchKeywordState);
// keyword 안 쓰는데 가져옴 → 불필요한 리렌더링

// ✅ 좋은 예: setter만 필요하면 useSetRecoilState
const setKeyword = useSetRecoilState(searchKeywordState);
```

---

## 6. GraphQL과 Recoil 통합

### 역할 분리 (중요!)

| 라이브러리  | 역할                 | 예시                  |
| ----------- | -------------------- | --------------------- |
| **GraphQL** | 서버 데이터 관리     | todos 목록, user 정보 |
| **Recoil**  | 클라이언트 상태 관리 | 필터, 검색어, UI 상태 |

### 실무 패턴

```typescript
function TodoList() {
  // ═══════════════════════════════════════════════════════
  // GraphQL: 서버 데이터
  // ═══════════════════════════════════════════════════════
  const { loading, error, data } = useQuery<Pick<Query, 'todos'>>(GET_TODOS);

  const [toggleTodo] = useMutation<ToggleTodo, ToggleTodoVariables>(
    TOGGLE_TODO
  );

  // ═══════════════════════════════════════════════════════
  // Recoil: 클라이언트 상태
  // ═══════════════════════════════════════════════════════
  const [filter, setFilter] = useRecoilState(todoFilterState);
  const [searchKeyword, setSearchKeyword] = useRecoilState(searchKeywordState);
  const filterStats = useRecoilValue(filterStatsState);

  // ═══════════════════════════════════════════════════════
  // 데이터 필터링 (Recoil 상태 기반)
  // ═══════════════════════════════════════════════════════
  const filteredTodos = data?.todos.filter(todo => {
    // 검색어 필터링
    if (searchKeyword.trim()) {
      if (!todo.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }
    }

    // 완료 상태 필터링
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // UI 렌더링...
}
```

### 언제 Recoil을 쓰나?

**✅ Recoil 사용:**

- UI 상태 (모달 열림/닫힘, 탭 선택 등)
- 필터, 정렬, 검색어
- 선택된 아이템 ID
- 로컬 설정 (테마, 언어 등)

**❌ Recoil 사용 안 함:**

- 서버 데이터 (todos, users, products)
- API 응답 캐싱
- 데이터 패칭

---

## 7. 네이밍 컨벤션

### Atom 네이밍

| 패턴                  | 예시                             | 용도                |
| --------------------- | -------------------------------- | ------------------- |
| `[명사]State`         | `todoFilterState`, `userIdState` | 기본 상태           |
| `is[형용사]State`     | `isLoadingState`, `isOpenState`  | Boolean             |
| `has[명사]State`      | `hasErrorState`                  | Boolean (소유 여부) |
| `selected[명사]State` | `selectedTodoIdState`            | 선택된 값           |
| `current[명사]State`  | `currentPageState`               | 현재 값             |

### Selector 네이밍

| 패턴                  | 예시                  | 용도            |
| --------------------- | --------------------- | --------------- |
| `[명사]State`         | `filterTextState`     | 계산된 값       |
| `is[형용사]State`     | `isSearchActiveState` | Boolean         |
| `filtered[명사]State` | `filteredTodosState`  | 필터링된 데이터 |
| `[명사]StatsState`    | `todoStatsState`      | 통계 정보       |

### Key 네이밍

```typescript
// ✅ atom 이름과 key 동일하게
export const todoFilterState = atom({
  key: 'todoFilterState', // ✅ 변수명과 같음
  default: 'all',
});

// ❌ 다르게 하면 혼란
export const todoFilterState = atom({
  key: 'filter', // ❌ 변수명과 다름
  default: 'all',
});
```

---

## 8. 실전 예제

### 예제 1: 기본 사용법

```typescript
// ═══════════════════════════════════════════════════════
// atoms/counterAtoms.ts
// ═══════════════════════════════════════════════════════
import { atom } from 'recoil';

export const countState = atom<number>({
  key: 'countState',
  default: 0,
});

// ═══════════════════════════════════════════════════════
// selectors/counterSelectors.ts
// ═══════════════════════════════════════════════════════
import { selector } from 'recoil';
import { countState } from '../atoms/counterAtoms';

export const doubleCountState = selector<number>({
  key: 'doubleCountState',
  get: ({ get }) => {
    const count = get(countState);
    return count * 2;
  },
});

// ═══════════════════════════════════════════════════════
// components/Counter.tsx
// ═══════════════════════════════════════════════════════
import { useRecoilState, useRecoilValue } from 'recoil';
import { countState } from '../recoil/atoms/counterAtoms';
import { doubleCountState } from '../recoil/selectors/counterSelectors';

function Counter() {
  const [count, setCount] = useRecoilState(countState);
  const doubleCount = useRecoilValue(doubleCountState);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </div>
  );
}
```

---

### 예제 2: 복잡한 필터링

```typescript
// ═══════════════════════════════════════════════════════
// atoms/productAtoms.ts
// ═══════════════════════════════════════════════════════
import { atom } from 'recoil';

export const categoryFilterState = atom<string>({
  key: 'categoryFilterState',
  default: 'all',
});

export const priceRangeState = atom<{ min: number; max: number }>({
  key: 'priceRangeState',
  default: { min: 0, max: 100000 },
});

export const sortByState = atom<'price' | 'name' | 'date'>({
  key: 'sortByState',
  default: 'date',
});

// ═══════════════════════════════════════════════════════
// selectors/productSelectors.ts
// ═══════════════════════════════════════════════════════
import { selector } from 'recoil';
import {
  categoryFilterState,
  priceRangeState,
  sortByState,
} from '../atoms/productAtoms';

export const activeFiltersCountState = selector<number>({
  key: 'activeFiltersCountState',
  get: ({ get }) => {
    let count = 0;

    const category = get(categoryFilterState);
    if (category !== 'all') count++;

    const priceRange = get(priceRangeState);
    if (priceRange.min > 0 || priceRange.max < 100000) count++;

    return count;
  },
});

// ═══════════════════════════════════════════════════════
// components/ProductList.tsx
// ═══════════════════════════════════════════════════════
import { useQuery } from '@apollo/client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { GET_PRODUCTS } from '../graphql/queries';
import type { Query } from '../graphql/__generated__/graphqlType';
import {
  categoryFilterState,
  priceRangeState,
  sortByState,
} from '../recoil/atoms/productAtoms';
import { activeFiltersCountState } from '../recoil/selectors/productSelectors';

function ProductList() {
  // GraphQL
  const { data } = useQuery<Pick<Query, 'products'>>(GET_PRODUCTS);

  // Recoil
  const [category, setCategory] = useRecoilState(categoryFilterState);
  const [priceRange, setPriceRange] = useRecoilState(priceRangeState);
  const [sortBy, setSortBy] = useRecoilState(sortByState);
  const activeFiltersCount = useRecoilValue(activeFiltersCountState);

  // 필터링 & 정렬
  const filteredProducts = data?.products
    .filter((product) => {
      if (category !== 'all' && product.category !== category) return false;
      if (product.price < priceRange.min || product.price > priceRange.max)
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // date
    });

  return (
    <div>
      <p>활성 필터: {activeFiltersCount}개</p>
      {/* UI... */}
    </div>
  );
}
```

---

### 예제 3: 모달 상태 관리

```typescript
// ═══════════════════════════════════════════════════════
// atoms/uiAtoms.ts
// ═══════════════════════════════════════════════════════
import { atom } from 'recoil';

export const isModalOpenState = atom<boolean>({
  key: 'isModalOpenState',
  default: false,
});

export const modalContentState = atom<'edit' | 'delete' | 'share' | null>({
  key: 'modalContentState',
  default: null,
});

export const selectedItemIdState = atom<string | null>({
  key: 'selectedItemIdState',
  default: null,
});

// ═══════════════════════════════════════════════════════
// hooks/useModal.ts (커스텀 hook)
// ═══════════════════════════════════════════════════════
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  isModalOpenState,
  modalContentState,
  selectedItemIdState,
} from '../recoil/atoms/uiAtoms';

export function useModal() {
  const [isOpen, setIsOpen] = useRecoilState(isModalOpenState);
  const setContent = useSetRecoilState(modalContentState);
  const setSelectedId = useSetRecoilState(selectedItemIdState);

  const openModal = (
    content: 'edit' | 'delete' | 'share',
    itemId: string
  ) => {
    setContent(content);
    setSelectedId(itemId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
    setSelectedId(null);
  };

  return { isOpen, openModal, closeModal };
}

// ═══════════════════════════════════════════════════════
// components/TodoItem.tsx
// ═══════════════════════════════════════════════════════
import { useModal } from '../hooks/useModal';

function TodoItem({ todo }: { todo: Todo }) {
  const { openModal } = useModal();

  return (
    <div>
      <span>{todo.title}</span>
      <button onClick={() => openModal('edit', todo.id)}>수정</button>
      <button onClick={() => openModal('delete', todo.id)}>삭제</button>
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. RecoilRoot 설정

```typescript
// src/main.tsx
import { RecoilRoot } from 'recoil';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
);
```

### 2. Atom 초기화

```typescript
// ✅ 좋은 예: 명확한 기본값
const filterState = atom({
  key: 'filterState',
  default: 'all' as const, // 타입 안전
});

// ❌ 나쁜 예: undefined 기본값
const filterState = atom({
  key: 'filterState',
  default: undefined, // 타입 불안정
});
```

### 3. Selector는 Pure Function

```typescript
// ✅ 좋은 예: 순수 함수
const doubleCountState = selector({
  key: 'doubleCountState',
  get: ({ get }) => {
    const count = get(countState);
    return count * 2;
  },
});

// ❌ 나쁜 예: 부수 효과 있음
const doubleCountState = selector({
  key: 'doubleCountState',
  get: ({ get }) => {
    const count = get(countState);
    console.log(count); // ❌ 부수 효과!
    return count * 2;
  },
});
```

### 4. 적절한 Hook 선택

```typescript
// 읽기 + 쓰기 모두 필요
const [value, setValue] = useRecoilState(someState);

// 읽기만 필요
const value = useRecoilValue(someState);

// 쓰기만 필요
const setValue = useSetRecoilState(someState);
```

---

## ✅ 체크리스트

실무 투입 전 확인사항:

- [ ] `RecoilRoot`로 앱을 감쌌는가?
- [ ] Atom의 key가 전역적으로 유니크한가?
- [ ] Selector는 순수 함수인가?
- [ ] GraphQL vs Recoil 역할 분리가 명확한가?
- [ ] 적절한 Hook을 선택했는가? (State/Value/Set)
- [ ] 네이밍 컨벤션을 따랐는가?

---

**작성일**: 2025-10-05
**버전**: 1.0.0
**기준**: Recoil v0.7 + React 18
