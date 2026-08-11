<template>
  <section id="tooltip" class="demo-section">
    <h2 class="demo-section__title">Tooltip 文字提示</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <!-- 单条实时示例：弹出方向由右侧「方向」配置项控制（:key 触发方向切换时重挂载） -->
        <div class="demo-row">
          <!-- show-after 300：全站统一延迟，避免鼠标路过一排图标时 tooltip 连片闪烁 -->
          <el-tooltip
            :key="tooltipPlacement"
            :content="tooltipContent"
            :placement="tooltipPlacement"
            :show-after="300"
          >
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

/* 本页配置项多（多行表单/单选组），配置卡加宽一档 */
.config-card {
  flex: 0 0 auto;
  width: 400px;
}

@media (max-width: 1100px) {
  /* 本页覆盖了 config-card 宽度，窄屏撑满需在此重申（scoped 特异性高于公共层） */
  .config-card { width: 100%; }
}
</style>
