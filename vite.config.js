import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths, so the build works from any folder or sub-path.
  base: './',
  plugins: [react()],
  server: { port: 8999, host: '0.0.0.0', strictPort: true },
});
