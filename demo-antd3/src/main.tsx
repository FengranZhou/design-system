import React from 'react'
import ReactDOM from 'react-dom'
import { ConfigProvider } from 'antd'

// 样式加载顺序（固定）：antd 基础 → 设计令牌 → antd3 覆盖层
import 'antd/dist/antd.css'
import '../../design-spec/design-token/index.scss'
import '../../design-spec/antd3-theme/index.less'

import './demo.less'
import ButtonDemo from './ButtonDemo'

// 把运行时错误显示到页面上（React 16 白屏时看不到原因，故显式兜住）
window.addEventListener('error', (e) => {
  const el = document.getElementById('root')
  if (el && !el.innerHTML.trim()) {
    el.innerHTML = `<pre style="padding:24px;color:#c00;white-space:pre-wrap;font:14px monospace">运行时错误：\n${e.message}\n\n${e.error?.stack || ''}</pre>`
  }
})

try {
  // autoInsertSpaceInButton={false}：关掉 antd 3 对两字中文按钮自动插空格
  // （「确定」→「确 定」）。这是 JS 行为、CSS 压不掉，必须在此关闭。见 DIFF #8。
  ReactDOM.render(
    <ConfigProvider autoInsertSpaceInButton={false}>
      <ButtonDemo />
    </ConfigProvider>,
    document.getElementById('root'),
  )
} catch (err: any) {
  document.getElementById('root')!.innerHTML =
    `<pre style="padding:24px;color:#c00;white-space:pre-wrap;font:14px monospace">渲染失败：\n${err?.message}\n\n${err?.stack || ''}</pre>`
}
