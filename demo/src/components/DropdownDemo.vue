<template>
  <section id="dropdown" class="demo-section">
    <h2 class="demo-section__title">Dropdown 下拉菜单</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">常与"触发器"（按钮、图标、下拉选择器等）组合使用，当页面上的操作命令过多时，用此组件可以收纳操作元素。</p>
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
                <!-- 分组：开关打开后，每组前加一行抬头（约定类 .dropdown-group-title，
                     源头 dropdown.scss）。抬头非可选项，故用裸 li 而非 el-dropdown-item。 -->
                <template v-if="grouped">
                  <template v-for="group in groupedItems" :key="group.title">
                    <li class="dropdown-group-title">{{ group.title }}</li>
                    <el-dropdown-item
                      v-for="it in group.items"
                      :key="it.label"
                      :disabled="it.disabled"
                    >{{ it.label }}</el-dropdown-item>
                  </template>
                </template>
                <template v-else>
                  <el-dropdown-item>编辑</el-dropdown-item>
                  <el-dropdown-item>复制</el-dropdown-item>
                  <el-dropdown-item>移动</el-dropdown-item>
                  <el-dropdown-item divided disabled>删除</el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="分组">
            <div class="config-field">
              <div class="config-field__row">
                <el-switch v-model="grouped" />
              </div>
              <p class="config-card__hint">选项超过约 7 条、且能按语义归类时开启，用抬头分段替代一长串平铺</p>
            </div>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

// Dropdown 展开态：驱动触发器箭头翻转
const dropdownVisible = ref(false)

/** 配置项：分组（打开后菜单按语义分段，每段前加抬头） */
const grouped = ref(false)
const configForm = reactive({ grouped })

// 分组态的菜单数据：同一批操作按语义归类，演示抬头与选项的层级差异
const groupedItems: { title: string; items: { label: string; disabled?: boolean }[] }[] = [
  { title: '基础操作', items: [{ label: '编辑' }, { label: '复制' }, { label: '移动' }] },
  { title: '危险操作', items: [{ label: '删除', disabled: true }] },
]
</script>

<style scoped>

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
