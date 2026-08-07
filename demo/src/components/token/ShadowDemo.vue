<template>
  <section id="token-shadow" class="demo-section demo-plain" ref="rootEl">
    <h2 class="demo-section__title">Shadow 阴影</h2>

    <div class="demo-block">
      <p class="demo-label">阴影 Shadow — 三档层级：悬浮反馈 → 关联浮层 → 独立浮层</p>
      <div class="token-shadow-row">
        <div
          v-for="t in shadowTokens"
          :key="t.name"
          class="token-shadow-card"
          :style="{ boxShadow: `var(${t.name})` }"
          :title="`点击复制 var(${t.name})`"
          @click="copyToken(t.name)"
        >
          <span class="token-name">{{ t.name.replace('--iflyv-', '') }}</span>
          <span class="token-desc">{{ t.desc }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { copyToken, useTokenValues } from './useTokens'

const shadowTokens = [
  { name: '--iflyv-shadow-hover', desc: '悬浮反馈（卡片 hover）' },
  { name: '--iflyv-shadow-related', desc: '关联浮层（下拉、气泡）' },
  { name: '--iflyv-shadow-independent', desc: '独立浮层（弹窗、抽屉）' },
]

const rootEl = ref<HTMLElement | null>(null)
useTokenValues(rootEl)
</script>

<style lang="scss" src="./token-demo.scss"></style>
