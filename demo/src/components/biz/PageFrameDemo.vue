<template>
  <section id="page-frame" class="demo-section">
    <h2 class="demo-section__title">PageFrame 页面框架</h2>

    <!-- 框架承载舞台：固定高度模拟视口，框架内部自适应铺满（纯本页排版）。
         框架自带 bg-page 灰底，不再套 bg-card 灰卡片，直接描边收边。 -->
    <div class="page-frame-stage">
        <PageFrame
          v-model:active="activeKey"
          :menus="menus"
          :course="course"
          :breadcrumbs="breadcrumbs"
          :notice-count="13"
          avatar-role="teacher-female"
        >
          <!-- 内容区留白底即可（默认插槽由接入方填页面内容） -->
        </PageFrame>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BookOpen,
  ClipboardList,
  Network,
  ClipboardCheck,
  Wrench,
  Sparkles,
  LayoutGrid,
  Video,
  TrendingUp,
  Gauge,
  MessageCircleQuestion,
  Settings,
  UserCog,
} from 'lucide-vue-next'
import { PageFrame, type PageFrameMenuGroup, type PageFrameCourse } from '../../../../design-spec/components'

const course: PageFrameCourse = {
  name: '《智能启思从零懂智能》',
  meta: ['2023年春', '全网公开', '教务开课'],
}

const menus: PageFrameMenuGroup[] = [
  {
    title: '教学内容',
    items: [
      { key: 'prepare', label: '备授课', icon: BookOpen },
      { key: 'homework', label: '作业任务', icon: ClipboardList },
      { key: 'graph', label: '课程图谱', icon: Network },
      { key: 'question-bank', label: '课程题库', icon: ClipboardCheck },
      { key: 'course-tool', label: '课程工具', icon: Wrench },
    ],
  },
  {
    title: 'AI能力',
    items: [{ key: 'ai-workbench', label: 'AI工作台', icon: Sparkles }],
  },
  {
    title: '教学运营',
    items: [
      {
        key: 'grouping',
        label: '分组',
        icon: LayoutGrid,
        children: [
          { key: 'grouping-student', label: '学生分组' },
          { key: 'grouping-activity', label: '分组活动' },
        ],
      },
      {
        key: 'live',
        label: '直播课堂',
        icon: Video,
        children: [
          { key: 'live-list', label: '直播列表' },
          { key: 'live-replay', label: '直播回放' },
        ],
      },
      { key: 'learning', label: '学生学情', icon: TrendingUp },
      { key: 'portrait', label: '课程画像', icon: Gauge },
      { key: 'qa', label: '答疑区', icon: MessageCircleQuestion },
    ],
  },
  {
    title: '课程设置',
    items: [
      { key: 'course-info', label: '课程信息', icon: Settings },
      { key: 'members', label: '成员管理', icon: UserCog },
    ],
  },
]

const activeKey = ref('course-tool')

// 面包屑随选中项联动：所在分组名 →（父项名 →）当前项名
const breadcrumbs = computed(() => {
  for (const group of menus) {
    for (const item of group.items) {
      if (item.key === activeKey.value)
        return [{ label: group.title ?? '' }, { label: item.label }]
      const child = item.children?.find((c) => c.key === activeKey.value)
      if (child)
        return [{ label: group.title ?? '' }, { label: item.label }, { label: child.label }]
    }
  }
  return [{ label: '教学内容' }]
})
</script>

<style scoped>
/* 承载舞台：固定高度模拟真实视口，描边收边便于观察框架边界（纯本页排版，不碰组件外观） */
.page-frame-stage {
  height: 640px;
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-lg);
  overflow: hidden;
}
</style>
