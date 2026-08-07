<template>
  <section id="switch" class="demo-section">
    <h2 class="demo-section__title">Switch 开关</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">开关</p>
        <!-- 文字开关切换 switch 右侧文字标签是否显示；关闭（默认）则只留开关本体。
             文字统一显示在开关右侧（active-text，EP 默认渲染在右），随开关状态取色（开=主色、禁用=灰）。
             文字内容为各自的状态名：开关 / 关闭禁用 / 开启禁用。 -->
        <div class="demo-row">
          <el-switch
            v-model="switchValue1"
            :active-text="switchShowText ? '开关' : undefined"
          />
          <el-switch
            disabled :model-value="false"
            :active-text="switchShowText ? '关闭禁用' : undefined"
          />
          <el-switch
            disabled :model-value="true"
            :active-text="switchShowText ? '开启禁用' : undefined"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="switchConfigForm" label-width="auto">
          <el-form-item label="文字">
            <el-switch v-model="switchShowText" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const switchValue1 = ref(true)

// Switch 文字：默认关闭（不展示 active-text / inactive-text），开启则显示状态名
const switchShowText = ref(false)
const switchConfigForm = reactive({ switchShowText })
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
</style>
