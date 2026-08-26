<!-- ============================================================================
  Chart 图表（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：数据看板 / 统计分析里的图表。选型先按 display-guide「图表选型」判据 +
         「各图型细则」（数量上限与硬判据）；只是一个核心数字→别画图，
         直接用 --iflyv-font-number-display 数字字阶。
  引用：  import { Chart } from '<path>/design-spec/components'
         ⚠ 本组件依赖 echarts（按需引 echarts/core，不全量）——接入方需自装：pnpm add echarts
  用法（形态 = 基础型 × 正交配置，勿为组合造新类型）：
    环形图：  <Chart type="donut" :data="…" center-title="104" center-label="课程资源" />
    饼状图：  <Chart type="pie" :data="…" />                  ← 环心无信息可放时用饼
    柱状图：  <Chart type="bar" :data="…" series-name="平均分" unit="分" />
    条形图：  <Chart type="bar" horizontal :data="…" />       ← 无序类别 / 类目多名称长
    堆积柱：  <Chart type="bar" stacked :categories="…" :series="…" />
    堆积条：  <Chart type="bar" stacked horizontal :categories="…" :series="…" />
    百分比堆积：<Chart type="bar" stacked percent :categories="…" :series="…" />  ← 只放 2 个序列
    双向柱/条：<Chart type="bar" diverging :categories="…" :series="…" />  ← 恰 2 序列（正负相对）
    柱线图：  <Chart type="bar-line" :categories="…" unit="部" unit2="亿"
                     :series="[{ name: '影片数', data: […] }, { name: '票房', data: […], kind: 'line' }]" />
    瀑布图：  <Chart type="waterfall" :data="…" unit="万" />  ← data.value 为增量（可负），不支持多组
    折线图：  <Chart type="line" :data="…" series-name="出勤率" unit="%" />
    散点图：  <Chart type="scatter" x-unit="体重(kg)" unit="身高(cm)"
                     :series="[{ name: '男生', data: [[62, 172], …] }]" />
    雷达图：  <Chart type="radar" :indicators="[{ name: '出勤' }, …]" :series="…" />  ← 维度 ≥3
  props：
    type          基础型（见上）             必填。
    data          { name, value }[]          单序列数据（与 categories/series 二选一；waterfall 专用）。
    categories    string[]                   多序列时的类目轴。
    series        { name, data, kind? }[]    多序列数据（自动出图例）；散点 data 为 [x,y][]；
                                             kind 仅 bar-line 用（'line' 走右轴）。
    indicators    { name, max? }[]（radar）  雷达维度，≥3 个；max 缺省按数据自动放大。
    horizontal    boolean（仅 bar）          横排 = 条形（无序类别 / 类目多名称长）。
    stacked       boolean（仅 bar 多序列）   堆积（比多个对象的构成时用）。
    percent       boolean（仅 stacked）      百分比堆积：各类目归一化到 100%——只放 2 个序列。
    diverging     boolean（仅 bar 双序列）   双向柱/条：正负相对的数据（收入/支出），恰 2 个序列。
    zoomable      boolean（竖排 bar/line）    横轴点位很多时开启：底部范围选择控件 + 滚轮缩放。
    series-name   string（单序列）           序列名：传了就展示图例（规范：单组数据也展示图例）。
    unit          string                     数值轴单位（'%'/'万'…）：轴顶部 + 浮层数值后缀。
    unit2         string（仅 bar-line）      右轴（折线）单位——双轴两侧都必须标单位。
    x-unit        string（仅 scatter）       横轴单位（散点两轴都必须标单位）。
    height        number，默认 240           图表高度 px；宽度撑满容器。
    center-title  string|number（仅 donut）  环心主数字（number-display-sm 字阶）。
    center-label  string（仅 donut）         环心说明文字。
    option        object                     可选逃生口：在规范默认 option 之上合并覆盖；
                                             仍不够再与设计负责人确认扩展本组件。
  已固化在源头、接入方不用管（这些正是页内手拼 ECharts 的翻车点）：
    · 令牌取色——canvas 读不到 CSS 变量，本组件用 getComputedStyle 取令牌喂 option；
    · 切亮暗主题 / 切品牌色自动重取色重绘（监听 html 的 data-theme / data-brand）；
    · 容器尺寸变化自动 resize；
    · 规范图形风格：细柱微圆角、环形留隙、网格虚线 border-subtle、轴标签/图例 text-3、
      序列配色（绿打头 + 扩展色板第 5 级）、tooltip 白底表格化浮层（bar 悬浮列高亮）、
      环形/饼分类自动从大到小 12 点起顺时针排、瀑布增减色走功能色语义（绿增红减）。
  未纳入（确需使用先与设计负责人确认）：词云（需第三方插件依赖）、韦恩图（ECharts 无实现）、
    热度地图（需地理数据与审图合规）。
  禁止：页内手拼 ECharts option 重写取色/重绘逻辑（Chart 自由度不够时先用 option 覆盖，
        再不够与设计负责人确认，勿绕过本组件另起炉灶）。
  改外观：回本文件源头改，改一次所有引用方同步。
============================================================================ -->
<template>
  <div class="iflyv-chart" :style="{ height: height + 'px' }">
    <div ref="canvasEl" class="iflyv-chart__canvas"></div>
    <!-- 环心数字用 HTML 覆盖层而非 canvas 文本：可直接吃字阶令牌（number-display-sm），
         随字号档位 / 主题自动变，canvas 文本做不到 -->
    <div v-if="type === 'donut' && centerTitle !== undefined" class="iflyv-chart__center">
      <span class="iflyv-chart__center-num">{{ centerTitle }}</span>
      <span v-if="centerLabel" class="iflyv-chart__center-label">{{ centerLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
// 按需注册（不全量 import echarts，控制接入方包体）
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ChartType, ChartDatum, ChartSeries, ChartIndicator } from './types'

echarts.use([BarChart, LineChart, PieChart, ScatterChart, RadarChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer])

const props = withDefaults(
  defineProps<{
    type: ChartType
    data?: ChartDatum[]
    categories?: string[]
    series?: ChartSeries[]
    indicators?: ChartIndicator[]
    horizontal?: boolean
    stacked?: boolean
    percent?: boolean
    diverging?: boolean
    /** 横轴点位很多时开启：底部范围选择控件 + 滚轮缩放（仅竖排 bar/line/bar-line） */
    zoomable?: boolean
    /** 单序列的序列名：传了就展示图例（规范：只有一组数据也展示图例，保持多图统一） */
    seriesName?: string
    /** 数值单位（如 '%'、'万'）：展示在数值轴顶部并拼进浮层数值 */
    unit?: string
    /** 仅 bar-line：右轴（折线）单位 */
    unit2?: string
    /** 仅 scatter：横轴单位 */
    xUnit?: string
    height?: number
    centerTitle?: string | number
    centerLabel?: string
    option?: Record<string, unknown>
  }>(),
  { data: () => [], height: 240 },
)

const canvasEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

/** canvas 读不到 CSS 变量——从根元素取令牌实际色值喂给 option */
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/** 序列配色：固定绿色打头（不随品牌切换——图表配色全站恒定）+ 扩展色板，
    统一取第 5 级（比语义强调档柔和一档），最多 6 色（display-guide 数据可视化·配色） */
const SERIES_COLOR_TOKENS = [
  '--iflyv-green-5',
  '--iflyv-blue-5',
  '--iflyv-orange-5',
  '--iflyv-cyan-5',
  '--iflyv-geekblue-5',
  '--iflyv-red-5',
]

function buildOption(): Record<string, unknown> {
  const colors = SERIES_COLOR_TOKENS.map(token)
  const textColor = token('--iflyv-text-3')
  const withUnit = (v: unknown) => `${v}${props.unit ?? ''}`
  // tooltip 统一白底表格化浮层（跟随主题令牌；色点+名称左对齐、数值右对齐为 ECharts 默认结构）
  const tooltip = {
    backgroundColor: token('--iflyv-bg-panel'),
    borderColor: token('--iflyv-border-subtle'),
    textStyle: { color: token('--iflyv-text-1'), fontSize: 12 },
    valueFormatter: withUnit,
  }
  const legendStyle = {
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: textColor, fontSize: 12 },
  }

  // ── 环形 / 饼状：单组占比 ─────────────────────────────────────────────
  if (props.type === 'donut' || props.type === 'pie') {
    // 分类从大到小、12 点方向顺时针排（Web 图表设计指南硬规则，固化源头下游免记）
    const sorted = [...props.data].sort((a, b) => b.value - a.value)
    const total = sorted.reduce((s, d) => s + d.value, 0) || 1
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'item' },
      // 图例右侧纵排：名称 + 数值（占比），文字走 text-3（图例不与正文争夺权重）
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'middle',
        itemGap: 14,
        ...legendStyle,
        formatter: (name: string) => {
          const d = sorted.find((x) => x.name === name)
          if (!d) return name
          return `${name}  ${d.value}（${((d.value / total) * 100).toFixed(2)}%）`
        },
      },
      series: [
        {
          type: 'pie',
          // 环形优先、扇区间留隙、微圆角（display-guide 图形风格）；饼状 = 环心无信息可放时
          radius: props.type === 'pie' ? [0, '72%'] : ['58%', '78%'],
          center: ['30%', '50%'],
          padAngle: 2,
          itemStyle: { borderRadius: 2 },
          label: { show: false },
          data: sorted,
        },
      ],
    }
  }

  // ── 雷达：多维度比较（维度 ≥3）─────────────────────────────────────────
  if (props.type === 'radar') {
    const seriesList = props.series ?? []
    const allValues = seriesList.flatMap((s) => s.data as number[])
    const autoMax = Math.ceil((Math.max(...allValues, 1) * 1.2) / 10) * 10
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'item' },
      legend: { top: 0, right: 0, ...legendStyle },
      radar: {
        indicator: (props.indicators ?? []).map((i) => ({ name: i.name, max: i.max ?? autoMax })),
        radius: '62%',
        center: ['50%', '55%'],
        axisName: { color: textColor, fontSize: 12 },
        axisLine: { lineStyle: { color: token('--iflyv-border-subtle') } },
        splitLine: { lineStyle: { color: token('--iflyv-border-subtle') } },
        splitArea: { show: false },
      },
      series: [
        {
          type: 'radar',
          symbolSize: 4,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.08 },
          data: seriesList.map((s) => ({ name: s.name, value: s.data })),
        },
      ],
    }
  }

  // ── 散点：变量相互影响程度（两轴都必须标单位）───────────────────────────
  if (props.type === 'scatter') {
    const seriesList = props.series ?? []
    const showLegend = seriesList.length > 1 || !!seriesList[0]?.name
    const numAxis = (unitName?: string) => ({
      type: 'value',
      scale: true,
      ...(unitName ? { name: unitName, nameTextStyle: { color: textColor, fontSize: 12 } } : {}),
      axisLine: { show: false },
      axisLabel: { color: textColor, fontSize: 12 },
      splitLine: { lineStyle: { color: token('--iflyv-border-subtle'), type: 'dashed' } },
    })
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'item' },
      ...(showLegend ? { legend: { top: 0, right: 0, ...legendStyle } } : {}),
      xAxis: numAxis(props.xUnit),
      yAxis: numAxis(props.unit),
      grid: { left: 8, right: 16, top: showLegend ? 32 : 16, bottom: 0, containLabel: true },
      series: seriesList.map((s) => ({ name: s.name, type: 'scatter', symbolSize: 8, itemStyle: { opacity: 0.75 }, data: s.data })),
    }
  }

  // ── 直角坐标系公共部分（bar / line / bar-line / waterfall）──────────────
  const multi = !!(props.series && props.series.length)
  const catNames = multi || props.type === 'bar-line' ? (props.categories ?? []) : props.data.map((d) => d.name)
  const categoryAxis = {
    type: 'category',
    data: catNames,
    axisLine: { lineStyle: { color: token('--iflyv-border-default') } },
    axisTick: { show: false },
    axisLabel: { color: textColor, fontSize: 12 },
  }
  const valueAxis = {
    type: 'value',
    // 常规单位可不标；传 unit 则展示在数值轴顶部（双轴/特殊单位场景必标）
    ...(props.unit || props.percent
      ? { name: props.percent ? '%' : props.unit, nameTextStyle: { color: textColor, fontSize: 12 } }
      : {}),
    ...(props.percent ? { max: 100 } : {}),
    // 双向图数值轴刻度取绝对值（第二序列内部取负只为方向，不是负数语义）
    axisLabel: props.diverging
      ? { color: textColor, fontSize: 12, formatter: (v: number) => `${Math.abs(v)}` }
      : { color: textColor, fontSize: 12 },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: token('--iflyv-border-subtle'), type: 'dashed' } },
  }
  // 横轴点位很多时的范围控件：底部 slider + 滚轮缩放（仅竖排类目轴场景）
  const zoomOn = props.zoomable && !props.horizontal
  const dataZoom = zoomOn
    ? {
        dataZoom: [
          {
            type: 'slider',
            height: 20,
            bottom: 4,
            borderColor: token('--iflyv-border-subtle'),
            fillerColor: token('--iflyv-blue-1'),
            handleStyle: { color: token('--iflyv-bg-panel'), borderColor: token('--iflyv-border-strong') },
            dataBackground: {
              lineStyle: { color: token('--iflyv-border-default') },
              areaStyle: { color: token('--iflyv-border-subtle') },
            },
            textStyle: { color: textColor, fontSize: 11 },
          },
          { type: 'inside' },
        ],
      }
    : {}
  const axes = {
    xAxis: props.horizontal ? valueAxis : categoryAxis,
    yAxis: props.horizontal ? categoryAxis : valueAxis,
    grid: { left: 8, right: 8, top: multi || props.seriesName ? 32 : 16, bottom: zoomOn ? 36 : 0, containLabel: true },
    ...dataZoom,
  }
  // 图例：多序列必出；单序列传 seriesName 也出（规范：只有一组数据也展示图例）。统一顶部横排
  const showLegend = multi || !!props.seriesName
  const cartesianLegend = showLegend ? { legend: { top: 0, right: 0, ...legendStyle } } : {}
  // 微圆角只给柱的"末端"：竖排在顶、横排在右
  const capRadius = props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]

  // ── 柱线图：不同性质数据的相关关系（双轴，柱=重要数据对应左轴）───────────
  if (props.type === 'bar-line') {
    const seriesList = props.series ?? []
    const rightAxis = {
      type: 'value',
      // 双轴两侧顶部都必须标单位
      ...(props.unit2 ? { name: props.unit2, nameTextStyle: { color: textColor, fontSize: 12 } } : {}),
      axisLine: { show: false },
      axisLabel: { color: textColor, fontSize: 12 },
      splitLine: { show: false },
    }
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: tooltip.backgroundColor, borderColor: tooltip.borderColor, textStyle: tooltip.textStyle },
      legend: { top: 0, right: 0, ...legendStyle },
      xAxis: categoryAxis,
      yAxis: [valueAxis, rightAxis],
      grid: { left: 8, right: 8, top: 32, bottom: zoomOn ? 36 : 0, containLabel: true },
      ...dataZoom,
      series: seriesList.map((s) =>
        s.kind === 'line'
          ? { name: s.name, type: 'line', yAxisIndex: 1, lineStyle: { width: 2 }, symbolSize: 6, data: s.data }
          : { name: s.name, type: 'bar', barWidth: 16, itemStyle: { borderRadius: capRadius, opacity: 0.9 }, data: s.data },
      ),
    }
  }

  // ── 瀑布图：增量趋势 + 总量（不支持多组；增减走功能色语义：绿增红减）─────
  if (props.type === 'waterfall') {
    const inc = props.data.map((d) => d.value)
    const bases: number[] = []
    let cum = 0
    for (const v of inc) {
      bases.push(v >= 0 ? cum : cum + v)
      cum += v
    }
    let cum2 = 0
    const cumulative = inc.map((v) => (cum2 += v))
    const green = token('--iflyv-green-5')
    const red = token('--iflyv-red-5')
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: tooltip.backgroundColor,
        borderColor: tooltip.borderColor,
        textStyle: tooltip.textStyle,
        // 浮层展示 增量 + 累计（跳过透明垫底序列）
        formatter: (params: { dataIndex: number }[]) => {
          const i = params[0]?.dataIndex ?? 0
          const v = inc[i]
          return `${props.data[i]?.name ?? ''}<br/>增量：${v >= 0 ? '+' : '-'}${withUnit(Math.abs(v))}<br/>累计：${withUnit(cumulative[i])}`
        },
      },
      xAxis: categoryAxis,
      yAxis: valueAxis,
      grid: { left: 8, right: 8, top: 16, bottom: 0, containLabel: true },
      series: [
        // 透明垫底：把增量柱抬到累计位置
        { type: 'bar', stack: 'wf', silent: true, itemStyle: { color: 'transparent' }, emphasis: { itemStyle: { color: 'transparent' } }, data: bases },
        {
          type: 'bar',
          stack: 'wf',
          barWidth: 16,
          data: inc.map((v) => ({
            value: Math.abs(v),
            itemStyle: { color: v >= 0 ? green : red, borderRadius: capRadius, opacity: 0.9 },
          })),
        },
      ],
    }
  }

  // ── 柱状 / 条形 / 堆积 / 百分比堆积 / 双向 ─────────────────────────────
  if (props.type === 'bar') {
    let seriesData = props.series ?? []
    // 百分比堆积：各类目归一化到 100%（只关心比例不关心总量；只放 2 个序列）
    if (multi && props.stacked && props.percent) {
      const totals = catNames.map((_, i) => seriesData.reduce((s, sr) => s + ((sr.data as number[])[i] ?? 0), 0) || 1)
      seriesData = seriesData.map((sr) => ({ ...sr, data: (sr.data as number[]).map((v, i) => +((v / totals[i]) * 100).toFixed(1)) }))
    }
    // 双向：恰 2 个序列，第二序列取负从零轴反向展开
    if (multi && props.diverging) {
      seriesData = seriesData.map((sr, i) => (i === 1 ? { ...sr, data: (sr.data as number[]).map((v) => -v) } : sr))
    }
    const stackOn = props.stacked || props.diverging
    const pctUnit = (v: unknown) => (props.percent ? `${v}%` : withUnit(v))
    const divAbs = (v: unknown) => pctUnit(Math.abs(Number(v)))
    const barSeries = multi
      ? seriesData.map((sr, i) => ({
          name: sr.name,
          type: 'bar',
          barWidth: 16,
          stack: stackOn ? 'total' : undefined,
          itemStyle: {
            // 堆积时只有最外层序列有"末端"圆角；双向两端各自有末端
            borderRadius: props.diverging
              ? i === 0
                ? capRadius
                : props.horizontal
                  ? [4, 0, 0, 4]
                  : [0, 0, 4, 4]
              : stackOn
                ? i === seriesData.length - 1
                  ? capRadius
                  : 0
                : capRadius,
            opacity: 0.9,
          },
          data: sr.data,
        }))
      : [
          {
            name: props.seriesName,
            type: 'bar',
            // 细柱 + 末端微圆角 + 适度透明度；单序列一色——颜色编码"序列"而非"类目"，
            // 同一指标的柱子五颜六色不携带信息、还与图例矛盾
            barWidth: 16,
            itemStyle: { borderRadius: capRadius, opacity: 0.9 },
            data: props.data.map((d) => d.value),
          },
        ]
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: props.diverging ? divAbs : pctUnit },
      ...axes,
      ...cartesianLegend,
      series: barSeries,
    }
  }

  // ── 折线：细线 + 小折点（多序列各一条线，≤4 条）────────────────────────
  const lineSeries = multi
    ? props.series!.map((sr) => ({ name: sr.name, type: 'line', lineStyle: { width: 2 }, symbolSize: 6, data: sr.data }))
    : [{ name: props.seriesName, type: 'line', lineStyle: { width: 2 }, symbolSize: 6, data: props.data.map((d) => d.value) }]
  return {
    backgroundColor: 'transparent',
    color: colors,
    tooltip: { ...tooltip, trigger: 'axis' },
    ...axes,
    ...cartesianLegend,
    series: lineSeries,
  }
}

function render() {
  if (!chart) return
  chart.setOption(buildOption(), { notMerge: true })
  // 逃生口：接入方 option 合并在规范默认之上
  if (props.option) chart.setOption(props.option)
}

// —— 主题 / 品牌切换自动重取色重绘（canvas 不会跟随 CSS 变量自己变）——
let themeObserver: MutationObserver | null = null
// —— 容器尺寸变化自动 resize ——
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!canvasEl.value) return
  chart = echarts.init(canvasEl.value)
  render()
  themeObserver = new MutationObserver(render)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-brand'] })
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(canvasEl.value)
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})

watch(
  () => [props.type, props.data, props.categories, props.series, props.indicators, props.horizontal, props.stacked, props.percent, props.diverging, props.zoomable, props.seriesName, props.unit, props.unit2, props.xUnit, props.option],
  render,
  { deep: true },
)
</script>

<style scoped>
/* 自己骨架的排版（铁律 3：只装扮自己的盒子） */
.iflyv-chart {
  position: relative;
  width: 100%;
}
.iflyv-chart__canvas {
  width: 100%;
  height: 100%;
}
/* 环心覆盖层：定位对齐 pie center（30%/50%），文字走字阶令牌 */
.iflyv-chart__center {
  position: absolute;
  left: 30%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.iflyv-chart__center-num {
  font: var(--iflyv-font-number-display-sm);
  color: var(--iflyv-text-1);
}
.iflyv-chart__center-label {
  font: var(--iflyv-font-body-min);
  color: var(--iflyv-text-3);
}
</style>
