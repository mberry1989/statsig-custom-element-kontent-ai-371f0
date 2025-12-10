/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STATSIG_CLIENT_KEY: string;
  readonly VITE_EXPERIMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
