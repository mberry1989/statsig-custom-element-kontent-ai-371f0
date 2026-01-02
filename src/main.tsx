import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EnsureKontentAsParent } from "./customElement/EnsureKontentAsParent.tsx";
import { IntegrationApp } from "./IntegrationApp.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Cannot find the root element. Please, check your html.");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <EnsureKontentAsParent>
        <IntegrationApp />
      </EnsureKontentAsParent>
    </QueryClientProvider>
  </StrictMode>,
);
