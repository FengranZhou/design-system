import { useState } from 'react'
import { Button, Radio, Result, Switch } from 'antd'

const sceneMap = {
  success: { title: '提交成功', subtitle: '审核结果将在 1-3 个工作日内通知', button: '返回首页' },
  error: { title: '提交失败', subtitle: '请检查后重新提交', button: '重新提交' },
} as const

export default function ResultDemo() {
  const [scene, setScene] = useState<'success' | 'error'>('success')
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [showButton, setShowButton] = useState(true)

  const current = sceneMap[scene]

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Result 结果页 —— antd 3 适配层</h2>
      <div className="demo-block">
        <p className="demo-desc">当有重要操作需告知用户处理结果，且反馈内容较为复杂/重要时使用。</p>
        <div className="result-showcase">
          <div className="demo-row result-row">
            <Result
              status={scene}
              title={current.title}
              subTitle={showSubtitle ? current.subtitle : undefined}
              extra={showButton ? <Button type="primary">{current.button}</Button> : undefined}
            />
          </div>
          <aside className="config-card">
            <p className="config-card__title">配置项</p>
            <div className="config-form">
              <div className="config-item">
                <span className="config-item__label">场景</span>
                <Radio.Group value={scene} onChange={(event) => setScene(event.target.value)}>
                  <Radio value="success">正确</Radio>
                  <Radio value="error">错误</Radio>
                </Radio.Group>
              </div>
              <div className="config-item">
                <span className="config-item__label">描述</span>
                <Switch checked={showSubtitle} onChange={setShowSubtitle} />
              </div>
              <div className="config-item">
                <span className="config-item__label">按钮</span>
                <Switch checked={showButton} onChange={setShowButton} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
