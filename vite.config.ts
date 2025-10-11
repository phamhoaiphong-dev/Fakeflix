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
    proxy: {
      // Cấu hình proxy chi tiết hơn
      '/api': {
        target: 'https://phimapi.com',
        changeOrigin: true,
        secure: true, 
        rewrite: (path) => {
          const newPath = path.replace(/^\/api/, '');
          console.log(`🚀 Proxy: ${path} -> /${newPath}`);
          return '/' + newPath;
        },

        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
          });

          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxy request:', req.method, req.url);
            console.log('📤 Target URL:', `${options.target}${proxyReq.path}`);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    // Thêm CORS headers cho dev server
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