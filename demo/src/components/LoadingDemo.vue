<template>
  <section id="loading" class="demo-section">
    <h2 class="demo-section__title">Loading 加载</h2>

    <!-- 区域加载：指令方式 v-loading；提示文字由右侧配置项控制——填了即带文字、清空即纯 spinner。 -->
    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">区域加载</p>
        <div
          v-loading="true"
          :element-loading-text="showLoadingText ? '数据加载中...' : undefined"
          class="loading-area"
        />
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form label-width="auto">
          <el-form-item label="提示文字">
            <el-switch v-model="showLoadingText" />
          </el-form-item>
        </el-form>
      </aside>
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
import { onBeforeUnmount, ref } from 'vue'

// 区域加载提示文字：开=显示"数据加载中..."，关=纯 spinner。
const showLoadingText = ref(true)

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
  overflow: hidden;
  /* 不自带底色：与外层 bg-card 大卡片融为一体，仅靠 v-loading 遮罩呈现加载态 */
}
</style>
