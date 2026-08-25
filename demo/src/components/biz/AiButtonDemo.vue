<template>
  <section id="ai-button" class="demo-section">
    <h2 class="demo-section__title">AiButton Ai按钮
      <CopyToCC anchor="ai-button" />
    </h2>

    <!-- 三形态（渐变实心 / 白底描边 / 行内文字链）× 三状态（常规 / 禁用 / 加载）矩阵 -->
    <div class="demo-block">
      <div class="demo-row">
        <AiButton type="primary">下一步</AiButton>
        <AiButton type="outline">定制批量出题</AiButton>
        <AiButton type="text">AI 生成</AiButton>
      </div>
      <div class="demo-row">
        <AiButton type="primary" disabled>下一步</AiButton>
        <AiButton type="outline" disabled>定制批量出题</AiButton>
        <AiButton type="text" disabled>AI 生成</AiButton>
      </div>
      <div class="demo-row">
        <AiButton type="primary" loading>生成中...</AiButton>
        <AiButton type="outline" loading>生成中...</AiButton>
        <AiButton type="text" loading>思考中...</AiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from '../CopyToCC.vue'
import { AiButton } from '../../../../design-spec/components'
</script>

<style scoped>

/* 三行状态矩阵的行距（纯本页排版） */
.demo-row + .demo-row {
  margin-top: var(--iflyv-spacing-4);
}
</style>
