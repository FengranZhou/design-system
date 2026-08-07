/**
 * 业务组件层 —— 统一导出入口
 *
 * 各使用方（本仓库 demo、将来接入的外部项目）只从本入口 import 业务组件，
 * 指向同一份源头，改源头处处同步。详见本目录 CLAUDE.md「正规调用方式」。
 *
 *   import { SearchMini } from '<path>/design-spec/components'
 */
export { SearchMini } from './SearchMini'
export { UserAvatar, AVATAR_MAP, AVATAR_LABEL, type AvatarRole } from './UserAvatar'
export { DataTable, type DataTableColumn, type DataTableAction, type ColumnKind } from './DataTable'
export { Breadcrumb, type BreadcrumbItem } from './Breadcrumb'
export { StepBar } from './StepBar'
export { AiButton } from './AiButton'
export {
  PageFrame,
  type PageFrameMenuGroup,
  type PageFrameMenuItem,
  type PageFrameMenuChild,
  type PageFrameCourse,
} from './PageFrame'
