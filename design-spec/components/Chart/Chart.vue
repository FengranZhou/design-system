<!-- ============================================================================
  Chart 图表（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：数据看板 / 统计分析里的图表。选型先按 display-guide「图表选型」判据：
         类目比大小→bar、随时间走势→line、占比构成→donut（扇区 ≤5）；
         只是一个核心数字→别画图，直接用 --iflyv-font-number-display 数字字阶。
  引用：  import { Chart } from '<path>/design-spec/components'
         ⚠ 本组件依赖 echarts（按需引 echarts/core，不全量）——接入方需自装：pnpm add echarts
  用法（形态 = 基础型 × 正交配置，勿为组合造新类型）：
    环形图：  <Chart type="donut" :data="[{ name: '文档', value: 28 }, …]"
                     center-title="104" center-label="课程资源" />
    柱状图：  <Chart type="bar" :data="[{ name: '本学期', value: 41 }, …]" />
    条形图：  <Chart type="bar" horizontal :data="…" />          ← 类目多/名称长时横排
    堆积柱：  <Chart type="bar" stacked :categories="['一班','二班']"
                     :series="[{ name: '选择', data: [40, 35] }, …]" />
    折线图：  <Chart type="line" :data="trend" />（多序列同柱状图传 categories + series）
  props：
    type          'bar' | 'line' | 'donut'   必填。
    data          { name, value }[]          单序列数据（与 categories/series 二选一）。
    categories    string[]                   多序列时的类目轴。
    series        { name, data: number[] }[] 多序列数据（bar/line；自动出图例）。
    horizontal    boolean（仅 bar）          横排 = 条形图（类目多或名称长时用）。
    stacked       boolean（仅 bar 多序列）   堆积柱状图（比多个对象的构成时用）。
    series-name   string（单序列）           序列名：传了就展示图例（规范：单组数据也展示图例）。
    unit          string                     数值单位（'%'/'万'…）：数值轴顶部 + 浮层数值后缀。
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
      环形图分类自动从大到小 12 点起顺时针排。
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
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ChartType, ChartDatum, ChartSeries } from './types'

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = withDefaults(
  defineProps<{
    type: ChartType
    data?: ChartDatum[]
    categories?: string[]
    series?: ChartSeries[]
    horizontal?: boolean
    stacked?: boolean
    /** 单序列的序列名：传了就展示图例（规范：只有一组数据也展示图例，保持多图统一） */
    seriesName?: string
    /** 数值单位（如 '%'、'万'）：展示在数值轴顶部并拼进浮层数值 */
    unit?: string
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
  // tooltip 统一白底浮层（跟随主题令牌）
  const tooltip = {
    backgroundColor: token('--iflyv-bg-panel'),
    borderColor: token('--iflyv-border-subtle'),
    textStyle: { color: token('--iflyv-text-1'), fontSize: 12 },
    // 浮层数值右侧拼单位；结构沿用 ECharts 表格化默认（色点+名称左对齐、数值右对齐）
    valueFormatter: (v: unknown) => `${v}${props.unit ?? ''}`,
  }

  if (props.type === 'donut') {
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
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 14,
        textStyle: { color: token('--iflyv-text-3'), fontSize: 12 },
        formatter: (name: string) => {
          const d = sorted.find((x) => x.name === name)
          if (!d) return name
          return `${name}  ${d.value}（${((d.value / total) * 100).toFixed(2)}%）`
        },
      },
      series: [
        {
          type: 'pie',
          // 环形优先、扇区间留隙、微圆角（display-guide 图形风格）
          radius: ['58%', '78%'],
          center: ['30%', '50%'],
          padAngle: 2,
          itemStyle: { borderRadius: 2 },
          label: { show: false },
          data: sorted,
        },
      ],
    }
  }

  // bar / line 公共坐标系：只留类目轴线，网格虚线最轻档，标签 text-3。
  // horizontal（条形图）时类目轴与数值轴互换
  const multi = !!(props.series && props.series.length)
  const catNames = multi ? (props.categories ?? []) : props.data.map((d) => d.name)
  const categoryAxis = {
    type: 'category',
    data: catNames,
    axisLine: { lineStyle: { color: token('--iflyv-border-default') } },
    axisTick: { show: false },
    axisLabel: { color: token('--iflyv-text-3'), fontSize: 12 },
  }
  const valueAxis = {
    type: 'value',
    // 常规单位可不标；传 unit 则展示在数值轴顶部（双轴/特殊单位场景必标）
    ...(props.unit ? { name: props.unit, nameTextStyle: { color: token('--iflyv-text-3'), fontSize: 12 } } : {}),
    axisLine: { show: false },
    axisLabel: { color: token('--iflyv-text-3'), fontSize: 12 },
    splitLine: { lineStyle: { color: token('--iflyv-border-subtle'), type: 'dashed' } },
  }
  const axes = {
    xAxis: props.horizontal ? valueAxis : categoryAxis,
    yAxis: props.horizontal ? categoryAxis : valueAxis,
    // 多序列出顶部图例，网格给图例让位
    grid: { left: 8, right: 8, top: multi || props.seriesName ? 32 : 16, bottom: 0, containLabel: true },
  }
  // 图例：多序列必出；单序列传 seriesName 也出（规范：只有一组数据也展示图例）。统一顶部横排
  const showLegend = multi || !!props.seriesName
  const cartesianLegend = showLegend
    ? {
        legend: {
          top: 0,
          right: 0,
          icon: 'roundRect',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { color: token('--iflyv-text-3'), fontSize: 12 },
        },
      }
    : {}

  if (props.type === 'bar') {
    // 微圆角只给柱的"末端"：竖排在顶、横排在右；堆积时只有最外层序列有末端
    const capRadius = props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
    const barSeries = multi
      ? props.series!.map((sr, i) => ({
          name: sr.name,
          type: 'bar',
          barWidth: 16,
          stack: props.stacked ? 'total' : undefined,
          itemStyle: {
            borderRadius: props.stacked ? (i === props.series!.length - 1 ? capRadius : 0) : capRadius,
            opacity: 0.9,
          },
          data: sr.data,
        }))
      : [
          {
            name: props.seriesName,
            type: 'bar',
            // 细柱 + 末端微圆角 + 适度透明度，逐类目取色（display-guide 图形风格）
            barWidth: 16,
            colorBy: 'data',
            itemStyle: { borderRadius: capRadius, opacity: 0.9 },
            data: props.data.map((d) => d.value),
          },
        ]
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
      ...axes,
      ...cartesianLegend,
      series: barSeries,
    }
  }

  // line：细线 + 小折点（多序列各一条线）
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

watch(() => [props.type, props.data, props.categories, props.series, props.horizontal, props.stacked, props.seriesName, props.unit, props.option], render, { deep: true })
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
