import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // 跨域代理：把前端 /api/* 请求转发到后端 Express API 服务器
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // /api/blocks → http://localhost:3001/blocks（去掉前缀 /api）
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
