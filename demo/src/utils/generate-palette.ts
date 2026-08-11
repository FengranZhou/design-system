/**
 * Ant Design 色板生成算法（@ant-design/colors 的 generate 实现）
 * ---------------------------------------------------------------------------
 * 用途：demo 的「自定义品牌色」需要在运行时把用户选的一个主色扩展成 10 阶色板，
 *      再喂给 design-token 的 --iflyv-accent-1~10。
 *
 * 为什么内联算法而非装包：这是确定性的公开算法，输出已与 brands.scss 顶部注释里
 * 的示例色板逐值比对一致；内联可避免 demo 多一个运行时依赖。
 *
 * ⚠ 预置品牌色（green / school-red / science-blue）走的是 scss 侧 register-brand
 *   静态注册，不经过本文件。本文件只服务「运行时自定义色」这一条路径。
 */

interface Hsv {
  h: number
  s: number
  v: number
}

const hueStep = 2
const saturationStep = 0.16
const saturationStep2 = 0.05
const brightnessStep1 = 0.05
const brightnessStep2 = 0.15
const lightColorCount = 5
const darkColorCount = 4

/**
 * 暗色板曲线：明度 / 饱和度逐阶模板，实测自 palette-dark.scss 的 green 暗板。
 *
 * ⚠ 不用 AntD 自带的暗色算法——它输出的亮度走向是「先升后降」（峰值在第 3 阶），
 *   与本设计系统「1 最深 → 10 最浅、第 6 阶为饱和主色」的约定冲突，会让 accent-6
 *   掉到接近背景色的暗档，暗色下主色几乎看不出来。
 */
const DARK_LIGHTNESS = [0.12, 0.16, 0.2, 0.24, 0.31, 0.37, 0.47, 0.58, 0.69, 0.82]
const DARK_SATURATION = [0.21, 0.38, 0.43, 0.52, 0.59, 0.64, 0.46, 0.44, 0.44, 0.38]
/** 模板取自 green，其主色饱和度为此值；换色时按比例缩放到目标色自身的饱和度 */
const DARK_TEMPLATE_BASE_SATURATION = 0.67

function hexToHsv(hex: string): Hsv {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : d / max, v: max }
}

function hsvToHex({ h, s, v }: Hsv): string {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r: number
  let g: number
  let b: number
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s, l }
}

function hslToHex({ h, s, l }: { h: number; s: number; l: number }): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r: number
  let g: number
  let b: number
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function getHue(hsv: Hsv, i: number, light?: boolean): number {
  let hue: number
  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    hue = light ? Math.round(hsv.h) - hueStep * i : Math.round(hsv.h) + hueStep * i
  } else {
    hue = light ? Math.round(hsv.h) + hueStep * i : Math.round(hsv.h) - hueStep * i
  }
  if (hue < 0) hue += 360
  if (hue >= 360) hue -= 360
  return hue
}

function getSaturation(hsv: Hsv, i: number, light?: boolean): number {
  if (hsv.h === 0 && hsv.s === 0) return hsv.s
  let saturation: number
  if (light) saturation = hsv.s - saturationStep * i
  else if (i === darkColorCount) saturation = hsv.s + saturationStep
  else saturation = hsv.s + saturationStep2 * i
  if (saturation > 1) saturation = 1
  if (light && i === lightColorCount && saturation > 0.1) saturation = 0.1
  if (saturation < 0.06) saturation = 0.06
  return Number(saturation.toFixed(2))
}

function getValue(hsv: Hsv, i: number, light?: boolean): number {
  let value: number
  if (light) value = hsv.v + brightnessStep1 * i
  else value = hsv.v - brightnessStep2 * i
  if (value > 1) value = 1
  return Number(value.toFixed(2))
}

/**
 * 由一个主色生成 10 阶色板（主色落在第 6 阶 = accent-6）
 * @param color 主色 hex，如 '#0077FF'
 * @param opts.theme 'dark' 时生成暗色板（1 最深 → 10 最浅，第 6 阶为饱和主色）
 */
export function generatePalette(
  color: string,
  opts: { theme?: 'dark' } = {},
): string[] {
  const patterns: string[] = []
  const pColor = hexToHsv(color)
  for (let i = lightColorCount; i > 0; i -= 1) {
    patterns.push(
      hsvToHex({
        h: getHue(pColor, i, true),
        s: getSaturation(pColor, i, true),
        v: getValue(pColor, i, true),
      }),
    )
  }
  patterns.push(hsvToHex(pColor))
  for (let i = 1; i <= darkColorCount; i += 1) {
    patterns.push(
      hsvToHex({
        h: getHue(pColor, i),
        s: getSaturation(pColor, i),
        v: getValue(pColor, i),
      }),
    )
  }
  if (opts.theme === 'dark') {
    // 暗色：固定色相，按模板曲线铺明度/饱和度（见 DARK_LIGHTNESS 注释说明为何不用 AntD 暗色算法）
    const base = hexToHsl(color)
    const satScale = base.s / DARK_TEMPLATE_BASE_SATURATION
    return DARK_LIGHTNESS.map((l, i) =>
      hslToHex({
        h: base.h,
        s: Math.min(1, DARK_SATURATION[i] * satScale),
        l,
      }).toUpperCase(),
    )
  }
  return patterns.map((c) => c.toUpperCase())
}
