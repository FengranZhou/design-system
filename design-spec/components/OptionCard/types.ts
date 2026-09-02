/** OptionCard 的单个选项 */
export interface OptionCardItem {
  /** 显示文案 */
  label: string
  /** 选项值，选中后由 v-model 带出 */
  value: string | number
  /** 选项图标（图片地址，import 后传入）。不传则只显示文字 */
  icon?: string
  /** 是否禁用该项 */
  disabled?: boolean
}
