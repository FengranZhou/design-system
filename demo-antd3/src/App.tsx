import React, { useMemo, useState } from 'react'

import ButtonDemo from './ButtonDemo'
import RadioDemo from './RadioDemo'
import CheckboxDemo from './CheckboxDemo'
import SwitchDemo from './SwitchDemo'
import PaletteDemo from './token/PaletteDemo'
import SemanticColorDemo from './token/SemanticColorDemo'
import FontBaseDemo from './token/FontBaseDemo'
import FontSemanticDemo from './token/FontSemanticDemo'
import SpacingDemo from './token/SpacingDemo'
import RadiusDemo from './token/RadiusDemo'
import ShadowDemo from './token/ShadowDemo'
import MotionDemo from './token/MotionDemo'
import IconDemo from './token/IconDemo'

/**
 * antd 3 规范站页面框架 —— 与 demo/src/App.vue 的骨架对位。
 *
 * 结构：顶栏（品牌 + 分类导航）+ 左侧栏（随分类切换的菜单）+ 内容区。
 * 说明：
 *   - 顶部分类、侧栏分组均由 TOP_TABS 数据驱动，逐条来自 Vue 版 App.vue；
 *   - 目前只有「基础组件」下的 Button / Radio 是真实内容（render 字段），
 *     其余菜单项内容留空，用统一占位面板兜住；
 *   - 试点阶段 antd3 版暂不迁移 Vue 版的品牌色 / 亮暗风格切换。
 */

type MenuItem = {
  key: string
  label: string
  render?: () => React.ReactNode
}

type MenuGroup = {
  label?: string
  items: MenuItem[]
}

type TopTab = {
  value: string
  label: string
  groups: MenuGroup[]
}

const TOP_TABS: TopTab[] = [
  {
    value: 'token',
    label: '基础样式',
    groups: [
      {
        items: [
          { key: 'palette', label: 'Palette 基础色板', render: () => <PaletteDemo /> },
          { key: 'token-color', label: 'Color 语义色板', render: () => <SemanticColorDemo /> },
          { key: 'token-font-base', label: 'Font Base 基础字阶', render: () => <FontBaseDemo /> },
          { key: 'token-font-semantic', label: 'Font 语义字阶', render: () => <FontSemanticDemo /> },
          { key: 'token-spacing', label: 'Spacing 间距', render: () => <SpacingDemo /> },
          { key: 'token-radius', label: 'Radius 圆角', render: () => <RadiusDemo /> },
          { key: 'token-shadow', label: 'Shadow 阴影', render: () => <ShadowDemo /> },
          { key: 'token-motion', label: 'Motion 动效', render: () => <MotionDemo /> },
          { key: 'token-icon', label: 'Icon 图标', render: () => <IconDemo /> },
        ],
      },
    ],
  },
  {
    value: 'component',
    label: '基础组件',
    groups: [
      {
        label: '通用',
        items: [{ key: 'button', label: 'Button 按钮', render: () => <ButtonDemo /> }],
      },
      {
        label: '导航',
        items: [
          { key: 'breadcrumb', label: 'Breadcrumb 面包屑' },
          { key: 'tabs', label: 'Tabs 标签页' },
          { key: 'pagination', label: 'Pagination 分页' },
          { key: 'anchor', label: 'Anchor 锚点' },
          { key: 'steps', label: 'Steps 轻量步骤条' },
          { key: 'dropdown', label: 'Dropdown 下拉菜单' },
        ],
      },
      {
        label: '数据录入',
        items: [
          { key: 'input', label: 'Input 输入框' },
          { key: 'select', label: 'Select 选择器' },
          { key: 'date-picker', label: 'Picker 时间/日期选择器' },
          { key: 'radio', label: 'Radio 单选框', render: () => <RadioDemo /> },
          { key: 'checkbox', label: 'Checkbox 多选框', render: () => <CheckboxDemo /> },
          { key: 'switch', label: 'Switch 开关', render: () => <SwitchDemo /> },
          { key: 'slider', label: 'Slider 滑块' },
          { key: 'rate', label: 'Rate 评分' },
        ],
      },
      {
        label: '数据展示',
        items: [
          { key: 'tag', label: 'Tag 标签' },
          { key: 'cell', label: 'Cell 单元格' },
          { key: 'badge', label: 'Badge 徽标' },
          { key: 'descriptions', label: 'Descriptions 描述列表' },
          { key: 'avatar', label: 'Avatar 头像' },
          { key: 'empty', label: 'Empty 空状态' },
        ],
      },
      {
        label: '反馈',
        items: [
          { key: 'dialog', label: 'Dialog 对话框' },
          { key: 'drawer', label: 'Drawer 抽屉' },
          { key: 'message', label: 'Message 消息提示' },
          { key: 'alert', label: 'Alert 警告' },
          { key: 'notification', label: 'Notification 通知' },
          { key: 'popconfirm', label: 'Popconfirm 气泡确认框' },
          { key: 'tooltip', label: 'Tooltip 文字提示' },
          { key: 'loading', label: 'Loading 加载' },
          { key: 'skeleton', label: 'Skeleton 骨架屏' },
          { key: 'result', label: 'Result 结果页' },
        ],
      },
    ],
  },
  {
    value: 'business',
    label: '业务组件',
    groups: [
      {
        items: [
          { key: 'page-frame', label: 'PageFrame 页面框架' },
          { key: 'step-bar', label: 'StepBar 步骤条' },
          { key: 'ai-button', label: 'AiButton Ai按钮' },
          { key: 'picked-item', label: 'PickedItem 已选项' },
          { key: 'option-card', label: 'OptionCard 卡片单选' },
        ],
      },
    ],
  },
  {
    value: 'chart',
    label: '图表组件',
    groups: [
      {
        items: [
          { key: 'chart-line', label: 'Line 折线图' },
          { key: 'chart-bar', label: 'Bar 柱状图' },
          { key: 'chart-bar-horizontal', label: 'Horizontal 条形图' },
          { key: 'chart-donut', label: 'Donut 环形图' },
          { key: 'chart-pie', label: 'Pie 饼状图' },
          { key: 'chart-bar-line', label: 'Bar-Line 柱线图' },
          { key: 'chart-radar', label: 'Radar 雷达图' },
          { key: 'chart-scatter', label: 'Scatter 散点图' },
          { key: 'chart-bar-stack', label: 'Stacked 堆积柱状图' },
          { key: 'chart-bar-stack-h', label: 'Stacked-H 堆积条形图' },
          { key: 'chart-bar-percent', label: 'Percent 百分比堆积' },
          { key: 'chart-diverging', label: 'Diverging 双向柱状图' },
        ],
      },
    ],
  },
  {
    value: 'pattern',
    label: '设计模式',
    groups: [
      {
        items: [
          { key: 'pattern-form-org', label: 'Form 表单组织' },
          { key: 'pattern-form', label: 'Form Layout 表单布局' },
          { key: 'pattern-list-item', label: 'List Item 列表条目' },
          { key: 'pattern-toolbar', label: 'Toolbar 工具栏布局' },
        ],
      },
    ],
  },
  {
    value: 'page',
    label: '典型页面',
    groups: [
      {
        items: [
          { key: 'page-public-info', label: 'Public 公开信息设置' },
          { key: 'page-course-tools', label: 'Course Tools 课程工具' },
          { key: 'page-course-dashboard', label: 'Profile 课程画像' },
          { key: 'page-ai-quiz', label: 'AI Quiz AI 出题' },
        ],
      },
    ],
  },
  {
    value: 'copywriting',
    label: '文案规范',
    groups: [
      {
        items: [
          { key: 'copywriting-time', label: 'Time 通用时间' },
          { key: 'copywriting-number', label: 'Number 数字' },
        ],
      },
    ],
  },
  {
    value: 'judging',
    label: '评判标准',
    groups: [
      {
        items: [
          { key: 'judging-intro', label: 'Overview 说明' },
          { key: 'judging-list', label: 'Checklist 检查清单' },
        ],
      },
    ],
  },
]

const flattenItems = (tab: TopTab): MenuItem[] =>
  tab.groups.reduce<MenuItem[]>((acc, group) => acc.concat(group.items), [])

/** 内容为空的菜单项统一用此占位（tab 已建，内容待补） */
function Placeholder({ label }: { label: string }) {
  return (
    <section className="demo-section">
      <h2 className="demo-section__title">{label}</h2>
      <div className="demo-placeholder">该子页面尚未实现，敬请期待。</div>
    </section>
  )
}

export default function App() {
  const [currentTopTab, setCurrentTopTab] = useState('component')
  const [activeKey, setActiveKey] = useState('button')

  const activeTab = useMemo(
    () => TOP_TABS.find((t) => t.value === currentTopTab) ?? TOP_TABS[0],
    [currentTopTab],
  )

  const activeItem = useMemo(
    () => flattenItems(activeTab).find((item) => item.key === activeKey),
    [activeTab, activeKey],
  )

  const handleTopTab = (tab: TopTab) => {
    setCurrentTopTab(tab.value)
    const first = flattenItems(tab)[0]
    if (first) setActiveKey(first.key)
  }

  return (
    <>
      <header className="app-topbar">
        <div className="app-topbar__brand">
          <div className="app-topbar__logo">
            <img src="/logo.png" alt="Xiaoya Theme" />
          </div>
          <div>
            <div className="app-topbar__title">Xiaoya Theme</div>
            <div className="app-topbar__subtitle">antd 3 主题演示</div>
          </div>
        </div>
        <nav className="app-topbar__nav">
          {TOP_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={
                'app-topbar__nav-item' +
                (tab.value === currentTopTab ? ' is-active' : '')
              }
              onClick={() => handleTopTab(tab)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="app-layout">
        <aside className="app-sidebar">
          <div className="app-sidebar__nav-wrap">
            {activeTab.groups.map((group, gi) => (
              <div key={group.label ?? gi}>
                {group.label && (
                  <div className="app-sidebar__group-label">{group.label}</div>
                )}
                <ul className="app-sidebar__nav">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <a
                        href={`#${item.key}`}
                        className={item.key === activeKey ? 'is-active' : undefined}
                        onClick={(e) => {
                          e.preventDefault()
                          setActiveKey(item.key)
                        }}
                      >
                        {item.label}
                        {!item.render && (
                          <span className="app-sidebar__todo-badge">未接入</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="app-content">
          {activeItem?.render ? (
            activeItem.render()
          ) : (
            <Placeholder label={activeItem?.label ?? ''} />
          )}
        </main>
      </div>
    </>
  )
}
