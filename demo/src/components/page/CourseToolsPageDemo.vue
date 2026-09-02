<template>
  <section id="page-course-tools" class="demo-section">
    <!-- 标题行按 toolbar-pattern 分支①：标题左、操作右（同「公开信息设置」页） -->
    <div class="toolbar course-tools-demo__toolbar">
      <div class="toolbar__left">
        <h2 class="demo-section__title">Course Tools 课程工具</h2>
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
    <div class="course-tools-stage" :class="{ 'course-tools-stage--fullscreen': isFullscreen }">
      <PageFrame
        v-model:active="activeKey"
        :menus="menus"
        :course="course"
        :breadcrumbs="breadcrumbs"
        :back-disabled="true"
        avatar-role="teacher-male"
      >
        <div class="course-tools">
          <!-- 页面级主标题（本页无 tab，标题独立成层） -->
          <h3 class="course-tools__title">课程工具</h3>

          <section v-for="group in toolGroups" :key="group.title" class="tool-group">
            <h4 class="tool-group__title">{{ group.title }}</h4>
            <!-- 分栏走源头栅格约定类：24 列，col-6 = 四列数据卡（最小粒度），
                 水槽与换行间距由 --iflyv-grid-gutter 提供（=「卡片之间」同档） -->
            <div class="grid">
              <div v-for="tool in group.tools" :key="tool.label" class="grid__col-6 tool-card">
                <img class="tool-card__icon" :src="tool.icon" alt="" />
                <span class="tool-card__label">{{ tool.label }}</span>
              </div>
            </div>
          </section>
        </div>
      </PageFrame>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 典型页面 —— 课程工具（参考讯飞小雅「教学内容 / 课程工具」页）。
 * 演示效率型「功能入口集合页」的组织：
 *   PageFrame 整页骨架 + 页面级标题 + 模块分组 + 源头栅格 .grid/.grid__col-6 四列卡。
 * 工具图标以二级图标四款轮转占位（24px），正式切图到位后逐一替换即可。
 * 本页 scoped 只写排版留白，组件外观均在源头。
 */
import { h, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Maximize, Minimize } from 'lucide-vue-next'
import { PageFrame, type PageFrameMenuGroup, type PageFrameCourse } from '../../../../design-spec/components'
import NavIcon from '../biz/NavIcon.vue'
import establishSvg from '../../assets/nav-icons/establish.svg?raw'
import establishActiveSvg from '../../assets/nav-icons/establish-active.svg?raw'
// —— 工具图标：二级图标四款（智慧课件/作业/测验/任务团子）轮转占位 ——
import iconCourseware from '../../assets/icons/level2/3.png'
import iconHomework from '../../assets/icons/level2/4.png'
import iconQuiz from '../../assets/icons/level2/5.png'
import iconTuanzi from '../../assets/icons/level2/6.png'

// —— 框架数据（同「公开信息设置」口径：组标题「典型页面」+ 本页单项）——
const menus: PageFrameMenuGroup[] = [
  {
    title: '典型页面',
    items: [{ key: 'course-tools', label: '课程工具', icon: (props: Record<string, unknown>) => h(NavIcon, { normal: establishSvg, activeSvg: establishActiveSvg, ...props }) }],
  },
]
const activeKey = ref('course-tools')

const course: PageFrameCourse = {
  name: '《智能启思从零懂智能》',
  meta: ['2023年春', '全网公开', '教务开课'],
}

// 面包屑首项 = 组标题；组标题非实体页 → 返回箭头禁用
const breadcrumbs = [{ label: '典型页面' }, { label: '课程工具' }]

// —— 工具分组（结构与文案沿用参考页）——
// 四款二级图标循环分配到各工具（固定轮转而非运行时随机，保证每次渲染/截图一致）；
// 个别工具可用第二参显式指定图标（0 课件绿 / 1 作业紫 / 2 测验蓝 / 3 团子），不打乱其余轮转
const TOOL_ICONS = [iconCourseware, iconHomework, iconQuiz, iconTuanzi]
let seq = 0
const tool = (label: string, iconIdx?: number) => {
  const i = iconIdx ?? seq % TOOL_ICONS.length
  seq++
  return { label, icon: TOOL_ICONS[i] }
}

const toolGroups = [
  { title: '教学增强', tools: [tool('评价活动'), tool('黑板'), tool('私信/群聊'), tool('回收站')] },
  { title: '课堂活动与表现', tools: [tool('签到管理', 2), tool('课堂表现管理', 3), tool('课堂活动管理', 1)] },
  { title: '教学回顾', tools: [tool('教学反思'), tool('往期课程空间')] },
  { title: '课程克隆', tools: [tool('课程克隆')] },
]

// —— 全屏预览（同「公开信息设置」的 demo 看图辅助）——
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
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* ===== 纯本页排版：舞台 / 留白，分栏走源头 .grid，组件外观不碰 ===== */

.course-tools-demo__toolbar {
  margin-bottom: var(--iflyv-spacing-4);
}
.course-tools-demo__toolbar .demo-section__title {
  margin-bottom: 0;
}

/* 承载舞台（同 PublicInfoPageDemo 的 demo 脚手架口径） */
.course-tools-stage {
  height: 640px;
  border-radius: var(--iflyv-radius-lg);
  overflow: hidden;
}
.course-tools-stage--fullscreen {
  position: fixed;
  inset: 0;
  height: auto;
  z-index: calc(var(--iflyv-z-sticky) + 1);
  border-radius: 0;
}

/* 页面内容区：顶 = 页面级标题与页面顶部(16)，左右/底 = 24 */
.course-tools {
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-6) var(--iflyv-spacing-6);
}

/* 页面级主标题：title-page 字阶；与下方内容 16 */
.course-tools__title {
  margin: 0 0 var(--iflyv-spacing-4);
  font: var(--iflyv-font-title-page);
  color: var(--iflyv-text-1);
}

/* 模块之间 32；模块级标题与其下方内容 12 */
.tool-group + .tool-group {
  margin-top: var(--iflyv-spacing-8);
}
.tool-group__title {
  margin: 0 0 var(--iflyv-spacing-3);
  font: var(--iflyv-font-title-module);
  color: var(--iflyv-text-1);
}

/* 工具入口卡：左右 16（小卡片档）；上下按用户视觉定稿放宽到 16（较小卡片成对锚点的 12 高一档，
   因 24px 图标撑行、上下 12 观感偏挤）；图标与文字横向 8 */
.tool-card {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  padding: var(--iflyv-spacing-4);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-bg-card);
}
.tool-card__icon {
  width: 24px;
  height: 24px;
}
.tool-card__label {
  font: var(--iflyv-font-body-primary);
  color: var(--iflyv-text-1);
}
</style>
