<template>
  <section id="slider" class="demo-section">
    <h2 class="demo-section__title">Slider 滑块</h2>

    <div class="demo-block">
      <p class="demo-desc">当用户需要在数值区间/自定义区间内进行选择时，可为连续或离散值。</p>
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
