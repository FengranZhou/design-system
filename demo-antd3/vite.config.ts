import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // ⚠ 必须保留：否则生产产物整页白屏。
      // antd 3 的 ESM 产物 es/icon/index.js 写的是
      //   import * as allIcons from '@ant-design/icons/lib/dist'
      // 而该子模块是 CJS。生产构建下 Rollup 给 CJS 命名空间额外挂一个 `default` 键，
      // antd 初始化时 ReactIcon.add(Object.keys(allIcons).map(...)) 就把这个非图标对象
      // 送进 withSuffix，theme 为 undefined 直接抛 "Unknown theme type" → 白屏。
      // dev 用 esbuild（识别 __esModule 后不加 default），故只有 build 产物复现。
      // 解法：裸 'antd' 指向 CJS 的 lib 构建，由 commonjs 插件统一处理，
      // require 拿到真实 exports 对象，Object.keys 干净。
      // 需与下方 build.commonjsOptions.transformMixedEsModules 配合使用。
      // 单靠 build.commonjsOptions（transformMixedEsModules / defaultIsModuleExports）
      // 而不加本别名无效：它们不改变 es 构建里 ESM 命名空间多出的 default 键。
      // 代价：CJS 无法 tree-shaking，729 个图标全量打入，产物约 2.6MB。
      // demo 站可接受；如需瘦身，应改为按需引入 antd 子模块而非退回 es 构建。
      // 精确匹配，避免影响 'antd/dist/antd.css' 等子路径。
      { find: /^antd$/, replacement: 'antd/lib' },
    ],
  },

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
    commonjsOptions: {
      // 配合上面的 antd→antd/lib 别名：lib 是 CJS，源码里含 require()，
      // 需开启混合模块转换让 Rollup 的 commonjs 插件把这些 require 正确转为
      // ESM import，否则浏览器运行到 require 会抛 "require is not defined"。
      transformMixedEsModules: true,
    },
  },
})
