import { defineConfig } from 'vite';
// @ts-ignore
import react from '@vitejs/plugin-react';
// @ts-ignore
import tailwind from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    tsconfigPaths()
  ],
  server: {
    cors: true,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src')
    }
  },
  // Define để debug
  define: {
    __DEV__: JSON.stringify(true),
  }
});