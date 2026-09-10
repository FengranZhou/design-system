import React from 'react'

import { copyToken, useTokenValues } from './useTokens'
import './token-demo.less'

/** Radius 圆角 —— 与 demo/src/components/token/RadiusDemo.vue 对位。 */

const RADIUS_TOKENS = [
  { name: '--iflyv-radius-xs', desc: 'Tag / 下拉项' },
  { name: '--iflyv-radius-sm', desc: '按钮 / 输入框 / 小卡片 / 卡内嵌套面板' },
  { name: '--iflyv-radius-md', desc: '大卡片' },
  { name: '--iflyv-radius-lg', desc: '页面 / 弹窗 / 抽屉' },
  { name: '--iflyv-radius-full', desc: '全圆角' },
]

export default function RadiusDemo() {
  const { rootRef, rawValues } = useTokenValues(RADIUS_TOKENS.map((t) => t.name))

  return (
    <section className="demo-section demo-plain" ref={rootRef}>
      <h2 className="demo-section__title">Radius 圆角</h2>

      <div className="demo-block">
        <p className="demo-label">圆角 Radius — 点击复制</p>
        <div className="token-radius-row">
          {RADIUS_TOKENS.map((t) => (
            <div
              key={t.name}
              className="token-radius-item"
              onClick={() => copyToken(t.name)}
              title={`点击复制 var(${t.name})`}
            >
              <div className="token-radius-box" style={{ borderRadius: `var(${t.name})` }} />
              <span className="token-name">{t.name.replace('--iflyv-radius-', '')}</span>
              <span className="token-value">{rawValues[t.name] || '…'}</span>
              <span className="token-desc">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
