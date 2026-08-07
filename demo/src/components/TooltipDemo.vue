<template>
  <section id="tooltip" class="demo-section">
    <h2 class="demo-section__title">Tooltip 文字提示</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">文字提示</p>
        <!-- 单条实时示例：弹出方向由右侧「方向」配置项控制（:key 触发方向切换时重挂载） -->
        <div class="demo-row">
          <el-tooltip :key="tooltipPlacement" :content="tooltipContent" :placement="tooltipPlacement">
            <el-button>悬停查看提示</el-button>
          </el-tooltip>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="tooltipConfigForm" label-width="auto">
          <el-form-item label="方向">
            <el-radio-group v-model="tooltipPlacement">
              <el-radio v-for="p in tooltipPlacements" :key="p.value" :value="p.value">{{ p.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <!-- ⏸ 暂停展示：弹出框（Popover，点击/悬浮触发）。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">弹出框</p>
      <div class="demo-row">
        <el-popover placement="bottom" :width="200" trigger="click">
          <template #reference>
            <el-button>点击弹出</el-button>
          </template>
          <p style="margin: 0; font: var(--iflyv-font-body-sub); color: var(--iflyv-text-2);">这是一段弹出框内容，用于展示 Popover 的定制效果。</p>
        </el-popover>
        <el-popover placement="bottom" :width="200" trigger="hover">
          <template #reference>
            <el-button>悬浮弹出</el-button>
          </template>
          <p style="margin: 0; font: var(--iflyv-font-body-sub); color: var(--iflyv-text-2);">悬浮触发的弹出框内容。</p>
        </el-popover>
      </div>
    </div>
    -->
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// —— 文字提示（Tooltip）：弹出方向作为配置项（上/右/下/左）——
const tooltipPlacements = [
  { value: 'top', label: '上方' },
  { value: 'right', label: '右侧' },
  { value: 'bottom', label: '下方' },
  { value: 'left', label: '左侧' },
] as const
const tooltipPlacement = ref<'top' | 'right' | 'bottom' | 'left'>('top')
const tooltipContent = '这是一段文字提示内容'
const tooltipConfigForm = reactive({ tooltipPlacement })
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Dialog / Select / Input 各 demo 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.demo-section .demo-block + .demo-block {
  margin-top: var(--iflyv-spacing-6);
}

/* 配置式布局：左示例 + 右配置卡横向（与 Dialog / Input 配置式范式一致，纯本页排版，不含组件外观） */
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
  flex: 0 0 auto;
  width: 400px;
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
