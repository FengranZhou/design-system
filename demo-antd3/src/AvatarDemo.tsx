import { useState } from 'react'
import { Radio } from 'antd'
import UserAvatar from './components/UserAvatar'
import { AVATAR_LABEL, type AvatarRole } from './avatar-roles'

const roles = (Object.keys(AVATAR_LABEL) as AvatarRole[]).map((role) => ({
  role,
  label: AVATAR_LABEL[role],
}))

export default function AvatarDemo() {
  const [mode, setMode] = useState<'single' | 'group'>('single')
  const [size, setSize] = useState(28)

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Avatar 头像 —— antd 3 适配层</h2>
      <div className="demo-block avatar-showcase">
        <div className="avatar-showcase__main">
          {mode === 'single' ? (
            <div className="demo-row" style={{ gap: 'var(--iflyv-spacing-10)' }}>
              {roles.map((item) => (
                <div key={item.role} className="avatar-cell">
                  <UserAvatar role={item.role} size={size} />
                  <span className="avatar-cell__label">{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="avatar-group"
              style={{ ['--avatar-overlap' as string]: `${Math.round(size * 0.3)}px` }}
            >
              {roles.map((item) => (
                <span key={item.role} className="avatar-group__item">
                  <UserAvatar role={item.role} size={size} />
                </span>
              ))}
            </div>
          )}
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">展示</span>
              <Radio.Group value={mode} onChange={(event) => setMode(event.target.value)}>
                <Radio value="single">独立</Radio>
                <Radio value="group">组合</Radio>
              </Radio.Group>
            </div>
            <div className="config-item">
              <span className="config-item__label">尺寸</span>
              <Radio.Group value={size} onChange={(event) => setSize(event.target.value)}>
                <Radio value={28}>28px</Radio>
                <Radio value={24}>24px</Radio>
                <Radio value={20}>20px</Radio>
              </Radio.Group>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
