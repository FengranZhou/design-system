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
    深层折叠：  <Breadcrumb :items="items" :max-items="4" @item-click="..." />
  说明：最后一项自动为当前页（不可点击，text-1）；带 to 的项可点击跳转（交给 EP 路由）。
       max-items 默认 0（不折叠、全量平铺）；设为 ≥2 时若层数超过它，则保留「首项 + 末项当前页」，
       中间超出的层级折进一个 `…` 项，hover 弹下拉菜单展开被折叠层级（每项可点跳转），可见项数即 max-items。
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
        v-for="node in displayNodes"
        :key="node.key"
        :to="node.collapsed ? undefined : node.item?.to"
        @click="!node.collapsed && node.item && emit('item-click', node.item, node.index)"
      >
        <!-- 折叠占位项：`…` hover 展开下拉，列出被折叠的中间层级（放 #dropdown 插槽，禁手撸浮层） -->
        <el-dropdown v-if="node.collapsed" trigger="hover" class="breadcrumb-more">
          <span class="breadcrumb-more__trigger">…</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="hidden in node.hiddenItems"
                :key="hidden.index"
                @click="emit('item-click', hidden.item, hidden.index)"
              >{{ hidden.item.label }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <template v-else>{{ node.item?.label }}</template>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
  /** 最多可见项数；0=不折叠（默认，全量平铺）。≥2 且层数超过它时，保留首项+末项、中间折进 `…` 下拉 */
  maxItems?: number
}>(), {
  showBack: true,
  backDisabled: false,
  separator: '/',
  maxItems: 0,
})

/** 渲染节点：普通项（携带原 item 与其在 items 中的真实下标）或折叠占位项（携带被折叠的中间项） */
interface DisplayNode {
  key: string
  collapsed: boolean
  item?: BreadcrumbItem
  index: number
  hiddenItems?: { item: BreadcrumbItem; index: number }[]
}

// 折叠策略：max-items 为 0 / 无效 / 未超限 → 全量平铺；
// 否则保留「首 1 项 + 尾 (maxItems-1) 项」，中间超出的塞进 `…` 折叠项（可见项数恒为 maxItems）。
const displayNodes = computed<DisplayNode[]>(() => {
  const list = props.items
  const max = props.maxItems
  const full: DisplayNode[] = list.map((item, index) => ({ key: `i${index}`, collapsed: false, item, index }))
  if (max < 2 || list.length <= max) return full

  const tailCount = max - 1                       // 尾部保留项数（首项占 1）
  const hiddenItems = list
    .slice(1, list.length - tailCount)
    .map((item, i) => ({ item, index: i + 1 }))   // 还原到 items 中的真实下标
  return [
    full[0],
    { key: 'more', collapsed: true, index: -1, hiddenItems },
    ...full.slice(list.length - tailCount),
  ]
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

/* `…` 折叠触发器：本组件自己的骨架元素（非基础组件），做成可点击的路径占位。
   字号继承 el-breadcrumb（源头 13/18）；色态对齐路径项：常态 text-3、hover text-2。 */
.breadcrumb-more { display: inline-flex; align-items: center; }
.breadcrumb-more__trigger {
  cursor: pointer;
  color: var(--iflyv-text-3);
  line-height: 1;
  letter-spacing: var(--iflyv-spacing-0_5);   /* … 三点略微拉开，视觉更像省略号 */
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}
.breadcrumb-more__trigger:hover { color: var(--iflyv-brand-primary); }
</style>
