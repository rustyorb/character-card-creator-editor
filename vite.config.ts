import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.LLM_API_KEY': JSON.stringify(env.LLM_API_KEY),
        'process.env.LLM_API_BASE': JSON.stringify(env.LLM_API_BASE),
        'process.env.LLM_MODEL': JSON.stringify(env.LLM_MODEL),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
