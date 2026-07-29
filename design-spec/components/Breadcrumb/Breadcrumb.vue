<!--
  Breadcrumb —— 带返回箭头的面包屑（业务组件层）

  把「返回箭头 + 路径面包屑」封成成品：下游只传 items、监听 @back，
  返回箭头的存在/禁用/点击行为都由本组件收口，无需自己写 span 挂 @click。

  内部只引用基础组件：el-breadcrumb / el-breadcrumb-item（外观归 el-theme/breadcrumb.scss 源头，
  不覆盖）；返回箭头复用源头约定 class .breadcrumb-back（图标/8px 间距/激活 icon-2/禁用 icon-4 全在源头）。
  scoped 只装扮自己骨架（flex 对齐容器），走令牌。

  接入方速查：
    基础用法：  <Breadcrumb :items="[{label:'首页',to:'/'},{label:'项目详情'}]" @back="router.back()" />
    隐藏返回：  <Breadcrumb :items="items" :show-back="false" />
    返回禁用：  <Breadcrumb :items="items" :back-disabled="noPrev" @back="..." />
  说明：最后一项自动为当前页（不可点击，text-1）；带 to 的项可点击跳转（交给 EP 路由）。
-->
<template>
  <div class="biz-breadcrumb">
    <span
      v-if="showBack"
      class="breadcrumb-back"
      :class="{ 'is-disabled': backDisabled }"
      @click="onBack"
    ></span>
    <el-breadcrumb :separator="separator">
      <el-breadcrumb-item
        v-for="(item, i) in items"
        :key="i"
        :to="item.to"
        @click="emit('item-click', item, i)"
      >{{ item.label }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from './types'

const props = withDefaults(defineProps<{
  /** 路径项数组；最后一项为当前页（不可点击）。带 to 的项可点击跳转 */
  items: BreadcrumbItem[]
  /** 是否显示前置返回箭头 */
  showBack?: boolean
  /** 返回箭头禁用态（无上一级时）*/
  backDisabled?: boolean
  /** 分隔符（透传 el-breadcrumb）*/
  separator?: string
}>(), {
  showBack: true,
  backDisabled: false,
  separator: '/',
})

const emit = defineEmits<{
  /** 点击返回箭头（禁用时不触发）*/
  back: []
  /** 点击某个路径项 */
  'item-click': [item: BreadcrumbItem, index: number]
}>()

const onBack = () => {
  if (props.backDisabled) return
  emit('back')
}
</script>

<style scoped>
/* 只装扮自己的骨架：flex 让返回箭头与面包屑基线对齐。
   返回箭头外观（图标/间距/色态）与面包屑外观均归各自源头 scss，此处不覆盖。 */
.biz-breadcrumb {
  display: inline-flex;
  align-items: center;
}
</style>
