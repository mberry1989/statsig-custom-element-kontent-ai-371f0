import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnsureKontentAsParent } from "./customElement/EnsureKontentAsParent";
import { IntegrationApp } from './IntegrationApp';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Cannot find the root element. Please, check your html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <EnsureKontentAsParent>
        <IntegrationApp />
      </EnsureKontentAsParent>
    </QueryClientProvider>
  </StrictMode>
);
