import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 用于 Playwright E2E 测试，不含 Electron 插件
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173
  }
})
