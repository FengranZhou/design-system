import React from 'react'

import { copyToken, useTokenValues } from './useTokens'
// 场景语义的单一数据源（同一份也被 references/foundations.md 间距速查表指向）
import { SPACING_USAGE } from '../../../design-spec/design-token/spacing-usage'
import './token-demo.less'

/**
 * Spacing 间距 —— 与 demo/src/components/token/SpacingDemo.vue 对位。
 * 场景清单直接复用 design-spec 的单一数据源，不在 demo 里另存副本。
 */
export default function SpacingDemo() {
  const { rootRef, rawValues } = useTokenValues(SPACING_USAGE.map((t) => t.name))

  return (
    <section className="demo-section demo-plain" ref={rootRef}>
      <h2 className="demo-section__title">Spacing 间距</h2>

      <div className="demo-block">
        <p className="demo-label">
          间距 Spacing — 命名规则：序号 × 4 = px 值；条形长度即实际尺寸
        </p>
        <div className="token-spacing-list">
          {SPACING_USAGE.map((t) => (
            <div
              key={t.name}
              className="token-spacing-row"
              onClick={() => copyToken(t.name)}
              title={`点击复制 var(${t.name})`}
            >
              <div className="token-spacing-row__head">
                <span className="token-name">{t.name.replace('--iflyv-', '')}</span>
                <span className="token-value">{rawValues[t.name] || '…'}</span>
                <span className="token-spacing-bar" style={{ width: `var(${t.name})` }} />
              </div>
              <div className="token-scenes">
                <span className="token-scenes__label">应用场景</span>
                {t.scenes.map((scene) => (
                  <span key={scene} className="token-scene-chip">
                    {scene}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
