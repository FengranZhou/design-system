<template>
  <section id="token-font-base" class="demo-section" ref="rootEl">
    <h2 class="demo-section__title">Font Base 基础字阶</h2>

    <!-- ==================== 字重 ==================== -->
    <div class="demo-block">
      <p class="demo-label">字重 Font Weight</p>
      <div class="token-font-list">
        <div v-for="t in fontWeightTokens" :key="t.name" class="token-font-row" @click="copyToken(t.name)" :title="`点击复制 var(${t.name})`">
          <span class="token-name">{{ t.name.replace('--iflyv-', '') }}</span>
          <span class="token-value">{{ rawValues[t.name] || '…' }}{{ t.note ? `（${t.note}）` : '' }}</span>
          <span class="token-font-sample" style="font-size: 18px" :style="{ fontWeight: `var(${t.name})` }">讯飞小雅</span>
        </div>
      </div>
    </div>

    <!-- ==================== 字号与行高 ==================== -->
    <div class="demo-block">
      <p class="demo-label">字号 Font Size — rem 实现，随左上角字号档位（S/M/L/XL）整体缩放</p>
      <div class="token-font-list">
        <div v-for="t in fontSizeTokens" :key="t.name" class="token-font-row token-font-row--size" @click="copyToken(t.name)" :title="`点击复制 var(${t.name})`">
          <span class="token-name">{{ t.name.replace('--iflyv-', '') }}</span>
          <span class="token-value">{{ t.px }}</span>
          <span class="token-lineheights">
            <span class="token-lineheights__label">行高</span>
            <span v-for="lh in t.lineHeights" :key="lh" class="token-lh-chip">{{ lh }}</span>
          </span>
          <span class="token-font-sample" :style="{ fontSize: `var(${t.name})` }">讯飞小雅</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { copyToken, useTokenValues } from './useTokens'

const fontWeightTokens = [
  { name: '--iflyv-font-weight-regular' },
  { name: '--iflyv-font-weight-semibold' },
  { name: '--iflyv-font-weight-bold', note: '抖音美好体专用' },
  { name: '--iflyv-font-weight-extrabold', note: '阿里普惠体专用' },
]

// lineHeights：每个字号配 1.5×(向上取双) 与 2× 两档行高；26 额外加 36 / 48
const fontSizeTokens = [
  { name: '--iflyv-font-size-12', px: '12px', lineHeights: [18, 24] },
  { name: '--iflyv-font-size-14', px: '14px', lineHeights: [20, 28] },
  { name: '--iflyv-font-size-16', px: '16px', lineHeights: [24, 32] },
  { name: '--iflyv-font-size-18', px: '18px', lineHeights: [28, 36] },
  { name: '--iflyv-font-size-22', px: '22px', lineHeights: [34, 44] },
  { name: '--iflyv-font-size-26', px: '26px', lineHeights: [40, 52, 36, 48] },
  { name: '--iflyv-font-size-40', px: '40px', lineHeights: [60, 80] },
]

const rootEl = ref<HTMLElement | null>(null)
const { rawValues } = useTokenValues(rootEl, fontWeightTokens.map(t => t.name))
</script>

<style lang="scss" src="./token-demo.scss"></style>
