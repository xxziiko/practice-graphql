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

// 실무 패턴: 변수가 있는 Query
export const GET_TODO = gql`
  query GetTodo($id: ID!) {
    todo(id: $id) {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;
