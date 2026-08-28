<template>
  <section id="page-course-dashboard" class="demo-section">
    <!-- 标题行按 toolbar-pattern 分支①：标题左、操作右（同前两个典型页面） -->
    <div class="toolbar course-dashboard-demo__toolbar">
      <div class="toolbar__left">
        <h2 class="demo-section__title">Profile 课程画像</h2>
      </div>
      <div class="toolbar__right">
        <el-button @click="toggleFullscreen">
          <template #icon>
            <Minimize v-if="isFullscreen" :size="16" :stroke-width="2" />
            <Maximize v-else :size="16" :stroke-width="2" />
          </template>
          {{ isFullscreen ? '退出全屏' : '全屏查看' }}
        </el-button>
      </div>
    </div>

    <!-- 承载舞台：固定高度模拟视口；全屏态 fixed 铺满，Esc 退出（demo 看图辅助） -->
    <div class="course-dashboard-stage" :class="{ 'course-dashboard-stage--fullscreen': isFullscreen }">
      <PageFrame
        v-model:active="activeKey"
        :menus="menus"
        :course="course"
        :breadcrumbs="breadcrumbs"
        :back-disabled="true"
        avatar-role="teacher-male"
      >
        <div class="dashboard">
          <!-- 页面级 tab 充当标题层 + 右侧主操作（主按钮贴容器右缘） -->
          <div class="dashboard__head">
            <el-tabs v-model="activeTab" class="tabs-page dashboard__tabs">
              <el-tab-pane label="课程看板" name="board" />
              <el-tab-pane label="AI+应用看板" name="ai" />
              <el-tab-pane label="课堂教学活动轨迹" name="track" />
              <el-tab-pane label="课堂实录分析" name="record" />
              <el-tab-pane label="班级画像" name="class" />
              <el-tab-pane label="成员画像" name="member" />
            </el-tabs>
            <el-button type="primary">查看课程群画像</el-button>
          </div>

          <template v-if="activeTab === 'board'">
            <!-- KPI 指标条：并列次级指标 → number-display-sm 数字字阶（规范：单个数字不画图）。
                 8 个并列指标一行铺开属卡内条目排布（非页面分栏），不走栅格（col-3 低于 6 列下限） -->
            <div class="kpi-strip">
              <div v-for="kpi in kpis" :key="kpi.label" class="kpi-item">
                <span class="kpi-item__num">{{ formatNumber(kpi.value) }}<em class="kpi-item__unit">{{ kpi.unit }}</em></span>
                <span class="kpi-item__label">{{ kpi.label }}</span>
              </div>
            </div>

            <!-- 课程备课：两张环形图卡（占比构成 → donut，扇区 ≤5） -->
            <section class="board-group">
              <h4 class="board-group__title">课程备课</h4>
              <div class="grid">
                <div v-for="d in donuts" :key="d.title" class="grid__col-12 chart-card">
                  <Chart type="donut" :title="d.title" :data="d.data" :center-title="d.total" :center-label="d.centerLabel" :height="180" />
                </div>
              </div>
            </section>

            <!-- 课堂授课：三张柱状图卡（类目比大小 → bar） -->
            <section class="board-group">
              <h4 class="board-group__title">课堂授课</h4>
              <div class="grid">
                <div v-for="b in bars" :key="b.title" class="grid__col-8 chart-card">
                  <Chart type="bar" :title="b.title" :data="b.data" :series-name="b.seriesName" :height="200" />
                </div>
              </div>
            </section>
          </template>

          <!-- 其余 tab 不在演示范围：空态占满内容区 → 页面级档 -->
          <el-empty
            v-else
            class="empty-page"
            :image="isDark ? noDataDark : noData"
            description="该 Tab 内容不在本页演示范围"
          />
        </div>
      </PageFrame>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 典型页面 —— 课程画像（参考讯飞小雅「课程看板」数据页；页面名取「课程画像」
 * 作六个 tab——看板/AI+应用/活动轨迹/实录分析/班级画像/成员画像——的总称，
 * 「课程看板」只是第一个 tab，不再用作页面名）。
 * 演示数据看板页的组织：
 *   PageFrame 骨架 + .tabs-page 标题层与右侧主操作 + KPI 数字条（number-display-sm）+
 *   模块分组 + 栅格分栏（col-12 双环图 / col-8 三柱图）+ 业务组件 Chart（取色/重绘在源头）。
 * 本页 scoped 只写排版留白，图表规范全部固化在 Chart 组件源头。
 */
import { h, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Maximize, Minimize } from 'lucide-vue-next'
import { PageFrame, Chart, type PageFrameMenuGroup, type PageFrameCourse } from '../../../../design-spec/components'
import { formatNumber } from '../../../../design-spec/utils/format-number'
import NavIcon from '../biz/NavIcon.vue'
import progressSvg from '../../assets/nav-icons/progress.svg?raw'
import progressActiveSvg from '../../assets/nav-icons/progress-active.svg?raw'
import noData from '../../../../design-spec/el-theme/assets/empty/no-data.png'
import noDataDark from '../../../../design-spec/el-theme/assets/empty/dark/no-data.png'

// —— 框架数据（同前两页口径：组标题「典型页面」+ 本页单项）——
const menus: PageFrameMenuGroup[] = [
  {
    title: '典型页面',
    items: [{ key: 'course-dashboard', label: '课程画像', icon: (props: Record<string, unknown>) => h(NavIcon, { normal: progressSvg, activeSvg: progressActiveSvg, ...props }) }],
  },
]
const activeKey = ref('course-dashboard')

const course: PageFrameCourse = {
  name: '《智能启思从零懂智能》',
  meta: ['2023年春', '全网公开', '教务开课'],
}

const breadcrumbs = [{ label: '典型页面' }, { label: '课程画像' }]

const activeTab = ref('board')

// —— KPI 指标（并列次级指标）——
const kpis = [
  { value: 2, unit: '人', label: '教师' },
  { value: 2, unit: '人', label: '助教' },
  { value: 82, unit: '人', label: '学生' },
  { value: 107, unit: '人', label: '访客人数' },
  { value: 345, unit: '人次', label: '访客人次' },
  { value: 5082, unit: '次', label: '访问热度' },
  { value: 50, unit: '%', label: '建设完整度' },
  { value: 1.5, unit: '人', label: '应用指数' },
]

// —— 环形图（占比构成，扇区 ≤5）——
const donuts = [
  {
    title: '课程资源分布',
    total: 104,
    centerLabel: '课程资源',
    data: [
      { name: '其他', value: 12 },
      { name: '练习', value: 18 },
      { name: '测验', value: 22 },
      { name: '文档', value: 28 },
      { name: '多媒体教材', value: 24 },
    ],
  },
  {
    title: '课程任务分布',
    total: 325,
    centerLabel: '课程任务',
    data: [
      { name: '其他', value: 25 },
      { name: '练习', value: 45 },
      { name: '测验', value: 85 },
      { name: '文档', value: 95 },
      { name: '多媒体教材', value: 75 },
    ],
  },
]

// —— 柱状图（类目比大小）——
const bars = [
  { title: '开启授课', seriesName: '授课次数', data: [{ name: '本学期', value: 41 }, { name: '上学期', value: 33 }] },
  { title: '授课资源', seriesName: '资源数量', data: [{ name: '本学期', value: 41 }, { name: '上学期', value: 33 }] },
  { title: '课堂互动', seriesName: '互动次数', data: [{ name: '本学期', value: 41 }, { name: '上学期', value: 33 }] },
]

// —— 跟随全局主题切换空状态亮/暗插画 ——
const isDark = ref(false)
let themeObserver: MutationObserver | null = null
function syncTheme() {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
}

// —— 全屏预览（同前两页的 demo 看图辅助）——
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    ElMessage({ message: '已进入全屏预览，按 Esc 退出', showClose: true })
  }
}
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !isFullscreen.value) return
  isFullscreen.value = false
  ;(document.activeElement as HTMLElement | null)?.blur()
}

onMounted(() => {
  syncTheme()
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  themeObserver?.disconnect()
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* ===== 纯本页排版：舞台 / 留白，分栏走源头 .grid，图表外观在 Chart 源头 ===== */

.course-dashboard-demo__toolbar {
  margin-bottom: var(--iflyv-spacing-4);
}
.course-dashboard-demo__toolbar .demo-section__title {
  margin-bottom: 0;
}

/* 承载舞台（同前两页的 demo 脚手架口径） */
.course-dashboard-stage {
  height: 640px;
  border-radius: var(--iflyv-radius-lg);
  overflow: hidden;
}
.course-dashboard-stage--fullscreen {
  position: fixed;
  inset: 0;
  height: auto;
  z-index: calc(var(--iflyv-z-sticky) + 1);
  border-radius: 0;
}

/* 页面内容区：顶 = 页面级标题与页面顶部(16)，左右/底 = 24 */
.dashboard {
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-6) var(--iflyv-spacing-6);
}

/* 标题层：页面级 tab 左、主操作贴右缘（主按钮贴边原则）；下方 = 页面级标题与其下方内容(16) */
.dashboard__head {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-4);
  margin-bottom: var(--iflyv-spacing-4);
}
.dashboard__tabs {
  flex: 1;
  min-width: 0;
}

/* KPI 指标条：大卡片档（上下 16 / 左右 20）；8 个并列指标均布（卡内条目排布，非页面分栏） */
.kpi-strip {
  display: flex;
  justify-content: space-between;
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-5);
  border-radius: var(--iflyv-radius-md);
  background: var(--iflyv-bg-card);
}
.kpi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 数字与说明是列表项内子元素关系（主信息与副信息） */
  gap: var(--iflyv-spacing-2);
}
.kpi-item__num {
  font: var(--iflyv-font-number-display-sm);
  color: var(--iflyv-text-1);
}
.kpi-item__unit {
  font: var(--iflyv-font-body-min);
  font-style: normal;
  color: var(--iflyv-text-3);
  /* 单位紧贴数字：控件内文字与其紧邻元素微间距 */
  margin-inline-start: var(--iflyv-spacing-0_5);
}
.kpi-item__label {
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-3);
}

/* 模块分组：组与组 32（模块之间）；组标题下方 12（模块级标题与其下方内容）。
   首组与 KPI 条之间同为模块间关系 */
.board-group {
  margin-top: var(--iflyv-spacing-8);
}
.board-group__title {
  margin: 0 0 var(--iflyv-spacing-3);
  font: var(--iflyv-font-title-module);
  color: var(--iflyv-text-1);
}

/* 图表卡：大卡片档内边距 + radius-md；白底面板叠白内容区，靠细描边分界 */
.chart-card {
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-5);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
  background: var(--iflyv-bg-panel);
}
</style>
