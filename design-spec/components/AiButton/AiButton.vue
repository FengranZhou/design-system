<!-- ============================================================================
  AiButton Ai按钮（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：AI 功能入口按钮（AI 生成、智能出题、AI 任务提交等 AI 操作）。
  引用：  import { AiButton } from '<path>/design-spec/components'
  用法：
    <AiButton type="primary">下一步</AiButton>            ← 渐变实心：AI 主操作
    <AiButton type="outline">定制批量出题</AiButton>       ← 白底描边：工具栏 AI 入口
    <AiButton type="text">AI 生成</AiButton>              ← 行内文字链：轻量 AI 入口
    <AiButton type="text" loading>思考中...</AiButton>    ← 加载态：星形旋转，文案自定
    <AiButton block>智能生成</AiButton>                   ← 撑满容器宽度（正交配置，可与 type 叠加）
  props：
    type     'primary' | 'outline' | 'text'  可选，默认 'primary'。三种互斥形态。
    block    boolean   可选，默认 false。撑满父容器宽度（如面板底部的主操作按钮）。
                       正交配置，与 type / loading / disabled 自由叠加。
    disabled boolean   可选，默认 false。禁用：半透明置灰 + 挡点击。
    loading  boolean   可选，默认 false。加载中：星形图标旋转 + 挡点击（不置灰——
                       「进行中」不是「不可用」）；文案由使用方自定（如"思考中..."）。
  外观（全在本组件源头，接入方无需关心，也不要在使用方 scoped 覆盖）：
    四角星图标为源项目原版切图（内置 assets/ 自包含，按形态自动选深色/渐变款）；
    渐变走 AI 渐变令牌（--iflyv-ai-gradient / ai-fill-gradient / ai-border-gradient）。
    primary=薄荷渐变底+锥形渐变描边+深字；outline=白底灰描边+渐变字，hover 仅换灰底（同次按钮）；
    text=无底无边渐变字。点击事件原生透传（@click 直接用）。
  禁止：手拼渐变按钮 / 在 el-button 上自贴渐变复刻这套观感——AI 按钮一律用本组件。
  改外观：回本文件源头改，改一次所有引用方同步（勿在使用方私自覆盖）。
============================================================================ -->
<template>
  <button
    type="button"
    class="ai-button"
    :class="[`ai-button--${type}`, { 'is-loading': loading, 'is-block': block }]"
    :disabled="disabled || loading"
  >
    <img class="ai-button__star" :src="ICON[type]" alt="" />
    <span class="ai-button__label"><slot /></span>
  </button>
</template>

<script setup lang="ts">
// 四角星图标：源项目（xy-fe-jx-web）原版切图，随组件自包含（显式 import 走 Vite 模块解析，
// dev/build 都稳定拿到 URL）。按形态选款：primary 深色星配深字，outline/text 渐变星配渐变字。
import fourStar from './assets/four_pointed_star.png'  // 深色四角星（源「下一步」同款）
import aiStar from './assets/Ai.png'                   // 渐变四角星（源 XyAiButton「定制批量出题」同款）
import linkStar from './assets/ai_link_icon.png'       // 渐变四角星（源「AI 生成 / 思考中」链接同款）

const ICON = { primary: fourStar, outline: aiStar, text: linkStar } as const

/**
 * AiButton Ai按钮（通用业务组件）
 * @prop type     形态：primary 渐变实心（AI 主操作）/ outline 白底描边（工具栏入口）/ text 行内文字链
 * @prop disabled 禁用态：半透明 + 挡点击
 * @prop loading  加载态：星形旋转 + 挡点击，文案由使用方自定（如"思考中..."）
 * @prop block    撑满父容器宽度（面板底部主操作等场景），与其余配置正交可叠加
 */
withDefaults(defineProps<{
  type?: 'primary' | 'outline' | 'text'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}>(), {
  type: 'primary',
  disabled: false,
  loading: false,
  block: false,
})
</script>

<style scoped lang="scss">
.ai-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--iflyv-spacing-1);
  border: 0;
  background: transparent;
  font: var(--iflyv-font-body-sub);
  /* body-sub token 自带 weight 400，按设计覆盖为 Semibold */
  font-weight: var(--iflyv-font-weight-semibold);
  cursor: pointer;
  transition:
    opacity var(--iflyv-duration-fast) var(--iflyv-ease-default),
    filter var(--iflyv-duration-fast) var(--iflyv-ease-default);
  flex-shrink: 0;

  /* 撑满容器：正交配置，与 type / loading / disabled 自由叠加。
     inline-flex + flex-shrink:0 在 flex 父容器里不会拉伸，故显式改 flex 显示 + 100% 宽。 */
  &.is-block {
    display: flex;
    width: 100%;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 加载 = 进行中而非不可用：不置灰，仅换光标；挡点击由 disabled 属性承担。
     写在 :disabled 之后，同特异性靠顺序覆盖。 */
  &.is-loading {
    opacity: 1;
    cursor: default;
  }
}

/* 星形图标：源项目原版切图（自带颜色，不做 CSS 上色），尺寸与源项目一致 16px */
.ai-button__star {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  object-fit: contain;
}

/* 加载中：星形顺时针循环旋转。四角星 4 重对称 → 每周期只转半周即视觉无缝；
   1.4s 一周期 = 1.2s 转 180°（先快后慢）+ 0.2s 停顿（源自参考项目的设计意图）。 */
.is-loading .ai-button__star {
  animation: ai-button-star-spin 1.4s infinite;
}

/* 渐变文字（outline / text 共用；primary 用实色深字不裁剪） */
.ai-button--outline .ai-button__label,
.ai-button--text .ai-button__label {
  background: var(--iflyv-ai-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* ── primary 渐变实心：薄荷渐变底(padding-box) + 锥形渐变描边(border-box) + 深字 ── */
.ai-button--primary {
  /* 与 el-button 默认档同高（36px，随字号档位缩放），并排混用不跳高 */
  height: var(--el-component-size);
  padding: 0 var(--iflyv-spacing-4);
  border: 1px solid transparent;
  border-radius: var(--iflyv-radius-sm);
  /* 底是恒定浅色渐变（暗色下也不变），故文字用 on-light 不随主题翻转
     —— 用 text-1 会在暗色下翻成浅色，浅字压浅底读不出来 */
  color: var(--iflyv-text-on-light);
  background:
    var(--iflyv-ai-fill-gradient) padding-box,
    var(--iflyv-ai-border-gradient) border-box;

  &:hover:not(:disabled) {
    filter: brightness(1.04);
  }
}

/* ── outline 白底描边：灰描边 + 渐变字；hover 仅换底色（与次按钮同口径：灰底、描边文字不变） ── */
.ai-button--outline {
  height: var(--el-component-size);
  padding: 0 var(--iflyv-spacing-4);
  border: 1px solid var(--iflyv-border-default);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-bg-panel);
  transition:
    opacity var(--iflyv-duration-fast) var(--iflyv-ease-default),
    background-color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover:not(:disabled) {
    background: var(--iflyv-bg-inset);
  }
}

/* ── text 行内文字链：无底无边，随文本流 ── */
.ai-button--text {
  padding: 0;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }
}

@keyframes ai-button-star-spin {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0.22, 0.68, 0.38, 1);
  }
  85.7%,
  100% {
    transform: rotate(180deg);
  }
}
</style>
