/** Chart 业务组件类型 */

/** 图表类型：按 display-guide「图表选型」判据选——比大小→bar、看走势→line、看构成→donut */
export type ChartType = 'bar' | 'line' | 'donut'

/** 单序列数据项 */
export interface ChartDatum {
  name: string
  value: number
}

/** 多序列数据（堆积柱 / 多序列柱·线）：与 categories 配套使用 */
export interface ChartSeries {
  name: string
  data: number[]
}
