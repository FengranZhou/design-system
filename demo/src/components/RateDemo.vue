<template>
  <section id="rate" class="demo-section">
    <h2 class="demo-section__title">Rate 评分</h2>

    <div class="demo-block">
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
