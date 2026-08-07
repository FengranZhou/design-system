<template>
  <section id="dropdown" class="demo-section">
    <h2 class="demo-section__title">Dropdown 下拉菜单</h2>

    <div class="demo-block">
      <p class="demo-label">下拉菜单</p>
      <p class="demo-desc">常与"触发器"（按钮、图标、下拉选择器等）组合使用。</p>
      <div class="demo-row">
        <el-dropdown @visible-change="dropdownVisible = $event">
          <span class="dropdown-trigger">
            更多操作
            <ChevronDown
              :size="14" :stroke-width="2"
              class="dropdown-caret"
              :class="{ 'is-expanded': dropdownVisible }"
            />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>编辑</el-dropdown-item>
              <el-dropdown-item>复制</el-dropdown-item>
              <el-dropdown-item>移动</el-dropdown-item>
              <el-dropdown-item divided disabled>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

// Dropdown 展开态：驱动触发器箭头翻转
const dropdownVisible = ref(false)
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Select / Input 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}

/* Dropdown 轻量文字触发器（纯本页装扮：本 demo 的触发器排版，走令牌；面板外观归 el-theme 源头） */
.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--iflyv-spacing-1);
  color: var(--iflyv-text-1);
  cursor: pointer;
}
.dropdown-trigger:hover {
  color: var(--iflyv-brand-primary);
}
/* 箭头翻转（展开时 180°+ 过渡）已归源头约定 .dropdown-caret（dropdown.scss），
   demo 只传展开真值 .is-expanded，不在此重复定义。 */
</style>
