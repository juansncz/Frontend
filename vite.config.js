import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Ensure dependencies like react-icons are bundled properly
      external: [], // Remove 'react-icons' from external
    },
  },
});