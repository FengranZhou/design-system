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
  /**
   * 右上角「更多」入口的下拉菜单项。
   * **框架一项都不写死**——「查看课程首页」「课程设置」「打开二维码」这类功能
   * 各系统有无不一，由业务方按自身能力传入（同 avatarMenus 口径）。
   * 不传或空数组 → 不渲染「更多」入口。
   */
  menus?: PageFrameCourseMenuItem[]
}

/** 课程卡「更多」下拉的菜单项（个数 / 文案 / 分段 / 危险项全由业务方定义） */
export interface PageFrameCourseMenuItem {
  /** 唯一 key（course-menu-click 以此为准） */
  key: string
  label: string
  /** 与上一项之间加分隔线——用来把菜单分段 */
  divided?: boolean
  /** 破坏性/不可逆操作：文字转 danger 色 */
  danger?: boolean
  disabled?: boolean
}

/** 头像下拉菜单项（个数 / 文案 / 分段 / 危险项全由业务方定义，框架不写死） */
export interface PageFrameAvatarMenuItem {
  /** 唯一 key（avatar-menu-click 以此为准） */
  key: string
  label: string
  /** 与上一项之间加分隔线——用来把菜单分段（如「账号」「服务」「登出」三段） */
  divided?: boolean
  /** 破坏性/不可逆操作（退出登录、注销账号）：文字转 danger 色 */
  danger?: boolean
  disabled?: boolean
}
