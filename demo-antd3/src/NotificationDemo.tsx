import { useState } from 'react'
import { Button, Radio, Switch, notification } from 'antd'

type NotifyScene = {
  value: string
  label: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
}

const notifyScenes: NotifyScene[] = [
  { value: 'success', label: '成功', title: '操作成功', message: '数据已成功保存到系统中。', type: 'success' },
  { value: 'warning', label: '警告', title: '注意', message: '该操作可能影响其他模块。', type: 'warning' },
  { value: 'error', label: '错误', title: '操作失败', message: '网络异常，请稍后重试。', type: 'error' },
  { value: 'info', label: '信息', title: '提示', message: '系统将于今晚 22:00 进行维护。', type: 'info' },
]

export default function NotificationDemo() {
  const [scene, setScene] = useState('success')
  const [persist, setPersist] = useState(false)
  const [actions, setActions] = useState(false)

  const show = () => {
    const s = notifyScenes.find((n) => n.value === scene) ?? notifyScenes[0]
    const key = `notify-${Date.now()}`
    const message = actions ? (
      <div>
        <p style={{ margin: 0 }}>{s.message}</p>
        <div className="notify-actions">
          <Button size="small" onClick={() => notification.close(key)}>
            忽略
          </Button>
          <Button size="small" type="primary" onClick={() => notification.close(key)}>
            查看详情
          </Button>
        </div>
      </div>
    ) : (
      s.message
    )
    notification[s.type]({
      key,
      message: s.title,
      description: message,
      duration: persist ? 0 : 4.5,
    })
  }

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Notification 通知 —— antd 3 适配层</h2>
      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">适用于较长时间的结果通知，期间用户不必停留等待，可进行其他操作。</p>
          <div className="demo-row">
            <Button onClick={show}>打开通知</Button>
          </div>
        </div>
        <aside className="config-card config-card--wide">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">场景</span>
              <Radio.Group value={scene} onChange={(event) => setScene(event.target.value)}>
                {notifyScenes.map((s) => (
                  <Radio key={s.value} value={s.value}>
                    {s.label}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
            <div className="config-item">
              <span className="config-item__label">是否常驻</span>
              <div className="config-field">
                <div className="config-field__row">
                  <Switch checked={persist} onChange={setPersist} />
                </div>
                <p className="config-card__hint">{persist ? '默认常驻' : '非必要不临时'}</p>
              </div>
            </div>
            <div className="config-item">
              <span className="config-item__label">操作按钮</span>
              <Switch checked={actions} onChange={setActions} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
