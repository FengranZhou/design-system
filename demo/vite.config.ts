import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// demo 的 node_modules 绝对路径。业务组件源头在 demo 之外（design-spec/components），
// 其依赖（vue / element-plus / lucide-vue-next）装在 demo 的 node_modules。
// 用 alias 显式把这些依赖指向 demo/node_modules，让 demo 之外的组件也能正确解析、
// 并与 demo 自身用同一份实例（避免 vue 双实例）。
const nm = (pkg: string) =>
  fileURLToPath(new URL(`./node_modules/${pkg}`, import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 关键依赖去重：demo 与 design-spec 业务组件共用同一份实例
    dedupe: ['vue', 'element-plus', 'lucide-vue-next', 'echarts'],
    alias: {
      vue: nm('vue'),
      'element-plus': nm('element-plus'),
      'lucide-vue-next': nm('lucide-vue-next'),
      echarts: nm('echarts'),
    },
  },
})
