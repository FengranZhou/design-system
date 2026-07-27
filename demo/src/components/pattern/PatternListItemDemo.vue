<template>
  <section id="pattern-list-item" class="demo-section">
    <h2 class="demo-section__title">List Item 列表条目</h2>

    <!-- 上块：模式规则 —— 一条记录=四区拼装的拆解示意 -->
    <div class="pattern-card">
      <p class="pattern-card__title">模式规则</p>
      <p class="pattern-card__desc">
        一条记录（表格的一行 / 列表的一个条目）= 四个功能区从左到右拼装。区职责固定、每区可放的元素类型有清单、每类元素用一个已有组件——既统一又能灵活拼出各种业务场景（表格 / 卡片列表 / 信息流通用）。
      </p>

      <!-- 四区拆解：横向四列，每区淡色胶囊标题 + 元素类型清单 -->
      <div class="anatomy">
        <div v-for="z in zones" :key="z.key" class="zone">
          <span class="zone__tag">{{ z.tag }}</span>
          <p class="zone__duty">{{ z.duty }}</p>
          <ul class="zone__rules">
            <li v-for="el in z.elements" :key="el">{{ el }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 下块：标准范例 —— 用业务组件 DataTable。完整字段（列多、会横滚），由 auto-freeze 决定是否自动固定首尾列。 -->
    <div class="pattern-card">
      <p class="pattern-card__title">标准范例</p>
      <DataTable
        :data="tableData"
        :columns="columns"
        :actions="[
          { label: '编辑', command: 'edit', icon: SquarePen },
          { label: '查看', command: 'view', icon: Eye },
        ]"
        :more-actions="[
          { label: '发布', command: 'publish' },
          { label: '下载', command: 'download' },
          { label: '删除', command: 'delete', danger: true },
        ]"
        :operation-width="240"
        selectable
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { SquarePen, Eye } from 'lucide-vue-next'
import { DataTable, type DataTableColumn } from '../../../../design-spec/components'

// 完整字段列（列多、总宽超容器 → 组件自动冻结首尾列）。主题列/操作列的固定交给组件自动，不手动传 fixed。
const columns: DataTableColumn[] = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'status', label: '状态', kind: 'tag', width: 100 },
  { prop: 'date', label: '日期', kind: 'date', width: 180 },
  { prop: 'amount', label: '金额', kind: 'amount', width: 150 },
  { prop: 'department', label: '部门', width: 150 },
  { prop: 'position', label: '职位', width: 180 },
  { prop: 'remark', label: '备注', minWidth: 200 },
]

// 四区模型（对应 list-item-pattern.md「一条记录=四区」）
const zones = [
  {
    key: 'global',
    tag: '01 全局功能区',
    duty: '对整条记录的整体操作 —— “我能做什么（结构）”',
    elements: ['勾选', '排序', '展开 / 收起', '置顶', '拖拽'],
  },
  {
    key: 'subject',
    tag: '02 主题区',
    duty: '这条是什么 —— 身份 / 概览',
    elements: ['名称 / 标题', '头像 / 图标', '时间', '人员', '摘要 / 类目'],
  },
  {
    key: 'key-info',
    tag: '03 关键信息区',
    duty: '这条里有什么 —— 核心数据 / 分析',
    elements: ['状态标签', '进度', 'Mini Chart', '数值 / 金额', '数据概览'],
  },
  {
    key: 'action',
    tag: '04 操作区',
    duty: '基于业务的具体操作',
    elements: ['编辑', '查看', '复制', '更多（下拉）'],
  },
]

// 一份完整数据，两态共用（关闭冻结时只是少展示几列）
const tableData = [
  { name: '张三', status: '进行中', statusType: 'primary', date: '2026-03-10', amount: 1200, department: '技术部', position: '前端工程师', remark: '项目进展顺利' },
  { name: '李四', status: '已完成', statusType: 'success', date: '2026-03-11', amount: 3450, department: '产品部', position: '产品经理', remark: '已交付' },
  { name: '王五', status: '待审核', statusType: 'warning', date: '2026-03-12', amount: 890, department: '设计部', position: 'UI设计师', remark: '等待审批中' },
  { name: '赵六', status: '已驳回', statusType: 'danger', date: '2026-03-13', amount: 2100, department: '市场部', position: '市场专员', remark: '材料需补充' },
  { name: '钱七', status: '已关闭', statusType: 'info', date: '2026-03-14', amount: 560, department: '运营部', position: '运营专员', remark: '已归档' },
]
</script>

<style scoped>
/* 纯本页排版，全部走令牌。上下两块 bg-card 大卡片（与 PatternFormDemo 一致）。 */
.pattern-card {
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.pattern-card + .pattern-card { margin-top: var(--iflyv-spacing-6); }
.pattern-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
.pattern-card__desc {
  margin: 0 0 var(--iflyv-spacing-6);
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}

/* 四区拆解：横向四列等宽，窄屏换行 */
.anatomy {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--iflyv-spacing-4);
}
@media (max-width: 1100px) {
  .anatomy { grid-template-columns: repeat(2, 1fr); }
}

/* 区块卡片：白底柔描边，区名淡色胶囊浮左上、职责一行、元素清单圆点竖排 */
.zone {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-3);
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-lg);
}
.zone__tag {
  align-self: flex-start;
  padding: var(--iflyv-spacing-1) var(--iflyv-spacing-3);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-info-bg);
  color: var(--iflyv-info-primary);
  font: var(--iflyv-font-title-component);
}
.zone__duty {
  margin: 0;
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
.zone__rules {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-2);
  margin: 0;
  padding-left: var(--iflyv-spacing-6);
  list-style: disc;
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-body-sub);
}
</style>
