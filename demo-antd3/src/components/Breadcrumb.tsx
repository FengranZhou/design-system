import { useMemo } from 'react'
import { Breadcrumb as AntBreadcrumb, Dropdown, Menu } from 'antd'
import { ChevronRight } from 'lucide-react'

import './Breadcrumb.less'

/**
 * Breadcrumb —— 带返回箭头的面包屑（业务组件层）。React 版，对位
 * design-spec/components/Breadcrumb/Breadcrumb.vue，行为逐条复刻。
 *
 * 把「返回箭头 + 路径面包屑」封成成品：下游只传 items、监听 onBack / onItemClick，
 * 返回箭头的存在/禁用/点击行为都由本组件收口，无需自己写 span 挂 onClick。
 *
 * 内部只引用基础组件：antd Breadcrumb / Breadcrumb.Item（外观归 antd3-theme/breadcrumb.less 源头）；
 * 返回箭头复用源头约定 class .breadcrumb-back（图标/8px 间距/激活 icon-2/禁用 icon-4 全在源头）。
 * scoped 只装扮自己骨架（flex 对齐容器、`…` 折叠触发器）。
 *
 * 接入方速查：
 *   基础用法：  <Breadcrumb items={[{label:'首页',to:'/'},{label:'项目详情'}]} onBack={router.back} />
 *   隐藏返回：  <Breadcrumb items={items} showBack={false} />
 *   返回禁用：  <Breadcrumb items={items} backDisabled={noPrev} onBack={...} />
 *   深层折叠：  <Breadcrumb items={items} maxItems={4} />（超过 4 项时中间折进 `…` hover 展开）
 */

export interface BreadcrumbItem {
  label: string
  /** 跳转目标（接入方根据此决定如何跳转，如 router.push(item.to)）*/
  to?: unknown
}

export interface BreadcrumbProps {
  /** 路径项数组；最后一项为当前页（不可点击） */
  items: BreadcrumbItem[]
  /** 是否显示前置返回箭头 */
  showBack?: boolean
  /** 返回箭头禁用态（无上一级时）*/
  backDisabled?: boolean
  /** 最多可见项数；0=不折叠（默认，全量平铺）。≥2 且层数超过它时，保留首项+末项、中间折进 `…` 下拉 */
  maxItems?: number
  /** 点击返回箭头（禁用时不触发）*/
  onBack?: () => void
  /** 点击某个路径项 */
  onItemClick?: (item: BreadcrumbItem, index: number) => void
}

/** 渲染节点：普通项（携带原 item 与其在 items 中的真实下标）或折叠占位项（携带被折叠的中间项） */
interface DisplayNode {
  key: string
  collapsed: boolean
  item?: BreadcrumbItem
  index: number
  hiddenItems?: { item: BreadcrumbItem; index: number }[]
}

export default function Breadcrumb({
  items,
  showBack = true,
  backDisabled = false,
  maxItems = 0,
  onBack,
  onItemClick,
}: BreadcrumbProps) {
  // 折叠策略：max-items 为 0 / 无效 / 未超限 → 全量平铺；
  // 否则保留「首 1 项 + 尾 (maxItems-1) 项」，中间超出的塞进 `…` 折叠项（可见项数恒为 maxItems）。
  const displayNodes = useMemo<DisplayNode[]>(() => {
    const list = items
    const max = maxItems
    const full: DisplayNode[] = list.map((item, index) => ({
      key: `i${index}`,
      collapsed: false,
      item,
      index,
    }))
    if (max < 2 || list.length <= max) return full

    const tailCount = max - 1 // 尾部保留项数（首项占 1）
    const hiddenItems = list
      .slice(1, list.length - tailCount)
      .map((item, i) => ({ item, index: i + 1 })) // 还原到 items 中的真实下标
    return [
      full[0],
      { key: 'more', collapsed: true, index: -1, hiddenItems },
      ...full.slice(list.length - tailCount),
    ]
  }, [items, maxItems])

  const handleBack = () => {
    if (backDisabled) return
    onBack?.()
  }

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    onItemClick?.(item, index)
  }

  // 折叠下拉菜单
  const renderCollapsedMenu = (hiddenItems: { item: BreadcrumbItem; index: number }[]) => (
    <Menu>
      {hiddenItems.map(({ item, index }) => (
        <Menu.Item key={index} onClick={() => handleItemClick(item, index)}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <div className="biz-breadcrumb">
      {/* 返回箭头：约定 class .breadcrumb-back（图标/间距/色态全在 breadcrumb.less 源头） */}
      {showBack && (
        <span
          className={`breadcrumb-back${backDisabled ? ' is-disabled' : ''}`}
          onClick={handleBack}
        />
      )}

      {/* antd3 Breadcrumb 分隔符默认 `/`，传 separator 改成右箭头（与 EP 对齐） */}
      <AntBreadcrumb separator={<ChevronRight size={16} strokeWidth={2} />}>
        {displayNodes.map((node) => {
          // 折叠占位项：`…` hover 下拉，列出被折叠的中间层级
          if (node.collapsed) {
            return (
              <AntBreadcrumb.Item key={node.key}>
                <Dropdown overlay={renderCollapsedMenu(node.hiddenItems!)} trigger={['hover']}>
                  <span className="breadcrumb-more__trigger">…</span>
                </Dropdown>
              </AntBreadcrumb.Item>
            )
          }
          // 普通项：末项不可点击（antd Breadcrumb 末项自动无链接态），其他项可点击
          const isLast = node.index === items.length - 1
          return (
            <AntBreadcrumb.Item key={node.key}>
              {isLast ? (
                node.item!.label
              ) : (
                <a onClick={() => handleItemClick(node.item!, node.index)}>{node.item!.label}</a>
              )}
            </AntBreadcrumb.Item>
          )
        })}
      </AntBreadcrumb>
    </div>
  )
}
