/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addTodo: Todo;
  deleteTodo: Scalars['ID']['output'];
  toggleTodo: Todo;
};


export type MutationaddTodoArgs = {
  title: Scalars['String']['input'];
};


export type MutationdeleteTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationtoggleTodoArgs = {
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  todo: Maybe<Todo>;
  todos: Array<Todo>;
};


export type QuerytodoArgs = {
  id: Scalars['ID']['input'];
};

export type Todo = {
  __typename?: 'Todo';
  completed: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type AddTodoVariables = Exact<{
  title: Scalars['String']['input'];
}>;


export type AddTodo = { addTodo: { __typename?: 'Todo', id: string, title: string, completed: boolean } };

export type ToggleTodoVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ToggleTodo = { toggleTodo: { __typename?: 'Todo', id: string, title: string, completed: boolean } };

export type DeleteTodoVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTodo = { deleteTodo: string };

export type GetTodosVariables = Exact<{ [key: string]: never; }>;


export type GetTodos = { todos: Array<{ __typename?: 'Todo', id: string, title: string, completed: boolean }> };

export type GetTodoVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTodo = { todo: { __typename?: 'Todo', id: string, title: string, completed: boolean, createdAt: string, updatedAt: string } | null };
