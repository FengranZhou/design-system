<template>
  <section id="loading" class="demo-section">
    <h2 class="demo-section__title">Loading 加载</h2>

    <div class="demo-block">
      <p class="demo-label">区域加载（指令方式）</p>
      <div v-loading="true" class="loading-area" />
    </div>

    <div class="demo-block">
      <p class="demo-label">区域加载（带提示文字）</p>
      <div
        v-loading="true"
        element-loading-text="数据加载中..."
        class="loading-area"
      />
    </div>

    <div class="demo-block">
      <p class="demo-label">全屏加载</p>
      <div class="demo-row">
        <el-button type="primary" @click="openFullscreen">打开全屏 Loading（3秒后关闭）</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'

const openFullscreen = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'var(--iflyv-mask-primary)',
  })
  setTimeout(() => loading.close(), 3000)
}
</script>

<style scoped lang="scss">
.loading-area {
  height: 120px;
  border-radius: var(--iflyv-radius-sm);
  background-color: var(--iflyv-bg-inset);
  overflow: hidden;
}
</style>
