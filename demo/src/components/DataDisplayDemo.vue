<template>
  <section id="data-display" class="demo-section">
    <h2 class="demo-section__title">DataDisplay 数据展示</h2>

    <!-- 徽标 / 描述列表已拆分为独立模块：BadgeDemo.vue / DescriptionsDemo.vue -->

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

  </section>
</template>

<script setup lang="ts">
// 徽标 / 描述列表已拆分为独立模块：BadgeDemo.vue / DescriptionsDemo.vue（相关脚本随之迁移）
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

// ⏸ 随 Collapse 折叠面板块暂停（模板已注释），保留、需要时一并放开（含 vue 的 ref import）：
// import { ref } from 'vue'
// const collapseActive = ref(['1'])
// const collapseAccordion = ref('1')
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

</style>
