# 指标条 Metric Strip

## 何时用（触发）

页面上**一排横向并列的指标卡 / 数据卡 / KPI 条**：看板顶部的「教师 2 人 · 学生 82 人 · 访客 107 人…」、统计页的核心指标带、详情页顶部的几个关键数字。

判据是「**多个同级数值指标横向并列成一长条**」——不管叫 KPI 条、数据概览、统计条还是指标卡组，都走本模式。

> **只有一个核心数字**（不成条）→ 不用本模式，直接用 `--iflyv-font-number-display` 数字字阶排版即可（见 display-guide「只是一个核心数字→别画图」）。

## 强制做法

- **一律用源头约定 class**（样式在 `el-theme/patterns/metric-strip.scss`）：容器 `.metric-strip`，每项 `.metric-item`，项内 `.metric-item__num` / `__unit` / `__label`。<!-- @rule id=metric-strip-class level=MUST cat=组件用法 detect=regex dtitle=一排指标卡应宽度等分、内容居中，各项不因文字长短而宽窄不齐 title=指标条一律用源头约定 class .metric-strip / .metric-item，禁在使用方自拼 -->
- **宽度按项数等分、内容在等分宽度内水平居中**——这是本模式的核心规则，由源头的 `grid-auto-columns: 1fr` 保证，**接入方不写任何宽度**。<!-- @rule id=metric-strip-equal-width level=MUST cat=布局与栅格 detect=manual dtitle=指标条各项宽度应均分，不能按内容长短自然排布 title=指标条按项数等分列宽、列内居中；禁用 flex + space-between 按内容宽度排布 -->
- **一律等分，不因项数少而改规则**：2 项和 8 项都等分撑满。这样宽度可预测、多个页面的指标条并置时纵向对得齐。<!-- @rule-skip dup 同 metric-strip-equal-width，本行是该规则「项数少也不例外」的补充说明 -->
- **不走栅格 `.grid`**：指标条是**卡内条目排布**，不是页面分栏；且常见 8 项均分（col-3）低于栅格 6 列下限。
- 数字用数字展示字阶、单位弱化一档紧贴数字、说明文字走副信息色阶——全在源头，接入方只填内容。
- **数字与下方说明的垂直间距取 `spacing-0_5`**（2px，紧贴元素微调档；不用常规的列表项子元素档 `spacing-2`）——见 `foundations.md` 语义字阶表同条。源头已保证，接入方不写。
- **数字千分位走 `formatNumber`**（见 `references/copywriting/number.md`），不自己拼字符串。

## 反例

- ❌ 用 `display: flex` + `justify-content: space-between` 排指标项——那是按**内容宽度**排布：「访客人次」比「教师」宽一截，各项宽窄不齐、间隔也不匀，一眼就看出没对齐。
- ❌ 在使用方 `<style scoped>` 里复刻 `.kpi-strip` / `.stat-item` 一类的私有类（脱离源头，改源头它不动）。
- ❌ 给指标条套 `.grid` / `.grid__col-*`（栅格是页面分栏用的，且 8 项等分低于 6 列下限）。
- ❌ 项数少时改成左对齐紧凑排（规则不可预测，两个页面并置就对不齐）。

## 可照抄骨架

```vue
<template>
  <div class="metric-strip">
    <div v-for="m in metrics" :key="m.label" class="metric-item">
      <span class="metric-item__num">{{ formatNumber(m.value) }}<em class="metric-item__unit">{{ m.unit }}</em></span>
      <span class="metric-item__label">{{ m.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber } from '<path>/design-spec/utils/format-number'

const metrics = [
  { value: 2, unit: '人', label: '教师' },
  { value: 82, unit: '人', label: '学生' },
  { value: 5082, unit: '次', label: '访问热度' },
  // …项数不限，宽度自动等分
]
</script>
```
