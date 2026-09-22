<!-- ============================================================================
  Toolbar 工具栏（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：列表页/表格页顶部操作条、模块卡片头部工具栏——任何「一排里同时有
         标题 / tab / 下拉 / 搜索 / 操作按钮 中两类及以上」的横向组织。
  引用：  import { Toolbar } from '<path>/design-spec/components'
  用法：
    <Toolbar>                                      ← 分支①：有标题
      <template #left>
        <h3 class="iflyv-toolbar__title">课程工具</h3>
      </template>
      <template #right>
        <el-select v-model="type" />               ← 顺序：tab → 下拉 → 搜索 → 次按钮 → 主按钮
        <el-button type="primary">新建</el-button>
      </template>
    </Toolbar>

    <Toolbar>                                      ← 分支③：只有操作按钮，不写 #right
      <template #left><el-button type="primary">新建</el-button></template>
    </Toolbar>

    <Toolbar>                                      ← 含页面级 tab：整条自动吸顶，零配置
      <template #left><el-tabs class="tabs-page">…</el-tabs></template>
      <template #right><el-button type="primary">导出</el-button></template>
    </Toolbar>

  插槽：
    left    左组内容。按「左右分配三分支」决定放什么（见下）。
    right   右组内容。分支③（只有操作按钮）时**不写本插槽**，左组自然靠左。
    default 等价于 left 的简写——只有一组内容时可省略 <template #left>。

  ----------------------------------------------------------------------------
  ⚠️ 本组件**只提供外壳与左右分组**，不规定里面放什么——内容完全由业务方给。
     这是刻意的：工具栏的内容组合是开放的（标题/tab/下拉/搜索/各种按钮 + 业务
     事件处理），穷举成 props 既盖不全、又会让每加一种元素就要改源头。
     **顺序与左右分配是规则（写在文档里），不是组件的限制。**

  ⚠️ 布局 / 间距 / 标题字阶 / 吸顶 **全部在源头 el-theme/patterns/toolbar.scss**，
     本组件不重复定义、不带 scoped 样式——它只是把那几个约定 class 包装成标签，
     省掉使用方手写 div + 记类名。改外观一律回那个 scss，改一次所有引用方同步。
     源头的激活门槛是**容器双类**（`iflyv-toolbar` + `toolbar` 同时在场），
     本组件已内置双类输出，用组件即无感；手写约定 class 时两个都要挂。

  ⚠️ **标题仍由业务方自己写** `<h3 class="iflyv-toolbar__title">`（模块级加
     `iflyv-toolbar__title--module`）。不做成 title prop 的原因：标题有时是
     h3/h4、有时是 el-tabs、有时带业务标签，prop 化会立刻不够用。

  ⚠️ **含页面级 tab 自动吸顶**靠源头的 `.iflyv-toolbar.toolbar:has(.tabs-page)`。
     `:has()` 匹配任意后代，插槽内容渲染进本组件的 div 后仍是其后代，故照常生效。
     用 PageFrame 时首选把本组件放进 `#page-header` 插槽（在滚动区之外）。

  规则全文（固定顺序 + 左右分配三分支 + 留白档位）见
  references/patterns/toolbar-pattern.md。
============================================================================ -->
<template>
  <!-- 双类是源头 toolbar.scss 的激活门槛：iflyv-toolbar + toolbar 同时在场才生效，
       缺一个整套样式全不激活（防裸 .toolbar 撞宿主项目同名 DOM，详见源头文末警示段） -->
  <div class="iflyv-toolbar toolbar">
    <div class="iflyv-toolbar__left">
      <slot name="left"><slot /></slot>
    </div>
    <div v-if="$slots.right" class="iflyv-toolbar__right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 无 props、无 emits、无 scoped 样式——本组件是「模式层约定 class 的标签化封装」。
 * 一切外观归源头 el-theme/patterns/toolbar.scss，一切内容归业务方插槽。
 */
defineOptions({ name: 'IflyvToolbar' })
</script>
