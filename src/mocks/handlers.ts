import { graphql, HttpResponse } from 'msw';
import { todos } from '../mock/data';

export const handlers = [
  // 전체 TODO 조회
  graphql.query('GetTodos', () => {
    console.log('📖 GetTodos 쿼리 실행:', todos);
    return HttpResponse.json({
      data: {
        todos: todos,
      },
    });
  }),

  // TODO 추가
  graphql.mutation('AddTodo', ({ variables }) => {
    const newTodo = {
      id: String(Date.now()),
      title: variables.title as string,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    todos.push(newTodo);
    console.log('✅ TODO 추가:', newTodo);

    return HttpResponse.json({
      data: {
        addTodo: newTodo,
      },
    });
  }),

  // TODO 완료 토글
  graphql.mutation('ToggleTodo', ({ variables }) => {
    const todo = todos.find(t => t.id === variables.id);
    if (todo) {
      todo.completed = !todo.completed;
      console.log('🔄 TODO 토글:', todo);
    }

    return HttpResponse.json({
      data: {
        toggleTodo: todo,
      },
    });
  }),

  // TODO 삭제
  graphql.mutation('DeleteTodo', ({ variables }) => {
    const index = todos.findIndex(t => t.id === variables.id);
    if (index > -1) {
      todos.splice(index, 1);
      console.log('🗑️ TODO 삭제:', variables.id);
    }

    return HttpResponse.json({
      data: {
        deleteTodo: variables.id,
      },
    });
  }),
];
