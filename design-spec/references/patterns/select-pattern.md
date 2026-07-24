# 选择器选型模式 (Select Pattern)

> 设计模式层规则。接到「加下拉选择器 / 筛选下拉 / 类型选择」任务时，**动手前必读本文件**，先按「选型判据」定 `clearable`（可清除与否）、再按「强制做法」落地、避开「反例」、直接套用「可照抄骨架」。读之前不要凭直觉给选择器一律加或一律不加 clearable。
>
> 选择器用 Element Plus 原生 `el-select`（外观归 `el-theme/components/select.scss` 源头）。`clearable`（可清除）、`filterable`（可搜索）是两个**正交配置项**，按需叠加——**其中「可清除」不是默认开或默认关，而是由「空状态是不是合法有语义的状态」决定**。

---

## 一、何时用（触发条件）

命中以下任一，即用本模式：

- 页面里要放一个**下拉选择 / 类型选择 / 状态筛选**入口。
- 列表 / 表格顶部要加**按某个维度筛选**的下拉。
- 表单里一个字段需要**从固定选项里选一个**。

---

## 二、选型判据（最关键的一步：先定「可清除」）

「可清除」的前提是 **「空状态本身是一个合法、有意义的状态」**。据此分两种场景，**不要凭感觉或为了统一一律加/一律不加**：

| 场景 | 特征 | clearable | 为什么 |
|---|---|---|---|
| **有默认语义项** | 下拉自带一个有语义的默认值、初始即选中（如「全部类型」「全部状态」——本身表达"不筛选/全部"） | **不可清除**（`clearable=false`） | 清空后变空，反而丢了「全部」这个语义。没有任何值能表达的空状态是无意义的——总得是某个类型或"全部" |
| **无默认值 + 外部标签** | 选择器初始为空，靠旁边的 label（如「类型：[下拉]」）说明它是什么；空 = "还没选" | **可清除**（`clearable=true`） | 清空 = 回到"未选择"状态，语义完整合法，用户需要能撤销选择 |

> **判断入口**：动手前先问自己一句——"这个下拉清空以后，那个空状态用户能看懂、是合法的吗？" 空是合法的"未选" → 可清除；空会丢语义（本该有个默认值兜底）→ 不可清除。

### 可搜索（filterable）

- 选项**较多**（一屏放不下、需滚动找）→ 开 `filterable`，让用户输入关键词过滤。
- 选项**很少**（3~5 个一眼看全）→ 不必开，避免多余的输入交互。

---

## 三、强制做法

### 1. 按判据定 clearable，不要一刀切

- 有默认语义项（「全部类型」等）：**不加** `clearable`，且给一个默认选中值。
- 无默认值、靠外部标签：**加** `clearable`，`v-model` 初始为空。

### 2. 可搜索按选项数量定

- 选项多 → `filterable`；选项少 → 省略。

### 3. placeholder 与默认值二选一，不并存

- 有默认语义项时：`v-model` 有初始值，看不到 placeholder（本就该显示「全部类型」）。
- 无默认值时：`v-model` 为空，靠 placeholder（如「请选择」）+ 外部 label 说明。

---

## 四、反例（禁止）

- ❌ **给带「全部类型」等默认语义项的下拉加 clearable** —— 用户一清空就变成无意义的空，丢了"全部"语义。
- ❌ **给"未选=合法"的下拉不加 clearable** —— 用户选错了无法撤销回未选状态。
- ❌ **凭"统一"给所有下拉一律加或一律不加 clearable** —— clearable 是按空状态语义决定的，不是统一开关。
- ❌ **在使用方 scoped 里覆盖 select 外观**（`:deep(.el-select ...)` 改字号/边框/圆角等）—— 外观归 `el-theme/components/select.scss` 源头，手写即私货、不同步。

---

## 五、可照抄骨架

```vue
<template>
  <!-- 场景 A：有默认语义项「全部类型」→ 不可清除，给默认值 -->
  <el-select v-model="typeFilter" placeholder="全部类型">
    <el-option label="全部类型" value="all" />
    <el-option label="课程" value="course" />
    <el-option label="作业" value="homework" />
  </el-select>

  <!-- 场景 B：无默认值 + 外部标签 → 可清除，初始为空 -->
  <span>类型</span>
  <el-select v-model="type" clearable placeholder="请选择">
    <el-option label="课程" value="course" />
    <el-option label="作业" value="homework" />
  </el-select>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const typeFilter = ref('all')  // 场景 A：默认「全部类型」，不可清除
const type = ref('')            // 场景 B：初始空，可清除
</script>
```

> 照抄要点：**先按「空状态是否合法」定 clearable**——有默认语义项（`all`/`'全部'`）→ 不加 clearable + 给默认值；无默认值 + 外部标签 → 加 clearable + 初始空。可搜索按选项数量决定是否加 `filterable`。外观一概不手写，全由 `el-theme` 源头保证。
