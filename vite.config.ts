import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/chatwork': {
        target: 'https://api.chatwork.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chatwork/, ''),
        secure: false,
        headers: {
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=5, max=1000',
        },
        timeout: 30000, // 30 seconds timeout
      },
    },
  },
});