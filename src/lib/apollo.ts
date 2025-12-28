import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useLoadingStore } from '../stores/loadingStore';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const loadingLink = new ApolloLink((operation, forward) => {
  useLoadingStore.getState().startLoading();
  
  return forward(operation).map((response) => {
    useLoadingStore.getState().stopLoading();
    return response;
  });
});

const errorLink = onError(() => {
  useLoadingStore.getState().stopLoading();
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, loadingLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
