import { useState } from 'react'
import { Dropdown, Menu, Button, Switch } from 'antd'
import { ChevronDown } from 'lucide-react'

/**
 * Dropdown 下拉菜单 —— 与 demo/src/components/DropdownDemo.vue 严格对位。
 *
 * 触发器：轻量入口用 Button className="btn-text"（文字色/hover/inline-flex 归 button.less），
 *   尾部 ChevronDown 带 .dropdown-caret，展开时翻转（.is-expanded 由 onVisibleChange 驱动）。
 * 菜单：
 *   - 平铺：编辑 / 复制 / 移动 / 删除（divided + disabled）
 *   - 分组（开关打开）：基础操作 / 危险操作，用 Menu.ItemGroup 抬头分段
 * 配置卡：分组开关（+ 选型指引 hint）。
 */

const GROUPED_ITEMS: { title: string; items: { label: string; disabled?: boolean }[] }[] = [
  { title: '基础操作', items: [{ label: '编辑' }, { label: '复制' }, { label: '移动' }] },
  { title: '危险操作', items: [{ label: '删除', disabled: true }] },
]

export default function DropdownDemo() {
  const [visible, setVisible] = useState(false)
  const [grouped, setGrouped] = useState(false)

  const menu = grouped ? (
    <Menu>
      {GROUPED_ITEMS.map((group) => (
        <Menu.ItemGroup key={group.title} title={group.title}>
          {group.items.map((it) => (
            <Menu.Item key={it.label} disabled={it.disabled}>
              {it.label}
            </Menu.Item>
          ))}
        </Menu.ItemGroup>
      ))}
    </Menu>
  ) : (
    <Menu>
      <Menu.Item key="edit">编辑</Menu.Item>
      <Menu.Item key="copy">复制</Menu.Item>
      <Menu.Item key="move">移动</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" disabled>
        删除
      </Menu.Item>
    </Menu>
  )

  return (
    <section id="dropdown" className="demo-section">
      <h2 className="demo-section__title">Dropdown 下拉菜单 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">
            常与"触发器"（按钮、图标、下拉选择器等）组合使用，当页面上的操作命令过多时，用此组件可以收纳操作元素。
          </p>
          <div className="demo-row">
            {/* 默认 hover 触发（对齐 EP 版 el-dropdown 默认），不显式传 trigger */}
            <Dropdown overlay={menu} onVisibleChange={setVisible}>
              <Button className="btn-text">
                更多操作
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  className={`dropdown-caret${visible ? ' is-expanded' : ''}`}
                />
              </Button>
            </Dropdown>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-field">
              <div className="config-field__row">
                <span className="config-item__label">分组</span>
                <Switch checked={grouped} onChange={setGrouped} />
              </div>
              <p className="config-card__hint">
                选项超过约 7 条、且能按语义归类时开启，用抬头分段替代一长串平铺
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
