<template>
  <section id="table" class="demo-section">
    <h2 class="demo-section__title">Cell 单元格</h2>

    <!-- 基础组件层只展示表格的「最小单元」——单元格有哪几类。用真实 el-table 渲染，
         排序箭头 / 表头底色 / 行线 / hover 全部 el-table 原生，零手画私货。
         整表的组装 / 冻结 / 布局属「列表条目模式」，见设计模式 tab。 -->

    <div class="demo-block">
      <p class="demo-label">表头单元格</p>
      <p class="demo-desc">三类：复选框 / 纯文字 / 带排序</p>
      <!-- 只看表头行：空数据 + 空 empty-text，仅展示各类表头单元格。
           el-table 无 show-body 开关，只能喂空数据 → 会残留一块空占位区，用 header-only-table 类在本页 scoped 压掉其高度。
           末列（带排序）用 min-width 弹性列吸收剩余宽度，避免右侧留空白列。 -->
      <el-table :data="[]" empty-text=" " class="header-only-table" style="width: 100%">
        <el-table-column type="selection" width="60" />
        <el-table-column label="标题" width="200" />
        <el-table-column label="标题" min-width="200" sortable />
      </el-table>
    </div>

    <div class="demo-block">
      <p class="demo-label">内容单元格</p>
      <p class="demo-desc">六类：复选框 / 纯文字 / 标签 / 日期 / 数值 / 操作</p>
      <!-- 只看内容行：show-header=false 隐藏表头，仅展示各类内容单元格 -->
      <el-table :data="contentRow" :show-header="false" style="width: 100%">
        <el-table-column type="selection" width="60" />
        <el-table-column prop="name" width="160" />
        <el-table-column width="160">
          <template #default="{ row }">
            <el-tag :type="row.statusType" round>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="180"
          :formatter="(row: any) => formatTime(row.date)" />
        <el-table-column prop="amount" width="160" align="right"
          :formatter="(_r: any, _c: any, val: number) => `¥${val.toLocaleString()}`" />
        <el-table-column min-width="200">
          <template #default>
            <!-- 一个 class 全包：.table-operation 源头保证无底/紧贴文案/相邻间距 16/hover 绿。 -->
            <el-button class="table-operation">
              <template #icon><SquarePen :size="14" :stroke-width="2" /></template>
              编辑
            </el-button>
            <el-button class="table-operation">
              <template #icon><Eye :size="14" :stroke-width="2" /></template>
              查看
            </el-button>
            <!-- 更多：... 图标 + 下拉（与 DataTable 一致，复用 .table-operation 约定）
                 纯图标入口必配 tooltip，show-after 300 全站统一 -->
            <el-dropdown class="table-operation">
              <el-tooltip content="更多操作" placement="top" :show-after="300">
                <span class="table-operation__more"><MoreHorizontal :size="16" :stroke-width="2" /></span>
              </el-tooltip>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>复制</el-dropdown-item>
                  <el-dropdown-item divided>
                    <span style="color: var(--iflyv-danger-primary)">删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup lang="ts">
// 基础组件层只演示单元格「类型」本身——用真实 el-table 渲染（表头单元格只留表头行、
// 内容单元格 show-header=false 只留内容行），排序/边框/hover 皆 el-table 原生，无私货。
import { SquarePen, Eye, MoreHorizontal } from 'lucide-vue-next'
// 日期列走文案规范唯一实现 formatTime（省本年年份 / 跨年带年 / 不带秒），不硬编码日期字符串。
import { formatTime } from '../../../design-spec/utils/format-time'

const contentRow = [
  // 原始时间带到分钟；formatTime 决定展示是否省略年份
  { name: '作业测练', status: '已完成', statusType: 'success', date: '2026-03-10 13:00', amount: 1200 },
]
</script>

<style scoped>

/* 【规范展示页的讲解脚手架】——见 design-spec/CLAUDE.md 铁律 3「唯一例外」条。
   本页演示专用：el-table 没有 show-body 开关，「只展示表头单元格」只能喂空数据实现，
   但空数据会残留一块 empty 占位区。仅对本块的 .header-only-table 压掉该占位高度——
   不影响其它空表的「暂无数据」正常显示（那是 el-table 该有的行为）。
   为何不进源头：「只渲染表头的表格」是为讲解表头单元格而造的展示形态，真实业务不存在此需求，
   放进源头 = 给下游多一个永远用不到的类，属污染。故就地留在本 demo 页，且不改变
   el-table 在任何真实用法下的外观。 */
.header-only-table :deep(.el-table__empty-block) {
  min-height: 0;
  height: 0;
  padding: 0;
}
/* 连同外层空 body + 其内 scrollbar 包裹层一起压掉：只喂了空数据，body 无需占任何高度，仅留表头。
   EP 新版 body-wrapper 内套 .el-scrollbar__wrap（本身还有 ~24px 高），需一并压 0。 */
.header-only-table :deep(.el-table__body-wrapper),
.header-only-table :deep(.el-scrollbar__wrap) {
  height: 0;
  min-height: 0;
}
/* body 压 0 后，表格外框底边（源头 table.scss L12 的 border）与表头行底线（L28 border-bottom）
   贴合成一条"粗线"（两条 1px 叠加）。源头的双线消除依赖"最后一行去 border-bottom + 外框收底"，
   但本演示只有表头一行、无内容行兜底 → 两线重合。这里让外框不要底边，底边只由表头行下边框呈现（单条 1px）。 */
:deep(.el-table.header-only-table) {
  border-bottom: none;
}
</style>
