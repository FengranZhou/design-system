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
import { onBeforeUnmount } from 'vue'

// 保存实例引用：组件卸载 / HMR 热替换时兜底关闭，避免全屏遮罩残留盖住页面（含顶部导航）。
let fullscreenLoading: ReturnType<typeof ElLoading.service> | null = null

const openFullscreen = () => {
  fullscreenLoading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'var(--iflyv-mask-primary)',
  })
  setTimeout(() => {
    fullscreenLoading?.close()
    fullscreenLoading = null
  }, 3000)
}

// 兜底：本 demo 组件卸载前，若全屏 Loading 还开着就强制关掉
onBeforeUnmount(() => {
  fullscreenLoading?.close()
  fullscreenLoading = null
})
</script>

<style scoped lang="scss">
.loading-area {
  /* position:relative 让 v-loading 的 absolute 遮罩锁在本块内——
     否则遮罩会向上找定位祖先、铺到大范围盖住顶部导航。 */
  position: relative;
  height: 120px;
  border-radius: var(--iflyv-radius-sm);
  background-color: var(--iflyv-bg-inset);
  overflow: hidden;
}
</style>
