<template>
  <section id="slider" class="demo-section">
    <h2 class="demo-section__title">Slider 滑块</h2>

    <div class="demo-block">
      <p class="demo-label">滑块</p>
      <div style="width: 400px">
        <el-slider v-model="sliderValue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sliderValue = ref(30)
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（本页排版，走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
</style>
