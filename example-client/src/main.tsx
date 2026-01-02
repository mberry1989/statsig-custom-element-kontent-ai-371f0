import { StatsigProvider } from "@statsig/react-bindings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { getUserId } from "./userId.ts";

const queryClient = new QueryClient();

const statsigClientKey = import.meta.env.VITE_STATSIG_CLIENT_KEY;

if (!statsigClientKey) {
  throw new Error(
    "Missing VITE_STATSIG_CLIENT_KEY environment variable. " +
      "Please copy .env.template to .env and configure your Statsig Client SDK Key.",
  );
}

const userId = getUserId();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StatsigProvider
        sdkKey={statsigClientKey}
        user={{ userID: userId }}
        options={{
          environment: { tier: import.meta.env.MODE },
        }}
        loadingComponent={<div>Loading Statsig...</div>}
      >
        <App />
      </StatsigProvider>
    </QueryClientProvider>
  </StrictMode>,
);
