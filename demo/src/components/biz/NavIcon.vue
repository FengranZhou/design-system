<!-- demo 侧边导航图标（仅本 demo 的示例菜单用，非组件库资产）。
     双态：默认态描边、选中态实心，由 PageFrame 透传的 active prop 决定用哪张
     （源头渲染 item.icon 时传 :active，使用方无需够组件内部 class）。
     两张同时渲染、叠放同一格，切换靠 opacity 交叉渐变——若用 v-html 换内容，
     DOM 是整体替换、没有可过渡的中间态，只能硬切。
     svg 已洗成单色 currentColor，颜色由 PageFrame 源头的图标色令牌赋值（见 __item-icon）。 -->
<template>
  <span class="nav-icon">
    <span class="nav-icon__img" :class="{ 'is-on': !active }" v-html="normal" />
    <span class="nav-icon__img" :class="{ 'is-on': active }" v-html="activeSvg" />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  /** 默认态 svg 源码（?raw 导入） */
  normal: string
  /** 选中态 svg 源码（?raw 导入） */
  activeSvg: string
  /** 是否选中：由 PageFrame 源头透传 */
  active?: boolean
}>()
</script>

<style scoped>
/* 尺寸取源头 .page-frame__item-icon 的 20×20（class 透传到本根节点），
   颜色靠 svg 里的 currentColor 接住源头的图标色令牌，这里都不重复定义 */
.nav-icon {
  position: relative;
  display: block;
}

/* 两态叠放同一格：都脱离文档流，切换只改透明度，不影响布局 */
.nav-icon__img {
  position: absolute;
  inset: 0;
  display: block;
  opacity: 0;
  transition: opacity var(--iflyv-duration-fast) var(--iflyv-ease-default);
}

.nav-icon__img.is-on {
  opacity: 1;
}

.nav-icon__img :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
