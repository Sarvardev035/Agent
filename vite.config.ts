import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://finly.uyqidir.uz',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
  },
})
