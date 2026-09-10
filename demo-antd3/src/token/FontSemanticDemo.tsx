import React from 'react'

import { copyToken, useTokenValues } from './useTokens'
import './token-demo.less'

/**
 * Font 语义字阶 —— 与 demo/src/components/token/FontSemanticDemo.vue 对位。
 * 展示 font 简写复合令牌（字重 + 字号 / 行高 + 字族），业务代码优先用这层。
 */

type SplitSpec = { family: string; weight: string; size: number; lh: number }
type SemanticFontToken = {
  name: string
  desc: string
  sample?: string
  /** split → 用拆分属性渲染（含空格的字体名不能走 font 简写，见 sampleStyle） */
  split?: SplitSpec
}

const SEMANTIC_FONT_TOKENS: SemanticFontToken[] = [
  // —— 标题·页面层级链（页面级 → 模块级 → 组件级，逐级递减，给页面分层只在这三档里选）——
  {
    name: '--iflyv-font-title-page',
    desc: '① 页面级标题 26/48 阿里普惠 800',
    split: { family: 'emphasis', weight: 'extrabold', size: 26, lh: 48 },
  },
  { name: '--iflyv-font-title-module', desc: '② 模块级标题 18/36 semibold' },
  { name: '--iflyv-font-title-component', desc: '③ 组件级标题 14/20 semibold' },
  // —— 正文（title-regular 不参与页面分层，规格与 body-primary 同为 16/24、仅字重不同，故归此组）——
  { name: '--iflyv-font-title-regular', desc: '通用容器内标题 16/24 semibold' },
  { name: '--iflyv-font-body-primary', desc: '常规正文 16/24' },
  { name: '--iflyv-font-body-sub', desc: '次要正文 14/20' },
  { name: '--iflyv-font-body-min', desc: '辅助信息 12/18' },
  // —— Tab ——
  {
    name: '--iflyv-font-tab-active',
    desc: '页面级选中 Tab 项 26/36 阿里普惠 800',
    split: { family: 'emphasis', weight: 'extrabold', size: 26, lh: 36 },
  },
  { name: '--iflyv-font-tab-active-sub', desc: '模块级选中 Tab 项 18/28 semibold' },
  { name: '--iflyv-font-tab-default', desc: '默认 Tab 项 18/36 regular' },
  // —— 标签 ——
  { name: '--iflyv-font-label-primary', desc: '常规标签 12/18' },
  // —— 展示数字 ——
  { name: '--iflyv-font-number-display', desc: '展示数字 26/40 抖音美好体', sample: '1234567890' },
  {
    name: '--iflyv-font-number-display-sm',
    desc: '展示数字小 22/34 抖音美好体',
    sample: '1234567890',
  },
  // —— 多行变体：预期 ≥3 行时用，1~2 行一律用常规档（行高＝字号 2 倍，短句上会过松）
  //    标题/tab/label 角色上不成段落，故无多行档 ——
  {
    name: '--iflyv-font-title-page-multiline',
    desc: '页面标题·≥3 行 26/52 阿里普惠 800',
    split: { family: 'emphasis', weight: 'extrabold', size: 26, lh: 52 },
  },
  { name: '--iflyv-font-body-primary-multiline', desc: '常规正文·≥3 行 16/32' },
  { name: '--iflyv-font-body-sub-multiline', desc: '次要正文·≥3 行 14/28' },
  { name: '--iflyv-font-body-min-multiline', desc: '辅助信息·≥3 行 12/24' },
]

// 语义字体示例样式：默认用 font 简写；split 令牌改用拆分属性。
// 注意：内联 style 对象里 var() 展开含逗号的字体族列表会被破坏，
// 故 split 的 fontFamily 用字面量（family: 逻辑名 → 字面字体栈）。
const SAMPLE_FAMILY: Record<string, string> = {
  emphasis: '"Alibaba PuHuiTi 3.0", sans-serif',
}

function sampleStyle(t: SemanticFontToken): React.CSSProperties {
  if (!t.split) return { font: `var(${t.name})` }
  const s = t.split
  return {
    fontFamily: SAMPLE_FAMILY[s.family] || 'inherit',
    fontWeight: `var(--iflyv-font-weight-${s.weight})` as any,
    fontSize: `var(--iflyv-font-size-${s.size})`,
    lineHeight: `var(--iflyv-line-height-${s.lh})`,
  }
}

export default function FontSemanticDemo() {
  const { rootRef } = useTokenValues()

  return (
    <section className="demo-section demo-plain" ref={rootRef}>
      <h2 className="demo-section__title">Font 语义字阶</h2>

      <div className="demo-block">
        <p className="demo-label">
          语义字体 Composite Font — font 简写复合令牌（字重 + 字号 / 行高 + 字族），业务代码优先用这层
        </p>
        <div className="token-font-list">
          {SEMANTIC_FONT_TOKENS.map((t) => (
            <div
              key={t.name}
              className="token-font-row token-font-row--semantic"
              onClick={() => copyToken(t.name)}
              title={`点击复制 var(${t.name})`}
            >
              <span className="token-font-row__head">
                <span className="token-name">{t.name.replace('--iflyv-font-', '')}</span>
                <span className="token-desc">{t.desc}</span>
              </span>
              <span className="token-font-sample" style={sampleStyle(t)}>
                {t.sample || '讯飞小雅'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
