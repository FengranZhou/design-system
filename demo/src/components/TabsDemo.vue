<template>
  <section id="tabs" class="demo-section">
    <h2 class="demo-section__title">Tabs 标签页</h2>

    <!-- Tabs 三级（页面级 / 模块级 / 组件级）合并为一块，由「级别」分段切换 class。
         级别是三选一具名类型 → 用 radio-button；页面级=.tabs-page、模块级=默认、组件级=.tabs-sub。 -->
    <div class="demo-block control-showcase" :class="{ 'is-outlined': tabsLevel === 'sub' }">
      <div class="control-showcase__main">
        <p class="demo-label">标签页</p>
        <el-tabs v-model="tabsActive" :class="tabsLevelClass">
          <el-tab-pane
            v-for="item in tabsItems"
            :key="item.name"
            :name="item.name"
            :disabled="item.disabled"
          >
            <template #label>
              <span class="tab-label-count">{{ item.label }}<span v-if="tabsShowCount" class="tab-count">{{ item.count }}</span></span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="tabsConfigForm" label-width="auto">
          <el-form-item label="级别">
            <el-radio-group v-model="tabsLevel">
              <el-radio value="page">页面级</el-radio>
              <el-radio value="module">模块级</el-radio>
              <el-radio value="sub">组件级</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="数字">
            <el-switch v-model="tabsShowCount" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// —— Tabs 三级合并：级别 → class 映射 ——
// 级别 class：页面级 .tabs-page、模块级 默认（无 class）、组件级 .tabs-sub（外观归 el-theme 源头）
const LEVEL_CLASS = { page: 'tabs-page', module: '', sub: 'tabs-sub' } as const
// 三级共用同一套 tab 项：文案即状态名（选中项/未选中项/禁用项）+ 数字徽标，级别只切外观不切项。
// 数字徽标由「显示数字」开关（tabsShowCount）控制显隐。
const tabsItems = [
  { label: '选中项', name: 'a', count: 5 },
  { label: '未选中项', name: 'b', count: 12 },
  { label: '禁用项', name: 'c', count: 3, disabled: true },
]
const tabsLevel = ref<'page' | 'module' | 'sub'>('page')
const tabsShowCount = ref(false)
const tabsConfigForm = reactive({ tabsLevel, tabsShowCount })
const tabsLevelClass = computed(() => LEVEL_CLASS[tabsLevel.value])
const tabsActive = ref('a')
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Select / Input 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}

/* 级别选中「组件级」时：整个大卡片从灰底切换为白底 + 描边，与组件级 tab 外观呼应 */
.demo-section .demo-block.is-outlined {
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
}

/* Tabs 示例无内容面板，清掉 EP header 默认下边距 */
.demo-block :deep(.el-tabs__header) {
  margin-bottom: 0;
}

/* 左示例 + 右配置卡横向布局（与 Input 配置式范式一致，纯本页排版，不含组件外观） */
.control-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.control-showcase__main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .control-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}

/* 配置卡：白底 + 细边框区分层次（与 Input 一致） */
.config-card {
  flex: 0 1 auto;
  width: auto;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
</style>
