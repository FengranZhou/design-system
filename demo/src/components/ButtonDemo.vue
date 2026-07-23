<template>
  <section id="button" class="demo-section">
    <h2 class="demo-section__title">Button 按钮</h2>

    <div class="button-grid">
      <!-- 第 1 行：基础类型 -->
      <el-button>次按钮</el-button>
      <el-button type="primary">主按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
      <el-button text>文本次按钮</el-button>
      <el-button type="primary" text>文本主按钮</el-button>
      <el-button type="danger" text>文本危险按钮</el-button>

      <!-- 第 2 行：禁用状态 -->
      <el-button disabled>次按钮</el-button>
      <el-button type="primary" disabled>主按钮</el-button>
      <el-button type="danger" disabled>危险按钮</el-button>
      <el-button text disabled>文本次按钮</el-button>
      <el-button type="primary" text disabled>文本主按钮</el-button>
      <el-button type="danger" text disabled>文本危险按钮</el-button>

      <!-- 第 3 行：加载状态 -->
      <el-button loading>次按钮</el-button>
      <el-button type="primary" loading>主按钮</el-button>
      <el-button type="danger" loading>危险按钮</el-button>
      <el-button text loading>文本次按钮</el-button>
      <el-button type="primary" text loading>文本主按钮</el-button>
      <el-button type="danger" text loading>文本危险按钮</el-button>

      <!-- 第 4 行：图标按钮 -->
      <el-button>
        <template #icon><Share2 :size="16" :stroke-width="2" /></template>次按钮
      </el-button>
      <el-button type="primary">
        <template #icon><Pencil :size="16" :stroke-width="2" /></template>主按钮
      </el-button>
      <el-button type="danger">
        <template #icon><Trash2 :size="16" :stroke-width="2" /></template>危险按钮
      </el-button>
      <el-button text>
        <template #icon><Pencil :size="16" :stroke-width="2" /></template>文本次按钮
      </el-button>
      <el-button type="primary" text>
        <template #icon><Share2 :size="16" :stroke-width="2" /></template>文本主按钮
      </el-button>
      <el-button type="danger" text>
        <template #icon><Trash2 :size="16" :stroke-width="2" /></template>文本危险按钮
      </el-button>
    </div>

    <!-- 带箭头的按钮（Button + 下箭头，普通按钮，不含下拉菜单） -->
    <div class="caret-row">
      <el-button>次按钮 <ChevronDown class="btn-caret" :size="14" :stroke-width="2" /></el-button>
      <el-button type="primary">主按钮 <ChevronDown class="btn-caret" :size="14" :stroke-width="2" /></el-button>
      <el-button text>文本按钮 <ChevronDown class="btn-caret" :size="14" :stroke-width="2" /></el-button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { Pencil, Share2, Trash2, ChevronDown } from 'lucide-vue-next'
</script>

<style scoped>
/* 纯本页排版：4 行 × 6 列按钮网格，每列内容水平居中对齐。
   不含任何组件外观规则，仅负责本 demo 的布局。 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: center;      /* 同一行按钮垂直居中（text 无固定高，与实心按钮对齐） */
  justify-items: center;    /* 每格内容水平居中 → 同列按钮以列中心对齐 */
  gap: var(--iflyv-spacing-10);  /* 行列间距统一 40 */
}

/* 横向适配：窄屏时按 6→3→2 列递减，避免按钮被挤压变形 */
@media (max-width: 1100px) {
  .button-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .button-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* 带箭头按钮演示行：本页排版留白 */
.caret-row {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-6);
  margin-top: var(--iflyv-spacing-10);
}
</style>
