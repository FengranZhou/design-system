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
  build: {
    // antd 3 的 ESM 构建里 es/icon/index.js 用 `import * as allIcons` 引了 CJS 子模块
    // @ant-design/icons/lib/dist；Rollup 默认的 CJS interop 会在命名空间里多塞一个
    // `default` 键，antd 初始化时 `ReactIcon.add(Object.keys(allIcons).map(...))` 会把
    // 这个非图标对象送进 withSuffix，theme 为 undefined 直接抛 “Unknown theme type”
    // 导致生产产物白屏（dev 走 esbuild 预构建无此问题）。开启混合模块转换让 Rollup
    // 正确处理这类 ESM 中夹带的 CJS 依赖。
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
