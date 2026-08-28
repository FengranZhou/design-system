/**
 * 通用数字格式化 —— 文案规范「Number 数字」的唯一实现（Single Source of Truth）。
 *
 * 规范（见 demo「文案规范 → Number 数字」）：
 *   · 整数部分从右往左每 3 位打一个英文逗号：5082 → 5,082；1234567 → 1,234,567
 *   · 小数部分原样保留、不分组：12345.67 → 12,345.67
 *   · 负号保留：-5082 → -5,082
 *
 * 任何展示「统计数 / 数量 / 金额」等数字的地方（KPI 指标、图表浮层、详情字段……）
 * 都 import 本函数，不要各自再写一遍或硬编码带逗号的字符串——规范改一处，处处同步。
 *
 * 【幂等】formatNumber(formatNumber(n)) === formatNumber(n)：已带逗号的串会先剥掉再重打。
 * 【不猜】非纯数字输入（含单位、百分号、任意文本）原样返回，不做任何加工——
 *   单位拼接是调用方（或 Chart 源头）的事，本函数只管数字本体。
 */
export function formatNumber(input: number | string): string {
  const raw = String(input).replace(/,/g, '').trim()
  if (!/^[-+]?\d+(\.\d+)?$/.test(raw)) return String(input)
  const [intPart, decPart] = raw.replace(/^\+/, '').split('.')
  const sign = intPart.startsWith('-') ? '-' : ''
  const digits = sign ? intPart.slice(1) : intPart
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return sign + grouped + (decPart !== undefined ? `.${decPart}` : '')
}
