<template>
  <section id="token-spacing" class="demo-section" ref="rootEl">
    <h2 class="demo-section__title">Spacing 间距</h2>

    <div class="demo-block">
      <p class="demo-label">间距 Spacing — 命名规则：序号 × 4 = px 值；条形长度即实际尺寸</p>
      <div class="token-spacing-list">
        <div v-for="t in spacingTokens" :key="t.name" class="token-spacing-row" @click="copyToken(t.name)" :title="`点击复制 var(${t.name})`">
          <div class="token-spacing-row__head">
            <span class="token-name">{{ t.name.replace('--iflyv-', '') }}</span>
            <span class="token-value">{{ rawValues[t.name] || '…' }}</span>
            <span class="token-spacing-bar" :style="{ width: `var(${t.name})` }"></span>
          </div>
          <div class="token-scenes">
            <span class="token-scenes__label">应用场景</span>
            <span v-for="scene in toScenes(t.desc)" :key="scene" class="token-scene-chip">{{ scene }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { copyToken, useTokenValues } from './useTokens'

// desc 支持字符串或字符串数组；数组每项渲染为一颗场景标签 chip
const spacingTokens = [
  { name: '--iflyv-spacing-0_5', desc: ['微间距'] },
  { name: '--iflyv-spacing-1', desc: ['微间距'] },
  { name: '--iflyv-spacing-1_5', desc: ['微间距'] },
  { name: '--iflyv-spacing-2', desc: ['微间距'] },
  { name: '--iflyv-spacing-3', desc: ['模块级与内容垂直间距', '按钮水平间距'] },
  { name: '--iflyv-spacing-4', desc: ['页面级与下方内容垂直间距', '卡片间常规间距'] },
  { name: '--iflyv-spacing-5', desc: [] },
  { name: '--iflyv-spacing-6', desc: ['表单垂直间距'] },
  { name: '--iflyv-spacing-8', desc: ['模块垂直间距'] },
  { name: '--iflyv-spacing-10', desc: [] },
]

// 把 desc（字符串或数组）归一为场景数组，供 chip 渲染
function toScenes(desc: string | string[]): string[] {
  if (Array.isArray(desc)) return desc
  return desc ? [desc] : []
}

const rootEl = ref<HTMLElement | null>(null)
const { rawValues } = useTokenValues(rootEl, spacingTokens.map(t => t.name))
</script>

<style lang="scss" src="./token-demo.scss"></style>
