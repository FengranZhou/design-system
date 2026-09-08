import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 固定 5174，与 EP 版 demo（5173）错开，两个预览可同时打开对比
  server: { port: 5174, strictPort: true },
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true }, // antd 3 的 less 需要
    },
  },
})
