/**
 * 通用时间格式化 —— 文案规范「Time 通用时间」的唯一实现（Single Source of Truth）。
 *
 * 规范（见 demo「文案规范 → Time 通用时间」）：
 *   · 本年内：省略年份，展示 MM-DD HH:mm      如 03-25 13:00
 *   · 非本年：展示完整年份，YYYY-MM-DD HH:mm  如 2024-12-21 13:00
 *   · 精度：精确至分钟即可，不展示秒
 *
 * 任何需要展示「通用时间」的地方（Timeline、列表时间列、卡片时间戳……）都 import 本函数，
 * 不要各自再写一遍或硬编码日期字符串——规范改一处，处处同步。
 */
export function formatTime(input: string | number | Date): string {
  const d = new Date(input)
  const pad = (n: number) => String(n).padStart(2, '0')
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hour = pad(d.getHours())
  const minute = pad(d.getMinutes())
  const isThisYear = d.getFullYear() === new Date().getFullYear()
  return isThisYear
    ? `${month}-${day} ${hour}:${minute}`
    : `${d.getFullYear()}-${month}-${day} ${hour}:${minute}`
}
