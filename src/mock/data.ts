import type { Todo } from '../types/todo';

export let todos: Todo[] = [
  {
    id: '1',
    title: 'GraphQL 기본 문법 익히기',
    completed: false,
  },
  {
    id: '2',
    title: 'Query 작성해보기',
    completed: false,
  },
  {
    id: '3',
    title: 'Mutation 작성해보기',
    completed: false,
  },
];

export const resetTodos = () => {
  todos = [
    {
      id: '1',
      title: 'GraphQL 기본 문법 익히기',
      completed: false,
    },
    {
      id: '2',
      title: 'Query 작성해보기',
      completed: false,
    },
    {
      id: '3',
      title: 'Mutation 작성해보기',
      completed: false,
    },
  ];
};
