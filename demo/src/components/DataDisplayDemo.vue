<template>
  <section id="data-display" class="demo-section">
    <h2 class="demo-section__title">DataDisplay 数据展示</h2>

    <div class="demo-block">
      <p class="demo-label">Badge 徽标 + Avatar 头像</p>
      <div class="demo-row">
        <el-badge :value="12">
          <UserAvatar :size="40" role="teacher-male" />
        </el-badge>
        <el-badge :value="3" type="primary">
          <UserAvatar :size="40" role="teacher-female" />
        </el-badge>
        <el-badge value="new" type="success">
          <UserAvatar :size="40" role="student-male" />
        </el-badge>
        <el-badge is-dot>
          <UserAvatar :size="40" role="student-female" />
        </el-badge>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Badge 徽标 + Button 按钮</p>
      <div class="demo-row">
        <el-badge :value="5">
          <el-button>消息</el-button>
        </el-badge>
        <el-badge :value="12">
          <el-button type="primary">待处理</el-button>
        </el-badge>
        <el-badge value="hot" type="warning">
          <el-button>活动</el-button>
        </el-badge>
        <el-badge is-dot>
          <el-button>通知</el-button>
        </el-badge>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Badge 徽标 + Icon 图标</p>
      <div class="demo-row" style="gap: 24px;">
        <el-badge :value="8">
          <Bell :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
        </el-badge>
        <el-badge is-dot>
          <Mail :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
        </el-badge>
        <el-badge :value="99" :max="99">
          <MessageSquare :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
        </el-badge>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Badge 徽标 + Tab 导航项</p>
      <el-tabs class="badge-tabs">
        <el-tab-pane>
          <template #label>
            <el-badge :value="3" :offset="[10, -2]">全部任务</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane>
          <template #label>
            <el-badge is-dot :offset="[6, -2]">待审核</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已完成" />
      </el-tabs>
    </div>

    <div class="demo-block">
      <p class="demo-label">Progress 进度条</p>
      <div style="width: 400px;">
        <el-progress :percentage="30" />
        <el-progress :percentage="70" status="success" style="margin-top: 12px;" />
        <el-progress :percentage="50" status="warning" style="margin-top: 12px;" />
        <el-progress :percentage="80" status="exception" style="margin-top: 12px;" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Descriptions 描述列表</p>
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

    <div class="demo-block">
      <p class="demo-label">Timeline 时间线</p>
      <el-timeline>
        <el-timeline-item timestamp="2026-03-17" type="primary">提交需求文档</el-timeline-item>
        <el-timeline-item timestamp="2026-03-15" type="success">完成设计评审</el-timeline-item>
        <el-timeline-item timestamp="2026-03-10" type="warning">启动项目排期</el-timeline-item>
        <el-timeline-item timestamp="2026-03-05">创建项目仓库</el-timeline-item>
      </el-timeline>
    </div>

    <div class="demo-block">
      <p class="demo-label">Tree 树形控件</p>
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

    <div class="demo-block">
      <p class="demo-label">TreeSelect 树形选择器</p>
      <div class="demo-row">
        <el-tree-select
          v-model="treeSelectValue"
          :data="treeSelectData"
          placeholder="单选树形选择"
          check-strictly
          style="width: 240px;"
        />
        <el-tree-select
          v-model="treeSelectMultiple"
          :data="treeSelectData"
          multiple
          placeholder="多选树形选择"
          check-strictly
          collapse-tags
          collapse-tags-tooltip
          style="width: 300px;"
        />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Collapse 折叠面板</p>
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

    <div class="demo-block">
      <p class="demo-label">Skeleton 骨架屏</p>
      <div class="demo-row" style="gap: 48px; align-items: flex-start;">
        <div style="width: 300px;">
          <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">基础骨架屏</p>
          <el-skeleton :rows="3" />
        </div>
        <div style="width: 300px;">
          <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: 8px;">带动画加载</p>
          <el-skeleton :rows="3" animated />
        </div>
      </div>
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Mail, MessageSquare } from 'lucide-vue-next'
import UserAvatar from './UserAvatar.vue'

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

const treeSelectData = [
  {
    value: 'dev',
    label: '研发中心',
    children: [
      { value: 'fe', label: '前端组' },
      { value: 'be', label: '后端组' },
      { value: 'qa', label: '测试组' },
    ],
  },
  {
    value: 'design',
    label: '设计中心',
    children: [
      { value: 'ui', label: 'UI 组' },
      { value: 'ux', label: 'UX 组' },
    ],
  },
]
const treeSelectValue = ref('')
const treeSelectMultiple = ref([])

const collapseActive = ref(['1'])
const collapseAccordion = ref('1')

const skeletonLoading = ref(true)
</script>
