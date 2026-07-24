<!--
  SearchMini —— 收起态搜索框（业务组件层第一个正式组件）

  两种形态由 collapsed 控制，是「同一物料的一个 prop 差异」：
    - collapsed=false（默认）：基础形式，常驻展开的标准搜索框（el-input + 右侧可点击放大镜 + clearable）
    - collapsed=true：收起态，平时显示一个「带图标的次按钮」（🔍 搜索），点击展开、失焦且空则自动收起

  ▶ 选型判据（接入时按此判断用哪种形态，不要凭感觉）：
    - 搜索在当前场景【是核心功能】→ collapsed=false（常驻展开，让用户一眼可用）
    - 搜索在当前场景【非核心功能】→ collapsed=true（收起态，省空间、不喧宾夺主）

  右侧放大镜可点击 / 回车 → 立即触发 search 事件（用于非实时检索场景）；输入防抖也会触发 search（实时场景）。
  clearable 清除叉由 EP 自动叠在放大镜左侧（有内容时）。

  内部只引用基础组件：展开态 el-input、收起态 el-button（均不覆盖其外观——input 外观归 el-theme/input.scss、
  button 外观归 el-theme/button.scss 源头；此处只挂 .search-input 语义锚点 + 定位钩子）。
  scoped 样式只装扮「自己的骨架」（展开动画容器），全走令牌。

  接入方速查：
    基础形式：  <SearchMini v-model="kw" @search="onSearch" />
    收起态：    <SearchMini collapsed v-model="kw" @search="onSearch" />
    防抖：      <SearchMini :search-delay="500" @search="onSearch" />（默认 300ms；设 0 关闭防抖，输入即触发）
-->
<template>
  <!-- 收起态且未展开：带图标的次按钮（复用标准 el-button，外观归 button.scss 源头，不自绘胶囊）-->
  <el-button v-if="collapsed && !expanded" class="search-mini__trigger" @click="expand">
    <template #icon><Search :size="16" :stroke-width="2" /></template>
    {{ collapsedText }}
  </el-button>

  <!-- 展开态 / 基础形式：标准搜索输入框 -->
  <el-input
    v-else
    ref="inputRef"
    v-model="innerValue"
    class="search-input search-mini__input"
    :class="{ 'search-mini__input--collapsible': collapsed }"
    clearable
    :placeholder="placeholder"
    @input="onInput"
    @blur="onBlur"
    @clear="onClear"
    @keydown.enter="onEnter"
  >
    <!-- 放大镜在右侧、可点击触发搜索；clearable 清除叉由 EP 自动叠在其左侧（有内容时）。 -->
    <template #suffix>
      <Search
        :size="16" :stroke-width="2"
        class="search-mini__search-icon"
        @mousedown.prevent
        @click="triggerSearch"
      />
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Search } from 'lucide-vue-next'
import type { InputInstance } from 'element-plus'

const props = withDefaults(defineProps<{
  /** v-model 绑定值 */
  modelValue?: string
  /** 是否默认收起。选型判据：搜索是核心功能→false（常驻展开）；非核心功能→true（收起态省空间） */
  collapsed?: boolean
  /** 占位文案 */
  placeholder?: string
  /** 收起态按钮上的文字 */
  collapsedText?: string
  /** 输入防抖触发 search 的延迟（ms）；0 = 关闭防抖，输入即触发 */
  searchDelay?: number
}>(), {
  modelValue: '',
  collapsed: false,
  placeholder: '搜索',
  collapsedText: '搜索',
  searchDelay: 300,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** 搜索触发（输入防抖后 / 回车 / 清空时）*/
  search: [value: string]
  /** 展开或收起时触发 */
  'toggle': [expanded: boolean]
}>()

const inputRef = ref<InputInstance>()
const innerValue = ref(props.modelValue)
const expanded = ref(false)

watch(() => props.modelValue, v => { innerValue.value = v ?? '' })

// —— 防抖：settle 后触发 search —— //
let timer: ReturnType<typeof setTimeout> | undefined
const fireSearch = (v: string) => {
  if (!props.searchDelay) { emit('search', v); return }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => emit('search', v), props.searchDelay)
}

const onInput = (v: string) => {
  emit('update:modelValue', v)
  fireSearch(v)
}

const onEnter = () => {
  if (timer) clearTimeout(timer)
  emit('search', innerValue.value)
}

// 点击右侧放大镜：立即触发搜索（用于非实时检索场景）
const triggerSearch = () => {
  if (timer) clearTimeout(timer)
  emit('search', innerValue.value)
}

const onClear = () => {
  emit('update:modelValue', '')
  emit('search', '')
  // 收起态清空后自动收起
  if (props.collapsed) collapse()
}

const onBlur = () => {
  // 收起态：失焦且内容为空 → 自动收起
  if (props.collapsed && !innerValue.value) collapse()
}

const expand = () => {
  expanded.value = true
  emit('toggle', true)
  nextTick(() => inputRef.value?.focus())
}

const collapse = () => {
  expanded.value = false
  emit('toggle', false)
}
</script>

<style scoped>
/* 只装扮自己的骨架：搜索框宽度、展开态动画。收起态用标准 el-button（外观归 button.scss 源头），
   基础组件 el-input / el-button 外观均不在此定义、不覆盖。 */

/* 搜索框宽度：集中一处变量控制，与基础输入框默认宽度一致（240px）。
   使用方可通过 style="--search-mini-width: 320px" 覆盖，不必散落改。 */
.search-mini__input {
  --search-mini-width: 240px;
  width: var(--search-mini-width);
}

/* .search-mini__trigger 仅作收起态按钮的定位钩子，不写任何外观（外观归 button.scss） */

/* 右侧可点击放大镜：本组件自己塞进 suffix slot 的图标，装扮其可点击交互态。
   只作用于自己的图标，不触碰 el-input 的 suffix 区外观。 */
.search-mini__search-icon {
  /* order:1 使放大镜排在 EP 清除叉(order:0)右侧 → 清除叉在左、放大镜在右 */
  order: 1;
  cursor: pointer;
  color: var(--iflyv-icon-3);
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}
.search-mini__search-icon:hover {
  color: var(--iflyv-brand-primary);
}

/* 展开态：收起态展开时用宽度动画，营造从按钮"长出"输入框的观感 */
.search-mini__input--collapsible {
  animation: search-mini-expand var(--iflyv-duration-normal) var(--iflyv-ease-decelerate);
}
@keyframes search-mini-expand {
  from { width: var(--el-component-size); opacity: 0; }
  to   { width: var(--search-mini-width); opacity: 1; }
}
</style>
