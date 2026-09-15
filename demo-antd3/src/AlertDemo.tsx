import { useState } from 'react'
import { Alert, Radio, Switch } from 'antd'

type AlertScene = {
  value: string
  label: string
  title: string
  type: 'success' | 'warning' | 'error' | 'info'
  className?: string
  desc: string
}

const alertScenes: AlertScene[] = [
  { value: 'success', label: '成功', title: '成功提示', type: 'success', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'warning', label: '警告', title: '警告提示', type: 'warning', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'error', label: '错误', title: '错误提示', type: 'error', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'info', label: '信息', title: '信息提示', type: 'info', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'neutral', label: '中性', title: '中性提示', type: 'info', className: 'alert-neutral', desc: '这是一段辅助描述信息，提供更多上下文。' },
]

export default function AlertDemo() {
  const [sceneKey, setSceneKey] = useState('success')
  const [showDesc, setShowDesc] = useState(false)
  const scene = alertScenes.find((s) => s.value === sceneKey) ?? alertScenes[0]

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Alert 警告 —— antd 3 适配层</h2>
      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">当提示内容较重要，并需要吸引用户查看时使用。</p>
          <Alert
            message={scene.title}
            type={scene.type}
            className={scene.className}
            description={showDesc ? scene.desc : undefined}
            showIcon
          />
        </div>
        <aside className="config-card config-card--wide">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">场景</span>
              <Radio.Group value={sceneKey} onChange={(event) => setSceneKey(event.target.value)}>
                {alertScenes.map((s) => (
                  <Radio key={s.value} value={s.value}>
                    {s.label}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
            <div className="config-item">
              <span className="config-item__label">辅助信息</span>
              <Switch checked={showDesc} onChange={setShowDesc} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
