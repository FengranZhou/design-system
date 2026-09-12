import { useState, useMemo } from 'react'
import { Select } from 'antd'

import Breadcrumb, { type BreadcrumbItem } from './components/Breadcrumb'

/**
 * Breadcrumb 面包屑 —— 与 demo/src/components/BreadcrumbDemo.vue 严格对位。
 *
 * 一个带返回箭头 + 深层折叠的面包屑：8 级路径按「当前层级」截断到第 N 级，
 * 超过 maxItems(4) 时中间折进 `…`（hover 展开）；每项带 to 可点击跳转（demo 里跳转打日志示意）。
 *
 * 配置卡：「当前层级」下拉（1~8），选中后面包屑截断到该层，模拟深层导航时的动态层级。
 */

// 全量 8 级路径（实际项目中会由路由 meta 或后端接口提供）
const FULL_PATH: BreadcrumbItem[] = [
  { label: '首页', to: '/' },
  { label: '系统管理', to: '/system' },
  { label: '用户管理', to: '/system/users' },
  { label: '角色列表', to: '/system/users/roles' },
  { label: '角色详情', to: '/system/users/roles/123' },
  { label: '权限配置', to: '/system/users/roles/123/permissions' },
  { label: '资源分组', to: '/system/users/roles/123/permissions/groups' },
  { label: '分组详情', to: '/system/users/roles/123/permissions/groups/456' },
]

export default function BreadcrumbDemo() {
  // 当前层级（1~8）：控制面包屑截断到第几级（模拟实际项目里根据当前路由动态生成面包屑）
  const [currentLevel, setCurrentLevel] = useState(8)

  // 根据当前层级截取路径（截到第 N 级 = 取前 N 项）
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => FULL_PATH.slice(0, currentLevel),
    [currentLevel]
  )

  // 点返回 = 回退一级（当前层级 -1）；到只剩首页时箭头禁用。真实项目里 onBack 通常接 router.back()。
  const handleBack = () => {
    if (currentLevel > 1) setCurrentLevel(currentLevel - 1)
  }

  // 点击某一路径项（含 `…` 下拉里的项）：定位到该层级 = 把「当前层级」设为该项层级，面包屑随之截断。
  // 真实项目里会用 item.to 走 router 跳转；此处 index 即该项在全量路径中的 0-based 下标。
  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    console.log('点击面包屑项', item, '定位到层级', index + 1)
    setCurrentLevel(index + 1)
  }

  return (
    <section id="breadcrumb" className="demo-section">
      <h2 className="demo-section__title">Breadcrumb 面包屑 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          {/* 一个带返回箭头 + 深层折叠的面包屑：8 级路径按「当前层级」截断到第 N 级，
               超过 maxItems(4) 时中间折进 `…`（hover 展开） */}
          <div className="demo-row">
            <Breadcrumb
              items={breadcrumbItems}
              maxItems={4}
              backDisabled={currentLevel <= 1}
              onBack={handleBack}
              onItemClick={handleItemClick}
            />
          </div>
        </div>

        <aside className="config-card config-card--breadcrumb">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            {/* 当前层级下拉：选 N 则面包屑截断到第 N 级（模拟深层导航） */}
            <div className="config-field">
              <div className="config-field__row">
                <span className="config-item__label">当前层级</span>
                {/* ⚠ antd 3.x 的 Select 无 options prop（那是 antd4+），必须用 Select.Option 子元素 */}
                <Select value={currentLevel} onChange={setCurrentLevel} style={{ width: 120 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <Select.Option key={n} value={n}>
                      第 {n} 级
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <p className="config-card__hint">
                「当前层级」决定面包屑截断到第几级。真实项目中由路由 meta 或后端接口决定当前页深度。
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
