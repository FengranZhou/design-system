<!-- ============================================================================
  PageFrame 页面框架（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：整页级后台框架（左侧边导航 + 顶栏面包屑/用户区 + 白色圆角内容区），
         如课程空间、管理后台等「进入某对象后的工作区」页面骨架。
  引用：  import { PageFrame } from '<path>/design-spec/components'
  用法：
    <PageFrame
      v-model:active="activeKey"
      :menus="menus"
      :course="{ name: '《智能启思从零懂智能》', meta: ['2023年春', '全网公开'] }"
      :breadcrumbs="[{ label: '教学内容' }, { label: '课程工具' }]"
      :notice-count="13"
      avatar-role="teacher-female"
      @back="router.back()"
      @back-platform="router.push('/')"
    >
      页面内容（默认插槽，渲染在白色圆角内容卡里）
    </PageFrame>
  props：
    menus          PageFrameMenuGroup[]  必填。侧边导航分组：{ title?, items: [{ key, label, icon?, children? }] }。
                                         item 带 children 时为可折叠父项（点击只展开/收起，子项才可选中）。
                                         icon 渲染时会收到 :active（该项是否选中）——图标组件若要做
                                         默认/选中双态切图，声明 active prop 接住即可；不需要则忽略
                                         （Lucide 等不认识它的组件会把它落成无害的 DOM 属性）。
    v-model:active string                当前选中菜单 key（含子项 key）。选中态 = 加粗 + text-1。
    course         PageFrameCourse       可选。侧边栏顶部课程卡 { name, meta?, cover?, cornerTag? }；不传则不渲染。
    back-text      string                可选，默认「返回平台」。侧边栏顶部返回按钮文案；传空串隐藏按钮。
    breadcrumbs    BreadcrumbItem[]      可选。顶栏面包屑（内部复用业务组件 Breadcrumb）；不传则不渲染。
    back-disabled  boolean               可选。面包屑返回箭头禁用态（透传 Breadcrumb）。判据 = 面包屑倒数第二项
                                         是不是可跳转实体页，不是层数——分组标题、只负责展开子菜单的可折叠父项
                                         都不是实体页，以它们为上一级时须传 true（详见 Breadcrumb 速查）。
    show-help / show-notice  boolean     可选，默认 true。顶栏帮助 / 通知铃铛图标（均自带
                                         el-tooltip 全称提示，向下展开）。
    help-text / notice-text  string      可选，默认「帮助中心」「消息提醒」。上述两个图标的 tooltip 文案，
                                         改叫法 / 国际化时传入。**不要传空串**——纯图标入口没有全称
                                         就只能靠猜（见 component-interaction.md Tooltip 段）；
                                         不需要该入口请用 show-help / show-notice 关掉整个图标。
    notice-count   number                可选，默认 0。通知未读数（el-badge，0 时隐藏红点）。
    avatar-role / avatar-src             可选。顶栏头像（透传业务组件 UserAvatar）；都不传则不渲染头像。
    v-model:collapsed  boolean           可选，默认 false。侧边栏收起态。**不传也能用**——组件内部自管状态，
                                         只有需要外部读取/持久化（如记住用户偏好）时才传。
  收起交互（内置，接入方无需做任何事）：
    hover 侧边栏 → 右缘垂直居中浮出收起把手 → 点击收起为 64px 图标栏
    （返回平台收成图标、课程卡与分组标题隐藏）→ hover 某图标弹出下拉面板补回分组标题与子项。
    窄屏自动折叠：视口 < 1440 时自动收起（把宽度让给内容区）；**用户手动切换过之后
    不再自动干预**。接入方无需写任何 media query。（1200 是页面硬下限，更窄时整页
    走横向滚动、布局不再变化，故不存在更低的断点。）
  emits：
    menu-select(key, item)  选中某菜单项（父项展开/收起不触发）
    back                    点击面包屑返回箭头
    breadcrumb-click(item, index)  点击某面包屑路径项
    collapse-change(collapsed)  侧边栏收起 / 展开切换
    back-platform / course-click / help-click / notice-click / avatar-click
  slots：
    默认插槽      内容区（白色圆角卡内部；内边距由页面自定）
    #course-card  整体替换侧边栏课程卡
    #breadcrumb   整体替换顶栏左侧面包屑区
    #topbar-right 顶栏右侧追加自定义入口（插在帮助图标之前）
  最小宽度：整页框架有 1200px 宽度下限（--iflyv-layout-min-width）。承载容器窄于此值时，
           框架自身出横向滚动条、内部布局不再压缩——接入方无需做任何事，也勿在外层
           另加 overflow-x / 自设 min-width 覆盖（会与本机制打架）。
  禁止：手写 aside/header div 拼同款框架、用 el-menu/el-container 复刻这套观感——一律用本组件。
  改外观：回本文件源头改，改一次所有引用方同步（勿在使用方私自覆盖）。
============================================================================ -->
<template>
  <!-- 最外层横向滚动壳：整页框架有 1200px 最小宽度（--iflyv-layout-min-width），
       容器窄于此值时由本壳出横向滚动条，而非把侧边栏 + 内容区继续压到不可用。
       滚动条用 el-scrollbar（同侧边栏 / 内容区），不用原生 overflow-x。 -->
  <el-scrollbar class="page-frame-shell" view-class="page-frame-shell__view">
    <div class="page-frame">
      <!-- ==================== 侧边栏 ==================== -->
      <!-- hover 整条侧栏才浮出收起把手（把手常显会成为持续的视觉噪音） -->
      <aside
        class="page-frame__sidebar"
        :class="{ 'is-collapsed': collapsed }"
        @mouseenter="onSidebarEnter"
        @mouseleave="onSidebarLeave"
      >
        <!-- 收起把手：贴侧栏右缘垂直居中，凹口形状用 CSS 遮罩绘制（见样式段），
             底色随灰底令牌走。收起态图标翻转指向展开方向。 -->
        <!-- 外层 clip 壳固定不动、overflow 裁切：薄片推入/推走时越过壳左缘即被切掉，
             不会跑进侧栏里露脸（壳只做窗口，不接指针事件，点击透传给内部按钮） -->
        <div class="page-frame__handle-clip">
          <Transition name="page-frame-handle">
            <button
              v-show="sidebarHover"
              type="button"
              class="page-frame__handle"
              :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
              @click="toggleCollapse"
            >
              <ChevronLeft :size="16" class="page-frame__handle-icon" />
            </button>
          </Transition>
        </div>

        <button
          v-if="backText"
          type="button"
          class="page-frame__back"
          :title="collapsed ? backText : undefined"
          @click="emit('back-platform')"
        >
          <House :size="16" class="page-frame__back-icon" />
          <!-- 收起态只留图标，文字随宽度一起收掉 -->
          <span v-if="!collapsed">{{ backText }}</span>
        </button>

        <!-- 课程卡 + 导航同处一个滚动区：课程卡随导航一起滚走，不吸顶。
             用 el-scrollbar（基础组件）而非原生滚动条：自绘条浮在内容上不占位、
             无原生 track 白底，且默认 hover 才显形 -->
        <el-scrollbar class="page-frame__scroll" view-class="page-frame__scroll-view">
          <!-- 收起态隐藏课程卡：缩到 64px 宽后封面图与课程名都无法辨识 -->
          <slot v-if="!collapsed" name="course-card">
            <div v-if="course" class="page-frame__course" @click="emit('course-click')">
              <img :src="course.cover || defaultCover" class="page-frame__course-cover" alt="" />
              <span v-if="(course.cornerTag ?? '课程详情') !== ''" class="page-frame__course-tag">
                {{ course.cornerTag ?? '课程详情' }}
              </span>
              <div class="page-frame__course-info">
                <p class="page-frame__course-name">{{ course.name }}</p>
                <p v-if="course.meta?.length" class="page-frame__course-meta">
                  <template v-for="(m, i) in course.meta" :key="i">
                    <span v-if="i > 0" class="page-frame__course-meta-divider">|</span>
                    <span>{{ m }}</span>
                  </template>
                </p>
              </div>
            </div>
          </slot>

          <nav class="page-frame__nav">
            <template v-for="(group, gi) in menus" :key="gi">
              <!-- 收起态不渲染分组小标题：64px 宽放不下，标题改由 hover 浮层给出 -->
              <p v-if="group.title && !collapsed" class="page-frame__group-title">{{ group.title }}</p>
              <template v-for="item in group.items" :key="item.key">
                <!-- 收起态（可展开项）：图标触发 el-dropdown（基础组件），面板补回窄态下
                     丢失的层级——抬头 = 该一级项自身名称，选项 = 其下二级项。
                     触发器 = 图标方块（属"紧凑场景用纯图标触发"档），菜单项一律用
                     el-dropdown-item——行高/圆角/hover 全在 dropdown.scss 源头；
                     抬头用源头约定类 .dropdown-group-title（灰小字，与选项拉开层级）。 -->
                <el-dropdown
                  v-if="collapsed && item.children?.length"
                  placement="right-start"
                  trigger="hover"
                  popper-class="page-frame-flyout"
                  @command="onFlyoutCommand"
                >
                  <div
                    class="page-frame__item"
                    :class="{ 'is-active': isItemActive(item) }"
                    @click="onItemClick(item)"
                  >
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      class="page-frame__item-icon"
                      :active="isItemActive(item)"
                    />
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <!-- 抬头 = 一级项名称：非可选项，故不是 dropdown-item，只作面板抬头 -->
                      <li class="dropdown-group-title">{{ item.label }}</li>
                      <el-dropdown-item
                        v-for="child in item.children"
                        :key="child.key"
                        :command="child.key"
                        :class="{ 'is-active': active === child.key }"
                      >{{ child.label }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

                <!-- 收起态（不可展开项）：无下级可列，弹面板等于只放一个自己＝多余一层点击。
                     纯图标入口按规范一律配 el-tooltip 补全称即可（placement 右侧：侧栏贴左边） -->
                <el-tooltip
                  v-else-if="collapsed"
                  :content="item.label"
                  placement="right"
                  :show-after="300"
                >
                  <div
                    class="page-frame__item"
                    :class="{ 'is-active': isItemActive(item) }"
                    @click="onItemClick(item)"
                  >
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      class="page-frame__item-icon"
                      :active="isItemActive(item)"
                    />
                  </div>
                </el-tooltip>

                <!-- 展开态：原有完整形态（图标 + 文字 + 可折叠子菜单） -->
                <template v-else>
                  <div
                    class="page-frame__item"
                    :class="{ 'is-active': !item.children?.length && active === item.key }"
                    @click="onItemClick(item)"
                  >
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      class="page-frame__item-icon"
                      :active="!item.children?.length && active === item.key"
                    />
                    <span class="page-frame__item-label">{{ item.label }}</span>
                    <ChevronDown
                      v-if="item.children?.length"
                      :size="16"
                      class="page-frame__item-arrow"
                      :class="{ 'is-open': openKeys.has(item.key) }"
                    />
                  </div>
                  <!-- 子菜单：EP 折叠过渡（基础组件，全局注册），展开/收起带高度动效 -->
                  <el-collapse-transition v-if="item.children?.length">
                    <div v-show="openKeys.has(item.key)" class="page-frame__subitems">
                      <div
                        v-for="child in item.children"
                        :key="child.key"
                        class="page-frame__subitem"
                        :class="{ 'is-active': active === child.key }"
                        @click="onChildClick(child, item)"
                      >{{ child.label }}</div>
                    </div>
                  </el-collapse-transition>
                </template>
              </template>
            </template>
          </nav>
        </el-scrollbar>
      </aside>

      <!-- ==================== 主区（顶栏 + 内容卡） ==================== -->
      <div class="page-frame__main">
        <header class="page-frame__topbar">
          <slot name="breadcrumb">
            <Breadcrumb
              v-if="breadcrumbs?.length"
              :items="breadcrumbs"
              :back-disabled="backDisabled"
              @back="emit('back')"
              @item-click="(item, index) => emit('breadcrumb-click', item, index)"
            />
          </slot>
          <div class="page-frame__topbar-right">
            <slot name="topbar-right" />
            <!-- 纯图标入口无文字标签，一律用 el-tooltip 补全称（placement 统一 bottom：
                 顶栏贴页面顶边，气泡只能向下展开）。气泡外观走 tooltip.scss 源头，此处不写样式 -->
            <el-tooltip v-if="showHelp" :content="helpText" placement="bottom" :show-after="300">
              <button
                type="button"
                class="page-frame__icon-btn"
                @click="emit('help-click')"
              >
                <CircleHelp :size="18" />
              </button>
            </el-tooltip>
            <!-- 徽标挂图标：el-badge 直接包裸图标（EP 原生定位贴图标右上角，见 badge.scss 使用约定），
                 28px 热区由外层按钮提供，badge 不包按钮——包按钮会让徽标锚到热区角上、飘离铃铛 -->
            <el-tooltip v-if="showNotice" :content="noticeText" placement="bottom" :show-after="300">
              <button
                type="button"
                class="page-frame__icon-btn"
                @click="emit('notice-click')"
              >
                <el-badge :value="noticeCount" :max="99" :hidden="!noticeCount">
                  <Bell :size="18" />
                </el-badge>
              </button>
            </el-tooltip>
            <div
              v-if="avatarRole || avatarSrc"
              class="page-frame__avatar"
              @click="emit('avatar-click')"
            >
              <UserAvatar :role="avatarRole" :src="avatarSrc" :size="28" />
            </div>
          </div>
        </header>
        <!-- 内容区可滚：用 el-scrollbar（基础组件）而非 overflow:auto——
             原生滚动条样式不可控、有白底 track 且占位挤内容（见 component-interaction.md 滚动条段） -->
        <el-scrollbar
          tag="main"
          class="page-frame__content"
          view-class="page-frame__content-view"
        >
          <slot />
        </el-scrollbar>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { House, ChevronDown, ChevronLeft, CircleHelp, Bell } from 'lucide-vue-next'
import { Breadcrumb } from '../Breadcrumb'
import type { BreadcrumbItem } from '../Breadcrumb'
import { UserAvatar, type AvatarRole } from '../UserAvatar'
import type { PageFrameMenuGroup, PageFrameMenuItem, PageFrameMenuChild, PageFrameCourse } from './types'
// 组件自包含资源：课程卡缺省封面（使用方不传 cover 时用它，无需在自己项目放图）
import defaultCover from './assets/course-cover-default.png'

const props = withDefaults(defineProps<{
  /** 侧边导航分组 */
  menus: PageFrameMenuGroup[]
  /** 侧边栏顶部课程卡；不传则不渲染 */
  course?: PageFrameCourse
  /** 侧边栏顶部返回按钮文案；空串隐藏 */
  backText?: string
  /** 顶栏面包屑路径项；不传则不渲染 */
  breadcrumbs?: BreadcrumbItem[]
  /** 面包屑返回箭头禁用态 */
  backDisabled?: boolean
  /** 顶栏帮助图标 */
  showHelp?: boolean
  /** 帮助图标的 tooltip 文案（纯图标入口必须有全称，故不允许空串） */
  helpText?: string
  /** 顶栏通知铃铛 */
  showNotice?: boolean
  /** 通知铃铛的 tooltip 文案（同上，不允许空串） */
  noticeText?: string
  /** 通知未读数（0 隐藏红点） */
  noticeCount?: number
  /** 头像（透传 UserAvatar）；role/src 都不传则不渲染 */
  avatarRole?: AvatarRole
  avatarSrc?: string
}>(), {
  backText: '返回平台',
  backDisabled: false,
  showHelp: true,
  helpText: '帮助中心',
  showNotice: true,
  noticeText: '消息提醒',
  noticeCount: 0,
})

/** 当前选中菜单 key（v-model:active） */
const active = defineModel<string>('active')

/** 侧边栏是否收起（v-model:collapsed；使用方不传也能用，组件内部自管状态） */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const emit = defineEmits<{
  /** 选中某菜单项（含子项）；父项的展开/收起不触发 */
  'menu-select': [key: string, item: PageFrameMenuItem | PageFrameMenuChild]
  /** 点击面包屑返回箭头 */
  back: []
  /** 点击某面包屑路径项 */
  'breadcrumb-click': [item: BreadcrumbItem, index: number]
  'back-platform': []
  'course-click': []
  'help-click': []
  'notice-click': []
  'avatar-click': []
  /** 侧边栏收起 / 展开切换 */
  'collapse-change': [collapsed: boolean]
}>()

/** 鼠标是否停留在侧栏上（决定收起把手是否浮出） */
const sidebarHover = ref(false)

/** 移开侧栏后把手的延迟消失计时器：鼠标离开不立即收，留 0.5s 反悔窗口——
 *  把手贴在侧栏右缘，鼠标从侧栏移向它的路径上很容易先划出侧栏边界，
 *  立即消失会让人"够不着"这个按钮。进入时清掉待执行的隐藏。 */
let handleHideTimer: ReturnType<typeof setTimeout> | undefined

const onSidebarEnter = () => {
  clearTimeout(handleHideTimer)
  sidebarHover.value = true
}

const onSidebarLeave = () => {
  clearTimeout(handleHideTimer)
  handleHideTimer = setTimeout(() => {
    sidebarHover.value = false
  }, 500)
}

onBeforeUnmount(() => clearTimeout(handleHideTimer))

/* ==================== 窄屏自动折叠 ====================
   1200~1439 区间内自动收起侧边栏为图标栏，把宽度让给内容区
   （规则见 references/efficiency-guide.md「响应式策略」）。
   ⚠️ 只在 ≥1200 区间内生效——窄于 1200 时整页走横向滚动、布局不再变化
      （--iflyv-layout-min-width 是硬下限），故无需也不该设更低的断点。
   ⚠️ 用户手动切换过之后就不再自动干预（userToggled 锁）：自动折叠只是
      「默认初始状态」的智能化，用户的显式选择优先级更高，否则拖窗口会
      不断覆盖用户刚做的操作。 */
const AUTO_COLLAPSE_BELOW = 1440
/** 用户是否手动切换过收起态——一旦为 true，窗口尺寸变化不再改 collapsed */
let userToggled = false

const syncCollapseByWidth = () => {
  if (userToggled) return
  collapsed.value = window.innerWidth < AUTO_COLLAPSE_BELOW
}

onMounted(() => {
  syncCollapseByWidth()
  window.addEventListener('resize', syncCollapseByWidth)
})
onBeforeUnmount(() => window.removeEventListener('resize', syncCollapseByWidth))

const toggleCollapse = () => {
  userToggled = true
  collapsed.value = !collapsed.value
  emit('collapse-change', collapsed.value)
}

/** 收起态某图标是否高亮：自身选中，或其任一子项选中（子项此时藏在浮层里） */
const isItemActive = (item: PageFrameMenuItem) =>
  active.value === item.key || !!item.children?.some((c) => c.key === active.value)

/** 收起态浮层选中某项：command 传的是 key，回查出对应项后走与展开态同一套 emit */
const onFlyoutCommand = (key: string) => {
  for (const group of props.menus) {
    for (const item of group.items) {
      if (item.key === key && !item.children?.length) return onItemClick(item)
      const child = item.children?.find((c) => c.key === key)
      if (child) return onChildClick(child, item)
    }
  }
}

/** 已展开的可折叠父项 key 集合 */
const openKeys = ref(new Set<string>())

/** 选中子项时自动展开其父项（含初始 active 命中子项的场景） */
watch(
  () => active.value,
  (key) => {
    if (!key) return
    for (const group of props.menus) {
      for (const item of group.items) {
        if (item.children?.some((c) => c.key === key)) openKeys.value.add(item.key)
      }
    }
  },
  { immediate: true },
)

const onItemClick = (item: PageFrameMenuItem) => {
  if (item.children?.length) {
    // 父项：只做展开/收起，不参与选中
    openKeys.value.has(item.key) ? openKeys.value.delete(item.key) : openKeys.value.add(item.key)
    return
  }
  active.value = item.key
  emit('menu-select', item.key, item)
}

const onChildClick = (child: PageFrameMenuChild, _parent: PageFrameMenuItem) => {
  active.value = child.key
  emit('menu-select', child.key, child)
}
</script>

<style scoped lang="scss">
/* 横向滚动壳：撑满承载容器，只负责在容器窄于最小宽度时提供横向滚动。
   底色放在这里（而非骨架上）——骨架被最小宽度撑出容器后，灰底才不会在横向滚动时露白。 */
.page-frame-shell {
  width: 100%;
  height: 100%;
  background: var(--iflyv-bg-page);
}

/* view 是 el-scrollbar 的内容层：骨架靠它撑满高度，flex 布局才有 100% 高可继承 */
:deep(.page-frame-shell__view) {
  height: 100%;
}

/* 页面框架骨架：左侧边栏 + 右主区（顶栏 + 白色圆角内容卡），整体铺在 bg-page 灰底上。
   高度撑满承载容器（真实项目通常是 100vh 视口），侧边导航与内容区各自独立滚动。
   最小宽度 1200：窄于此值不再压缩，改由外层壳出横向滚动条（值走令牌，勿硬写）。 */
.page-frame {
  display: flex;
  width: 100%;
  min-width: var(--iflyv-layout-min-width);
  height: 100%;
  min-height: 0;
  background: var(--iflyv-bg-page);
}

/* ==================== 侧边栏 ==================== */
/* 200px 结构宽度（含左右 spacing-3 内边距），列向排布：返回按钮 → 课程卡 → 导航（独立滚动）。
   顶部内边距与子项间垂直缝均为 10px 结构性缝隙（非间距序列，单点维护） */
.page-frame__sidebar {
  position: relative;
  flex: 0 0 auto;
  width: 200px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px var(--iflyv-spacing-3) 0;
  min-height: 0;
  transition: width var(--iflyv-duration-normal) var(--iflyv-ease-default);

  /* 收起态：64px 只容一列 40px 图标方块（左右各 spacing-3 内边距） */
  &.is-collapsed {
    width: 64px;
  }
}

/* 收起把手：14×64 的凹口薄片，贴侧栏右缘垂直居中，浮在内容区白卡之上。
   形状用 mask 绘制而非 <img>——设计稿给的 svg 填充是写死的 #F2F5F7，
   贴图会脱离令牌（暗色主题下不跟着变）；mask 只取形状，颜色仍由 background 走灰底令牌。 */
/* clip 壳：固定窗口，贴侧栏右缘垂直居中，兼任热区扩张层。
   ① 裁切——它不动、只负责 overflow 裁切，薄片的滑动全发生在窗口内（位移不能写在薄片自身
      的 mask/clip-path 上，那会跟着 transform 一起移动、裁不掉）；
   ② 容纳热区——薄片按钮本体被放大成 24×96 的热区（见下），壳同尺寸才不会把热区裁掉；
      薄片可见形状仍是 14×64，由 mask-size 锁死、不随按钮放大而拉伸。
      注意左侧不能扩：壳左缘就是「消失线」，往左扩会让推走的薄片露进侧栏。
      壳自身 pointer-events: none，只有内部按钮吃点击，不挡内容区。 */
.page-frame__handle-clip {
  position: absolute;
  inset-inline-end: -24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--iflyv-z-sticky);
  width: 24px;
  height: 96px;
  overflow: hidden;
  pointer-events: none;
}

/* 把手按钮 = 24×96 热区（薄片只有 14 宽、直接点太细），
   可见薄片仍是 14×64：mask-size 锁死尺寸不随按钮放大而拉伸，
   mask-position 让它贴热区左缘垂直居中——热区向右、上下三面无痕扩张。 */
.page-frame__handle {
  pointer-events: auto;
  width: 24px;
  height: 96px;
  padding: 0;
  border: none;
  background: var(--iflyv-bg-page);
  /* 与可折叠父项箭头同取 icon-3：两者同为侧栏里的"方向指示"图标，保持一致。
     hover 提亮到 icon-1 作为可点反馈 */
  color: var(--iflyv-icon-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  /* 图标随薄片走：靠左 14px 内居中，而非在整个热区里居中 */
  justify-content: flex-start;
  text-indent: 0;
  /* 凹口形状：右缘中段向内收一个弧，与设计稿 svg 路径同形 */
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='64' viewBox='0 0 14 64'%3E%3Cpath d='M0,58.219868C0,54.915554,1.7845628,51.868858,4.666666,50.252701C10.430874,47.020386,14,40.926994,14,34.318367L14,29.681637C14,23.073008,10.430875,16.979616,4.6666665,13.747299C1.7845626,12.131141,0,9.084445,0,5.7801309L0,58.219868Z' fill='%23000'/%3E%3C/svg%3E");
  mask-repeat: no-repeat;
  mask-size: 14px 64px;
  mask-position: left center;
  /* hover 提亮渐变过色，与导航项同档，不做突变。
     只写 color——opacity/transform 归进出场的 Transition 管，写进来会打架 */
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    color: var(--iflyv-icon-1);
  }
}

/* 把手进出场：自左向右推入 / 原路反向推走 + 渐隐，全程被 clip 壳裁在窗口内。
   出现走减速曲线、消失走加速曲线（令牌语义）。
   垂直居中归 clip 壳，这里只做横向位移，不再叠 translateY */
.page-frame-handle-enter-active {
  transition:
    opacity var(--iflyv-duration-normal) var(--iflyv-ease-decelerate),
    transform var(--iflyv-duration-normal) var(--iflyv-ease-decelerate);
}

.page-frame-handle-leave-active {
  transition:
    opacity var(--iflyv-duration-normal) var(--iflyv-ease-accelerate),
    transform var(--iflyv-duration-normal) var(--iflyv-ease-accelerate);
}

/* 位移量 = 薄片可见宽度 14（非按钮宽 24，按钮多出的是透明热区，
   按 24 推会多滑一段空行程） */
.page-frame-handle-enter-from,
.page-frame-handle-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}

/* 收起态箭头翻转，指向"展开"方向。
   取色不写在这里——写死会盖掉把手按钮的 hover 提亮，见 .page-frame__handle。
   左移 2px 视觉居中：图标 16px 落在 14px 薄片里本就宽出 2px，靠左对齐后
   偏右显重；用负 margin 而非 translateX——transform 被收起态的 rotate 占着。 */
.page-frame__handle-icon {
  margin-inline-start: -2px;
  transition: transform var(--iflyv-duration-fast) var(--iflyv-ease-default);

  .is-collapsed & {
    transform: rotate(180deg);
  }
}

/* 返回平台按钮：整行浅灰底块（border-subtle 6% 深色墨水铺在 gray-1 上，参考 StepBar 用描边令牌做中性填充的先例） */
.page-frame__back {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-1_5);
  height: 32px;
  padding: 0 var(--iflyv-spacing-4);
  border: none;
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-bg-back);
  color: var(--iflyv-text-1);
  /* 13/18 紧凑字阶：在 body-sub 基础上收一档（shorthand 后两行覆盖字号+行高，成套设置） */
  font: var(--iflyv-font-body-sub);
  font-size: var(--iflyv-font-size-13);
  line-height: var(--iflyv-line-height-18);
  font-weight: var(--iflyv-font-weight-semibold);
  cursor: pointer;
  /* 收起/展开的那一帧宽度仍在变，此刻文字仍在 DOM 里：
     不锁 nowrap 会被挤成一列竖排字，必须裁切而非折行（同 __item-label 的处理） */
  white-space: nowrap;
  overflow: hidden;

  /* 收起态：收成 40px 方块只留图标，与下方导航图标同列对齐 */
  .is-collapsed & {
    width: 40px;
    padding: 0;
    justify-content: center;
  }
}

.page-frame__back-icon {
  color: var(--iflyv-icon-2);
  flex-shrink: 0;
}

/* 课程卡：16:9 封面 + 底部渐变压暗 + 白字课程名/元信息 + 右上角标 */
.page-frame__course {
  position: relative;
  /* 固定 100 高：侧栏宽度变化时不再按 16:9 抻高 */
  height: 100px;
  flex-shrink: 0;
  border-radius: var(--iflyv-radius-sm);
  overflow: hidden;
  background: var(--iflyv-ai-gradient); /* 无封面图时的缺省底 */
  cursor: pointer;
}

.page-frame__course-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-frame__course-tag {
  position: absolute;
  top: 0;
  right: 0;
  padding: var(--iflyv-spacing-0_5) var(--iflyv-spacing-2);
  border-radius: 0 var(--iflyv-radius-sm) 0 var(--iflyv-radius-sm);
  background: var(--iflyv-mask-primary);
  color: var(--iflyv-text-on-dark);
  font: var(--iflyv-font-label-primary);
  /* 同 __back / __group-title：过渡中卡片被压窄，不锁 nowrap 会折成两行 */
  white-space: nowrap;
}

/* 底部信息区：向下渐变压暗保证白字可读（用遮罩令牌做渐变终点色，不硬编码黑） */
.page-frame__course-info {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: var(--iflyv-spacing-5) var(--iflyv-spacing-3) var(--iflyv-spacing-1);
  background: linear-gradient(180deg, transparent 0%, var(--iflyv-mask-primary) 100%);
  text-align: center;
}

.page-frame__course-name {
  margin: 0;
  color: var(--iflyv-text-on-dark);
  font: var(--iflyv-font-body-sub);
  font-weight: var(--iflyv-font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-frame__course-meta {
  margin: 0;
  /* 固定 20 行高：文本 14 行高上下各留 3，与课程名保持稳定节奏 */
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--iflyv-spacing-1_5);
  color: var(--iflyv-text-on-dark);
  /* 10/14：卡内元信息比 body-min(12) 再收一档
     TODO 待令牌化：字阶最小为 12，用户确认先硬编码 */
  font: var(--iflyv-font-body-min);
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
}

.page-frame__course-meta-divider {
  color: var(--iflyv-border-on-dark);
}

/* 侧栏滚动区（el-scrollbar 外壳）：课程卡 + 导航同处其中，一起滚动（课程卡不吸顶） */
.page-frame__scroll {
  flex: 1;
  min-height: 0;
}

/* 滚动内容排布放在 el-scrollbar 的 view 上（滚动发生在这一层） */
:deep(.page-frame__scroll-view) {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: var(--iflyv-spacing-4);
  /* 展开过渡中导航按展开态定宽铺开（见 __nav），这里锁住 view 宽度并裁切，
     让超出的部分被侧栏遮住，而不是把滚动区撑出一条横向滚动条 */
  width: 100%;
  overflow-x: hidden;
}

.page-frame__nav {
  flex-shrink: 0;
  /* 展开过渡中侧栏宽度还在 64→200 之间，此刻文字已回到 DOM：
     导航整块按展开态宽度（200 - 左右 spacing-3）铺开、由侧栏 overflow 裁切，
     文字全程横排、未展开的部分被遮住（同 __group-title 的处理思路）。
     收起态交给 .is-collapsed 分支重新收成一列图标宽。 */
  width: calc(200px - var(--iflyv-spacing-3) * 2);

  .is-collapsed & {
    width: 40px;
  }
}

/* 分组小标题：与导航项文字同一左缘（spacing-3 缩进） */
.page-frame__group-title {
  margin: var(--iflyv-spacing-4) 0 var(--iflyv-spacing-2);
  padding: 0 var(--iflyv-spacing-3);
  color: var(--iflyv-text-3);
  /* 13/18 紧凑字阶：在 body-sub 基础上收一档（后两行成套覆盖字号+行高） */
  font: var(--iflyv-font-body-sub);
  font-size: var(--iflyv-font-size-13);
  line-height: var(--iflyv-line-height-18);
  /* 收起/展开的那一帧宽度仍在变，不锁 nowrap 会折成两行 */
  white-space: nowrap;
  overflow: hidden;
}

/* 导航项：44px 行高，图标 + 文字，选中 = 加粗 + text-1（无底色，靠字重/色阶导航） */
.page-frame__item {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  height: 44px;
  padding: 0 var(--iflyv-spacing-3);
  margin-bottom: var(--iflyv-spacing-0_5);
  border-radius: var(--iflyv-radius-sm);
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-primary);
  cursor: pointer;
  transition:
    background var(--iflyv-duration-fast) var(--iflyv-ease-default),
    color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    background: var(--iflyv-border-subtle);
  }

  &.is-active {
    color: var(--iflyv-text-1);
    font-weight: var(--iflyv-font-weight-semibold);

    .page-frame__item-icon {
      color: var(--iflyv-icon-1);
    }
  }

  /* 收起态：40px 方块只放图标。选中态与展开态口径一致——不加底板，
     只靠图标色阶（is-active → icon-1）区分；底色仅留给 hover。 */
  .is-collapsed & {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
  }
}

.page-frame__item-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--iflyv-icon-3);
  /* 选中态转 icon-1 时渐变过色，与导航项底板 hover 同档，不做突变 */
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}

.page-frame__item-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 可折叠父项箭头：展开时翻转 */
.page-frame__item-arrow {
  flex-shrink: 0;
  color: var(--iflyv-icon-3);
  transition: transform var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &.is-open {
    transform: rotate(180deg);
  }
}

/* 子菜单项：缩进对齐父项文字左缘（父项内边距 + 图标 18px + 图标间隙）；
   行高/字阶/色阶与一级项一致，仅靠缩进体现层级 */
.page-frame__subitem {
  display: flex;
  align-items: center;
  height: 44px;
  padding-inline-start: calc(var(--iflyv-spacing-3) + 18px + var(--iflyv-spacing-2));
  padding-inline-end: var(--iflyv-spacing-3);
  margin-bottom: var(--iflyv-spacing-0_5);
  border-radius: var(--iflyv-radius-sm);
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-primary);
  cursor: pointer;
  /* 同 __group-title / __item-label：收起过渡中宽度仍在变（且本项缩进占掉 40px+），
     不锁 nowrap 会被挤成一列竖排字——始终横排、超出裁切 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    background var(--iflyv-duration-fast) var(--iflyv-ease-default),
    color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    background: var(--iflyv-border-subtle);
  }

  &.is-active {
    color: var(--iflyv-text-1);
    font-weight: var(--iflyv-font-weight-semibold);
  }
}

/* ==================== 主区 ==================== */
.page-frame__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 顶栏：52px 结构高度（非间距序列，单点维护），左面包屑右用户区，透明底融入 bg-page；
   左侧不留内边距（与内容卡左缘对齐），右侧留 spacing-3 */
.page-frame__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  flex-shrink: 0;
  padding: 0 var(--iflyv-spacing-3) 0 0;
}

.page-frame__topbar-right {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-4);
}

/* 顶栏图标按钮：28px 方形热区（结构尺寸，单点维护），小圆角 */
.page-frame__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--iflyv-radius-xs);
  background: transparent;
  color: var(--iflyv-icon-2);
  cursor: pointer;
  transition:
    background var(--iflyv-duration-fast) var(--iflyv-ease-default),
    color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    background: var(--iflyv-border-subtle);
    color: var(--iflyv-icon-1);
  }
}

.page-frame__avatar {
  display: flex;
  cursor: pointer;
  padding: 0 var(--iflyv-spacing-1);
}

/* 内容区：白色圆角大卡，占满剩余高度，margin 留出与页面灰底的呼吸缝（右/下），
   内部滚动；内边距由页面内容自定 */
/* 内容区外壳：只负责在主区 flex 里占位 + 白底圆角卡外观，滚动发生在内部 view */
.page-frame__content {
  flex: 1;
  min-height: 0;
  margin: 0 var(--iflyv-spacing-3) var(--iflyv-spacing-3) 0;
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-lg);
  /* 圆角裁掉滚动条溢出的直角，使自绘条贴合卡片圆角 */
  overflow: hidden;
}
</style>
