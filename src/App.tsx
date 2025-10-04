import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import TodoListWithCodegen from './components/TodoListWithCodegen';
import AddTodoWithCodegen from './components/AddTodoWithCodegen';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div style={{ padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>
          🚀 GraphQL TODO App (Code Generator)
        </h1>
        <AddTodoWithCodegen />
        <TodoListWithCodegen />
      </div>
    </ApolloProvider>
  );
}

export default App;
