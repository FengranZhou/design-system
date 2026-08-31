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
                                             ← 超 5 类源头自动并「其他」（保留前 4 大类，「其他」恒排末位）
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
    title         string                     图表标题：传了就在图表内渲染（左上）；横排图例自动与
                                             标题同行右侧垂直居中（规范）——禁在图表上方自拼标题行。
    title-level   'component'（默认）        标题字阶按**该图在页面里的层级**取档，不是图表自带属性：
                  | 'module' | 'regular'     卡片内一张图＝component；独占一个模块分区＝module/regular。
    data          { name, value }[]          单序列数据（与 categories/series 二选一；waterfall 专用）。
    categories    string[]                   多序列时的类目轴。
    series        { name, data, kind? }[]    多序列数据（自动出图例）；散点 data 为 [x,y][]；
                                             kind 仅 bar-line 用（'line' 走右轴）。
    indicators    { name, max? }[]（radar）  雷达维度，≥3 个；max 缺省按数据自动放大。
    horizontal    boolean（仅 bar）          横排 = 条形（无序类别 / 类目多名称长）。
    stacked       boolean（仅 bar 多序列）   堆积（比多个对象的构成时用）。
    percent       boolean（仅 stacked）      百分比堆积：各类目归一化到 100%——只放 2 个序列。
    diverging     boolean（仅 bar 双序列）   双向柱/条：正负相对的数据（收入/支出），恰 2 个序列。
    zoomable      boolean（竖排 bar/line）    横轴点位 >12 开启、≤12 不开：底部范围选择控件 + 滚轮缩放。
    series-name   string（单序列）           序列名：传了就展示图例（规范：单组数据也展示图例）。
    unit          string                     数值轴单位（'%'/'万'…）：轴顶部 + 浮层数值后缀。
    unit2         string（仅 bar-line）      右轴（折线）单位——双轴两侧都必须标单位。
    x-unit        string（仅 scatter）       横轴单位（散点两轴都必须标单位）。
    height        number，默认 240           绘图区高度 px（标题/图例头行在其上另计）；宽度撑满容器。
    center-title  string|number（仅 donut）  环心主数字（number-display-sm 字阶）。
    center-label  string（仅 donut）         环心说明文字。
    option        object                     可选逃生口：在规范默认 option 之上合并覆盖；
                                             仍不够再与设计负责人确认扩展本组件。
  已固化在源头、接入方不用管（这些正是页内手拼 ECharts 的翻车点）：
    · 令牌取色——canvas 读不到 CSS 变量，本组件用 getComputedStyle 取令牌喂 option；
    · 切亮暗主题 / 切品牌色自动重取色重绘（监听 html 的 data-theme / data-brand）；
    · 容器尺寸变化自动 resize；
    · 规范图形风格：细柱微圆角、环形留隙、网格虚线 border-subtle、轴标签 text-3 / 图例 text-1、
      序列配色（蓝打头 + 扩展色板第 5 级）、标题行与图例同行右侧垂直居中（传 title 即得）、
      tooltip 白底表格化浮层（bar 悬浮列高亮）、
      环形/饼分类自动从大到小 12 点起顺时针排、瀑布增减色走功能色语义（绿增红减）。
  未纳入（确需使用先与设计负责人确认）：词云（需第三方插件依赖）、韦恩图（ECharts 无实现）、
    热度地图（需地理数据与审图合规）。
  禁止：页内手拼 ECharts option 重写取色/重绘逻辑（Chart 自由度不够时先用 option 覆盖，
        再不够与设计负责人确认，勿绕过本组件另起炉灶）。
  改外观：回本文件源头改，改一次所有引用方同步。
============================================================================ -->
<template>
  <!-- height 只作用于绘图区（__body）：标题/图例头行在其上另计，不挤占画布 -->
  <div class="iflyv-chart">
    <!-- 标题与横排图例同处一个 flex 行：垂直居中是布局事实，不再依赖 canvas 内像素偏移估算；
         图例过多放不下时收纳成「+N」（头行高度恒定），点开 el-dropdown 面板查看并开关其余序列 -->
    <div v-if="title || legendItems.length" class="iflyv-chart__head">
      <span v-if="title" class="iflyv-chart__title" :class="titleLevel !== 'component' && `iflyv-chart__title--${titleLevel}`">{{ title }}</span>
      <div v-if="legendItems.length" class="iflyv-chart__legend">
        <button
          v-for="it in visibleLegendItems"
          :key="it.name"
          type="button"
          class="iflyv-chart__legend-item"
          :class="{ 'is-off': legendOff[it.name] }"
          @click="toggleLegend(it.name)"
          @mouseenter="hoverSeries(it.name, true)"
          @mouseleave="hoverSeries(it.name, false)"
        >
          <i class="iflyv-chart__legend-dot" :style="{ background: it.color }"></i>{{ it.name }}
        </button>
        <el-dropdown v-if="hiddenLegendItems.length" trigger="hover" :hide-on-click="false" @command="toggleLegend">
          <button type="button" class="iflyv-chart__legend-item iflyv-chart__legend-more">+{{ hiddenLegendItems.length }}</button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="it in hiddenLegendItems" :key="it.name" :command="it.name">
                <span class="iflyv-chart__legend-option" :class="{ 'is-off': legendOff[it.name] }">
                  <i class="iflyv-chart__legend-dot" :style="{ background: it.color }"></i>{{ it.name }}
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="iflyv-chart__body" :style="{ height: height + 'px' }">
      <div ref="canvasEl" class="iflyv-chart__canvas"></div>
      <!-- 环心数字用 HTML 覆盖层而非 canvas 文本：可直接吃字阶令牌（number-display-sm），
           随字号档位 / 主题自动变，canvas 文本做不到 -->
      <div v-if="type === 'donut' && centerTitle !== undefined" class="iflyv-chart__center">
        <span class="iflyv-chart__center-num">{{ formatNumber(centerTitle) }}</span>
        <span v-if="centerLabel" class="iflyv-chart__center-label">{{ centerLabel }}</span>
      </div>
      <!-- 环/饼的纵排图例（HTML 而非 canvas：hover 灰底 / 点击开关复用横排图例同套交互）。
           名称按最长名称定宽，数值列左对齐 -->
      <div v-if="pieRows.length" class="iflyv-chart__legend-v">
        <button
          v-for="it in pieRows"
          :key="it.name"
          type="button"
          class="iflyv-chart__legend-item"
          :class="{ 'is-off': legendOff[it.name] }"
          @click="toggleLegend(it.name)"
          @mouseenter="hoverPieItem(it.name, true)"
          @mouseleave="hoverPieItem(it.name, false)"
        >
          <i class="iflyv-chart__legend-dot" :style="{ background: it.color }"></i>
          <span class="iflyv-chart__legend-vname" :style="{ width: pieNameW + 'px' }">{{ it.name }}</span>
          <span class="iflyv-chart__legend-vval">{{ it.val }}<span class="iflyv-chart__legend-vpct"> ({{ it.pct }})</span></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
// 按需注册（不全量 import echarts，控制接入方包体）
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ChartType, ChartDatum, ChartSeries, ChartIndicator } from './types'
// 数字千分位走文案规范唯一实现（references/copywriting/number.md）——浮层/图例/环心数字在源头接好，调用方免处理
import { formatNumber } from '../../utils/format-number'

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
    /** 横轴点位 >12 开启、≤12 不开：底部范围选择控件 + 滚轮缩放（仅竖排 bar/line/bar-line） */
    zoomable?: boolean
    /** 图表标题：传了就在图表内渲染标题行（左侧）——图例同行右侧垂直居中（规范固化） */
    title?: string
    /** 标题层级：按该图表在页面里的位置取档，不是图表自带属性。
     *  component（默认）=卡片内的一张图 / module=独占一个模块分区 / regular=常规标题层 */
    titleLevel?: 'component' | 'module' | 'regular'
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
  { data: () => [], height: 240, titleLevel: 'component' },
)

const canvasEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// —— 横排图例：不画进 canvas，渲染在标题行右侧（HTML）——
// canvas 内图例与 HTML 标题的垂直对齐只能靠像素估算，字号一变就错位；
// 挪进同一个 flex 行后居中是布局事实，且图例过多时自动换行、绘图区自动让位。
// 环形/饼保留 canvas 纵排图例（带数值占比、与圆心天然同轴，无对齐痛点）。
const H_LEGEND_TYPES = ['bar', 'line', 'bar-line', 'scatter', 'radar']
const legendItems = ref<{ name: string; color: string }[]>([])
const legendOff = ref<Record<string, boolean>>({})
// 横排图例（legendItems）与环/饼纵排图例（pieRows）二者只会有其一非空，合并映射即可通吃
const legendSelected = () => Object.fromEntries([...legendItems.value, ...pieRows.value].map((it) => [it.name, !legendOff.value[it.name]]))

// —— 环形/饼的纵排图例（同为 HTML，canvas 图例给不了 hover 反馈）——
// 行数据在 buildOption 的 donut/pie 分支填充（含「其他」归并后的顺序与配色）；
// pieNameW = 最长名称估宽 + 10，名称定宽后数值列自然左对齐
const pieRows = ref<{ name: string; color: string; val: string; pct: string }[]>([])
const pieNameW = ref(0)

// hover 图例 → 图中对应元素高亮：canvas 图例自带这层联动，HTML 图例须手动派发。
// 横排图例按系列名高亮（seriesName）；环/饼按数据项名高亮（seriesIndex + name）
const hoverSeries = (name: string, on: boolean) => chart?.dispatchAction({ type: on ? 'highlight' : 'downplay', seriesName: name })
const hoverPieItem = (name: string, on: boolean) => chart?.dispatchAction({ type: on ? 'highlight' : 'downplay', seriesIndex: 0, name })
function toggleLegend(name: string) {
  legendOff.value = { ...legendOff.value, [name]: !legendOff.value[name] }
  chart?.setOption({ legend: { selected: legendSelected() } })
}

/** canvas 读不到 CSS 变量——从根元素取令牌实际色值喂给 option */
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/** 6 位 hex 令牌色 → 带透明度的 rgba（canvas 渐变 / 高亮层需要；非 hex 原样返回） */
const hexA = (c: string, a: number) => {
  const m = c.match(/^#([0-9a-fA-F]{6})$/)
  if (!m) return c
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

/** 序列配色：固定蓝色打头（不随品牌切换——图表配色全站恒定）+ 扩展色板，
    统一取第 5 级（比语义强调档柔和一档），最多 6 色（display-guide 数据可视化·配色） */
const SERIES_COLOR_TOKENS = [
  '--iflyv-blue-5',
  '--iflyv-green-5',
  '--iflyv-orange-5',
  '--iflyv-cyan-5',
  '--iflyv-geekblue-5',
  '--iflyv-red-5',
]

// —— 「+N」收纳：图例单行放不下时只展示放得下的前几个，其余收进 el-dropdown ——
// 宽度用与轴名同套的估宽法（CJK/ASCII 分宽）：确定性强于测 DOM，且避免渲染-测量-再渲染的抖动
const visibleCount = ref(Infinity)
function updateLegendLayout() {
  const total = legendItems.value.length
  const w = canvasEl.value?.clientWidth ?? 0
  if (!w || !total) {
    visibleCount.value = total
    return
  }
  const est = (t: string, cn: number, en: number) => [...t].reduce((s2, ch) => s2 + (ch.charCodeAt(0) > 255 ? cn : en), 0)
  const avail = w - (props.title ? est(props.title, 15, 8) + 16 : 0)
  const itemW = legendItems.value.map((it) => 10 + 4 + est(it.name, 14, 7))
  const GAP = 16
  const MORE_W = 36
  if (itemW.reduce((a, b) => a + b, 0) + GAP * (total - 1) <= avail) {
    visibleCount.value = total
    return
  }
  let n = 0
  let acc = 0
  for (let i = 0; i < total; i++) {
    const next = acc + (n ? GAP : 0) + itemW[i]
    if (next + GAP + MORE_W > avail) break
    acc = next
    n++
  }
  visibleCount.value = Math.max(1, n)
}
const visibleLegendItems = computed(() => legendItems.value.slice(0, visibleCount.value))
const hiddenLegendItems = computed(() => legendItems.value.slice(visibleCount.value))

function computeLegendItems() {
  if (!H_LEGEND_TYPES.includes(props.type)) return []
  const names = props.series?.length
    ? props.series.map((sr) => sr.name)
    : props.seriesName
      ? [props.seriesName]
      : []
  return names.map((name, i) => ({ name, color: token(SERIES_COLOR_TOKENS[i % SERIES_COLOR_TOKENS.length]) }))
}
legendItems.value = computeLegendItems()

function buildOption(): Record<string, unknown> {
  // 纵排图例数据每次重建（仅 donut/pie 分支会重新填充；类型切换后不残留）
  pieRows.value = []
  const colors = SERIES_COLOR_TOKENS.map(token)
  const textColor = token('--iflyv-text-3')
  const txtVal = (v: unknown) => `${formatNumber(String(v))}${props.unit ?? ''}`
  // 浮层统一用自定义 formatter 出 HTML（valueFormatter 的返回会被 ECharts 转义成纯文本，塞不进样式）：
  // 行结构复刻默认表格化浮层——色点+名称左对齐、数值右对齐加重（text-1 / 600）
  const valCell = (t: string) => `<span style="float: right; margin-left: 20px; font-weight: 600; color: ${token('--iflyv-text-1')}">${t}</span>`
  // mt：行顶距——跟在表头后的行留 8px（行间与标题-首行同一档）；无表头的独立单行传 0（否则在底板里整体偏下、垂直不居中）
  const rowHtml = (marker: string, name: string, val: string, mt = 8) =>
    `<div style="margin-top: ${mt}px; min-width: 140px">${marker}<span style="margin-left: ${marker ? 6 : 0}px">${name}</span>${valCell(val)}<span style="display: block; clear: both"></span></div>`
  // 标题与首行间距 = 首行自带的 margin-top 8（与条目行间一致），标题行自身不再补空
  const headHtml = (t: string) => `<div>${t}</div>`
  // 浮层色点：不用 ECharts 自带 marker（圆形），自绘与图例 dot 完全同款的圆角方块（12×12 / r2）——
  // 同一系列在图例和浮层里形状必须一致
  const mk = (c: unknown) => (c ? `<span style="display: inline-block; width: 12px; height: 12px; border-radius: 2px; background: ${c}; vertical-align: -1px"></span>` : '')
  // 折线下方面积渐变：线色 12% → 全透明（自上而下）。纯折线图与柱线图的折线共用
  const areaGrad = (c: string) => ({
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: hexA(c, 0.12) },
      { offset: 1, color: hexA(c, 0) },
    ]),
  })
  const axisTip = (valFn: (v: unknown, p: Record<string, unknown>) => string) => (params: unknown) => {
    const list = (Array.isArray(params) ? params : [params]) as Record<string, unknown>[]
    const head = String((list[0] as { axisValueLabel?: string; name?: string }).axisValueLabel ?? list[0]?.name ?? '')
    return headHtml(head) + list.map((pm) => rowHtml(mk(pm.color), String(pm.seriesName ?? ''), valFn(pm.value, pm))).join('')
  }
  // tooltip 统一白底表格化浮层（色点+名称左对齐、数值右对齐为 ECharts 默认结构）；
  // 底板样式对齐 el-tooltip 源头（el-theme/components/tooltip.scss）：
  // 白底 + border-default 描边 + radius-sm 圆角 + shadow-related 投影 + 8/12 内边距，文字 text-1 14 号
  // 悬浮列高亮（柱类图 axisPointer shadow）：ECharts 默认灰太重，
  // 取 gray-1（bg-inset 同源的最浅灰）80% 透明度；
  // z 压到 0（系列默认 z=2）——默认层级阴影会盖在柱子上把柱色蒙淡，高亮应垫在柱子底下
  const shadowPointer = { type: 'shadow', z: 0, shadowStyle: { color: hexA(token('--iflyv-gray-1'), 0.8) } }
  const tooltip = {
    backgroundColor: token('--iflyv-bg-panel'),
    borderColor: token('--iflyv-border-default'),
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: token('--iflyv-text-1'), fontSize: 14 },
    extraCssText: `border-radius: ${token('--iflyv-radius-sm')}; box-shadow: ${token('--iflyv-shadow-related')};`,
  }
  // 绘图区顶部：标题/横排图例已在 HTML 头行（canvas 之外），canvas 只需为「纵轴顶部单位名」让位
  //（ECharts 把轴名画在绘图区上方 15px 处）。有头行时基础留 8（头行自带 margin 凑足间距）
  const headed = !!props.title || legendItems.value.length > 0
  const gridTop = (hasUnitTop: boolean) => (headed ? (hasUnitTop ? 40 : 16) : hasUnitTop ? 36 : 16)
  // 估算文本宽度（CJK / ASCII 分宽）：轴名不被 containLabel 收容，留边须按名宽自算
  const textW = (t: string, fs = 12) => [...t].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? fs : Math.ceil(fs * 0.59)), 0)
  // 横排图例在 HTML 头行渲染（见模板注释）；canvas 内保留隐藏 legend 承接序列显隐状态
  const hiddenLegend = { legend: { show: false, selected: legendSelected() } }

  // ── 环形 / 饼状：单组占比 ─────────────────────────────────────────────
  if (props.type === 'donut' || props.type === 'pie') {
    // 分类从大到小、12 点方向顺时针排；「其他」固定排最后不参与降序（Web 图表设计指南硬规则，固化源头下游免记）。
    // 超过 5 类自动合并：保留前 4 大类，其余（含调用方自带的「其他」）并入「其他」——扇区 ≤5 由源头保证，
    // 长尾颜色分不清、占比读不出；每一类都重要不能合并的场景本就不该用环形，改条形图逐类比大小
    const desc = [...props.data].sort((a, b) => b.value - a.value)
    const rest = desc.filter((d) => d.name !== '其他')
    const over = rest.length + (desc.length - rest.length ? 1 : 0) > 5
    const kept = over ? rest.slice(0, 4) : rest
    const merged = (over ? rest.slice(4) : []).concat(desc.filter((d) => d.name === '其他'))
    const sorted = merged.length
      ? [...kept, { name: '其他', value: merged.reduce((s2, d) => s2 + d.value, 0) }]
      : kept
    const total = sorted.reduce((s, d) => s + d.value, 0) || 1
    // HTML 纵排图例数据（名称/色点/数值占比）：数值列靠名称定宽单元格左对齐
    pieRows.value = sorted.map((d, i) => ({
      name: d.name,
      color: colors[i % colors.length],
      // 数值与占比分两段渲染：数值是主信息（常规字重 text-1），占比是附注（text-3）
      val: formatNumber(d.value),
      // 括号用半角 () 且前置空格（全角（）在数字语境里过宽）——空格在模板里
      pct: `${((d.value / total) * 100).toFixed(1)}%`,
    }))
    pieNameW.value = Math.max(...sorted.map((d) => textW(d.name, 14))) + 10
    // 环/饼不走 grid：标题已在 HTML 头行（canvas 之外），canvas 即纯绘图区，
    // 圆心 50%、图例 top:'middle'、环心数字覆盖层（body 的 50%）天然同轴，无需任何避让
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'item', formatter: (pm: Record<string, unknown>) => rowHtml(mk(pm.color), String(pm.name ?? ''), `${txtVal(pm.value)} (${Number(pm.percent).toFixed(1)}%)`, 0) },
      // 图例改为 HTML 覆盖层（右侧纵排，见模板 __legend-v）：canvas 图例给不了 hover 灰底反馈。
      // canvas 侧仅保留隐藏的 legend 组件承接 selected 状态（show:false 不影响开关扇区）
      legend: { show: false, selected: legendSelected() },
      series: [
        {
          type: 'pie',
          // 环形优先、扇区间留隙、微圆角（display-guide 图形风格）；饼状 = 环心无信息可放时。
          // 半径按「上下各留 16px」反推（与直角坐标系 headed 时 gridTop 16 同口径）——
          // 原 72%/78% 比例留白随高度放大（216 高时上下各挤出约 30px），标题下方明显比折线图空
          radius: props.type === 'pie' ? [0, props.height / 2 - 16] : [(props.height / 2 - 16) * (58 / 78), props.height / 2 - 16],
          center: ['30%', '50%'],
          // 扇区分隔两种做法按形态分流：环形用留隙 padAngle（缝在环带上，观感干净）；
          // 饼状是实心圆，padAngle 的缝会在圆心汇成裂缝——改用面板底色描边分隔（白色辐条，圆心交汇均匀）
          ...(props.type === 'donut'
            ? { padAngle: 2, itemStyle: { borderRadius: 2 } }
            : { itemStyle: { borderColor: token('--iflyv-bg-panel'), borderWidth: 2, borderRadius: 3 } }),
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
      tooltip: { ...tooltip, trigger: 'item', formatter: (pm: Record<string, unknown>) => headHtml(`${mk(pm.color)}<span style="margin-left: 6px">${pm.name ?? ''}</span>`) + (props.indicators ?? []).map((ind, ii) => rowHtml('', ind.name, String((pm.value as number[] | undefined)?.[ii] ?? ''))).join('') },
      ...hiddenLegend,
      radar: {
        indicator: (props.indicators ?? []).map((i) => ({ name: i.name, max: i.max ?? autoMax })),
        // 半径按「顶部留 51px」反推：16 头行间距（与其他图同口径）+ 20 维度名行高 + 15 名到顶点的 nameGap。
        // 原 62% + 圆心下移 55% 的留白随高度放大，标题下方明显比折线图空
        radius: props.height / 2 - 51,
        center: ['50%', '50%'],
        axisName: { color: textColor, fontSize: 14 },
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
    // ECharts 的 grid 不会为轴名自动留位（containLabel 只算刻度）——散点轴名是「变量名+单位」偏长，
    // 按估算文字宽度给两侧让位，否则纵轴名伸出左缘、横轴名伸出右缘被裁
    const numAxis = (unitName?: string, vertical = false) => ({
      type: 'value',
      scale: true,
      // 纵轴单位与刻度数值同为右对齐（对齐到轴线左侧 8px，即刻度 label 的默认 margin）；横轴单位保持默认
      ...(unitName
        ? {
            name: unitName,
            ...(vertical ? { nameGap: 24 } : {}),
            // 横轴单位名下沉到刻度行（同 valueAxis 横排口径），纵轴保持右对齐贴轴
            nameTextStyle: {
              color: textColor,
              fontSize: 14,
              ...(vertical ? { align: 'right', padding: [0, 8, 0, 0] } : { verticalAlign: 'top', padding: [8, 0, 0, 0] }),
            },
          }
        : {}),
      axisLine: { show: false },
      axisLabel: { color: textColor, fontSize: 14 },
      splitLine: { lineStyle: { color: token('--iflyv-border-subtle'), type: 'dashed' } },
    })
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'item', formatter: (pm: Record<string, unknown>) => { const xy = pm.value as number[] | undefined; return rowHtml(mk(pm.color), String(pm.seriesName ?? ''), `${xy?.[0] ?? ''}${props.xUnit ?? ''}，${xy?.[1] ?? ''}${props.unit ?? ''}`, 0) } },
      ...hiddenLegend,
      xAxis: numAxis(props.xUnit),
      yAxis: numAxis(props.unit, true),
      grid: {
        // 纵轴名右对齐在刻度列右缘：左侧需容下「名宽 + 8」，containLabel 已含约 24 的刻度列
        left: props.unit ? Math.max(8, textW(props.unit, 14) + 8 - 24) : 8,
        // 横轴名画在轴末端之后：右侧需容下整个名宽
        right: props.xUnit ? Math.max(16, textW(props.xUnit, 14) + 24) : 16,
        top: gridTop(!!props.unit),
        bottom: 0,
        containLabel: true,
      },
      series: seriesList.map((s) => ({ name: s.name, type: 'scatter', symbolSize: 8, itemStyle: { opacity: 0.75 }, data: s.data })),
    }
  }

  // ── 直角坐标系公共部分（bar / line / bar-line / waterfall）──────────────
  const multi = !!(props.series && props.series.length)
  const catNames = multi || props.type === 'bar-line' ? (props.categories ?? []) : props.data.map((d) => d.name)
  const categoryAxis = {
    type: 'category',
    data: catNames,
    // 不画实线轴线：零位已有数值轴的虚线网格线作基线，实线+虚线叠在一起显得双线
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: textColor, fontSize: 14 },
  }
  const valueAxis = {
    type: 'value',
    // 常规单位可不标；传 unit 则展示在数值轴顶部（双轴/特殊单位场景必标）。
    // 纵轴单位与顶部刻度的垂直间距 nameGap 取 24（单位 14 号字高约 16，留出 ~8px 视觉间隙）；
    // 横排时单位在 x 轴右端、走默认，不受此值影响
    ...(props.unit || props.percent
      ? {
          name: props.percent ? '%' : props.unit,
          ...(props.horizontal ? {} : { nameGap: 24 }),
          // 横排时单位名默认垂直居中在轴线上，而刻度数字画在轴线下方 8px——
          // 名字会比刻度行浮高半行；下沉到与刻度同一行（同字号 14 + 同 8px 起点，自然底对齐）
          nameTextStyle: {
            color: textColor,
            fontSize: 14,
            ...(props.horizontal ? { verticalAlign: 'top', padding: [8, 0, 0, 0] } : { align: 'right', padding: [0, 8, 0, 0] }),
          },
        }
      : {}),
    ...(props.percent ? { max: 100 } : {}),
    // 双向图数值轴刻度取绝对值（第二序列内部取负只为方向，不是负数语义）
    axisLabel: props.diverging
      ? { color: textColor, fontSize: 14, formatter: (v: number) => `${Math.abs(v)}` }
      : { color: textColor, fontSize: 14 },
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
            moveHandleStyle: { color: token('--iflyv-blue-2') },
            emphasis: { moveHandleStyle: { color: token('--iflyv-blue-3') } },
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
  // 横排时单位名挂在 x 轴末端、伸出绘图区右缘（nameGap 15 + 单位字宽），
  // 而 containLabel 只包刻度标签不包轴名——right 只留 8 会把单位裁掉半个，按名宽自算
  const hUnitName = props.percent ? '%' : props.unit
  const gridRight = props.horizontal && hUnitName ? textW(hUnitName, 14) + 24 : 8
  const axes = {
    xAxis: props.horizontal ? valueAxis : categoryAxis,
    yAxis: props.horizontal ? categoryAxis : valueAxis,
    grid: { left: 8, right: gridRight, top: gridTop(!props.horizontal && !!(props.unit || props.percent)), bottom: zoomOn ? 36 : 0, containLabel: true },
    ...dataZoom,
  }
  // 图例：多序列必出；单序列传 seriesName 也出（规范：只有一组数据也展示图例）。统一顶部横排
  const cartesianLegend = hiddenLegend
  // 柱体微圆角：四角统一 2px（含条形/柱线图柱/瀑布/双向）
  const capRadius = 2

  // ── 柱线图：不同性质数据的相关关系（双轴，柱=重要数据对应左轴）───────────
  if (props.type === 'bar-line') {
    const seriesList = props.series ?? []
    const rightAxis = {
      type: 'value',
      // 双轴两侧顶部都必须标单位；nameGap 与左轴同取 24，两侧单位保持等高
      ...(props.unit2 ? { name: props.unit2, nameGap: 24, nameTextStyle: { color: textColor, fontSize: 14, align: 'left', padding: [0, 0, 0, 8] } } : {}),
      axisLine: { show: false },
      axisLabel: { color: textColor, fontSize: 14 },
      splitLine: { show: false },
    }
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'axis', axisPointer: shadowPointer, formatter: axisTip((v, pm) => `${v}${(pm.componentSubType === 'line' ? props.unit2 : props.unit) ?? ''}`) },
      ...hiddenLegend,
      xAxis: categoryAxis,
      yAxis: [valueAxis, rightAxis],
      grid: { left: 8, right: 8, top: gridTop(!!(props.unit || props.unit2)), bottom: zoomOn ? 36 : 0, containLabel: true },
      ...dataZoom,
      series: seriesList.map((s, i) =>
        s.kind === 'line'
          ? { name: s.name, type: 'line', yAxisIndex: 1, smooth: 0.3, lineStyle: { width: 2 }, symbolSize: 6, emphasis: { scale: 1.5 }, areaStyle: areaGrad(colors[i % colors.length]), data: s.data }
          : { name: s.name, type: 'bar', barWidth: 20, itemStyle: { borderRadius: capRadius, opacity: 0.9 }, emphasis: { disabled: true }, data: s.data },
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
        ...tooltip,
        trigger: 'axis',
        axisPointer: shadowPointer,
        // 浮层展示 增量 + 累计（跳过透明垫底序列）
        formatter: (params: { dataIndex: number }[]) => {
          const i = params[0]?.dataIndex ?? 0
          const v = inc[i]
          return headHtml(props.data[i]?.name ?? '') + rowHtml('', '增量', `${v >= 0 ? '+' : '-'}${txtVal(Math.abs(v))}`) + rowHtml('', '累计', txtVal(cumulative[i]))
        },
      },
      xAxis: categoryAxis,
      yAxis: valueAxis,
      grid: { left: 8, right: 8, top: gridTop(!!props.unit), bottom: 0, containLabel: true },
      series: [
        // 透明垫底：把增量柱抬到累计位置
        { type: 'bar', stack: 'wf', silent: true, itemStyle: { color: 'transparent' }, emphasis: { itemStyle: { color: 'transparent' } }, data: bases },
        {
          type: 'bar',
          stack: 'wf',
          barWidth: 20,
          emphasis: { disabled: true },
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
    const barVal = (v: unknown) => (props.percent ? `${v}%` : txtVal(v))
    // 悬浮反馈统一由列高亮阴影承担：关掉 ECharts 默认的 emphasis 提亮——
    // 轴触发会把整列柱子切到 emphasis 态、颜色被提亮（看起来像"变浅"），与阴影反馈重复且失真
    const barSeries = multi
      ? seriesData.map((sr) => ({
          name: sr.name,
          type: 'bar',
          barWidth: 20,
          emphasis: { disabled: true },
          stack: stackOn ? 'total' : undefined,
          itemStyle: props.diverging
            ? {
                // 双向：两端各自有"末端"圆角；零轴交汇处与堆积同款留 2px 白缝（相邻段各 1px 面板色描边拼成）
                borderRadius: capRadius,
                borderColor: token('--iflyv-bg-panel'),
                borderWidth: 1,
                opacity: 0.9,
              }
            : stackOn
              ? {
                  // 堆积：段与段之间留 2px 白（相邻段各 1px 面板色描边拼成），每段四角 2px 微圆角
                  borderRadius: 2,
                  borderColor: token('--iflyv-bg-panel'),
                  borderWidth: 1,
                  opacity: 0.9,
                }
              : { borderRadius: capRadius, opacity: 0.9 },
          data: sr.data,
        }))
      : [
          {
            name: props.seriesName,
            type: 'bar',
            // 细柱 + 末端微圆角 + 适度透明度；单序列一色——颜色编码"序列"而非"类目"，
            // 同一指标的柱子五颜六色不携带信息、还与图例矛盾
            barWidth: 20,
            emphasis: { disabled: true },
            itemStyle: { borderRadius: capRadius, opacity: 0.9 },
            data: props.data.map((d) => d.value),
          },
        ]
    return {
      backgroundColor: 'transparent',
      color: colors,
      tooltip: { ...tooltip, trigger: 'axis', axisPointer: shadowPointer, formatter: axisTip((v) => barVal(props.diverging ? Math.abs(Number(v)) : v)) },
      ...axes,
      ...cartesianLegend,
      series: barSeries,
    }
  }

  // ── 折线：细线 + 小折点（多序列各一条线，建议 ≤4 条）────────────────────────
  // smooth 0.3：点间过渡取轻度圆滑（硬折角生硬），刻意不用默认 true（=0.5）——
  // 弧度过大时曲线会越过真实数据点、暗示不存在的中间值。
  // 线下面积铺「线色 12% → 全透明」的自上而下渐变（areaGrad 定义在上方，柱线图折线共用）：
  // 给走势一点体量感，低起点不透明度保证多条线叠加时底下的网格线与彼此的面积仍可辨
  const lineSeries = multi
    ? props.series!.map((sr, i) => ({ name: sr.name, type: 'line', smooth: 0.3, lineStyle: { width: 2 }, symbolSize: 6, emphasis: { scale: 1.5 }, areaStyle: areaGrad(colors[i % colors.length]), data: sr.data }))
    : [{ name: props.seriesName, type: 'line', smooth: 0.3, lineStyle: { width: 2 }, symbolSize: 6, emphasis: { scale: 1.5 }, areaStyle: areaGrad(colors[0]), data: props.data.map((d) => d.value) }]
  return {
    backgroundColor: 'transparent',
    color: colors,
    // 悬浮指示竖线取描边令牌（ECharts 默认是自带的灰，不随主题令牌走）
    tooltip: { ...tooltip, trigger: 'axis', axisPointer: { lineStyle: { color: token('--iflyv-border-default') } }, formatter: axisTip((v) => txtVal(v)) },
    ...axes,
    ...cartesianLegend,
    series: lineSeries,
  }
}

function render() {
  if (!chart) return
  legendItems.value = computeLegendItems()
  updateLegendLayout()
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
  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
    updateLegendLayout()
  })
  resizeObserver.observe(canvasEl.value)
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})

watch(
  // height 必须在列（环/饼/雷达的半径按它反推进 option）：漏掉时容器缩了半径不缩，圆被画布裁切
  () => [props.type, props.data, props.categories, props.series, props.indicators, props.horizontal, props.stacked, props.percent, props.diverging, props.zoomable, props.seriesName, props.unit, props.unit2, props.xUnit, props.height, props.option],
  render,
  { deep: true },
)
</script>

<style scoped>
/* 自己骨架的排版（铁律 3：只装扮自己的盒子） */
.iflyv-chart {
  display: flex;
  flex-direction: column;
  width: 100%;
}
/* 头行：标题左、图例右，flex 交叉轴居中——垂直对齐是布局事实；与绘图区的间距 spacing-2（canvas 顶部另有轴留白凑足视觉间距） */
.iflyv-chart__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--iflyv-spacing-4);
  min-height: 20px;
  margin-bottom: var(--iflyv-spacing-2);
}
/* 标题：组件标题字阶 */
/* 标题字阶按 title-level 取档：图表标题的层级由它在页面里的位置决定，不是图表自带属性——
   卡片内的一张图＝组件级（默认）；独占一个模块/分区时＝模块级或常规标题 */
.iflyv-chart__title {
  font: var(--iflyv-font-title-component);
  color: var(--iflyv-text-1);
  white-space: nowrap;
}
.iflyv-chart__title--module {
  font: var(--iflyv-font-title-module);
}
.iflyv-chart__title--regular {
  font: var(--iflyv-font-title-regular);
}
/* 图例：单行不折行（头行高度恒定）；放不下的序列收进「+N」；条目可点击开关序列 */
.iflyv-chart__legend {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  column-gap: var(--iflyv-spacing-4);
}
.iflyv-chart__legend-item {
  display: inline-flex;
  align-items: center;
  /* 色点与文字间距：spacing-1 偏挤，按视觉定稿 +2 到 6px（间距体系无 6 档，calc 补差） */
  gap: calc(var(--iflyv-spacing-1) + 2px);
  /* hover 灰底胶囊：padding 撑出底的范围，负 margin 抵消占位——布局位置与无底时完全一致。
     audit-ignore 胶囊内边距 2/6 为用户视觉定稿的微调值（间距体系最小档 4，无对应档），
     且被负 margin 抵消、不参与任何布局间距，不属于排版取值 */
  padding: 2px 6px;
  margin: -2px -6px;
  border: 0;
  border-radius: var(--iflyv-radius-sm);
  background: none;
  cursor: pointer;
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-1);
  transition: opacity var(--iflyv-duration-fast), background-color var(--iflyv-duration-fast);
}
.iflyv-chart__legend-item:hover {
  background: var(--iflyv-bg-inset);
}
/* 色点尺寸与浮层色点同款（12px 方点、2px 圆角） */
.iflyv-chart__legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex: none;
}
/* 关闭态：整体降透明（与 ECharts 原生图例灰化同语义） */
.iflyv-chart__legend-item.is-off {
  opacity: 0.4;
}
/* 「+N」收纳徽标：浅底小胶囊，字色随图例文字 */
.iflyv-chart__legend-more {
  padding: 0 var(--iflyv-spacing-1_5);
  height: 20px;
  border-radius: var(--iflyv-radius-xs);
  background: var(--iflyv-bg-card);
}
/* 收纳面板内条目（随 el-dropdown 传送，scoped 属性仍在，样式可达）；关闭态同款降透明 */
.iflyv-chart__legend-option {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--iflyv-spacing-1) + 2px); /* 与图例项同款：色点↔文字 6px */
}
/* 环/饼纵排图例：右缘垂直居中，行距 12（负 margin 抵消后视觉约 8） */
.iflyv-chart__legend-v {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--iflyv-spacing-3);
}
/* 纵排行的 hover 胶囊比横排大一圈（上下 6 / 左右 10）：行内含数值信息更长，小胶囊显局促；
   负 margin 同步抵消，行位置与占位不变。
   audit-ignore 胶囊内边距 6/10 为用户视觉定稿微调值（体系无对应档），被负 margin 抵消不参与布局 */
.iflyv-chart__legend-v .iflyv-chart__legend-item {
  padding: 6px 10px;
  margin: -6px -10px;
}
.iflyv-chart__legend-vname {
  flex: none;
  text-align: left;
}
/* 数值：与行同档字阶（body-sub，常规字重）——名称已是主信息，数值不再加粗抢一层。
   tabular-nums 保证多行数字等宽对齐 */
.iflyv-chart__legend-vval {
  color: var(--iflyv-text-1);
  font-variant-numeric: tabular-nums;
}
/* 占比：数值的附注信息，弱化到 text-3（与 metric-item__unit 的「单位弱化一档」同语义） */
.iflyv-chart__legend-vpct {
  color: var(--iflyv-text-3);
}
.iflyv-chart__legend-option.is-off {
  opacity: 0.4;
}
/* 绘图区：高度由 height prop 显式给定（头行另计）；环心覆盖层以此为定位参照（与 canvas 同区域） */
.iflyv-chart__body {
  position: relative;
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
  /* 环心数字与说明取 spacing-0_5（紧贴元素微调档）——规则见 foundations.md 语义字阶表
     「数字展示字阶自带的排版约定」 */
  gap: var(--iflyv-spacing-0_5);
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
