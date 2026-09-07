<template>
  <section id="token-spacing" class="demo-section demo-plain" ref="rootEl">
    <h2 class="demo-section__title">Spacing 间距</h2>

    <div class="demo-block">
      <p class="demo-label">间距 Spacing — 命名规则：序号 × 4 = px 值；条形长度即实际尺寸</p>
      <div class="token-spacing-list">
        <div v-for="t in SPACING_USAGE" :key="t.name" class="token-spacing-row" @click="copyToken(t.name)" :title="`点击复制 var(${t.name})`">
          <div class="token-spacing-row__head">
            <span class="token-name">{{ t.name.replace('--iflyv-', '') }}</span>
            <span class="token-value">{{ rawValues[t.name] || '…' }}</span>
            <span class="token-spacing-bar" :style="{ width: `var(${t.name})` }"></span>
          </div>
          <div class="token-scenes">
            <span class="token-scenes__label">应用场景</span>
            <span v-for="scene in t.scenes" :key="scene" class="token-scene-chip">{{ scene }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { copyToken, useTokenValues } from './useTokens'
// 场景语义的单一数据源（同一份也被 references/foundations.md 间距速查表指向）
import { SPACING_USAGE } from '../../../../design-spec/design-token/spacing-usage'

const rootEl = ref<HTMLElement | null>(null)
const { rawValues } = useTokenValues(rootEl, SPACING_USAGE.map(t => t.name))
</script>

<style lang="scss" src="./token-demo.scss"></style>
