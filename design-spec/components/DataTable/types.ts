/**
 * DataTable —— 列定义 / 操作定义类型
 *
 * 对应「列表条目模式」（references/patterns/list-item-pattern.md）：
 * 一行 = 四区拼装，列的 kind 决定该单元格用哪类元素（→ 哪个基础组件）。
 */
import type { Component } from 'vue'

/** 内容单元格类型（关键信息区 / 主题区的元素种类，决定用哪个组件渲染） */
export type ColumnKind =
  | 'text'    // 纯文字（名称 / 备注 / 部门…）
  | 'tag'     // 状态 / 分类标签 → el-tag（走状态语义色）
  | 'date'    // 日期时间 → 纯文本（统一格式）
  | 'amount'  // 数值 / 金额 → 右对齐 + 千分位

/** 单个列定义 */
export interface DataTableColumn {
  /** 取数字段名 */
  prop: string
  /** 表头文字 */
  label: string
  /** 单元格元素类型，默认 'text' */
  kind?: ColumnKind
  /** 列宽（px） */
  width?: number | string
  /** 最小列宽（px） */
  minWidth?: number | string
  /** 是否可排序（表头「带排序」类型） */
  sortable?: boolean
  /** 是否固定（主题区常 'left'、其它按需） */
  fixed?: 'left' | 'right' | boolean
  /**
   * kind='tag' 时：行数据里「标签语义色」的字段名（值为 primary/success/warning/danger/info）。
   * 不传则默认取 `${prop}Type`。
   */
  tagTypeProp?: string
}

/** 操作区单个操作按钮 */
export interface DataTableAction {
  /** 按钮文案 */
  label: string
  /** 事件标识，点击时通过 @action 派发 */
  command: string
  /**
   * 按钮图标（lucide-vue-next 图标组件）。
   * 操作按钮约定「图标 + 文字」，外露 actions 建议都传 icon；
   * 「更多」下拉里的 moreActions 走纯文字，无需 icon。
   */
  icon?: Component
  /** 是否危险操作（红色文字） */
  danger?: boolean
}
