<template>
  <!-- 环形图 -->
  <section id="chart-donut" class="demo-section">
    <h2 class="demo-section__title">Donut 环形图
      <CopyToCC anchor="chart-donut" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">单组数据看占比用它（扇区 ≤5）；分类自动从大到小、12 点方向顺时针排（源头固化）；环心放总量或留空。多组数据一起比构成 → 改堆积图，扇区超限别硬塞。</p>
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
      <p class="demo-desc">横坐标必须是时间、学期等有序类别（无序类别一律用条形图）；分类 ≤4 种，数据差距过小时最好只留 2 组；横向空间不足时转条形图。单组数据也展示图例（传 series-name）。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
          <h5 class="chart-spec-card__title">近五学期平均分</h5>
          <Chart type="bar" :data="barData" series-name="平均分" unit="分" :height="216" />
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
      <p class="demo-desc">包含关系的数据：展示总量的同时展示总量内各子分类（type="bar" 加 stacked）。序列 ≥3 时中间序列难以直接比较，需精确比较只放 2 个序列；交付前必须用真实数据验证可读性。</p>
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
      <p class="demo-desc">无序类别（科目、班级、资源类型…）的比大小一律用它（type="bar" 加 horizontal）；柱状图类目过多、标签挤压时也转到这里。很灵活，常与数据表格结合使用。</p>
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
      <p class="demo-desc">随时间/有序类别的走势用它（折线 ≤4 条，数据多须用真实数据确认不过于集中）；时间点多别用柱状——会挤成栅栏。特殊单位传 unit（轴顶 + 浮层后缀）。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
          <h5 class="chart-spec-card__title">近八周出勤率</h5>
          <Chart type="line" :data="lineData" series-name="出勤率" unit="%" :height="216" />
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

// 柱状图横坐标必须有序类别（学期有先后）；无序类别（如班级、科目）用条形图
const barData = [
  { name: '大一上', value: 78 },
  { name: '大一下', value: 82 },
  { name: '大二上', value: 79 },
  { name: '大二下', value: 86 },
  { name: '大三上', value: 91 },
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
