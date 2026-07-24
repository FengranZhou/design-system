<template>
  <section id="date-picker" class="demo-section">
    <h2 class="demo-section__title">DatePicker 日期选择器</h2>

    <div class="demo-block">
      <p class="demo-label">日期选择</p>
      <div class="demo-row">
        <el-date-picker v-model="dateValue" type="date" placeholder="选择日期" style="width: 240px" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">日期范围</p>
      <div class="demo-row">
        <div style="width: 360px">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
        </div>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">日期时间</p>
      <div class="demo-row">
        <el-date-picker v-model="dateTimeValue" type="datetime" placeholder="选择日期时间" style="width: 280px" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">时间选择</p>
      <div class="demo-row">
        <el-time-picker v-model="timeValue" placeholder="选择时间" style="width: 200px" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dateValue = ref('')
const dateRange = ref([])
const dateTimeValue = ref('')
const timeValue = ref('')
</script>
