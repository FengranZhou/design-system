import type { Component } from 'vue'

/** 侧边导航项 */
export interface PageFrameMenuItem {
  /** 唯一 key（选中态 / menu-select 以此为准） */
  key: string
  label: string
  /** 图标组件（如 lucide 图标），不传则只显示文字 */
  icon?: Component
  /** 子菜单：有则该项变为可折叠父项（点击只展开/收起，不参与选中） */
  children?: PageFrameMenuChild[]
}

/** 可折叠父项下的子菜单项 */
export interface PageFrameMenuChild {
  key: string
  label: string
}

/** 侧边导航分组（title 可省 → 不渲染分组小标题） */
export interface PageFrameMenuGroup {
  title?: string
  items: PageFrameMenuItem[]
}

/** 侧边栏顶部的课程信息卡 */
export interface PageFrameCourse {
  /** 课程名（如《智能启思从零懂智能》） */
  name: string
  /** 元信息数组，以 | 分隔展示（如 ['2023年春', '全网公开', '教务开课']） */
  meta?: string[]
  /** 封面图 URL；不传时用 AI 渐变缺省底 */
  cover?: string
  /** 右上角标文案，默认「课程详情」；传空串隐藏角标 */
  cornerTag?: string
}
