import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import TodoListWithRecoil from './components/TodoListWithRecoil';
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
        <TodoListWithRecoil />
      </div>
    </ApolloProvider>
  );
}

export default App;
