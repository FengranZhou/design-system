<template>
  <el-config-provider :locale="epLocale">
  <header class="app-topbar">
    <div class="app-topbar__brand">
      <div class="app-topbar__logo">
        <img src="/logo.png" alt="Xiaoya Theme" />
      </div>
      <div>
        <div class="app-topbar__title">Xiaoya Theme</div>
        <div class="app-topbar__subtitle">Element Plus 主题演示</div>
      </div>
    </div>
    <el-tabs v-model="currentTopTab" class="app-topbar__nav">
      <el-tab-pane
        v-for="tab in topTabs"
        :key="tab.value"
        :label="tab.label"
        :name="tab.value"
      />
    </el-tabs>
  </header>
  <div class="app-layout">
    <aside class="app-sidebar">
      <div class="app-sidebar__nav-wrap">
        <template v-if="currentTopTab === 'token'">
        <ul class="app-sidebar__nav">
          <li><a href="#palette" :class="{ 'is-active': activeSection === 'palette' }">Palette 基础色板</a></li>
          <li><a href="#token-color" :class="{ 'is-active': activeSection === 'token-color' }">Semantic Color 语义色板</a></li>
          <li><a href="#token-font-base" :class="{ 'is-active': activeSection === 'token-font-base' }">Font Base 基础字阶</a></li>
          <li><a href="#token-font-semantic" :class="{ 'is-active': activeSection === 'token-font-semantic' }">Semantic Font 语义字阶</a></li>
          <li><a href="#token-spacing" :class="{ 'is-active': activeSection === 'token-spacing' }">Spacing 间距</a></li>
          <li><a href="#token-radius" :class="{ 'is-active': activeSection === 'token-radius' }">Radius 圆角</a></li>
          <li><a href="#token-shadow" :class="{ 'is-active': activeSection === 'token-shadow' }">Shadow 阴影</a></li>
          <li><a href="#token-motion" :class="{ 'is-active': activeSection === 'token-motion' }">Motion 动效</a></li>
        </ul>
        </template>

        <template v-if="currentTopTab === 'component'">
        <div class="app-sidebar__group-label">通用</div>
        <ul class="app-sidebar__nav">
          <li><a href="#button" :class="{ 'is-active': activeSection === 'button' }">Button 按钮</a></li>
          <!-- <li><a href="#button-examples" :class="{ 'is-active': activeSection === 'button-examples' }" style="color: var(--iflyv-brand-primary);">📋 Button Examples（临时预览）</a></li> -->
        </ul>

        <div class="app-sidebar__group-label">表单</div>
        <ul class="app-sidebar__nav">
          <li><a href="#input" :class="{ 'is-active': activeSection === 'input' }">Input 输入框</a></li>
          <li><a href="#select" :class="{ 'is-active': activeSection === 'select' }">Select 选择器</a></li>
          <!-- <li><a href="#select-examples" :class="{ 'is-active': activeSection === 'select-examples' }" style="color: var(--iflyv-brand-primary);">📋 Select Examples（临时预览）</a></li> -->
          <li><a href="#form-control" :class="{ 'is-active': activeSection === 'form-control' }">FormControl 表单控件</a></li>
          <li><a href="#date-picker" :class="{ 'is-active': activeSection === 'date-picker' }">DatePicker 日期选择器</a></li>
          <!-- Upload 上传：暂时用不到，先注释保留，需要时放开 -->
          <!-- <li><a href="#upload" :class="{ 'is-active': activeSection === 'upload' }">Upload 上传</a></li> -->
          <!-- Transfer 穿梭框：暂时用不到，先注释保留，需要时放开 -->
          <!-- <li><a href="#transfer" :class="{ 'is-active': activeSection === 'transfer' }">Transfer 穿梭框</a></li> -->
        </ul>

        <div class="app-sidebar__group-label">数据展示</div>
        <ul class="app-sidebar__nav">
          <li><a href="#tag" :class="{ 'is-active': activeSection === 'tag' }">Tag 标签</a></li>
          <li><a href="#table" :class="{ 'is-active': activeSection === 'table' }">Cell 单元格</a></li>
          <!-- <li><a href="#table-examples" :class="{ 'is-active': activeSection === 'table-examples' }" style="color: var(--iflyv-brand-primary);">📋 Table Examples（临时预览）</a></li> -->
          <li><a href="#avatar" :class="{ 'is-active': activeSection === 'avatar' }">Avatar 头像</a></li>
          <li><a href="#data-display" :class="{ 'is-active': activeSection === 'data-display' }">DataDisplay 数据展示</a></li>
        </ul>

        <div class="app-sidebar__group-label">导航</div>
        <ul class="app-sidebar__nav">
          <li><a href="#navigation" :class="{ 'is-active': activeSection === 'navigation' }">Navigation 导航组件</a></li>
        </ul>

        <div class="app-sidebar__group-label">反馈</div>
        <ul class="app-sidebar__nav">
          <li><a href="#dialog" :class="{ 'is-active': activeSection === 'dialog' }">Dialog 对话框</a></li>
          <!-- <li><a href="#dialog-examples" :class="{ 'is-active': activeSection === 'dialog-examples' }" style="color: var(--iflyv-brand-primary);">📋 Dialog Examples（临时预览）</a></li> -->
          <li><a href="#message" :class="{ 'is-active': activeSection === 'message' }">Message 消息提示</a></li>
          <li><a href="#popconfirm" :class="{ 'is-active': activeSection === 'popconfirm' }">Popconfirm 气泡确认框</a></li>
          <li><a href="#feedback" :class="{ 'is-active': activeSection === 'feedback' }">Feedback 反馈组件</a></li>
          <li><a href="#loading" :class="{ 'is-active': activeSection === 'loading' }">Loading 加载</a></li>
        </ul>

        <div class="app-sidebar__group-label">其他</div>
        <ul class="app-sidebar__nav">
          <li><a href="#empty" :class="{ 'is-active': activeSection === 'empty' }">Empty 空状态</a></li>
          <li><a href="#other" :class="{ 'is-active': activeSection === 'other' }">Other 其他组件</a></li>
        </ul>
        </template>

        <template v-if="currentTopTab === 'business'">
        <!-- 业务组件层导航：随组件逐个加入（如 AiPanel 等） -->
        </template>

        <template v-if="currentTopTab === 'pattern'">
        <ul class="app-sidebar__nav">
          <li><a href="#pattern-form" :class="{ 'is-active': activeSection === 'pattern-form' }">Form Layout 表单布局</a></li>
          <li><a href="#pattern-list-item" :class="{ 'is-active': activeSection === 'pattern-list-item' }">List Item 列表条目</a></li>
        </ul>
        </template>

        <template v-if="currentTopTab === 'copywriting'">
        <ul class="app-sidebar__nav">
          <li><a href="#copywriting-time" :class="{ 'is-active': activeSection === 'copywriting-time' }">Time 通用时间</a></li>
        </ul>
        </template>
      </div>
    </aside>

    <main class="app-content">
      <div v-show="currentTopTab === 'token'">
      <PaletteDemo />
      <SemanticColorDemo />
      <FontBaseDemo />
      <FontSemanticDemo />
      <SpacingDemo />
      <RadiusDemo />
      <ShadowDemo />
      <MotionDemo />
      </div>
      <div v-show="currentTopTab === 'component'">
      <ButtonDemo />
      <!-- <section id="button-examples" class="demo-section" style="border-top: 2px dashed var(--iflyv-brand-primary); padding-top: 24px; margin-top: 24px;">
        <h2 class="demo-section__title">📋 Button Examples（design-spec/examples/ 临时预览）</h2>
        <p style="color: var(--iflyv-text-3); margin-bottom: 16px; font-size: 13px;">
          这是 design-spec/examples/button.examples.vue 的渲染效果。
          反模式（注释中的代码）不会渲染，只展示推荐写法。验收完毕可移除本 section。
        </p>
        <ButtonExamples />
      </section> -->
      <InputDemo />
      <SelectDemo />
      <!-- <section id="select-examples" class="demo-section" style="border-top: 2px dashed var(--iflyv-brand-primary); padding-top: 24px; margin-top: 24px;">
        <h2 class="demo-section__title">📋 Select Examples（design-spec/examples/ 临时预览）</h2>
        <p style="color: var(--iflyv-text-3); margin-bottom: 16px; font-size: 13px;">
          design-spec/examples/select.examples.vue 的渲染效果。反模式仅在源码注释中。
        </p>
        <SelectExamples />
      </section> -->
      <FormControlDemo />
      <DatePickerDemo />
      <!-- Upload 上传：暂时用不到，先注释保留，需要时放开 -->
      <!-- <UploadDemo /> -->
      <!-- Transfer 穿梭框：暂时用不到，先注释保留，需要时放开 -->
      <!-- <TransferDemo /> -->
      <TagDemo />
      <TableDemo />
      <!-- <section id="table-examples" class="demo-section" style="border-top: 2px dashed var(--iflyv-brand-primary); padding-top: 24px; margin-top: 24px;">
        <h2 class="demo-section__title">📋 Table Examples（design-spec/examples/ 临时预览）</h2>
        <p style="color: var(--iflyv-text-3); margin-bottom: 16px; font-size: 13px;">
          design-spec/examples/table.examples.vue 的渲染效果。反模式仅在源码注释中。
        </p>
        <TableExamples />
      </section> -->
      <AvatarDemo />
      <DataDisplayDemo />
      <NavigationDemo />
      <DialogDemo />
      <!-- <section id="dialog-examples" class="demo-section" style="border-top: 2px dashed var(--iflyv-brand-primary); padding-top: 24px; margin-top: 24px;">
        <h2 class="demo-section__title">📋 Dialog Examples（design-spec/examples/ 临时预览）</h2>
        <p style="color: var(--iflyv-text-3); margin-bottom: 16px; font-size: 13px;">
          design-spec/examples/dialog.examples.vue 的渲染效果。反模式仅在源码注释中。
        </p>
        <DialogExamples />
      </section> -->
      <MessageDemo />
      <PopconfirmDemo />
      <FeedbackDemo />
      <LoadingDemo />
      <EmptyDemo />
      <OtherDemo />
      </div>
      <div v-show="currentTopTab === 'business'">
      <!-- 业务组件层：先空着，基础组件优化完成后逐个造入（引用 design-spec/components/） -->
      </div>
      <div v-show="currentTopTab === 'pattern'">
      <PatternFormDemo />
      <PatternListItemDemo />
      </div>
      <div v-show="currentTopTab === 'copywriting'">
      <CopywritingTimeDemo />
      </div>
    </main>
  </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 顶部导航 tab
const topTabs = [
  { value: 'token', label: '基础样式' },
  { value: 'component', label: '基础组件' },
  { value: 'business', label: '业务组件' },
  { value: 'pattern', label: '设计模式' },
  { value: 'page', label: '典型页面' },
  { value: 'copywriting', label: '文案规范' },
]
const currentTopTab = ref('component')

// demo 默认使用 green 品牌
document.documentElement.dataset.brand = 'green'

// 语言 locale（固定中文）
const epLocale = ref(zhCn)

import PaletteDemo from './components/PaletteDemo.vue'
import SemanticColorDemo from './components/token/SemanticColorDemo.vue'
import RadiusDemo from './components/token/RadiusDemo.vue'
import SpacingDemo from './components/token/SpacingDemo.vue'
import FontBaseDemo from './components/token/FontBaseDemo.vue'
import FontSemanticDemo from './components/token/FontSemanticDemo.vue'
import ShadowDemo from './components/token/ShadowDemo.vue'
import MotionDemo from './components/token/MotionDemo.vue'
import ButtonDemo from './components/ButtonDemo.vue'
import InputDemo from './components/InputDemo.vue'
import SelectDemo from './components/SelectDemo.vue'
import FormControlDemo from './components/FormControlDemo.vue'
import DatePickerDemo from './components/DatePickerDemo.vue'
// import UploadDemo from './components/UploadDemo.vue'  // ⏸ 暂停启用，需要时放开
// Transfer 穿梭框：暂时用不到，先注释保留，需要时放开
// import TransferDemo from './components/TransferDemo.vue'
import TagDemo from './components/TagDemo.vue'
import TableDemo from './components/TableDemo.vue'
import NavigationDemo from './components/NavigationDemo.vue'
import DataDisplayDemo from './components/DataDisplayDemo.vue'
import AvatarDemo from './components/AvatarDemo.vue'
import DialogDemo from './components/DialogDemo.vue'
import MessageDemo from './components/MessageDemo.vue'
import PopconfirmDemo from './components/PopconfirmDemo.vue'
import FeedbackDemo from './components/FeedbackDemo.vue'
import LoadingDemo from './components/LoadingDemo.vue'
import EmptyDemo from './components/EmptyDemo.vue'
import OtherDemo from './components/OtherDemo.vue'
import PatternFormDemo from './components/pattern/PatternFormDemo.vue'
import PatternListItemDemo from './components/pattern/PatternListItemDemo.vue'
import CopywritingTimeDemo from './components/CopywritingTimeDemo.vue'
// 临时预览 examples 的 import（已注释挂载，需要时取消注释）：
// import ButtonExamples from '../../design-spec/examples/button.examples.vue'
// import FormExamples from '../../design-spec/examples/form.examples.vue'
// import TableExamples from '../../design-spec/examples/table.examples.vue'
// import DialogExamples from '../../design-spec/examples/dialog.examples.vue'
// import SelectExamples from '../../design-spec/examples/select.examples.vue'

// Scroll-spy: 高亮当前可见区域对应的导航项
const activeSection = ref('palette')

const sectionIds = [
  'palette', 'token-color', 'token-font-base', 'token-font-semantic', 'token-spacing', 'token-radius', 'token-shadow', 'token-motion',
  'button', 'input', 'select', 'form-control', 'date-picker',
  'tag', 'table', 'avatar', 'data-display',
  'navigation', 'dialog', 'message', 'popconfirm', 'feedback', 'loading', 'empty', 'other',
  'pattern-form', 'pattern-list-item',
  'copywriting-time',
]

// 每个顶部 tab 对应它的首个 section id，切 tab 时先兜底高亮该项，
// 避免某些 tab（如「设计模式」只有单个长 section）滚动观察器未触发导致导航不高亮。
const firstSectionByTab: Record<string, string> = {
  token: 'palette',
  component: 'button',
  pattern: 'pattern-form',
  copywriting: 'copywriting-time',
}

watch(currentTopTab, (tab) => {
  const first = firstSectionByTab[tab]
  if (first) activeSection.value = first
  // 切 tab 后 DOM 中可见 section 变化，重挂观察器让滚动高亮继续生效
  nextTick(observeSections)
})

let observer: IntersectionObserver | null = null

function observeSections() {
  observer?.disconnect()
  sectionIds.forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer!.observe(el)
  })
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
  )

  // 初始 tab 也先兜底高亮其首个 section，再挂观察器
  const first = firstSectionByTab[currentTopTab.value]
  if (first) activeSection.value = first
  observeSections()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>
