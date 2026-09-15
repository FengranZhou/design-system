import { useEffect, useRef, useState } from 'react'
import { Button, Spin, Switch } from 'antd'

export default function LoadingDemo() {
  const [showText, setShowText] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const timerRef = useRef<number | null>(null)

  const openFullscreen = () => {
    setFullscreen(true)
    timerRef.current = window.setTimeout(() => setFullscreen(false), 3000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Loading 加载 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-label">区域加载</p>
          <div className="loading-area">
            <Spin spinning tip={showText ? '数据加载中...' : undefined}>
              <div style={{ height: 120 }} />
            </Spin>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">提示文字</span>
              <Switch checked={showText} onChange={setShowText} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block">
        <p className="demo-label">全屏加载</p>
        <div className="demo-row">
          <Button type="primary" onClick={openFullscreen}>
            打开全屏 Loading（3秒后关闭）
          </Button>
        </div>
      </div>

      {fullscreen && (
        <div className="loading-fullscreen">
          <Spin spinning tip="加载中..." size="large" />
        </div>
      )}
    </section>
  )
}
