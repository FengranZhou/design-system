import { createApp } from 'vue'
import ElementPlus from 'element-plus'

// 样式加载顺序：EP 基础 → 设计令牌 → 主题覆盖
import 'element-plus/dist/index.css'
import '../../design-spec/design-token/index.scss'
import '../../design-spec/el-theme/index.scss'

// demo 专用字体兜底：让 @font-face 的 src 能指向 demo/public/font/，
// 使打包部署后字体正常加载（源头 font.scss 的 ../font 相对路径打包时丢失）。
import './styles/font-face-override.scss'

import './styles/global.scss'

import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
