<!-- ============================================================================
  TabBar 标签页（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：任何页内 tab 切换，**尤其是 tab 文案长度不可控时**（分区名来自业务数据、
         用户自定义命名、接口返回），会出现「一项特别长把整条工具栏撑破」的场景。
  引用：  import { TabBar } from '<path>/design-spec/components'
  用法：
    <TabBar v-model="active" :tabs="['知识图谱', '问题图谱']" />                    ← 最简：字符串数组
    <TabBar v-model="active" :tabs="[{ name: '知识图谱', value: 'kg' }]" />        ← 需要自定义 value 时
    <TabBar v-model="active" :tabs="tabs" level="module" />                        ← 模块级档
    <TabBar v-model="active" :tabs="tabs" :max-label-width="160" />                ← 自定宽度上限

  props：
    modelValue     string|number  必填（v-model）。当前选中项的 value。
    tabs           (string | { name, value?, disabled? })[]  必填。name 是显示文案、
                   value 是标识（v-model 的值）；传字符串时 name/value 同为该字符串。
    level          'page'|'module'|'sub'  可选，默认 'page'。对应 tabs 三档
                   （page→.tabs-page / module→裸 el-tabs / sub→.tabs-sub，见 component-interaction.md）。
    maxLabelWidth  number  可选，默认 200。单项文案宽度上限（px），超出显示省略号 + hover 出 tooltip。
                   传 0 关闭省略（文案长度可控、确定不会超长时）。
  emits：
    update:modelValue / tab-change  切换时触发。

  ----------------------------------------------------------------------------
  为什么需要这个组件（不是「el-tabs 不好用」）：
    EP 的 el-tabs **没有**「单项超长自动省略 + hover 出全称」的能力。而省略要成立必须两步：
      ① 给 label 定宽 + ellipsis —— 纯 CSS 可做
      ② **只在真被截断时**才挂 tooltip —— 必须 JS 量 scrollWidth > clientWidth，
         否则没截断的项也弹气泡（鼠标扫过一排 tab 全是气泡）
    ② 决定了它**做不进 el-theme 的 scss 源头**（那层只有样式、没有 JS），只能包一层业务组件。

  ⚠️ 省略号作用在**本组件自己渲染的 `<span class="tab-bar__label">`** 上，
     不是 `.el-tabs__item` —— 后者是基础组件的盒子，碰它就是「局部私货」（见本层公约铁律 1）。
     这也是技术上的必须：`.tabs-page .el-tabs__item` 是 `flex-direction: column`
     （文字 + 下方短横两行），文字是匿名 flex item，**匿名盒子挂不住 ellipsis**，
     必须由我们自己包一层真实元素承载。

  ⚠️ 「整条撑破 / 没有左右箭头」不归本组件管，已在源头修掉
     （el-theme/components/tabs.scss 的 min-width 链路 + patterns/toolbar.scss 的收缩分工）。
     本组件只解决「单项自身太长」。两者是不同层面的问题，别混。

  禁止：手写 div 拼 tab；在使用方 scoped 里给 .el-tabs__item 写 max-width/ellipsis
       （那是改基础组件外观，回源头或用本组件）。
  改外观：回本文件源头改，改一次所有引用方同步。
============================================================================ -->
<template>
  <!-- 档位 class 直接引用基础组件层已定义的三档约定（.tabs-page / 裸 / .tabs-sub），
       本组件不重新定义 tab 的任何外观，只负责 label 的省略与 tooltip。 -->
  <el-tabs
    :class="levelClass"
    :model-value="modelValue"
    @update:model-value="onChange"
  >
    <el-tab-pane
      v-for="item in normalized"
      :key="item.value"
      :name="item.value"
      :disabled="item.disabled"
    >
      <template #label>
        <!-- 未截断时不渲染 tooltip 外壳：避免给每一项都挂一个永不显示的气泡实例。
             el-tooltip 的延迟 300 是全站统一口径（见 component-interaction.md Tooltip 段），
             必须显式传——它是 JS prop，源头 scss 兜不住。 -->
        <el-tooltip
          v-if="truncated[item.value]"
          :content="item.name"
          :show-after="300"
          placement="bottom"
        >
          <span
            :ref="(el) => setLabelRef(item.value, el)"
            class="tab-bar__label"
            :style="labelStyle"
          >{{ item.name }}</span>
        </el-tooltip>
        <span
          v-else
          :ref="(el) => setLabelRef(item.value, el)"
          class="tab-bar__label"
          :style="labelStyle"
        >{{ item.name }}</span>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, watch } from 'vue'

export interface TabBarItem {
  name: string
  value?: string | number
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    tabs: (string | TabBarItem)[]
    level?: 'page' | 'module' | 'sub'
    maxLabelWidth?: number
  }>(),
  { level: 'page', maxLabelWidth: 200 },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'tab-change': [value: string | number]
}>()

/** 归一后的内部形态：value 必定有值（字符串简写时以 name 兜底） */
interface NormalizedTab {
  name: string
  value: string | number
  disabled: boolean
}

/** 字符串简写归一成对象；未给 value 时以 name 兜底 */
const normalized = computed<NormalizedTab[]>(() =>
  props.tabs.map((t) =>
    typeof t === 'string'
      ? { name: t, value: t, disabled: false }
      : { name: t.name, value: t.value ?? t.name, disabled: t.disabled ?? false },
  ),
)

/** 三档对应基础组件层的约定 class（裸 el-tabs 即模块级，故为空串） */
const levelClass = computed(() =>
  props.level === 'page' ? 'tabs-page' : props.level === 'sub' ? 'tabs-sub' : '',
)

const labelStyle = computed(() =>
  props.maxLabelWidth > 0 ? { maxWidth: `${props.maxLabelWidth}px` } : undefined,
)

// ── 截断检测：只有真被截断的项才挂 tooltip ──────────────────────────
const labelRefs = new Map<string | number, HTMLElement>()
const truncated = reactive<Record<string | number, boolean>>({})

function setLabelRef(value: string | number, el: unknown) {
  if (el instanceof HTMLElement) labelRefs.set(value, el)
  else labelRefs.delete(value)
}

/** scrollWidth > clientWidth 即内容被 ellipsis 截掉了。
 *  +1 容差：浏览器亚像素舍入会让未截断的元素也差出 0.x px，不留容差会误判成截断。 */
function measure() {
  if (props.maxLabelWidth <= 0) {
    for (const k of Object.keys(truncated)) truncated[k] = false
    return
  }
  for (const [value, el] of labelRefs) {
    truncated[value] = el.scrollWidth > el.clientWidth + 1
  }
}

/** 字体加载完成前量宽度会偏小（用兜底字体量的），量完再量一次。
 *  ⚠️ 本设计系统用的是自定义字体族，这一步不做会有「首屏漏判截断」的偶发。 */
function measureAfterFonts() {
  void nextTick(measure)
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  void fonts?.ready?.then(() => nextTick(measure))
}

let ro: ResizeObserver | undefined
onMounted(() => {
  measureAfterFonts()
  // 容器变窄 / tab 区被压缩时截断状态会变，跟着重量
  ro = new ResizeObserver(() => measure())
  for (const el of labelRefs.values()) ro.observe(el)
})
onBeforeUnmount(() => ro?.disconnect())

watch(
  () => [props.tabs, props.maxLabelWidth],
  () => {
    void nextTick(() => {
      measure()
      // 新增/替换的 label 节点要补挂观察
      if (ro) for (const el of labelRefs.values()) ro.observe(el)
    })
  },
  { deep: true },
)

// 选中项字号会变大（tabs-page 激活 26px / 常规 18px），截断状态随之改变
watch(() => props.modelValue, () => void nextTick(measure))

function onChange(value: string | number) {
  emit('update:modelValue', value)
  emit('tab-change', value)
}
</script>

<style scoped>
/* 只装扮本组件自己渲染的 label 盒子——不碰 .el-tabs__item 等基础组件的盒子（本层公约铁律 1、3）。
   display:block 是 ellipsis 生效的前提（内联盒不吃 max-width + overflow）。 */
.tab-bar__label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
