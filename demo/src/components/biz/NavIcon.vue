<!-- demo 侧边导航图标（仅本 demo 的示例菜单用，非组件库资产）。
     双态：默认态描边、选中态实心，由 PageFrame 透传的 active prop 决定用哪张
     （源头渲染 item.icon 时传 :active，使用方无需够组件内部 class）。
     两张同时渲染、叠放同一格，切换靠 opacity 交叉渐变——若用 v-html 换内容，
     DOM 是整体替换、没有可过渡的中间态，只能硬切。
     svg 已洗成单色 currentColor，颜色由 PageFrame 源头的图标色令牌赋值（见 __item-icon）。

     ⚠️ 选中态（实心）图标的**负形**（图形内部镂空处，如加号、圆点）：
        能用 fill="none" 真透出底色的就用 none；确实需要填色时**必须填
        var(--iflyv-bg-page)**（侧栏底色令牌），不可写死 #FFFFFF——
        亮色下主体是深色、填白正好，暗色下主体转白，负形还是白就整块糊成白方块。
        （establish / progress 两张曾因此翻车。）
        注意 <defs> 里 mask 与渐变的 #FFFFFF 是遮罩/透明度语义，不是视觉颜色，不要改。 -->
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
