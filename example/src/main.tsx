import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StatsigProvider } from '@statsig/react-bindings';
import { App } from './App';
import { getUserId } from './userId';

const userId = getUserId();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StatsigProvider
      sdkKey={import.meta.env.VITE_STATSIG_CLIENT_KEY || ''}
      user={{ userID: userId }}
      options={{
        environment: { tier: import.meta.env.MODE },
      }}
      loadingComponent={<div>Loading Statsig...</div>}
    >
      <App />
    </StatsigProvider>
  </StrictMode>,
);
