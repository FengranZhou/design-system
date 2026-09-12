import { useState } from 'react'
import { Radio, Switch, Tabs } from 'antd'

const { TabPane } = Tabs

const TABS = [
  { label: '选中项', key: 'a', count: 5 },
  { label: '未选中项', key: 'b', count: 12 },
  { label: '禁用项', key: 'c', count: 3, disabled: true },
]

export default function TabsDemo() {
  const [level, setLevel] = useState<'page' | 'module' | 'sub'>('page')
  const [showCount, setShowCount] = useState(false)
  const [activeKey, setActiveKey] = useState('a')
  const levelClass = level === 'page' ? 'tabs-page' : level === 'sub' ? 'tabs-sub' : ''

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Tabs 标签页 —— antd 3 适配层</h2>
      <div className={`demo-block control-showcase${level === 'sub' ? ' is-outlined' : ''}`}>
        <div className="control-showcase__main">
          <p className="demo-desc">提供平级的区域将大块内容进行收纳和展现，保持界面整洁。</p>
          <Tabs className={levelClass} activeKey={activeKey} onChange={setActiveKey}>
            {TABS.map((item) => (
              <TabPane
                key={item.key}
                disabled={item.disabled}
                tab={
                  <span className="tab-label-count">
                    {item.label}
                    {showCount && <span className="tab-count">{item.count}</span>}
                  </span>
                }
              />
            ))}
          </Tabs>
        </div>
        <aside className="config-card tabs-config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">级别</span>
              <Radio.Group value={level} onChange={(event) => setLevel(event.target.value)}>
                <Radio.Button value="page">页面级</Radio.Button>
                <Radio.Button value="module">模块级</Radio.Button>
                <Radio.Button value="sub">组件级</Radio.Button>
              </Radio.Group>
            </div>
            <div className="config-item">
              <span className="config-item__label">数字</span>
              <Switch checked={showCount} onChange={setShowCount} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
