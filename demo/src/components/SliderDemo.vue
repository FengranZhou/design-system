<template>
  <section id="slider" class="demo-section">
    <h2 class="demo-section__title">Slider 滑块
      <CopyToCC anchor="slider" :values="configForm" />
    </h2>

    <!-- 滑块：四个配置项（数值输入框 / 区间 / 离散值 / 刻度）自由叠加，
         不为组合穷举具名类型（见 CLAUDE.md「配置式组件设计范式」）。
         唯一例外：EP 源码 `showInput && !range`，区间模式下数值输入框不渲染，
         故该开关在区间开启时置禁用（而非任其静默失效）。 -->
    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">当用户需要在数值区间/自定义区间内进行选择时，可为连续或离散值。</p>
        <!-- slider 默认撑满父级，必须放进定宽容器（源头无默认宽度） -->
        <div class="slider-host">
          <el-slider
            v-model="sliderValue"
            :range="isRange"
            :show-input="showInput"
            :step="discrete ? 20 : 1"
            :show-stops="discrete"
            :marks="showMarks ? MARKS : undefined"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="数值输入框">
            <el-switch v-model="showInput" :disabled="isRange" />
            <p v-if="isRange" class="config-card__hint">区间模式下 EP 不支持</p>
          </el-form-item>
          <el-form-item label="区间选择">
            <el-switch v-model="isRange" />
          </el-form-item>
          <el-form-item label="离散值">
            <el-switch v-model="discrete" />
          </el-form-item>
          <el-form-item label="刻度标签">
            <el-switch v-model="showMarks" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
import { ref, reactive, watch } from 'vue'

// 区间开关切换时 v-model 的形态要跟着变：单值 number ↔ 区间 [number, number]
const sliderValue = ref<number | number[]>(30)

const showInput = ref(false)
const isRange = ref(false)
const discrete = ref(false)
const showMarks = ref(false)

// 刻度标签：仅在开启「刻度标签」时传入（不传 undefined 而非空对象，避免渲染空刻度层）
const MARKS = { 0: '0', 50: '50', 100: '100' }

// range 与单值的 v-model 类型不同，切换时重置值，否则 EP 会拿到不匹配的类型
watch(isRange, (val) => {
  sliderValue.value = val ? [20, 60] : 30
})

const configForm = reactive({ showInput, isRange, discrete, showMarks })
</script>

<style scoped>
/* slider 默认撑满父级，须给定宽容器（纯本页排版）。
   带数值输入框时右侧要多留出输入框宽度，容器相应放宽。 */
.slider-host {
  width: 400px;
  max-width: 100%;
}
</style>
