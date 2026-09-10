import React from 'react'

import { copyToken, useTokenValues } from './useTokens'
import './token-demo.less'

/** Shadow 阴影 —— 与 demo/src/components/token/ShadowDemo.vue 对位。 */

const SHADOW_TOKENS = [
  { name: '--iflyv-shadow-hover', desc: '悬浮反馈（卡片 hover）' },
  { name: '--iflyv-shadow-related', desc: '关联浮层（下拉、气泡）' },
  { name: '--iflyv-shadow-independent', desc: '独立浮层（弹窗、抽屉）' },
]

export default function ShadowDemo() {
  const { rootRef } = useTokenValues()

  return (
    <section className="demo-section demo-plain" ref={rootRef}>
      <h2 className="demo-section__title">Shadow 阴影</h2>

      <div className="demo-block">
        <p className="demo-label">
          阴影 Shadow — 三档层级：悬浮反馈 → 关联浮层 → 独立浮层
        </p>
        <div className="token-shadow-row">
          {SHADOW_TOKENS.map((t) => (
            <div
              key={t.name}
              className="token-shadow-card"
              style={{ boxShadow: `var(${t.name})` }}
              title={`点击复制 var(${t.name})`}
              onClick={() => copyToken(t.name)}
            >
              <span className="token-name">{t.name.replace('--iflyv-', '')}</span>
              <span className="token-desc">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
