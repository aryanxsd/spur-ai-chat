import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    proxy: {
      '/chat': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
