// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID: string;
  readonly VITE_SANITY_DATASET: string;
  readonly VITE_SANITY_API_VERSION?: string;
  readonly VITE_SANITY_TOKEN?: string;
  // Add other environment variables as needed
}

// This tells TypeScript about the global `import.meta` object
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// This makes the types available globally
declare global {
  interface Window {
    // Add any global window extensions here if needed
  }
}

// This is needed to make the file a module
export {};