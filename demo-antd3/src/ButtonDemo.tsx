import React, { useState, useEffect } from 'react'
import { Button, Switch } from 'antd'

/**
 * Button 全形态矩阵 —— 与 demo/src/components/ButtonDemo.vue 严格对位。
 *
 * 版式与 EP 版一致：左侧 6 类（列）× 3 状态（行）网格 + 右侧配置项卡片。
 * 目的是让两边能逐格并排比对，凡对不上的登记进 antd3-theme/DIFF.md。
 */

/* Lucide 图标（内联 svg，避免为试点引入图标库依赖）。
   size 必须显式给：EP 版是 <Pencil :size="16" />（图标 16 / 箭头 14），
   lucide 组件把 size 渲染成 svg 的 width/height 属性；裸 svg 不给尺寸会撑成 300×150。 */
const Icon = ({
  d,
  className = 'btn-icon',
  size = 16,
}: {
  d: string
  className?: string
  size?: number
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
)

const PATH = {
  pencil: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
}

/** 6 种类型（列）—— 与 EP 版 types 一一对应 */
const TYPES = [
  { key: 'default',  primary: false, danger: false, text: false, label: '次按钮' },
  { key: 'primary',  primary: true,  danger: false, text: false, label: '主按钮' },
  { key: 'danger',   primary: false, danger: true,  text: false, label: '危险按钮' },
  { key: 'text',     primary: false, danger: false, text: true,  label: '文本次按钮' },
  { key: 'text-pri', primary: true,  danger: false, text: true,  label: '文本主按钮' },
  { key: 'text-dan', primary: false, danger: true,  text: true,  label: '文本危险按钮' },
]

/** 3 种状态（行） */
const STATES = [
  { key: 'normal',   disabled: false, loading: false },
  { key: 'disabled', disabled: true,  loading: false },
  { key: 'loading',  disabled: false, loading: true  },
]

export default function ButtonDemo() {
  // 配置开关：图标可与任意组合叠加；「下拉」与「入口引导」是尾部箭头同一维度的
  // 两个互斥取值（语义相反：原地展开 vs 去往别处，且同占文字尾部位置），
  // 开一个自动关另一个——联动本身就是对互斥规则的演示（与 EP 版同口径）
  const [showIcon, setShowIcon] = useState(false)
  const [showCaret, setShowCaret] = useState(false)
  const [showEntry, setShowEntry] = useState(false)
  useEffect(() => { if (showCaret) setShowEntry(false) }, [showCaret])
  useEffect(() => { if (showEntry) setShowCaret(false) }, [showEntry])

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Button 按钮 —— antd 3 适配层</h2>

      <div className="demo-block button-showcase">
        {/* 左侧：6 类 × 3 状态网格；图标 / 箭头由右侧开关统一控制 */}
        <div className="button-grid">
          {STATES.map((s) =>
            TYPES.map((b) => (
              <Button
                key={b.key + s.key}
                type={b.primary ? 'primary' : undefined}
                className={[b.text && 'btn-text', b.danger && 'btn-danger']
                  .filter(Boolean)
                  .join(' ') || undefined}
                disabled={s.disabled}
                loading={s.loading}
              >
                {showIcon && <Icon d={PATH.pencil} />}
                <span>{b.label}</span>
                {showCaret && <Icon d={PATH.chevronDown} className="btn-caret" size={14} />}
                {/* 入口引导仅限 text 形态（规范硬规则）：开关打开时有底三列不出现箭头，
                    这个"只有 text 列有"本身就是对适用范围的演示 */}
                {showEntry && b.text && (
                  <Icon d={PATH.chevronRight} className="btn-entry" size={14} />
                )}
              </Button>
            )),
          )}
        </div>

        {/* 右侧：配置项卡片，控制整个网格的图标 / 下拉箭头 / 入口引导 */}
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">图标</span>
              <Switch checked={showIcon} onChange={setShowIcon} />
            </div>
            <div className="config-item">
              <span className="config-item__label">下拉</span>
              <Switch checked={showCaret} onChange={setShowCaret} />
            </div>
            <div className="config-item">
              <span className="config-item__label">入口引导</span>
              <Switch checked={showEntry} onChange={setShowEntry} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
