<!--
  DataTable —— 标准数据表格（业务组件层）

  「列表条目模式」的表格实现（references/patterns/list-item-pattern.md）：
  一行 = 四区拼装。用配置驱动，使用方只传 data + columns + actions，不手写 el-table-column。

    - 全局功能区：selectable（勾选列）
    - 主题区 / 关键信息区：columns[].kind 决定单元格元素类型
        text  → 纯文字
        tag   → el-tag（状态语义色，round 胶囊）
        date  → 纯文本
        amount→ 右对齐 + 千分位
    - 操作区：actions（外露操作，用源头约定类 .table-operation）+ moreActions（收进「更多」下拉），固定右侧

  长文本列：加 showOverflowTooltip: true（标题 / 备注 / 简介等长度不可预期的列）
           → 单行截断 + hover 补全，不要在使用方自写 text-overflow。

  状态标签取色（kind:'tag'）：行数据里放两个字段，组件按列名自动取——
    `${prop}Type`   语义色：进行中/待审核→warning、已通过/已完成→success、
                    已驳回/失败→danger、未开始/草稿→info
    `${prop}Class`  约定类：**已结束/已归档/已关闭→'el-tag--gray'**（灰色是 class 不是 type，
                    type 表达不了）、AI 标识→'el-tag--ai'；不需要时留空即可
    两者可共存（同一列里某些行走 type、某些行走 class）。字段名可用 tagTypeProp /
    tagClassProp 改。选色判据见 references/component-interaction.md Tag 段状态对照表。

  内部只引用基础组件（el-table / el-table-column / el-tag / el-button / el-dropdown），
  外观均归各自 el-theme 源头，不覆盖；scoped 只装扮自己骨架。

  接入方速查：
    <DataTable
      :data="rows"
      :columns="[
        { prop:'name', label:'姓名', width:120, fixed:'left' },
        { prop:'intro', label:'简介', minWidth:220, showOverflowTooltip:true },
        { prop:'status', label:'状态', kind:'tag', width:100 },
        { prop:'date', label:'日期', kind:'date', width:150, sortable:true },
        { prop:'amount', label:'金额', kind:'amount', width:120, sortable:true },
      ]"
      :actions="[{ label:'编辑', command:'edit', icon:SquarePen }, { label:'查看', command:'view', icon:Eye }]"
      :more-actions="[{ label:'复制', command:'copy' }, { label:'删除', command:'delete', danger:true }]"
      selectable
      @action="onAction"
      @selection-change="onSelect"
    />
-->
<template>
  <el-table
    ref="tableRef"
    :data="data"
    highlight-current-row
    style="width: 100%"
    @selection-change="(rows: any[]) => emit('selection-change', rows)"
  >
    <!-- 01 全局功能区：勾选 -->
    <el-table-column v-if="selectable" type="selection" width="48" />

    <!-- 02 主题区 / 03 关键信息区：按 kind 渲染。resolvedColumns 会在内容超宽时自动给主题列补 fixed:left -->
    <el-table-column
      v-for="col in resolvedColumns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :width="col.width"
      :min-width="col.minWidth"
      :sortable="col.sortable"
      :fixed="col.fixed"
      :align="col.kind === 'amount' ? 'right' : undefined"
      :show-overflow-tooltip="col.showOverflowTooltip"
    >
      <template #default="{ row }">
        <!-- tag：状态 / 分类标签。
             type 走语义色；class 走约定类变体（el-tag--gray 非活跃 / el-tag--ai），
             二者可共存——同一列里某些行灰、某些行走语义色。 -->
        <el-tag
          v-if="col.kind === 'tag'"
          :type="row[col.tagTypeProp ?? `${col.prop}Type`]"
          :class="row[col.tagClassProp ?? `${col.prop}Class`]"
          round
        >{{ row[col.prop] }}</el-tag>
        <!-- amount：右对齐 + 千分位 -->
        <span v-else-if="col.kind === 'amount'">{{ formatAmount(row[col.prop]) }}</span>
        <!-- text / date：纯文本 -->
        <span v-else>{{ row[col.prop] }}</span>
      </template>
    </el-table-column>

    <!-- 04 操作区：外露操作用 .table-operation 约定类 + 「更多」下拉。
         是否固定右侧随「自动冻结」——内容超宽且 auto-freeze 开时固定，否则跟随滚动。 -->
    <el-table-column
      v-if="actions.length || moreActions.length"
      label="操作"
      :width="operationWidth"
      :fixed="operationFixed"
    >
      <template #default="{ row, $index }">
        <div class="data-table__ops">
          <el-button
            v-for="a in actions"
            :key="a.command"
            class="table-operation"
            :class="{ 'table-operation--danger': a.danger }"
            @click="emit('action', { command: a.command, row, index: $index })"
          >
            <template v-if="a.icon" #icon><component :is="a.icon" :size="14" :stroke-width="2" /></template>
            {{ a.label }}
          </el-button>

          <el-dropdown
            v-if="moreActions.length"
            class="table-operation"
            @command="(cmd: string) => emit('action', { command: cmd, row, index: $index })"
          >
            <!-- 纯图标入口必配 tooltip 给全称（show-after 300 全站统一延迟），否则语义靠猜 -->
            <el-tooltip content="更多操作" placement="top" :show-after="300">
              <span class="table-operation__more"><MoreHorizontal :size="16" :stroke-width="2" /></span>
            </el-tooltip>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(m, i) in moreActions"
                :key="m.command"
                :command="m.command"
                :divided="i === moreActions.length - 1 && m.danger"
              >
                <span v-if="m.danger" style="color: var(--iflyv-danger-primary)">{{ m.label }}</span>
                <template v-else>{{ m.label }}</template>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
          </el-dropdown>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'
import type { TableInstance } from 'element-plus'
import type { DataTableColumn, DataTableAction } from './types'

const props = withDefaults(
  defineProps<{
    /** 行数据 */
    data: Record<string, any>[]
    /** 列定义（按四区顺序排列） */
    columns: DataTableColumn[]
    /** 操作区外露按钮 */
    actions?: DataTableAction[]
    /** 操作区「更多」下拉内的操作 */
    moreActions?: DataTableAction[]
    /** 是否显示勾选列（全局功能区） */
    selectable?: boolean
    /** 操作列宽度（px） */
    operationWidth?: number | string
    /**
     * 内容超宽（列总宽 > 容器宽、会横滚）时，自动给主题列（第一个数据列）补 fixed:left。
     * 遵循「列表条目模式」默认冻结规则：横滚时用户仍要看到主题列 + 操作列。
     * 默认 true；特殊场景可传 false 关闭。使用方仍可在 columns 里手动指定 fixed（优先于自动）。
     */
    autoFreeze?: boolean
  }>(),
  {
    actions: () => [],
    moreActions: () => [],
    selectable: false,
    operationWidth: 200,
    autoFreeze: true,
  },
)

const emit = defineEmits<{
  /** 点击操作区按钮 / 下拉项 */
  action: [payload: { command: string; row: Record<string, any>; index: number }]
  /** 勾选变化 */
  'selection-change': [rows: Record<string, any>[]]
}>()

const formatAmount = (v: number) =>
  typeof v === 'number' ? `¥${v.toLocaleString()}` : v

// —— 自动冻结：内容总宽超容器宽时，给主题列（第一个数据列）补 fixed:left —— //
const tableRef = ref<TableInstance>()
const overflow = ref(false)

const px = (v: number | string | undefined): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return parseFloat(v) || 0
  return 0
}

/** 所有列宽之和（勾选列 48 + 各数据列 width/minWidth + 操作列） */
const totalColumnsWidth = computed(() => {
  let sum = props.selectable ? 48 : 0
  for (const c of props.columns) sum += px(c.width) || px(c.minWidth) || 80
  if (props.actions.length || props.moreActions.length) sum += px(props.operationWidth)
  return sum
})

const measure = () => {
  const el = tableRef.value?.$el as HTMLElement | undefined
  if (!el) return
  overflow.value = totalColumnsWidth.value > el.clientWidth
}

/** 渲染用列：内容超宽 + autoFreeze 时，给第一个数据列补 fixed:left（使用方已显式设 fixed 的不覆盖）。 */
const resolvedColumns = computed<DataTableColumn[]>(() => {
  if (!props.autoFreeze || !overflow.value) return props.columns
  return props.columns.map((c, i) =>
    i === 0 && c.fixed === undefined ? { ...c, fixed: 'left' } : c
  )
})

/** 操作列是否固定右侧：与主题列同步——超宽 + autoFreeze 时固定，否则跟随横向滚动。 */
const operationFixed = computed<'right' | undefined>(() =>
  props.autoFreeze && overflow.value ? 'right' : undefined
)

let ro: ResizeObserver | undefined
onMounted(() => {
  nextTick(measure)
  const el = tableRef.value?.$el as HTMLElement | undefined
  if (el && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => measure())
    ro.observe(el)
  }
})
onBeforeUnmount(() => ro?.disconnect())
// 列 / 数据变化后重新测量
watch(() => [props.columns, props.data, props.operationWidth], () => nextTick(measure), { deep: true })
</script>

<style scoped>
/* 只装扮自己骨架：操作区排布。基础组件外观不在此定义。 */
/* 操作区：inline 排版 + nowrap 防换行撑高。间距由 .table-operation 的相邻选择器给（16），
   故此处不用 flex/gap（会与相邻 margin 叠加成双倍）——遵守 table.scss 的约定。 */
.data-table__ops {
  white-space: nowrap;
}
/* 「更多」触发器改用源头约定类 .table-operation__more（外观/字号/颜色由 table.scss 源头统一，
   与「编辑/查看」一致：16px + 默认深色 + hover 绿）。此处不再自定，避免业务组件私货导致不同步。 */
</style>
