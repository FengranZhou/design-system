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
    <div class="app-topbar__theme">
      <div class="brand-switcher">
        <!-- 预置品牌：dot 自带 data-brand，命中该品牌色板作用域后 accent-6 即其主色 -->
        <button
          v-for="b in presetBrands"
          :key="b.value"
          type="button"
          class="brand-dot"
          :class="{ 'is-active': currentBrand === b.value }"
          :data-brand="b.value"
          :title="b.label"
          @click="currentBrand = b.value"
        />
        <!-- 自定义：点击弹出浮层，输入 16 进制色值作为主色。
             色点默认黑底 + 下拉箭头，选定后即所选色，选中态与预置色点同款外框 -->
        <el-popover
          v-model:visible="customPanelVisible"
          :width="280"
          placement="bottom-end"
          trigger="click"
          popper-class="custom-color-popover"
          @before-enter="customColorInput = customColor"
        >
          <template #reference>
            <button
              type="button"
              class="brand-dot brand-dot--custom"
              :class="{ 'is-active': currentBrand === CUSTOM_BRAND }"
              :style="{ background: customColor }"
              title="自定义主色"
            >
              <ChevronDown :size="14" class="brand-dot__caret" />
            </button>
          </template>

          <div class="custom-color-panel">
            <el-input
              v-model="customColorInput"
              placeholder="请输入十六进制色值作为主色"
              @keyup.enter="confirmCustomColor"
            />
            <div class="custom-color-panel__footer">
              <el-button @click="cancelCustomColor">取消</el-button>
              <el-button type="primary" @click="confirmCustomColor">确定</el-button>
            </div>
          </div>
        </el-popover>
      </div>
      <button
        type="button"
        class="theme-toggle"
        :title="isDark ? '切换到亮色' : '切换到暗色'"
        @click="isDark = !isDark"
      >
        <Moon v-if="isDark" :size="18" />
        <Sun v-else :size="18" />
      </button>
    </div>
  </header>
  <div class="app-layout">
    <aside class="app-sidebar">
      <el-scrollbar class="app-sidebar__nav-wrap" view-class="app-sidebar__nav-view">
        <template v-if="currentTopTab === 'token'">
        <ul class="app-sidebar__nav">
          <li><a href="#palette" :class="{ 'is-active': activeSection === 'palette' }">Palette 基础色板</a></li>
          <li><a href="#token-color" :class="{ 'is-active': activeSection === 'token-color' }">Color 语义色板</a></li>
          <li><a href="#token-font-base" :class="{ 'is-active': activeSection === 'token-font-base' }">Font Base 基础字阶</a></li>
          <li><a href="#token-font-semantic" :class="{ 'is-active': activeSection === 'token-font-semantic' }">Font 语义字阶</a></li>
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

        <div class="app-sidebar__group-label">导航</div>
        <ul class="app-sidebar__nav">
          <li><a href="#breadcrumb" :class="{ 'is-active': activeSection === 'breadcrumb' }">Breadcrumb 面包屑</a></li>
          <li><a href="#tabs" :class="{ 'is-active': activeSection === 'tabs' }">Tabs 标签页</a></li>
          <li><a href="#pagination" :class="{ 'is-active': activeSection === 'pagination' }">Pagination 分页</a></li>
          <li><a href="#anchor" :class="{ 'is-active': activeSection === 'anchor' }">Anchor 锚点</a></li>
          <li><a href="#steps" :class="{ 'is-active': activeSection === 'steps' }">Steps 轻量步骤条</a></li>
          <li><a href="#dropdown" :class="{ 'is-active': activeSection === 'dropdown' }">Dropdown 下拉菜单</a></li>
        </ul>

        <div class="app-sidebar__group-label">数据录入</div>
        <ul class="app-sidebar__nav">
          <li><a href="#input" :class="{ 'is-active': activeSection === 'input' }">Input 输入框</a></li>
          <li><a href="#select" :class="{ 'is-active': activeSection === 'select' }">Select 选择器</a></li>
          <!-- <li><a href="#select-examples" :class="{ 'is-active': activeSection === 'select-examples' }" style="color: var(--iflyv-brand-primary);">📋 Select Examples（临时预览）</a></li> -->
          <li><a href="#date-picker" :class="{ 'is-active': activeSection === 'date-picker' }">Picker 时间/日期选择器</a></li>
          <li><a href="#radio" :class="{ 'is-active': activeSection === 'radio' }">Radio 单选框</a></li>
          <li><a href="#checkbox" :class="{ 'is-active': activeSection === 'checkbox' }">Checkbox 多选框</a></li>
          <li><a href="#switch" :class="{ 'is-active': activeSection === 'switch' }">Switch 开关</a></li>
          <li><a href="#slider" :class="{ 'is-active': activeSection === 'slider' }">Slider 滑块</a></li>
          <li><a href="#rate" :class="{ 'is-active': activeSection === 'rate' }">Rate 评分</a></li>
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
          <li><a href="#badge" :class="{ 'is-active': activeSection === 'badge' }">Badge 徽标</a></li>
          <li><a href="#descriptions" :class="{ 'is-active': activeSection === 'descriptions' }">Descriptions 描述列表</a></li>
          <li><a href="#avatar" :class="{ 'is-active': activeSection === 'avatar' }">Avatar 头像</a></li>
          <li><a href="#empty" :class="{ 'is-active': activeSection === 'empty' }">Empty 空状态</a></li>
          <!-- DataDisplay 数据展示：徽标/描述列表已拆出、骨架屏已移入反馈组，页内暂无在展内容（仅存暂停块），先注释，需要时放开 -->
          <!-- <li><a href="#data-display" :class="{ 'is-active': activeSection === 'data-display' }">DataDisplay 数据展示</a></li> -->
        </ul>

        <div class="app-sidebar__group-label">反馈</div>
        <ul class="app-sidebar__nav">
          <li><a href="#dialog" :class="{ 'is-active': activeSection === 'dialog' }">Dialog 对话框</a></li>
          <!-- <li><a href="#dialog-examples" :class="{ 'is-active': activeSection === 'dialog-examples' }" style="color: var(--iflyv-brand-primary);">📋 Dialog Examples（临时预览）</a></li> -->
          <li><a href="#drawer" :class="{ 'is-active': activeSection === 'drawer' }">Drawer 抽屉</a></li>
          <li><a href="#message" :class="{ 'is-active': activeSection === 'message' }">Message 消息提示</a></li>
          <li><a href="#alert" :class="{ 'is-active': activeSection === 'alert' }">Alert 警告</a></li>
          <li><a href="#notification" :class="{ 'is-active': activeSection === 'notification' }">Notification 通知</a></li>
          <li><a href="#popconfirm" :class="{ 'is-active': activeSection === 'popconfirm' }">Popconfirm 气泡确认框</a></li>
          <li><a href="#tooltip" :class="{ 'is-active': activeSection === 'tooltip' }">Tooltip 文字提示</a></li>
          <li><a href="#loading" :class="{ 'is-active': activeSection === 'loading' }">Loading 加载</a></li>
          <li><a href="#skeleton" :class="{ 'is-active': activeSection === 'skeleton' }">Skeleton 骨架屏</a></li>
          <li><a href="#result" :class="{ 'is-active': activeSection === 'result' }">Result 结果页</a></li>
        </ul>

        <!-- 其他组：Empty 已移入「数据展示」；Other 结果页拆出后页内暂无在展内容（仅存暂停块），整组先注释，需要时放开 -->
        <!-- <div class="app-sidebar__group-label">其他</div>
        <ul class="app-sidebar__nav">
          <li><a href="#other" :class="{ 'is-active': activeSection === 'other' }">Other 其他组件</a></li>
        </ul> -->
        </template>

        <template v-if="currentTopTab === 'business'">
        <!-- 业务组件层导航：随组件逐个加入（如 AiPanel 等） -->
        <ul class="app-sidebar__nav">
          <li><a href="#page-frame" :class="{ 'is-active': activeSection === 'page-frame' }">PageFrame 页面框架</a></li>
          <li><a href="#step-bar" :class="{ 'is-active': activeSection === 'step-bar' }">StepBar 步骤条</a></li>
          <li><a href="#ai-button" :class="{ 'is-active': activeSection === 'ai-button' }">AiButton Ai按钮</a></li>
        </ul>
        </template>

        <template v-if="currentTopTab === 'pattern'">
        <ul class="app-sidebar__nav">
          <li><a href="#pattern-form" :class="{ 'is-active': activeSection === 'pattern-form' }">Form Layout 表单布局</a></li>
          <li><a href="#pattern-list-item" :class="{ 'is-active': activeSection === 'pattern-list-item' }">List Item 列表条目</a></li>
          <li><a href="#pattern-toolbar" :class="{ 'is-active': activeSection === 'pattern-toolbar' }">Toolbar 工具栏布局</a></li>
        </ul>
        </template>

        <template v-if="currentTopTab === 'copywriting'">
        <ul class="app-sidebar__nav">
          <li><a href="#copywriting-time" :class="{ 'is-active': activeSection === 'copywriting-time' }">Time 通用时间</a></li>
        </ul>
        </template>
      </el-scrollbar>
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
      <div v-show="currentTopTab === 'component'" class="no-title-divider">
      <ButtonDemo />
      <!-- <section id="button-examples" class="demo-section" style="border-top: 2px dashed var(--iflyv-brand-primary); padding-top: 24px; margin-top: 24px;">
        <h2 class="demo-section__title">📋 Button Examples（design-spec/examples/ 临时预览）</h2>
        <p style="color: var(--iflyv-text-3); margin-bottom: 16px; font-size: 13px;">
          这是 design-spec/examples/button.examples.vue 的渲染效果。
          反模式（注释中的代码）不会渲染，只展示推荐写法。验收完毕可移除本 section。
        </p>
        <ButtonExamples />
      </section> -->
      <BreadcrumbDemo />
      <TabsDemo />
      <PaginationDemo />
      <AnchorDemo />
      <StepsDemo />
      <DropdownDemo />
      <InputDemo />
      <SelectDemo />
      <!-- <section id="select-examples" class="demo-section" style="border-top: 2px dashed var(--iflyv-brand-primary); padding-top: 24px; margin-top: 24px;">
        <h2 class="demo-section__title">📋 Select Examples（design-spec/examples/ 临时预览）</h2>
        <p style="color: var(--iflyv-text-3); margin-bottom: 16px; font-size: 13px;">
          design-spec/examples/select.examples.vue 的渲染效果。反模式仅在源码注释中。
        </p>
        <SelectExamples />
      </section> -->
      <DatePickerDemo />
      <RadioDemo />
      <CheckboxDemo />
      <SwitchDemo />
      <SliderDemo />
      <RateDemo />
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
      <BadgeDemo />
      <DescriptionsDemo />
      <AvatarDemo />
      <EmptyDemo />
      <!-- DataDisplay 数据展示：页内暂无在展内容（仅存暂停块），随导航一并注释，需要时放开 -->
      <!-- <DataDisplayDemo /> -->
      <DialogDemo />
      <!-- <section id="dialog-examples" class="demo-section" style="border-top: 2px dashed var(--iflyv-brand-primary); padding-top: 24px; margin-top: 24px;">
        <h2 class="demo-section__title">📋 Dialog Examples（design-spec/examples/ 临时预览）</h2>
        <p style="color: var(--iflyv-text-3); margin-bottom: 16px; font-size: 13px;">
          design-spec/examples/dialog.examples.vue 的渲染效果。反模式仅在源码注释中。
        </p>
        <DialogExamples />
      </section> -->
      <DrawerDemo />
      <MessageDemo />
      <AlertDemo />
      <NotificationDemo />
      <PopconfirmDemo />
      <TooltipDemo />
      <LoadingDemo />
      <SkeletonDemo />
      <ResultDemo />
      <!-- Other 其他组件：结果页拆出后页内暂无在展内容（仅存暂停块），先注释，需要时放开 -->
      <!-- <OtherDemo /> -->
      </div>
      <div v-show="currentTopTab === 'business'" class="no-title-divider">
      <PageFrameDemo />
      <StepBarDemo />
      <AiButtonDemo />
      </div>
      <div v-show="currentTopTab === 'pattern'" class="no-title-divider">
      <PatternFormDemo />
      <PatternListItemDemo />
      <PatternToolbarDemo />
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
import { ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { Sun, Moon, ChevronDown } from 'lucide-vue-next'
import { generatePalette } from './utils/generate-palette'

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

// ============ 主题切换（品牌色 + 亮/暗）============
// ============ 主题切换（品牌色 + 亮/暗）============
// 预置品牌：值即 register-brand 注册的 name。
// ⚠ 注册在使用方（见本 demo 的 styles/global.scss 顶部），源头只提供 mixin——
//   下游项目要用自己的品牌色，同样在自己项目里 @include register-brand 注册。
const presetBrands = [
  { value: 'green', label: '品牌绿（默认）' },
  { value: 'science-blue', label: '理工蓝 #0077FF' },
]
const CUSTOM_BRAND = 'custom'

const currentBrand = ref('green')
// 自定义色默认黑（色点显示为黑底 + 白箭头）；仅当用户主动选色后才切到自定义品牌
const customColor = ref('#000000')
const isDark = ref(false)

// 自定义色：由主色算出 10 阶亮/暗色板，写成行内 CSS 变量覆盖 accent-1~10。
// 走行内 style 而非 scss 注册，是因为 register-brand 是编译期 mixin，接不了运行时色值。
function applyCustomPalette(color: string, dark: boolean) {
  const root = document.documentElement
  if (!color) {
    for (let i = 1; i <= 10; i += 1) root.style.removeProperty(`--iflyv-accent-${i}`)
    return
  }
  const palette = generatePalette(color, dark ? { theme: 'dark' } : {})
  palette.forEach((c, i) => root.style.setProperty(`--iflyv-accent-${i + 1}`, c))
}

const customPanelVisible = ref(false)
const customColorInput = ref('')

/** 取消：回落到首个预置主色（绿），自定义色点复位为黑 */
function cancelCustomColor() {
  customColorInput.value = ''
  customColor.value = '#000000'
  currentBrand.value = 'green'
  customPanelVisible.value = false
}

/** 确定：色值合法则应用为自定义主色，同时把选中态从预置色点移走 */
function confirmCustomColor() {
  const raw = customColorInput.value.trim()
  const hex = raw.startsWith('#') ? raw : `#${raw}`
  // 支持 #RGB 简写与 #RRGGBB
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
    ElMessage.warning('请输入合法的十六进制色值，如 #0077FF')
    return
  }
  // 简写补全成 6 位，供色板算法解析
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex
  customColor.value = full.toUpperCase()
  currentBrand.value = CUSTOM_BRAND
  customPanelVisible.value = false
}

// 写到 html 上：[data-brand] 命中品牌色板、[data-theme="dark"] 命中暗色语义层
watch(
  [currentBrand, customColor, isDark],
  ([brand, color, dark]) => {
    const root = document.documentElement
    if (dark) root.dataset.theme = 'dark'
    else delete root.dataset.theme

    if (brand === CUSTOM_BRAND && color) {
      // 自定义色不走 [data-brand] 作用域，清掉它避免预置色板残留
      delete root.dataset.brand
      applyCustomPalette(color, dark as boolean)
    } else {
      applyCustomPalette('', false) // 清掉行内覆盖，交还给 scss 注册的色板
      root.dataset.brand = brand as string
    }
  },
  { immediate: true },
)

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
import RadioDemo from './components/RadioDemo.vue'
import CheckboxDemo from './components/CheckboxDemo.vue'
import SwitchDemo from './components/SwitchDemo.vue'
import SliderDemo from './components/SliderDemo.vue'
import RateDemo from './components/RateDemo.vue'
import DatePickerDemo from './components/DatePickerDemo.vue'
// import UploadDemo from './components/UploadDemo.vue'  // ⏸ 暂停启用，需要时放开
// Transfer 穿梭框：暂时用不到，先注释保留，需要时放开
// import TransferDemo from './components/TransferDemo.vue'
import TagDemo from './components/TagDemo.vue'
import TableDemo from './components/TableDemo.vue'
import TabsDemo from './components/TabsDemo.vue'
import BreadcrumbDemo from './components/BreadcrumbDemo.vue'
import DropdownDemo from './components/DropdownDemo.vue'
import StepsDemo from './components/StepsDemo.vue'
import AnchorDemo from './components/AnchorDemo.vue'
import PaginationDemo from './components/PaginationDemo.vue'
// import DataDisplayDemo from './components/DataDisplayDemo.vue'  // ⏸ 暂停启用（页内暂无在展内容），需要时放开
import AvatarDemo from './components/AvatarDemo.vue'
import BadgeDemo from './components/BadgeDemo.vue'
import DescriptionsDemo from './components/DescriptionsDemo.vue'
import DialogDemo from './components/DialogDemo.vue'
import MessageDemo from './components/MessageDemo.vue'
import PopconfirmDemo from './components/PopconfirmDemo.vue'
import AlertDemo from './components/AlertDemo.vue'
import TooltipDemo from './components/TooltipDemo.vue'
import NotificationDemo from './components/NotificationDemo.vue'
import DrawerDemo from './components/DrawerDemo.vue'
import LoadingDemo from './components/LoadingDemo.vue'
import SkeletonDemo from './components/SkeletonDemo.vue'
import EmptyDemo from './components/EmptyDemo.vue'
import ResultDemo from './components/ResultDemo.vue'
// import OtherDemo from './components/OtherDemo.vue'  // ⏸ 暂停启用（页内暂无在展内容），需要时放开
import PatternFormDemo from './components/pattern/PatternFormDemo.vue'
import PatternListItemDemo from './components/pattern/PatternListItemDemo.vue'
import PatternToolbarDemo from './components/pattern/PatternToolbarDemo.vue'
import CopywritingTimeDemo from './components/CopywritingTimeDemo.vue'
// 业务组件层 demo（引用 design-spec/components/）
import StepBarDemo from './components/biz/StepBarDemo.vue'
import PageFrameDemo from './components/biz/PageFrameDemo.vue'
import AiButtonDemo from './components/biz/AiButtonDemo.vue'
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
  'button',
  'breadcrumb', 'tabs', 'pagination', 'anchor', 'steps', 'dropdown',
  'input', 'select', 'date-picker', 'radio', 'checkbox', 'switch', 'slider', 'rate',
  'tag', 'table', 'badge', 'descriptions', 'avatar', 'empty',
  'dialog', 'drawer', 'message', 'alert', 'notification', 'popconfirm', 'tooltip', 'loading', 'skeleton', 'result',
  'page-frame', 'step-bar', 'ai-button',
  'pattern-form', 'pattern-list-item', 'pattern-toolbar',
  'copywriting-time',
]

// 每个顶部 tab 对应它的首个 section id，切 tab 时先兜底高亮该项，
// 避免某些 tab（如「设计模式」只有单个长 section）滚动观察器未触发导致导航不高亮。
const firstSectionByTab: Record<string, string> = {
  token: 'palette',
  component: 'button',
  business: 'page-frame',
  pattern: 'pattern-form',
  copywriting: 'copywriting-time',
}

watch(currentTopTab, (tab) => {
  const first = firstSectionByTab[tab]
  if (first) activeSection.value = first
  // 切 tab 后 DOM 中可见 section 变化，重挂观察器让滚动高亮继续生效
  nextTick(observeSections)
})

// 确定性 scroll-spy：按滚动位置取「最后一个顶部越过停靠线的 section」。
// 之前用 IntersectionObserver 的「最后一个 isIntersecting 条目获胜」，向上滚动时
// 相邻两个 section 会短暂同时压在判定带上、后者获胜且离开事件被忽略，高亮卡在错误项。
// 停靠线与 html 的 scroll-padding-top 对齐（topbar 64 + spacing-3 12），再留少量容差。
const SPY_OFFSET = 64 + 12 + 8

let spyTicking = false

function updateActiveSection() {
  let current = ''
  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (!el || el.offsetParent === null) continue  // 跳过不存在或隐藏 tab 里的 section
    if (el.getBoundingClientRect().top <= SPY_OFFSET) {
      current = id  // 顶部已越线，暂记；继续找更靠后的
    } else {
      break  // sectionIds 按页面顺序排列，后面的更不可能越线
    }
  }
  if (current) {
    activeSection.value = current
  } else {
    // 还没有任何 section 越线（停在页面最顶端）→ 兜底高亮当前 tab 首项
    const first = firstSectionByTab[currentTopTab.value]
    if (first) activeSection.value = first
  }
}

function onSpyScroll() {
  if (spyTicking) return
  spyTicking = true
  requestAnimationFrame(() => {
    spyTicking = false
    updateActiveSection()
  })
}

function observeSections() {
  updateActiveSection()
}

onMounted(() => {
  window.addEventListener('scroll', onSpyScroll, { passive: true })
  // 初始 tab 先兜底高亮其首个 section，再按当前位置校正
  const first = firstSectionByTab[currentTopTab.value]
  if (first) activeSection.value = first
  updateActiveSection()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onSpyScroll)
})
</script>
