<template>
  <!-- 环形图 -->
  <section id="chart-donut" class="demo-section">
    <h2 class="demo-section__title">Donut 环形图
      <CopyToCC anchor="chart-donut" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">看占比构成用它（扇区 ≤5）；环心放总量数字。扇区超过 5 个改用堆积条形，别硬塞。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
          <h5 class="chart-spec-card__title">课程资源分布</h5>
          <Chart type="donut" :data="donutData" center-title="104" center-label="课程资源" :height="216" />
        </div>
      </div>
    </div>
  </section>

  <!-- 柱状图 -->
  <section id="chart-bar" class="demo-section">
    <h2 class="demo-section__title">Bar 柱状图
      <CopyToCC anchor="chart-bar" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">类目之间比大小用它（类目 ≤8）；单序列逐类目取色。别用折线连类目——类目间没有连续关系。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
          <h5 class="chart-spec-card__title">各班平均分</h5>
          <Chart type="bar" :data="barData" :height="216" />
        </div>
      </div>
    </div>
  </section>

  <!-- 堆积柱状图 -->
  <section id="chart-bar-stack" class="demo-section">
    <h2 class="demo-section__title">Stacked 堆积柱状图
      <CopyToCC anchor="chart-bar-stack" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">同时比较多个对象的构成用它（type="bar" 加 stacked，多序列传 categories + series，自动出图例）。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
          <h5 class="chart-spec-card__title">各班题型得分构成</h5>
          <Chart type="bar" stacked :categories="stackCategories" :series="stackSeries" :height="216" />
        </div>
      </div>
    </div>
  </section>

  <!-- 条形图 -->
  <section id="chart-bar-horizontal" class="demo-section">
    <h2 class="demo-section__title">Horizontal 条形图
      <CopyToCC anchor="chart-bar-horizontal" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">类目多或名称长时的比大小（type="bar" 加 horizontal）——横排放得下长名称。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
          <h5 class="chart-spec-card__title">各类型资源数量</h5>
          <Chart type="bar" horizontal :data="barHData" :height="240" />
        </div>
      </div>
    </div>
  </section>

  <!-- 折线图 -->
  <section id="chart-line" class="demo-section">
    <h2 class="demo-section__title">Line 折线图
      <CopyToCC anchor="chart-line" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">随时间的变化趋势用它（多序列 ≤4 条）；时间点多时别用柱状——会挤成栅栏。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
          <h5 class="chart-spec-card__title">近八周出勤率</h5>
          <Chart type="line" :data="lineData" :height="216" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 图表规范 —— 业务组件 Chart 的五种常用形态展示。
 * 形态 = 基础型（bar/line/donut）× 正交配置（horizontal / stacked / 多序列），
 * 取色/主题品牌重绘/图形风格全在 Chart 源头；本页只传 type + data，
 * 典型页面与下游项目的调用方式与本页完全相同。
 * 选型判据与配色规则见 references/display-guide.md「数据可视化」段。
 */
import CopyToCC from '../CopyToCC.vue'
import { Chart } from '../../../../design-spec/components'

const donutData = [
  { name: '其他', value: 12 },
  { name: '练习', value: 18 },
  { name: '测验', value: 22 },
  { name: '文档', value: 28 },
  { name: '多媒体教材', value: 24 },
]

const barData = [
  { name: '一班', value: 86 },
  { name: '二班', value: 79 },
  { name: '三班', value: 91 },
  { name: '四班', value: 74 },
  { name: '五班', value: 83 },
]

const stackCategories = ['一班', '二班', '三班', '四班']
const stackSeries = [
  { name: '选择题', data: [32, 28, 35, 26] },
  { name: '填空题', data: [24, 26, 22, 20] },
  { name: '简答题', data: [30, 25, 34, 28] },
]

const barHData = [
  { name: '多媒体教材', value: 46 },
  { name: '课堂实录视频', value: 38 },
  { name: '在线互动文档', value: 31 },
  { name: '自适应练习', value: 24 },
  { name: '课件 PPT', value: 19 },
  { name: '其他资源', value: 8 },
]

const lineData = [
  { name: '第1周', value: 92 },
  { name: '第2周', value: 95 },
  { name: '第3周', value: 89 },
  { name: '第4周', value: 93 },
  { name: '第5周', value: 88 },
  { name: '第6周', value: 91 },
  { name: '第7周', value: 96 },
  { name: '第8周', value: 94 },
]
</script>

<style scoped>
/* 纯本页排版：图表卡与看板页同构（白底面板 + 细描边 + 大卡片档），限宽让示例不满铺 */
.chart-spec-row {
  margin-top: var(--iflyv-spacing-3);
}
.chart-spec-card {
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-5);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
  background: var(--iflyv-bg-panel);
}
.chart-spec-card__title {
  margin: 0 0 var(--iflyv-spacing-2);
  font: var(--iflyv-font-title-regular);
  color: var(--iflyv-text-1);
}
</style>
