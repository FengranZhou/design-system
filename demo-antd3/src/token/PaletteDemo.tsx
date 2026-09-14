import React, { useEffect, useRef, useState } from 'react'

import './token-demo.less'

/**
 * Palette 基础色板 —— 与 demo/src/components/PaletteDemo.vue 对位。
 *
 * 本组件不硬编码任何色值：
 * - 色块背景直接绑定 var(--iflyv-{family}-{step})，来源于 design-token 色板层
 * - hex 标签 = 运行时 getComputedStyle 实测渲染值
 * token 层改动会自动反映到本页，供审查比对。
 */

const GROUPS = [
  { key: 'geekblue', label: 'GeekBlue 极客蓝' },
  { key: 'green', label: 'Green 成功色' },
  { key: 'red', label: 'Red 危险色' },
  { key: 'orange', label: 'Orange 警告色' },
  { key: 'blue', label: 'Blue 信息色' },
]

function toHexPart(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0').toUpperCase()
}

/* computed color 字符串 → hex。rgb()/rgba() 直接解析，oklch()/color() 等经 canvas 归一化 */
let canvasCtx: CanvasRenderingContext2D | null = null
function cssColorToHex(color: string): string {
  const m = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
  if (m) return `#${toHexPart(+m[1])}${toHexPart(+m[2])}${toHexPart(+m[3])}`
  if (!canvasCtx) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    canvasCtx = canvas.getContext('2d', { willReadFrequently: true })
  }
  if (!canvasCtx) return ''
  canvasCtx.clearRect(0, 0, 1, 1)
  canvasCtx.fillStyle = color
  canvasCtx.fillRect(0, 0, 1, 1)
  const d = canvasCtx.getImageData(0, 0, 1, 1).data
  return `#${toHexPart(d[0])}${toHexPart(d[1])}${toHexPart(d[2])}`
}

/* 根据实测色亮度决定色块内文字颜色 */
function cellTextClass(hex: string | undefined): string {
  if (!hex || hex.length < 7) return 'cell--light-text'
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? 'cell--dark-text' : 'cell--light-text'
}

export default function PaletteDemo() {
  const rootRef = useRef<HTMLElement | null>(null)
  const [resolved, setResolved] = useState<Record<string, string[]>>({})

  useEffect(() => {
    /* 实测每个色块的渲染背景色：色块自带 data-family / data-index，按属性归集 */
    const next: Record<string, string[]> = {}
    rootRef.current?.querySelectorAll<HTMLElement>('[data-family]').forEach((el) => {
      const family = el.dataset.family!
      const index = Number(el.dataset.index)
      ;(next[family] ??= [])[index] = cssColorToHex(getComputedStyle(el).backgroundColor)
    })
    setResolved(next)
  }, [])

  const renderRow = (family: string, steps: number[]) => (
    <div className="palette-row">
      {steps.map((step, i) => {
        const hex = resolved[family]?.[i]
        return (
          <div
            key={step}
            data-family={family}
            data-index={i}
            className={`palette-cell ${cellTextClass(hex)}`}
            style={{ background: `var(--iflyv-${family}-${step})` }}
            title={`var(--iflyv-${family}-${step}) → ${hex ?? ''}`}
          >
            <span className="palette-cell__step">{step}</span>
            <span className="palette-cell__hex">{hex ?? ''}</span>
          </div>
        )
      })}
    </div>
  )

  return (
    <section className="demo-section demo-plain" ref={rootRef as any}>
      <h2 className="demo-section__title">Palette 基础色板</h2>

      <div className="demo-block">
        {GROUPS.map((g) => (
          <div key={g.key} className="palette-group">
            <div className="palette-group__label">
              <span
                className="palette-group__dot"
                style={{ background: `var(--iflyv-${g.key}-6)` }}
              />
              {g.label}
            </div>
            {renderRow(
              g.key,
              Array.from({ length: 10 }, (_, i) => i + 1),
            )}
          </div>
        ))}

        {/* 灰阶色板：色阶从 0 起，共 11 档 */}
        <div className="palette-group" style={{ marginTop: 'var(--iflyv-spacing-5)' }}>
          <div className="palette-group__label">
            <span
              className="palette-group__dot"
              style={{ background: 'var(--iflyv-gray-6)' }}
            />
            Gray 灰阶
          </div>
          {renderRow(
            'gray',
            Array.from({ length: 11 }, (_, i) => i),
          )}
        </div>
      </div>
    </section>
  )
}
