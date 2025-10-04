import type { Todo } from '../types/todo';

export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Learn GraphQL',
    completed: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Build Todo App',
    completed: true,
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    title: 'Setup MSW',
    completed: false,
    createdAt: '2024-01-13T14:20:00Z',
    updatedAt: '2024-01-13T14:20:00Z',
  },
  {
    id: '4',
    title: 'Write Tests',
    completed: false,
    createdAt: '2024-01-12T16:10:00Z',
    updatedAt: '2024-01-12T16:10:00Z',
  },
];

export const createMockTodo = (title: string): Todo => {
  const now = new Date().toISOString();
  return {
    id: Math.random().toString(36).substr(2, 9),
    title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
};
