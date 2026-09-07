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
 *
 * 【幂等】本函数对自己的输出是幂等的：formatTime(formatTime(t)) === formatTime(t)。
 *   这是为防「双重格式化」而加的保护 —— 某些业务组件（如 DataTable 的 kind:'date' 列）
 *   内部已调用本函数，使用方若在数据层又调一次，省略年份后的 'MM-DD HH:mm'
 *   会被 new Date() 解析到 2001 年，且不报错。
 *   ⚠️ 幂等是**兜底**，不是许可：正确做法仍是「谁渲染谁格式化，数据层传原始时间串」。
 */

/** 展示精度：'minute' 带时分（默认）；'day' 只到日期 */
export type TimePrecision = 'minute' | 'day'

/**
 * 已是本规范输出、且**省略了年份**的形态：MM-DD 或 MM-DD HH:mm。
 * 这类串再喂给 new Date() 会被 JS 当成「无年份」而解析到 2001 年（静默错年份）。
 * 带完整年份的输出（YYYY-MM-DD[ HH:mm]）不在此列 —— 它再解析一次结果不变，天然幂等。
 */
const YEARLESS_OUTPUT = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])( ([01]\d|2[0-3]):[0-5]\d)?$/

export function formatTime(
  input: string | number | Date,
  precision: TimePrecision = 'minute',
): string {
  // 幂等保护：对已格式化过的结果再调一次，原样返回而不是错误解析。
  // ⚠️ 真实翻车：接入方在数据层先调了一次（'2026-08-20 23:59' → '08-20 23:59'），
  //    DataTable 内部按约定又调一次 → new Date('08-20 23:59') 落到 2001 年，
  //    页面显示 '2001-08-20 23:59'，**不报错、不告警**，只能靠眼睛发现。
  //    该形态本就是本函数的输出，原样返回是唯一正确解。
  //    （precision='day' 时需把已带的时分裁掉，否则精度会不受控。）
  if (typeof input === 'string' && YEARLESS_OUTPUT.test(input.trim())) {
    const v = input.trim()
    return precision === 'day' ? v.slice(0, 5) : v
  }

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
