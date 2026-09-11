import React from 'react'

import { copyToken, useTokenValues } from './useTokens'
import './token-demo.less'

/**
 * Font Base 基础字阶 —— 与 demo/src/components/token/FontBaseDemo.vue 对位。
 * 展示字重（实测值）与字号（含每档可配的行高）。
 */

const FONT_WEIGHT_TOKENS = [
  { name: '--iflyv-font-weight-regular' },
  { name: '--iflyv-font-weight-semibold' },
  { name: '--iflyv-font-weight-bold', note: '抖音美好体专用' },
  { name: '--iflyv-font-weight-extrabold', note: '阿里普惠体专用' },
]

// lineHeights：每个字号配 1.5×(向上取双) 与 2× 两档行高；26 额外加 36 / 48
const FONT_SIZE_TOKENS = [
  { name: '--iflyv-font-size-12', px: '12px', lineHeights: [18, 24] },
  { name: '--iflyv-font-size-14', px: '14px', lineHeights: [20, 28] },
  { name: '--iflyv-font-size-16', px: '16px', lineHeights: [24, 32] },
  { name: '--iflyv-font-size-18', px: '18px', lineHeights: [28, 36] },
  { name: '--iflyv-font-size-22', px: '22px', lineHeights: [34, 44] },
  { name: '--iflyv-font-size-26', px: '26px', lineHeights: [40, 52, 36, 48] },
  { name: '--iflyv-font-size-40', px: '40px', lineHeights: [60, 80] },
]

export default function FontBaseDemo() {
  const { rootRef, rawValues } = useTokenValues(FONT_WEIGHT_TOKENS.map((t) => t.name))

  return (
    <section className="demo-section demo-plain" ref={rootRef}>
      <h2 className="demo-section__title">Font Base 基础字阶</h2>

      <div className="demo-block">
        <p className="demo-label">字重 Font Weight</p>
        <div className="token-font-list">
          {FONT_WEIGHT_TOKENS.map((t) => (
            <div
              key={t.name}
              className="token-font-row token-font-row--weight"
              onClick={() => copyToken(t.name)}
              title={`点击复制 var(${t.name})`}
            >
              <span className="token-name">{t.name.replace('--iflyv-', '')}</span>
              <span className="token-value">
                {rawValues[t.name] || '…'}
                {t.note ? `（${t.note}）` : ''}
              </span>
              <span
                className="token-font-sample"
                style={{ fontSize: 18, fontWeight: `var(${t.name})` as any }}
              >
                讯飞小雅
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-block">
        <p className="demo-label">字号 Font Size</p>
        <div className="token-font-list">
          {FONT_SIZE_TOKENS.map((t) => (
            <div
              key={t.name}
              className="token-font-row token-font-row--size"
              onClick={() => copyToken(t.name)}
              title={`点击复制 var(${t.name})`}
            >
              <span className="token-name">{t.name.replace('--iflyv-', '')}</span>
              <span className="token-value">{t.px}</span>
              <span className="token-lineheights">
                <span className="token-lineheights__label">行高</span>
                {t.lineHeights.map((lh) => (
                  <span key={lh} className="token-lh-chip">
                    {lh}
                  </span>
                ))}
              </span>
              <span className="token-font-sample" style={{ fontSize: `var(${t.name})` }}>
                讯飞小雅
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
