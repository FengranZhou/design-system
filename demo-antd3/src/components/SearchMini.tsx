import { useEffect, useRef, useState } from 'react'
import { Input, Button } from 'antd'
import { Search } from 'lucide-react'

import './SearchMini.less'

/**
 * SearchMini —— 收起态搜索框（业务组件层）。React 版，对位
 * design-spec/components/SearchMini/SearchMini.vue，行为逐条复刻。
 *
 * 两种形态由 collapsed 控制（同一物料的一个 prop 差异）：
 *   - collapsed=false（默认）：基础形式，常驻展开的标准搜索框（Input + 右侧可点击放大镜 + allowClear）
 *   - collapsed=true：收起态，平时是「带图标的次按钮（🔍 搜索）」，点击展开、失焦且空则自动收起
 *
 * ▶ 选型判据：搜索是核心功能 → collapsed=false；非核心功能 → collapsed=true。
 *
 * 右侧放大镜可点击 / 回车 → 立即触发 onSearch（非实时检索）；输入防抖也触发 onSearch（实时检索）。
 * allowClear 清除叉由 antd 自动叠在放大镜左侧（有内容时）。
 *
 * 接入方速查：
 *   基础形式：  <SearchMini value={kw} onChange={setKw} onSearch={onSearch} />
 *   收起态：    <SearchMini collapsed value={kw} onChange={setKw} onSearch={onSearch} />
 *   防抖：      <SearchMini searchDelay={500} onSearch={onSearch} />（默认 300ms；设 0 关闭防抖，输入即触发）
 */

export interface SearchMiniProps {
  /** 受控值 */
  value?: string
  /** 值变化回调（对位 Vue 的 update:modelValue） */
  onChange?: (value: string) => void
  /** 搜索触发（输入防抖后 / 回车 / 点击放大镜 / 清空时） */
  onSearch?: (value: string) => void
  /** 展开或收起时触发 */
  onToggle?: (expanded: boolean) => void
  /** 是否默认收起。选型判据：核心功能→false（常驻展开）；非核心功能→true（收起态省空间） */
  collapsed?: boolean
  /** 占位文案 */
  placeholder?: string
  /** 收起态按钮上的文字 */
  collapsedText?: string
  /** 输入防抖触发 onSearch 的延迟（ms）；0 = 关闭防抖，输入即触发 */
  searchDelay?: number
}

export default function SearchMini({
  value = '',
  onChange,
  onSearch,
  onToggle,
  collapsed = false,
  placeholder = '搜索',
  collapsedText = '搜索',
  searchDelay = 300,
}: SearchMiniProps) {
  const [innerValue, setInnerValue] = useState(value)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // 受控同步：外部 value 变化时更新内部值（对位 Vue 的 watch modelValue）
  useEffect(() => {
    setInnerValue(value)
  }, [value])

  // 卸载时清掉未完成的防抖计时器
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  // —— 防抖：settle 后触发 search ——
  const fireSearch = (v: string) => {
    if (!searchDelay) {
      onSearch?.(v)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch?.(v), searchDelay)
  }

  const handleChange = (v: string) => {
    setInnerValue(v)
    onChange?.(v)
    // antd 的 allowClear 点叉会触发 onChange('')，这里统一按输入处理；
    // 收起态清空后的自动收起在 onBlur 里兜（对位 Vue：clear 也触发 search）
    fireSearch(v)
  }

  const handleEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onSearch?.(innerValue)
  }

  // 点击右侧放大镜：立即触发搜索（用于非实时检索场景）
  const triggerSearch = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onSearch?.(innerValue)
  }

  const handleBlur = () => {
    // 收起态：失焦且内容为空 → 自动收起
    if (collapsed && !innerValue) collapse()
  }

  const expand = () => {
    setExpanded(true)
    onToggle?.(true)
    // 等 input 渲染出来后聚焦
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const collapse = () => {
    setExpanded(false)
    onToggle?.(false)
  }

  // 收起态且未展开：带图标的次按钮（复用标准 Button，外观归 button.less 源头）
  if (collapsed && !expanded) {
    return (
      <Button className="search-mini__trigger" onClick={expand}>
        <Search size={16} strokeWidth={2} />
        {collapsedText}
      </Button>
    )
  }

  // 展开态 / 基础形式：标准搜索输入框
  return (
    <Input
      ref={inputRef}
      className={`search-input search-mini__input${
        collapsed ? ' search-mini__input--collapsible' : ''
      }`}
      value={innerValue}
      allowClear
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      onPressEnter={handleEnter}
      suffix={
        <Search
          size={16}
          strokeWidth={2}
          className="search-mini__search-icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={triggerSearch}
        />
      }
    />
  )
}
