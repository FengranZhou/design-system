<template>
  <section id="data-display" class="demo-section">
    <h2 class="demo-section__title">DataDisplay 数据展示</h2>

    <!-- 徽标：四类载体（头像/按钮/图标/Tab）通过配置项切换，每类固定四状态（点 / 数字 / 上限 99+ / 英文） -->
    <div class="demo-block badge-showcase">
      <div class="badge-showcase__main">
        <p class="demo-label">徽标</p>

        <!-- 头像 -->
        <div v-if="badgeType === 'avatar'" class="demo-row" style="gap: 24px;">
          <el-badge is-dot>
            <UserAvatar :size="40" role="teacher-male" />
          </el-badge>
          <el-badge :value="12">
            <UserAvatar :size="40" role="teacher-female" />
          </el-badge>
          <el-badge :value="100" :max="99">
            <UserAvatar :size="40" role="student-male" />
          </el-badge>
          <el-badge value="new">
            <UserAvatar :size="40" role="student-female" />
          </el-badge>
        </div>

        <!-- 按钮 -->
        <div v-else-if="badgeType === 'button'" class="demo-row">
          <el-badge is-dot>
            <el-button>通知</el-button>
          </el-badge>
          <el-badge :value="5">
            <el-button>消息</el-button>
          </el-badge>
          <el-badge :value="100" :max="99">
            <el-button>待处理</el-button>
          </el-badge>
          <el-badge value="hot">
            <el-button>活动</el-button>
          </el-badge>
        </div>

        <!-- 图标 -->
        <div v-else-if="badgeType === 'icon'" class="demo-row" style="gap: 32px;">
          <el-badge is-dot>
            <Mail :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge :value="8">
            <Bell :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge :value="100" :max="99">
            <MessageSquare :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge value="new">
            <Heart :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
        </div>

        <!-- Tab 导航项：badge 挂 tab 用源头约定 .tab-badge（定位 + 选中态不下沉统一在源头，不手写 offset） -->
        <el-tabs v-else class="badge-tabs">
          <el-tab-pane>
            <template #label>
              <el-badge is-dot class="tab-badge">待审核</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <el-badge :value="3" class="tab-badge">全部任务</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <el-badge :value="100" :max="99" class="tab-badge">已完成</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <el-badge value="new" class="tab-badge">最新</el-badge>
          </template>
        </el-tab-pane>
        </el-tabs>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form label-width="auto">
          <el-form-item label="类型">
            <el-radio-group v-model="badgeType">
              <el-radio value="avatar">头像</el-radio>
              <el-radio value="button">按钮</el-radio>
              <el-radio value="icon">图标</el-radio>
              <el-radio value="tab">tab 栏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <!-- ⏸ 暂停展示：Progress 进度条。暂时不要，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">进度条</p>
      <div style="width: 400px;">
        <el-progress :percentage="30" />
        <el-progress :percentage="70" status="success" style="margin-top: 12px;" />
        <el-progress :percentage="50" status="warning" style="margin-top: 12px;" />
        <el-progress :percentage="80" status="exception" style="margin-top: 12px;" />
      </div>
    </div>
    -->

    <div class="demo-block">
      <p class="demo-label">描述列表</p>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="姓名">张三</el-descriptions-item>
        <el-descriptions-item label="部门">设计部</el-descriptions-item>
        <el-descriptions-item label="职级">P6</el-descriptions-item>
        <el-descriptions-item label="邮箱">zhangsan@example.com</el-descriptions-item>
        <el-descriptions-item label="入职日期">2024-03-15</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag type="success" round>在职</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- ⏸ 暂停展示：Timeline 时间线。暂时不用，保留代码 + script 里 timelineItems / formatTime import，需要时一并放开。
         时间戳按文案规范格式化：本年内省略年份（MM-DD HH:mm）、跨年展示完整年份，精确至分钟，走源头 formatTime。
    <div class="demo-block">
      <p class="demo-label">时间线</p>
      <el-timeline>
        <el-timeline-item
          v-for="item in timelineItems"
          :key="item.raw"
          :timestamp="formatTime(item.raw)"
          :type="item.type"
        >{{ item.label }}</el-timeline-item>
      </el-timeline>
    </div>
    -->

    <!-- ⏸ 暂停展示：Tree 树形控件（基础树 / 可选择树 / 高亮当前节点）。暂时不用，保留代码 + script 里 treeData/treeDataDisabled，需要时一并放开。
    <div class="demo-block">
      <p class="demo-label">树形控件</p>
      <div class="demo-row" style="gap: 48px; align-items: flex-start;">
        <div>
          <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">基础树</p>
          <el-tree :data="treeData" default-expand-all />
        </div>
        <div>
          <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">可选择树（含禁用）</p>
          <el-tree :data="treeDataDisabled" show-checkbox default-expand-all node-key="id" />
        </div>
        <div>
          <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">高亮当前节点</p>
          <el-tree :data="treeData" default-expand-all node-key="id" highlight-current :current-node-key="2" />
        </div>
      </div>
    </div>
    -->

    <!-- ⏸ 暂停展示：Collapse 折叠面板（默认模式 + 手风琴模式）。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">折叠面板</p>
      <div class="demo-row" style="gap: 48px; align-items: flex-start;">
        <div style="width: 360px;">
          <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">默认模式</p>
          <el-collapse v-model="collapseActive">
            <el-collapse-item title="一致性" name="1">
              <p>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念。</p>
            </el-collapse-item>
            <el-collapse-item title="反馈" name="2">
              <p>通过界面样式和交互动效让用户可以清晰的感知自己的操作。</p>
            </el-collapse-item>
            <el-collapse-item title="效率" name="3">
              <p>简化流程，让用户在更少的操作下完成任务。</p>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div style="width: 360px;">
          <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">手风琴模式</p>
          <el-collapse v-model="collapseAccordion" accordion>
            <el-collapse-item title="一致性" name="1">
              <p>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念。</p>
            </el-collapse-item>
            <el-collapse-item title="反馈" name="2">
              <p>通过界面样式和交互动效让用户可以清晰的感知自己的操作。</p>
            </el-collapse-item>
            <el-collapse-item title="效率" name="3">
              <p>简化流程，让用户在更少的操作下完成任务。</p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
    -->

    <div class="demo-block">
      <p class="demo-label">骨架屏</p>
      <!-- ⏸ 暂停展示：基础骨架屏（无动画）。暂时不用，保留代码，需要时放开。
      <div style="width: 300px;">
        <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">基础骨架屏</p>
        <el-skeleton :rows="3" />
      </div>
      -->
      <!-- 白底衬底：骨架屏灰条铺在浅灰 bg-card 上对比弱，套一层 bg-panel 白底衬托 -->
      <div class="skeleton-panel">
        <el-skeleton :rows="3" animated />
      </div>
      <!-- ⏸ 暂停展示：切换加载状态（loading ↔ 内容）。暂时不用，保留代码 + script 里 skeletonLoading，需要时一并放开。
      <div style="margin-top: 24px;">
        <el-button @click="skeletonLoading = !skeletonLoading" style="margin-bottom: 12px;">
          切换加载状态
        </el-button>
        <el-skeleton :loading="skeletonLoading" animated :rows="2">
          <template #default>
            <p style="color: var(--iflyv-text-2);">这是加载完成后展示的实际内容。骨架屏可用于内容加载前的占位展示，提升用户体验。</p>
          </template>
        </el-skeleton>
      </div>
      -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Mail, MessageSquare, Heart } from 'lucide-vue-next'
import { UserAvatar } from '../../../design-spec/components'
// ⏸ 随 Timeline 时间线块暂停（模板已注释），保留、需要时一并放开（含 formatTime import）：
/*
import { formatTime } from '../../../design-spec/utils/format-time'

// Timeline 时间线数据：raw 为完整时间（精确至分钟），展示时经 formatTime 按文案规范格式化。
// 用当前年，令「本年内省略年份」规则生效（显示 MM-DD HH:mm）。
const nowYear = new Date().getFullYear()
const timelineItems = [
  { raw: `${nowYear}-03-17 09:30`, label: '提交需求文档', type: 'primary' as const },
  { raw: `${nowYear}-03-15 14:00`, label: '完成设计评审', type: 'success' as const },
  { raw: `${nowYear}-03-10 10:15`, label: '启动项目排期', type: 'warning' as const },
  { raw: `${nowYear}-03-05 16:45`, label: '创建项目仓库', type: '' as const },
]
*/

// ⏸ 随 Tree 树形控件块暂停（模板已注释），保留、需要时一并放开：
/*
const treeData = [
  {
    id: 1,
    label: '研发中心',
    children: [
      {
        id: 2,
        label: '前端组',
        children: [
          { id: 5, label: '张三' },
          { id: 6, label: '李四' },
        ],
      },
      {
        id: 3,
        label: '后端组',
        children: [
          { id: 7, label: '王五' },
        ],
      },
    ],
  },
  {
    id: 4,
    label: '设计中心',
    children: [
      { id: 8, label: 'UI 组' },
      { id: 9, label: 'UX 组' },
    ],
  },
]

const treeDataDisabled = [
  {
    id: 10,
    label: '研发中心',
    children: [
      { id: 11, label: '前端组' },
      { id: 12, label: '后端组', disabled: true },
    ],
  },
  {
    id: 13,
    label: '设计中心',
    disabled: true,
    children: [
      { id: 14, label: 'UI 组' },
      { id: 15, label: 'UX 组' },
    ],
  },
]
*/

// ⏸ 随 Collapse 折叠面板块暂停（模板已注释），保留、需要时一并放开：
// const collapseActive = ref(['1'])
// const collapseAccordion = ref('1')

// ⏸ 随「切换加载状态」骨架屏（已移除）暂停，保留、需要时一并放开：
// const skeletonLoading = ref(true)

// 徽标载体类型：头像 / 按钮 / 图标 / tab 栏
const badgeType = ref('avatar')
</script>

<style scoped>
/* 每个 demo 块用 bg-card 大卡片做区分（与 Cell / Input / FormControl 配置式范式一致）。
   卡间垂直间距统一 24（spacing-6）；覆盖全局 .demo-block 自带的 48px margin，避免叠加。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.demo-section .demo-block + .demo-block {
  margin-top: var(--iflyv-spacing-6);
}

/* 骨架屏白底衬底：灰条铺在浅灰 bg-card 上对比弱，套一层白底衬托（纯本页排版，走令牌） */
.skeleton-panel {
  width: 300px;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-md);
}

/* 徽标块：左列（标题+示例）+ 右列配置卡，配置卡顶与标题顶齐平 */
.badge-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.badge-showcase__main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .badge-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}

/* 配置卡在块卡（bg-card）内部，白底 + 细边框区分层次，避免同色套同色 */
.config-card {
  flex: 0 1 auto;
  width: 220px;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
/* 配置项内单选纵向排列，占满配置卡宽度 */
.config-card :deep(.el-radio-group) {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--iflyv-spacing-2);
}
</style>
