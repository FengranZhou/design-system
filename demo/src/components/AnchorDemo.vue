<template>
  <section id="anchor" class="demo-section">
    <h2 class="demo-section__title">Anchor 锚点</h2>

    <div class="demo-block">
      <p class="demo-label">锚点</p>
      <div class="demo-row">
        <el-anchor direction="horizontal">
          <el-anchor-link href="#navigation" title="导航组件" />
          <el-anchor-link href="#data-display" title="数据展示" />
          <el-anchor-link href="#form" title="表单组件" />
          <el-anchor-link href="#feedback" title="反馈组件" />
        </el-anchor>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Select / Input 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
</style>
