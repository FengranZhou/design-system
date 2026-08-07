<template>
  <section id="rate" class="demo-section">
    <h2 class="demo-section__title">Rate 评分</h2>

    <div class="demo-block">
      <p class="demo-label">评分</p>
      <div class="demo-row">
        <el-rate v-model="rateValue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rateValue = ref(3)
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
