export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodosData {
  todos: Todo[];
}

export interface TodoData {
  addTodo: Todo;
}

export interface ToggleTodoData {
  toggleTodo: Todo;
}

export interface DeleteTodoData {
  deleteTodo: string;
}
