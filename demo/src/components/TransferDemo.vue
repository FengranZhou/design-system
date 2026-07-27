<template>
  <section id="transfer" class="demo-section">
    <h2 class="demo-section__title">Transfer 穿梭框</h2>

    <div class="demo-block">
      <p class="demo-label">Transfer 穿梭框</p>
      <div class="demo-row">
        <el-transfer v-model="transferValue" :data="transferData" :titles="['可选列表', '已选列表']" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const transferValue = ref([1, 4])
const transferData = [
  { key: 1, label: '选项一' },
  { key: 2, label: '选项二' },
  { key: 3, label: '选项三' },
  { key: 4, label: '选项四' },
  { key: 5, label: '选项五' },
  { key: 6, label: '选项六' },
]
</script>
