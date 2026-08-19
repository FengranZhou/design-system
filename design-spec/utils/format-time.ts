/**
 * 通用时间格式化 —— 文案规范「Time 通用时间」的唯一实现（Single Source of Truth）。
 *
 * 规范（见 demo「文案规范 → Time 通用时间」）：
 *   · 本年内：省略年份            如 03-25 13:00 / 03-25
 *   · 非本年：展示完整年份        如 2024-12-21 13:00 / 2024-12-21
 *   · 精度：**时间根据需求展示** —— 需要时分才带，不需要则只给日期；
 *           带的时候精确至分钟即可，一律不展示秒。
 *
 * 任何需要展示「通用时间」的地方（Timeline、列表时间列、卡片时间戳……）都 import 本函数，
 * 不要各自再写一遍或硬编码日期字符串——规范改一处，处处同步。
 */

/** 展示精度：'minute' 带时分（默认）；'day' 只到日期 */
export type TimePrecision = 'minute' | 'day'

export function formatTime(
  input: string | number | Date,
  precision: TimePrecision = 'minute',
): string {
  const d = new Date(input)
  const pad = (n: number) => String(n).padStart(2, '0')
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const isThisYear = d.getFullYear() === new Date().getFullYear()

  const date = isThisYear
    ? `${month}-${day}`
    : `${d.getFullYear()}-${month}-${day}`

  // 只到日期：不拼时分。传入纯日期字符串（如 '2024-03-15'）时尤其重要——
  // 否则会补出一个并不存在的 00:00，等于凭空捏造精度。
  if (precision === 'day') return date

  return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
