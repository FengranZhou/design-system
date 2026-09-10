import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 部署基础路径：产物挂在子路径 /xiaoya-design-demo-antd3/ 下访问，
  // 所有资源引用会带上该前缀（首尾斜杠不可省，否则子路径下资源 404）
  base: '/xiaoya-design-demo-antd3/',
  // 固定 5174，与 EP 版 demo（5173）错开，两个预览可同时打开对比
  server: { port: 5174, strictPort: true },
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true }, // antd 3 的 less 需要
    },
  },
})
