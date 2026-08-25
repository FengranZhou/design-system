<template>
  <section id="tabs" class="demo-section">
    <h2 class="demo-section__title">Tabs 标签页
      <CopyToCC anchor="tabs" :values="tabsConfigForm" />
    </h2>

    <!-- Tabs 三级（页面级 / 模块级 / 组件级）合并为一块，由「级别」分段切换 class。
         级别是三选一具名类型 → 用 radio-button；页面级=.tabs-page、模块级=默认、组件级=.tabs-sub。 -->
    <div class="demo-block control-showcase" :class="{ 'is-outlined': tabsLevel === 'sub' }">
      <div class="control-showcase__main">
        <p class="demo-desc">提供平级的区域将大块内容进行收纳和展现，保持界面整洁。</p>
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
import CopyToCC from './CopyToCC.vue'
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

/* 级别选中「组件级」时：整个大卡片从灰底切换为白底 + 描边，与组件级 tab 外观呼应 */
.demo-section .demo-block.is-outlined {
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
}

/* 本页配置卡内容宽度不定，宽度随内容自适应而非公共层的固定宽 */
.config-card {
  flex: 0 1 auto;
  width: auto;
}

</style>
