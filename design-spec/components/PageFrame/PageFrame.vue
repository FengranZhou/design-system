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
    v-model:active string                当前选中菜单 key（含子项 key）。选中态 = 加粗 + text-1。
    course         PageFrameCourse       可选。侧边栏顶部课程卡 { name, meta?, cover?, cornerTag? }；不传则不渲染。
    back-text      string                可选，默认「返回平台」。侧边栏顶部返回按钮文案；传空串隐藏按钮。
    breadcrumbs    BreadcrumbItem[]      可选。顶栏面包屑（内部复用业务组件 Breadcrumb）；不传则不渲染。
    back-disabled  boolean               可选。面包屑返回箭头禁用态（透传 Breadcrumb）。
    show-help / show-notice  boolean     可选，默认 true。顶栏帮助 / 通知铃铛图标。
    notice-count   number                可选，默认 0。通知未读数（el-badge，0 时隐藏红点）。
    avatar-role / avatar-src             可选。顶栏头像（透传业务组件 UserAvatar）；都不传则不渲染头像。
  emits：
    menu-select(key, item)  选中某菜单项（父项展开/收起不触发）
    back                    点击面包屑返回箭头
    breadcrumb-click(item, index)  点击某面包屑路径项
    back-platform / course-click / help-click / notice-click / avatar-click
  slots：
    默认插槽      内容区（白色圆角卡内部；内边距由页面自定）
    #course-card  整体替换侧边栏课程卡
    #breadcrumb   整体替换顶栏左侧面包屑区
    #topbar-right 顶栏右侧追加自定义入口（插在帮助图标之前）
  禁止：手写 aside/header div 拼同款框架、用 el-menu/el-container 复刻这套观感——一律用本组件。
  改外观：回本文件源头改，改一次所有引用方同步（勿在使用方私自覆盖）。
============================================================================ -->
<template>
  <div class="page-frame">
    <!-- ==================== 侧边栏 ==================== -->
    <aside class="page-frame__sidebar">
      <button
        v-if="backText"
        type="button"
        class="page-frame__back"
        @click="emit('back-platform')"
      >
        <House :size="16" class="page-frame__back-icon" />
        <span>{{ backText }}</span>
      </button>

      <slot name="course-card">
        <div v-if="course" class="page-frame__course" @click="emit('course-click')">
          <img v-if="course.cover" :src="course.cover" class="page-frame__course-cover" alt="" />
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
          <p v-if="group.title" class="page-frame__group-title">{{ group.title }}</p>
          <template v-for="item in group.items" :key="item.key">
            <div
              class="page-frame__item"
              :class="{ 'is-active': !item.children?.length && active === item.key }"
              @click="onItemClick(item)"
            >
              <component :is="item.icon" v-if="item.icon" class="page-frame__item-icon" />
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
      </nav>
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
          <button
            v-if="showHelp"
            type="button"
            class="page-frame__icon-btn"
            @click="emit('help-click')"
          >
            <CircleHelp :size="20" />
          </button>
          <!-- 徽标挂图标：el-badge 直接包裸图标（EP 原生定位贴图标右上角，见 badge.scss 使用约定），
               28px 热区由外层按钮提供，badge 不包按钮——包按钮会让徽标锚到热区角上、飘离铃铛 -->
          <button
            v-if="showNotice"
            type="button"
            class="page-frame__icon-btn"
            @click="emit('notice-click')"
          >
            <el-badge :value="noticeCount" :max="99" :hidden="!noticeCount">
              <Bell :size="20" />
            </el-badge>
          </button>
          <div
            v-if="avatarRole || avatarSrc"
            class="page-frame__avatar"
            @click="emit('avatar-click')"
          >
            <UserAvatar :role="avatarRole" :src="avatarSrc" :size="28" />
          </div>
        </div>
      </header>
      <main class="page-frame__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { House, ChevronDown, CircleHelp, Bell } from 'lucide-vue-next'
import { Breadcrumb } from '../Breadcrumb'
import type { BreadcrumbItem } from '../Breadcrumb'
import { UserAvatar, type AvatarRole } from '../UserAvatar'
import type { PageFrameMenuGroup, PageFrameMenuItem, PageFrameMenuChild, PageFrameCourse } from './types'

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
  /** 顶栏通知铃铛 */
  showNotice?: boolean
  /** 通知未读数（0 隐藏红点） */
  noticeCount?: number
  /** 头像（透传 UserAvatar）；role/src 都不传则不渲染 */
  avatarRole?: AvatarRole
  avatarSrc?: string
}>(), {
  backText: '返回平台',
  backDisabled: false,
  showHelp: true,
  showNotice: true,
  noticeCount: 0,
})

/** 当前选中菜单 key（v-model:active） */
const active = defineModel<string>('active')

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
}>()

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
/* 页面框架骨架：左侧边栏 + 右主区（顶栏 + 白色圆角内容卡），整体铺在 bg-page 灰底上。
   高度撑满承载容器（真实项目通常是 100vh 视口），侧边导航与内容区各自独立滚动。 */
.page-frame {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--iflyv-bg-page);
}

/* ==================== 侧边栏 ==================== */
/* 200px 结构宽度（含左右 spacing-3 内边距），列向排布：返回按钮 → 课程卡 → 导航（独立滚动）。
   顶部内边距与子项间垂直缝均为 10px 结构性缝隙（非间距序列，单点维护） */
.page-frame__sidebar {
  flex: 0 0 auto;
  width: 200px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px var(--iflyv-spacing-3) 0;
  min-height: 0;
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
  background: var(--iflyv-border-subtle);
  color: var(--iflyv-text-1);
  /* 13/18 紧凑字阶：在 body-sub 基础上收一档（shorthand 后两行覆盖字号+行高，成套设置） */
  font: var(--iflyv-font-body-sub);
  font-size: var(--iflyv-font-size-13);
  line-height: var(--iflyv-line-height-18);
  font-weight: var(--iflyv-font-weight-semibold);
  cursor: pointer;
  transition: background var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    background: var(--iflyv-border-default);
  }
}

.page-frame__back-icon {
  color: var(--iflyv-icon-1);
  flex-shrink: 0;
}

/* 课程卡：16:9 封面 + 底部渐变压暗 + 白字课程名/元信息 + 右上角标 */
.page-frame__course {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--iflyv-radius-sm);
  overflow: hidden;
  background: var(--iflyv-ai-gradient); /* 无封面图时的缺省底 */
  cursor: pointer;
  flex-shrink: 0;
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
}

/* 底部信息区：向下渐变压暗保证白字可读（用遮罩令牌做渐变终点色，不硬编码黑） */
.page-frame__course-info {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: var(--iflyv-spacing-5) var(--iflyv-spacing-3) var(--iflyv-spacing-2);
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
  margin: var(--iflyv-spacing-0_5) 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--iflyv-spacing-1_5);
  color: var(--iflyv-text-on-dark);
  font: var(--iflyv-font-body-min);
  white-space: nowrap;
}

.page-frame__course-meta-divider {
  color: var(--iflyv-border-on-dark);
}

/* 导航：占余下高度独立滚动 */
.page-frame__nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* 侧栏 gap 收窄为 10 后补 6，使课程卡→导航仍保持 16（spacing-4）视觉间距 */
  margin-top: var(--iflyv-spacing-1_5);
  padding-bottom: var(--iflyv-spacing-4);
}

/* 分组小标题：与导航项文字同一左缘（spacing-3 缩进） */
.page-frame__group-title {
  margin: var(--iflyv-spacing-4) 0 var(--iflyv-spacing-1);
  padding: 0 var(--iflyv-spacing-3);
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}

/* 导航项：44px 行高，图标 + 文字，选中 = 加粗 + text-1（无底色，靠字重/色阶导航） */
.page-frame__item {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  height: 44px;
  padding: 0 var(--iflyv-spacing-3);
  margin-bottom: var(--iflyv-spacing-1);
  border-radius: var(--iflyv-radius-sm);
  color: var(--iflyv-text-2);
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
}

.page-frame__item-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--iflyv-icon-2);
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

/* 子菜单项：缩进对齐父项文字左缘（父项内边距 + 图标 18px + 图标间隙） */
.page-frame__subitem {
  display: flex;
  align-items: center;
  height: 36px;
  padding-inline-start: calc(var(--iflyv-spacing-3) + 18px + var(--iflyv-spacing-2));
  padding-inline-end: var(--iflyv-spacing-3);
  margin-bottom: var(--iflyv-spacing-1);
  border-radius: var(--iflyv-radius-sm);
  color: var(--iflyv-text-2);
  font: var(--iflyv-font-body-sub);
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
.page-frame__content {
  flex: 1;
  min-height: 0;
  margin: 0 var(--iflyv-spacing-3) var(--iflyv-spacing-3) 0;
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-lg);
  overflow: auto;
}
</style>
