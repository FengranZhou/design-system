<template>
  <section id="skeleton" class="demo-section">
    <h2 class="demo-section__title">Skeleton 骨架屏
      <CopyToCC anchor="skeleton" />
    </h2>

    <div class="demo-block">
      <p class="demo-desc">可以被「加载」完全代替，但是在可用的场景下可以比 Spin 提供更好的视觉效果和用户体验。</p>
      <!-- ⏸ 暂停展示：基础骨架屏（无动画）。暂时不用，保留代码，需要时放开。
      <div style="width: 300px;">
        <p style="color: var(--iflyv-text-3); font-size: 12px; margin-bottom: var(--iflyv-spacing-2);">基础骨架屏</p>
        <el-skeleton :rows="3" animated />
      </div>
      -->
      <!-- 白底衬底：骨架屏灰条铺在浅灰 bg-card 上对比弱，套一层 bg-panel 白底衬托 -->
      <div class="skeleton-panel">
        <el-skeleton :rows="3" animated />
      </div>
      <!-- ⏸ 暂停展示：切换加载状态（loading ↔ 内容）。暂时不用，保留代码 + script 里 skeletonLoading，需要时一并放开。
      <div style="margin-top: var(--iflyv-spacing-6);">
        <el-button @click="skeletonLoading = !skeletonLoading" style="margin-bottom: var(--iflyv-spacing-3);">
          切换加载状态
        </el-button>
        <el-skeleton :loading="skeletonLoading" animated :rows="2">
          <template #default>
            <p style="color: var(--iflyv-text-2);">这是加载完成后展示的实际内容。骨架屏可用于内容加载前的占位展示，提升用户体验。</p>
          </template>
        </el-skeleton>
      </div>
      -->
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
// ⏸ 随「切换加载状态」骨架屏暂停（模板已注释），保留、需要时一并放开（放开时需 import { ref } from 'vue'）：
// const skeletonLoading = ref(true)
</script>

<style scoped>

/* 骨架屏白底衬底：灰条铺在浅灰 bg-card 上对比弱，套一层白底衬托（纯本页排版，走令牌） */
.skeleton-panel {
  width: 300px;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-md);
}
</style>
