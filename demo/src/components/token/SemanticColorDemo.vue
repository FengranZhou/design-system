<template>
  <section id="token-color" class="demo-section demo-plain" ref="rootEl">
    <h2 class="demo-section__title">Color 语义色板</h2>

    <div class="demo-block">
      <div v-for="group in colorGroups" :key="group.label" class="token-group">
        <div class="token-group__label">{{ group.label }}</div>
        <div class="token-color-grid">
          <div
            v-for="t in group.tokens"
            :key="t.name"
            class="token-color-item"
            :title="`点击复制 var(${t.name})`"
            @click="copyToken(t.name)"
          >
            <span class="token-swatch" :data-swatch="t.name" :style="{ background: `var(${t.name})` }"></span>
            <span class="token-color-item__meta">
              <span class="token-name">{{ t.name.replace('--iflyv-', '') }}</span>
              <span class="token-value">{{ swatchValues[t.name] || '…' }}</span>
              <span v-if="t.desc || sourceLabels[t.name]" class="token-desc">
                {{ t.desc }}
                <span v-if="sourceLabels[t.name]" class="token-source">{{ sourceLabels[t.name] }}</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { copyToken, useTokenValues } from './useTokens'

const colorGroups = [
  {
    label: '主题色 Brand',
    tokens: [
      { name: '--iflyv-brand-primary', desc: '主色' },
      { name: '--iflyv-brand-text', desc: '品牌文字' },
      { name: '--iflyv-brand-hover', desc: '悬浮' },
      { name: '--iflyv-brand-pressed', desc: '点击' },
      { name: '--iflyv-brand-disabled', desc: '禁用' },
      { name: '--iflyv-brand-bg', desc: '浅背景' },
    ],
  },
  {
    label: '成功色 Success',
    tokens: [
      { name: '--iflyv-success-primary', desc: '主色' },
      { name: '--iflyv-success-hover', desc: '悬浮' },
      { name: '--iflyv-success-pressed', desc: '点击' },
      { name: '--iflyv-success-disabled', desc: '禁用' },
      { name: '--iflyv-success-bg', desc: '浅背景' },
    ],
  },
  {
    label: '危险色 Danger',
    tokens: [
      { name: '--iflyv-danger-primary', desc: '主色' },
      { name: '--iflyv-danger-hover', desc: '悬浮' },
      { name: '--iflyv-danger-pressed', desc: '点击' },
      { name: '--iflyv-danger-disabled', desc: '禁用' },
      { name: '--iflyv-danger-bg', desc: '浅背景' },
    ],
  },
  {
    label: '警告色 Warning',
    tokens: [
      { name: '--iflyv-warning-primary', desc: '主色' },
      { name: '--iflyv-warning-hover', desc: '悬浮' },
      { name: '--iflyv-warning-pressed', desc: '点击' },
      { name: '--iflyv-warning-disabled', desc: '禁用' },
      { name: '--iflyv-warning-bg', desc: '浅背景' },
    ],
  },
  {
    label: '信息色 Info',
    tokens: [
      { name: '--iflyv-info-primary', desc: '主色' },
      { name: '--iflyv-info-hover', desc: '悬浮' },
      { name: '--iflyv-info-pressed', desc: '点击' },
      { name: '--iflyv-info-disabled', desc: '禁用' },
      { name: '--iflyv-info-bg', desc: '浅背景' },
    ],
  },
  {
    label: '文本色 Text',
    tokens: [
      { name: '--iflyv-text-1', desc: '一级/标题' },
      { name: '--iflyv-text-2', desc: '二级/正文' },
      { name: '--iflyv-text-3', desc: '三级/辅助' },
      { name: '--iflyv-text-4', desc: '四级/禁用' },
      { name: '--iflyv-text-on-dark', desc: '深底文字' },
    ],
  },
  {
    label: '图标色 Icon',
    tokens: [
      { name: '--iflyv-icon-1', desc: '一级/主图标' },
      { name: '--iflyv-icon-2', desc: '二级/常规' },
      { name: '--iflyv-icon-3', desc: '三级/辅助' },
      { name: '--iflyv-icon-4', desc: '四级/禁用' },
      { name: '--iflyv-icon-on-dark', desc: '深底图标' },
    ],
  },
  {
    label: '背景色 Background',
    tokens: [
      { name: '--iflyv-bg-page', desc: '灰页面底' },
      { name: '--iflyv-bg-page-white', desc: '白页面底' },
      { name: '--iflyv-bg-panel', desc: '面板' },
      { name: '--iflyv-bg-inset', desc: '内嵌区域' },
      { name: '--iflyv-bg-segment-active', desc: '分段选中' },
      { name: '--iflyv-bg-card', desc: '卡片渐变' },
    ],
  },
  {
    label: '描边色 Border',
    tokens: [
      { name: '--iflyv-border-subtle', desc: '轻量 6%' },
      { name: '--iflyv-border-default', desc: '常规 10%' },
      { name: '--iflyv-border-strong', desc: '加重 20%' },
      { name: '--iflyv-border-on-dark', desc: '深底描边' },
    ],
  },
  {
    label: '遮罩与滚动条 Mask / Scroller',
    tokens: [
      { name: '--iflyv-mask-primary', desc: '遮罩' },
      { name: '--iflyv-mask-on-dark', desc: '深底遮罩' },
      { name: '--iflyv-scroller-primary', desc: '滚动条' },
      { name: '--iflyv-scroller-hover', desc: '滚动条悬浮' },
    ],
  },
  {
    label: 'Message 描边',
    tokens: [
      { name: '--iflyv-message-border-success', desc: 'success' },
      { name: '--iflyv-message-border-danger', desc: 'danger' },
      { name: '--iflyv-message-border-warning', desc: 'warning' },
      { name: '--iflyv-message-border-info', desc: 'info' },
    ],
  },
  {
    label: '组件桥接 Component Bridge',
    tokens: [
      { name: '--iflyv-input-focus-ring', desc: '聚焦光圈' },
      { name: '--iflyv-input-hover-border', desc: '悬浮边' },
      { name: '--iflyv-avatar-default-bg', desc: '头像默认底' },
    ],
  },
]

const rootEl = ref<HTMLElement | null>(null)
const { swatchValues, sourceLabels } = useTokenValues(rootEl)
</script>

<style lang="scss" src="./token-demo.scss"></style>
