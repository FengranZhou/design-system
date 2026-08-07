<template>
  <section id="checkbox" class="demo-section">
    <h2 class="demo-section__title">Checkbox 多选框</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">多选</p>
        <!-- checkbox-inline-row：让 group 内两项与后面四个独立项在 flex 里成为平级等距子项
             （group 盒子 display:contents 透明化，与 radio-inline-row 同一手法，纯排版不碰组件外观） -->
        <div class="demo-row checkbox-inline-row">
          <!-- 状态清单顺序：选中 / 未选 / 半选 / 选中禁用 / 未选禁用 / 半选禁用
               （三个常态在前、三个禁用态在后）。仅「选中」「未选」两个可交互项进 group 的 v-model；
               半选、选中禁用、未选禁用、半选禁用均为纯状态展示（indeterminate / disabled 直接置位，不进 group）。 -->
          <el-checkbox-group v-model="checkboxValue">
            <el-checkbox :label="checkboxShowText ? '选中' : ''" value="vue" />
            <el-checkbox :label="checkboxShowText ? '未选' : ''" value="react" />
          </el-checkbox-group>
          <el-checkbox :indeterminate="true" :label="checkboxShowText ? '半选' : ''" />
          <el-checkbox :model-value="true" disabled :label="checkboxShowText ? '选中禁用' : ''" />
          <el-checkbox :model-value="false" disabled :label="checkboxShowText ? '未选禁用' : ''" />
          <el-checkbox :indeterminate="true" disabled :label="checkboxShowText ? '半选禁用' : ''" />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="checkboxConfigForm" label-width="auto">
          <el-form-item label="文字">
            <el-switch v-model="checkboxShowText" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const checkboxValue = ref(['vue'])

// 配置卡：文字是否显示（关闭则只留选择控件本体）
const checkboxShowText = ref(true)
const checkboxConfigForm = reactive({ checkboxShowText })
</script>

<style scoped>
/* 纯本页排版：左示例 + 右配置卡横向布局，与 Button / Empty / Input 配置式范式一致。 */

/* demo 块用 bg-card 大卡片做区分（本页排版，走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}

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

.config-card {
  flex: 0 1 auto;
  width: 220px;
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

/* Checkbox 六态平级等距：group 盒子 display:contents 透明化，让「选中/未选」两项与后面
   四个独立展示项都成为 .demo-row(flex) 的直接子项，六个平级等距（与 radio-inline-row 同手法）。 */
.checkbox-inline-row :deep(.el-checkbox-group) {
  display: contents;
}
/* 抹掉源头 el-checkbox 的 margin-inline-end(16px)，间距统一交给 .demo-row 的 gap 管，避免叠加 */
.checkbox-inline-row :deep(.el-checkbox) {
  margin-inline-end: 0;
}
</style>
