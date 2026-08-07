<template>
  <section id="token-font-semantic" class="demo-section demo-plain" ref="rootEl">
    <h2 class="demo-section__title">Font 语义字阶</h2>

    <div class="demo-block">
      <p class="demo-label">语义字体 Composite Font — font 简写复合令牌（字重 + 字号 / 行高 + 字族），业务代码优先用这层</p>
      <div class="token-font-list">
        <div v-for="t in semanticFontTokens" :key="t.name" class="token-font-row token-font-row--semantic" @click="copyToken(t.name)" :title="`点击复制 var(${t.name})`">
          <span class="token-font-row__head">
            <span class="token-name">{{ t.name.replace('--iflyv-font-', '') }}</span>
            <span class="token-desc">{{ t.desc }}</span>
          </span>
          <span class="token-font-sample" :style="sampleStyle(t)">{{ t.sample || '讯飞小雅' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { copyToken, useTokenValues } from './useTokens'

const semanticFontTokens = [
  // split: true → 用拆分属性渲染（含空格字体名的令牌不能用 font 简写，见下方 sampleStyle）
  // —— 标题 ——
  { name: '--iflyv-font-title-page', desc: '页面标题 26/48 阿里普惠 800', split: { family: 'emphasis', weight: 'extrabold', size: 26, lh: 48 } },
  { name: '--iflyv-font-title-module', desc: '模块标题 18/36 semibold' },
  { name: '--iflyv-font-title-component', desc: '组件标题 14/20 semibold' },
  // —— 正文 ——
  { name: '--iflyv-font-body-primary', desc: '常规正文 16/24' },
  { name: '--iflyv-font-body-sub', desc: '次要正文 14/20' },
  { name: '--iflyv-font-body-min', desc: '辅助信息 12/18' },
  // —— Tab ——
  { name: '--iflyv-font-tab-active', desc: '页面级选中 Tab 项 26/36 阿里普惠 800', split: { family: 'emphasis', weight: 'extrabold', size: 26, lh: 36 } },
  { name: '--iflyv-font-tab-active-sub', desc: '模块级选中 Tab 项 18/28 semibold' },
  { name: '--iflyv-font-tab-default', desc: '默认 Tab 项 18/36 regular' },
  // —— 标签 ——
  { name: '--iflyv-font-label-primary', desc: '常规标签 12/18' },
  // —— 展示数字 ——
  { name: '--iflyv-font-number-display', desc: '展示数字 26/40 抖音美好体', sample: '1234567890' },
  { name: '--iflyv-font-number-display-sm', desc: '展示数字小 22/34 抖音美好体', sample: '1234567890' },
]

// 语义字体示例样式：默认用 font 简写；split 令牌改用拆分属性。
// 注意：Vue :style 内联对象里 var() 展开含逗号的字体族列表会被破坏，
// 故 split 的 fontFamily 用字面量（family: 逻辑名 → 字面字体栈）。
const SAMPLE_FAMILY: Record<string, string> = {
  emphasis: '"Alibaba PuHuiTi 3.0", sans-serif',
}
function sampleStyle(t: any) {
  if (!t.split) return { font: `var(${t.name})` }
  const s = t.split
  return {
    fontFamily: SAMPLE_FAMILY[s.family] || 'inherit',
    fontWeight: `var(--iflyv-font-weight-${s.weight})`,
    fontSize: `var(--iflyv-font-size-${s.size})`,
    lineHeight: `var(--iflyv-line-height-${s.lh})`,
  }
}

const rootEl = ref<HTMLElement | null>(null)
useTokenValues(rootEl)
</script>

<style lang="scss" src="./token-demo.scss"></style>
