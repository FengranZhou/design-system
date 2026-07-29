<template>
  <section id="tag" class="demo-section">
    <h2 class="demo-section__title">Tag 标签</h2>

    <div class="demo-block">
      <p class="demo-label">标签</p>
      <p class="demo-desc">尽量避免在实际使用过程中，3 个以上的标签一同出现</p>
      <div class="demo-row">
        <el-tag type="success" round>已完成</el-tag>
        <el-tag type="warning" round>待审核</el-tag>
        <el-tag type="danger" round>已驳回</el-tag>
        <el-tag type="info" round>已关闭</el-tag>
        <el-tag class="el-tag--gray" round>已归档</el-tag>
        <el-tag class="el-tag--ai" round>AI互动课堂</el-tag>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Select / Dialog / Navigation 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
</style>
