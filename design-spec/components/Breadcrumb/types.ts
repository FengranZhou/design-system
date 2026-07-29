/** 面包屑单项 */
export interface BreadcrumbItem {
  /** 显示文案 */
  label: string
  /** 可点击跳转目标（透传 el-breadcrumb-item 的 to，支持 vue-router 路径）；不传则为纯文本项 */
  to?: string | Record<string, unknown>
}
