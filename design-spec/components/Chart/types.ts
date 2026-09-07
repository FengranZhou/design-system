/** Chart 业务组件类型 */

/** 基础图型：形态 = 基础型 × 正交配置（horizontal/stacked/percent/diverging），勿为组合造新类型 */
export type ChartType = 'bar' | 'line' | 'donut' | 'pie' | 'bar-line' | 'waterfall' | 'scatter' | 'radar'

/** 单序列数据项（waterfall 时 value 为增量，可为负） */
export interface ChartDatum {
  name: string
  value: number
}

/** 多序列数据（柱/线/柱线/散点/雷达）：与 categories 或 indicators 配套使用 */
export interface ChartSeries {
  name: string
  /** 常规为 number[]；散点图为 [x, y][] */
  data: number[] | [number, number][]
  /** 仅 bar-line：该序列画柱还是线（默认 bar；line 走右轴） */
  kind?: 'bar' | 'line'
}

/** 雷达图维度（≥3 个；max 缺省时按数据自动放大取整） */
export interface ChartIndicator {
  name: string
  max?: number
}
