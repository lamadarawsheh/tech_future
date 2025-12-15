import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  // Vite automatically loads .env files, so we don't need loadEnv here
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Vite automatically exposes all env variables prefixed with VITE_
      // So you can use import.meta.env.VITE_GEMINI_API_KEY in your code
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        // Only include environment variables that are specifically needed
      }
    },
    resolve: {
      alias: {
        // Use fileURLToPath for better compatibility
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Add other aliases as needed
      }
    },
    // Add this to handle process.env in the browser
    // This is important for client-side code
    envPrefix: 'VITE_',
  };
});