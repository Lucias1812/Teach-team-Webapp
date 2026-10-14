import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink
} from '@apollo/client';
import App from './App';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4001' }),
  cache: new InMemoryCache(),
});

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}
