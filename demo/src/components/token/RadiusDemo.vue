<template>
  <section id="token-radius" class="demo-section demo-plain" ref="rootEl">
    <h2 class="demo-section__title">Radius 圆角</h2>

    <div class="demo-block">
      <p class="demo-label">圆角 Radius — 点击复制</p>
      <div class="token-radius-row">
        <div v-for="t in radiusTokens" :key="t.name" class="token-radius-item" @click="copyToken(t.name)" :title="`点击复制 var(${t.name})`">
          <div class="token-radius-box" :style="{ borderRadius: `var(${t.name})` }"></div>
          <span class="token-name">{{ t.name.replace('--iflyv-radius-', '') }}</span>
          <span class="token-value">{{ rawValues[t.name] || '…' }}</span>
          <span class="token-desc">{{ t.desc }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { copyToken, useTokenValues } from './useTokens'

const radiusTokens = [
  { name: '--iflyv-radius-xs', desc: 'Tag / 下拉项' },
  { name: '--iflyv-radius-sm', desc: '按钮 / 输入框 / 小卡片 / 卡内嵌套面板' },
  { name: '--iflyv-radius-md', desc: '大卡片' },
  { name: '--iflyv-radius-lg', desc: '页面 / 弹窗 / 抽屉' },
  { name: '--iflyv-radius-full', desc: '全圆角' },
]

const rootEl = ref<HTMLElement | null>(null)
const { rawValues } = useTokenValues(rootEl, radiusTokens.map(t => t.name))
</script>

<style lang="scss" src="./token-demo.scss"></style>
