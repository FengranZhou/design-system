import { useEffect, useRef, useState, type RefObject } from 'react'
import { message } from 'antd'

/**
 * Token 演示组件共享逻辑 —— 与 demo/src/components/token/useTokens.ts 对位。
 *
 * - 实时把 CSS 变量解析成显示值（rawValues：圆角/间距/字重/动效等；swatchValues：色板 hex）
 * - copyToken：点击复制 var(--xxx)
 *
 * 与 EP 版的差异：antd3 版 demo 暂无品牌色/亮暗切换，故不监听 html 上的
 * data-theme / data-brand 变化，只在挂载后解析一次。
 */

const PALETTE_FAMILIES = [
  'gray',
  'green',
  'red',
  'orange',
  'blue',
  'geekblue',
  'yellow',
  'cyan',
  'purple',
  'magenta',
]

function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/)
  if (!m) return rgb
  const hex = [m[1], m[2], m[3]]
    .map((n) => (+n).toString(16).padStart(2, '0').toUpperCase())
    .join('')
  if (m[4] !== undefined && +m[4] < 1) return `#${hex} ${Math.round(+m[4] * 100)}%`
  return `#${hex}`
}

export function copyToken(name: string) {
  navigator.clipboard.writeText(`var(${name})`).then(() => {
    message.success(`已复制 var(${name})`)
  })
}

/**
 * @param rawTokenNames 需要解析原始值的 token 名列表（圆角/间距/字重/动效）
 * @returns rootRef 需挂到组件根元素上，供 querySelector [data-swatch] 反查色值
 */
export function useTokenValues(rawTokenNames: string[] = []) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [rawValues, setRawValues] = useState<Record<string, string>>({})
  const [swatchValues, setSwatchValues] = useState<Record<string, string>>({})
  const [sourceLabels, setSourceLabels] = useState<Record<string, string>>({})

  // 依赖用 join 后的字符串：调用方常写 tokens.map(t => t.name)，
  // 数组每次渲染都是新引用，直接进依赖会死循环
  const namesKey = rawTokenNames.join(',')

  useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement)

    const raw: Record<string, string> = {}
    for (const name of rawTokenNames) {
      raw[name] = rootStyle.getPropertyValue(name).trim()
    }
    setRawValues(raw)

    const sw: Record<string, string> = {}
    rootRef.current?.querySelectorAll<HTMLElement>('[data-swatch]').forEach((el) => {
      const name = el.dataset.swatch!
      const cs = getComputedStyle(el)
      sw[name] = cs.backgroundImage !== 'none' ? '渐变' : rgbToHex(cs.backgroundColor)
    })
    setSwatchValues(sw)

    /* hex → 色板色阶名（gray 为 0-10，其余 1-10），供语义色反查来源 */
    const stepByHex: Record<string, string> = {}
    for (const family of PALETTE_FAMILIES) {
      for (let i = family === 'gray' ? 0 : 1; i <= 10; i++) {
        const hex = rootStyle.getPropertyValue(`--iflyv-${family}-${i}`).trim().toUpperCase()
        if (hex && !(hex in stepByHex)) stepByHex[hex] = `${family}-${i}`
      }
    }
    const src: Record<string, string> = {}
    for (const [name, hex] of Object.entries(sw)) {
      const step = stepByHex[hex]
      if (step) src[name] = step
    }
    setSourceLabels(src)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namesKey])

  return { rootRef: rootRef as RefObject<any>, rawValues, swatchValues, sourceLabels }
}
