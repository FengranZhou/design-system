<template>
  <!-- 折线图 -->
  <section id="chart-line" class="demo-section">
    <h2 class="demo-section__title">Line 折线图
      <CopyToCC anchor="chart-line" :values="chartConfig" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">走势 + 有序横轴；建议折线数量 ≤ 4 条。横轴点位多时可开启底部范围控件（拖选区间、滚轮缩放）。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="近三十日出勤率" type="line" :data="lineData" series-name="出勤率" unit="%" :zoomable="zoomable" :height="240" />
        </div>
        <aside class="config-card">
          <p class="config-card__title">配置项</p>
          <el-form label-width="auto">
            <el-form-item label="范围控件">
              <el-switch v-model="zoomable" />
            </el-form-item>
          </el-form>
        </aside>
      </div>
    </div>
  </section>
  <!-- 柱状图 -->
  <section id="chart-bar" class="demo-section">
    <h2 class="demo-section__title">Bar 柱状图
      <CopyToCC anchor="chart-bar" :values="chartConfig" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">有序类别比大小；建议并排系列最多 4 组。横轴点位多可开启底部范围控件（拖选区间、滚轮缩放）。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="近五学期成绩" type="bar" :categories="barCategories" :series="barSeries" unit="分" :zoomable="zoomable" :height="216" />
        </div>
        <aside class="config-card">
          <p class="config-card__title">配置项</p>
          <el-form label-width="auto">
            <el-form-item label="范围控件">
              <el-switch v-model="zoomable" />
            </el-form-item>
          </el-form>
        </aside>
      </div>
    </div>
  </section>
  <!-- 条形图 -->
  <section id="chart-bar-horizontal" class="demo-section">
    <h2 class="demo-section__title">Horizontal 条形图
      <CopyToCC anchor="chart-bar-horizontal" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">无序类别比大小；类目多、名称长时用。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="各类型资源数量" type="bar" horizontal :data="barHData" series-name="资源数量" :height="240" />
        </div>
      </div>
    </div>
  </section>
  <!-- 环形图 -->
  <section id="chart-donut" class="demo-section">
    <h2 class="demo-section__title">Donut 环形图
      <CopyToCC anchor="chart-donut" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">单组占比，扇区 ≤5；超 5 类自动合并为「其他」；环心放总量。每类都重要 → 条形图；多组比构成 → 堆积图。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="课程资源分布" type="donut" :data="donutData" center-title="104" center-label="课程资源" :height="180" />
        </div>
      </div>
    </div>
  </section>
  <!-- 饼状图 -->
  <section id="chart-pie" class="demo-section">
    <h2 class="demo-section__title">Pie 饼状图
      <CopyToCC anchor="chart-pie" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">判据同环形图；环心无信息可放时用饼。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="课堂提问类型分布" type="pie" :data="pieData" :height="180" />
        </div>
      </div>
    </div>
  </section>
  <!-- 柱线图 -->
  <section id="chart-bar-line" class="demo-section">
    <h2 class="demo-section__title">Bar-Line 柱线图
      <CopyToCC anchor="chart-bar-line" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">两种性质数据的相关关系；柱放更重要的数据、对应左轴。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="每周任务发布与完成率" type="bar-line" :categories="barLineCategories" :series="barLineSeries" unit="个" unit2="%" :height="216" />
        </div>
      </div>
    </div>
  </section>
  <!-- 雷达图 -->
  <section id="chart-radar" class="demo-section">
    <h2 class="demo-section__title">Radar 雷达图
      <CopyToCC anchor="chart-radar" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">多维度比较；维度 ≥3、分类 ≤4。超 4 类别硬叠：只留重点对象（其余合成「平均」基准）、拆多张并排，或改条形图。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="班级学情画像" type="radar" :indicators="radarIndicators" :series="radarSeries" :height="220" />
        </div>
      </div>
    </div>
  </section>
  <!-- 散点图 -->
  <section id="chart-scatter" class="demo-section">
    <h2 class="demo-section__title">Scatter 散点图
      <CopyToCC anchor="chart-scatter" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">变量相关性 / 分布。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="学习时长与成绩" type="scatter" x-unit="周学习时长(h)" unit="成绩(分)" :series="scatterSeries" :height="240" />
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
      <p class="demo-desc">总量 + 构成；堆 3 层以上时中间层难以比较。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="各学期题型得分构成" type="bar" stacked :categories="stackCategories" :series="stackSeries" :height="216" />
        </div>
      </div>
    </div>
  </section>
  <!-- 堆积条形图 -->
  <section id="chart-bar-stack-h" class="demo-section">
    <h2 class="demo-section__title">Stacked-H 堆积条形图
      <CopyToCC anchor="chart-bar-stack-h" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">无序类别的总量 + 构成（堆积的横排形态）；判据同堆积柱状图。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="各科目任务构成" type="bar" stacked horizontal :categories="stackHCategories" :series="stackHSeries" :height="216" />
        </div>
      </div>
    </div>
  </section>
  <!-- 百分比堆积 -->
  <section id="chart-bar-percent" class="demo-section">
    <h2 class="demo-section__title">Percent 百分比堆积
      <CopyToCC anchor="chart-bar-percent" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">只看比例、不看总量；只分 2 组。单组看比例 → 环形图。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="各学期线上/线下课时占比" type="bar" stacked percent :categories="percentCategories" :series="percentSeries" :height="216" />
        </div>
        <div class="chart-spec-card">
                    <Chart title="各课程男女比例" type="bar" stacked percent horizontal :categories="percentHCategories" :series="percentHSeries" :height="216" />
        </div>
      </div>
    </div>
  </section>
  <!-- 双向柱状图 -->
  <section id="chart-diverging" class="demo-section">
    <h2 class="demo-section__title">Diverging 双向柱状图
      <CopyToCC anchor="chart-diverging" />
    </h2>
    <div class="demo-block">
      <p class="demo-desc">正负相对的数据（收入/支出、转入/转出）；恰好 2 组、从零轴反向展开；横排即双向条形图。</p>
      <div class="chart-spec-row">
        <div class="chart-spec-card">
                    <Chart title="各周选课变动" type="bar" diverging :categories="divCategories" :series="divSeries" unit="人" :height="216" />
        </div>
        <div class="chart-spec-card">
                    <Chart title="各院系转入/转出" type="bar" diverging horizontal :categories="divHCategories" :series="divHSeries" unit="人" :height="216" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 图表组件 —— 业务组件 Chart 的全部形态展示（覆盖《Web 图表设计指南》图型清单）。
 * 形态 = 基础型（bar/line/donut/pie/bar-line/waterfall/scatter/radar）×
 * 正交配置（horizontal / stacked / percent / diverging / 多序列），
 * 取色/主题品牌重绘/图形风格全在 Chart 源头；本页只传 type + data，
 * 典型页面与下游项目的调用方式与本页完全相同。
 * 选型判据与各图型细则见 references/display-guide.md「数据可视化」段。
 */
import { ref, reactive } from 'vue'
import CopyToCC from '../CopyToCC.vue'
import { Chart } from '../../../../design-spec/components'

// 范围控件开关：折线/柱状两区块共用演示同一能力。默认关闭——
// 真实调用中开不开不是喜好项，由下游 CC 按「横轴点位多」判据决定（规则在 catalog mustRules / display-guide）
const zoomable = ref(false)
const chartConfig = reactive({ zoomable })

// 折线：时间有序；30 个点位演示 zoomable 底部范围控件
const lineData = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}日`,
  value: 88 + Math.round(6 * Math.sin(i / 3) + (i % 4)),
}))

// 柱状图横坐标必须有序类别（学期有先后）；无序类别（如班级、科目）用条形图。
// 用 2 个系列并排展示，给「并排系列最多 4 组」一个看得见的对照
const barCategories = ['大一上', '大一下', '大二上', '大二下', '大三上']
const barSeries = [
  { name: '平均分', data: [78, 82, 79, 86, 91] },
  { name: '最高分', data: [92, 95, 93, 97, 99] },
]

// 条形：无序类别
const barHData = [
  { name: '多媒体教材', value: 46 },
  { name: '课堂实录视频', value: 38 },
  { name: '在线互动文档', value: 31 },
  { name: '课件 PPT', value: 19 },
  { name: '其他资源', value: 8 },
]

// 堆积柱：竖排堆积同样受「横轴须有序类别」硬规则约束——班级是无序类别（序号只是命名），须用学期/考次等有序类目
const stackCategories = ['大一上', '大一下', '大二上', '大二下']
const stackSeries = [
  { name: '选择题', data: [32, 28, 35, 26] },
  { name: '填空题', data: [24, 26, 22, 20] },
  { name: '简答题', data: [30, 25, 34, 28] },
]

// 堆积条：无序类别（科目）
const stackHCategories = ['语文', '数学', '英语']
const stackHSeries = [
  { name: '作业', data: [18, 22, 15] },
  { name: '测验', data: [8, 10, 6] },
  { name: '讨论', data: [12, 6, 14] },
]

// 百分比堆积：只 2 组
const percentCategories = ['大一上', '大一下', '大二上', '大二下']
const percentSeries = [
  { name: '线上课时', data: [24, 32, 40, 52] },
  { name: '线下课时', data: [72, 64, 58, 46] },
]
const percentHCategories = ['高等数学', '大学物理', '程序设计']
const percentHSeries = [
  { name: '男生', data: [45, 52, 61] },
  { name: '女生', data: [38, 30, 25] },
]

// 双向：正负相对，恰 2 序列
const divCategories = ['第1周', '第2周', '第3周', '第4周', '第5周']
const divSeries = [
  { name: '新增选课', data: [42, 35, 28, 18, 12] },
  { name: '退课', data: [8, 12, 6, 9, 4] },
]
const divHCategories = ['计算机学院', '外国语学院', '数学学院', '物理学院']
const divHSeries = [
  { name: '转入', data: [26, 14, 18, 9] },
  { name: '转出', data: [12, 18, 7, 15] },
]

// 柱线：两种性质数据（个数 vs 百分比），柱=重要数据走左轴
const barLineCategories = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周']
const barLineSeries = [
  { name: '发布任务', data: [12, 15, 9, 18, 14, 16] },
  { name: '完成率', data: [86, 82, 91, 78, 88, 90], kind: 'line' as const },
]

// 环形 / 饼：单组占比
const donutData = [
  { name: '其他', value: 12 },
  { name: '练习', value: 18 },
  { name: '测验', value: 22 },
  { name: '文档', value: 28 },
  { name: '多媒体教材', value: 24 },
]
const pieData = [
  { name: '概念理解', value: 32 },
  { name: '解题方法', value: 26 },
  { name: '作业疑问', value: 20 },
  { name: '拓展探究', value: 12 },
  { name: '其他', value: 10 },
]

// 散点：两变量相关性（多序列即多色散点）
const scatterSeries = [
  {
    name: '一班',
    data: [[6, 72], [8, 78], [9, 74], [11, 82], [12, 85], [14, 88], [15, 84], [17, 91], [18, 93], [20, 95]] as [number, number][],
  },
  {
    name: '二班',
    data: [[5, 68], [7, 70], [8, 75], [10, 77], [12, 80], [13, 78], [15, 86], [16, 83], [19, 90], [21, 92]] as [number, number][],
  },
]

// 雷达：维度 ≥3，分类 ≤4
const radarIndicators = [
  { name: '出勤', max: 100 },
  { name: '作业', max: 100 },
  { name: '课堂互动', max: 100 },
  { name: '测验', max: 100 },
  { name: '实验', max: 100 },
]
const radarSeries = [
  { name: '一班', data: [92, 85, 74, 88, 80] },
  { name: '二班', data: [86, 90, 82, 76, 85] },
]
</script>

<style scoped>
/* 纯本页排版：图表卡与看板页同构（白底面板 + 细描边 + 大卡片档）；
   一节多卡时并排、间距走「卡片之间」档 */
.chart-spec-row {
  display: flex;
  gap: var(--iflyv-spacing-4);
  margin-top: var(--iflyv-spacing-3);
}
.chart-spec-card {
  flex: 1;
  min-width: 0;
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-5);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
  background: var(--iflyv-bg-panel);
}
</style>
