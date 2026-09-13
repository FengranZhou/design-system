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
  // —— 标题·页面层级链（页面级 → 模块级 → 组件级，逐级递减，给页面分层只在这三档里选）——
  { name: '--iflyv-font-title-page', desc: '① 页面级标题 26/48 semibold' },
  { name: '--iflyv-font-title-module', desc: '② 模块级标题 18/36 semibold' },
  { name: '--iflyv-font-title-component', desc: '③ 组件级标题 14/20 semibold' },
  // —— 正文（title-regular 不参与页面分层，规格与 body-primary 同为 16/24、仅字重不同，故归此组）——
  { name: '--iflyv-font-title-regular', desc: '通用容器内标题 16/24 semibold' },
  { name: '--iflyv-font-body-primary', desc: '常规正文 16/24' },
  { name: '--iflyv-font-body-sub', desc: '次要正文 14/20' },
  { name: '--iflyv-font-body-min', desc: '辅助信息 12/18' },
  // —— Tab ——
  { name: '--iflyv-font-tab-active', desc: '页面级选中 Tab 项 26/36 semibold' },
  { name: '--iflyv-font-tab-active-sub', desc: '模块级选中 Tab 项 18/28 semibold' },
  { name: '--iflyv-font-tab-default', desc: '默认 Tab 项 18/36 regular' },
  // —— 标签 ——
  { name: '--iflyv-font-label-primary', desc: '常规标签 12/18' },
  // —— 展示数字 ——
  { name: '--iflyv-font-number-display', desc: '展示数字 26/40 抖音美好体', sample: '1234567890' },
  { name: '--iflyv-font-number-display-sm', desc: '展示数字小 22/34 抖音美好体', sample: '1234567890' },
  // —— 多行变体：预期 ≥3 行时用，1~2 行一律用常规档（行高＝字号 2 倍，短句上会过松）
  //    标题/tab/label 角色上不成段落，故无多行档 ——
  { name: '--iflyv-font-title-page-multiline', desc: '页面标题·≥3 行 26/52 semibold' },
  { name: '--iflyv-font-body-primary-multiline', desc: '常规正文·≥3 行 16/32' },
  { name: '--iflyv-font-body-sub-multiline', desc: '次要正文·≥3 行 14/28' },
  { name: '--iflyv-font-body-min-multiline', desc: '辅助信息·≥3 行 12/24' },
]

// 语义字体示例样式：全部走 font 简写（字体族均为系统字体栈，无含空格字体名的解析例外）
function sampleStyle(t: any) {
  return { font: `var(${t.name})` }
}

const rootEl = ref<HTMLElement | null>(null)
useTokenValues(rootEl)
</script>

<style lang="scss" src="./token-demo.scss"></style>
