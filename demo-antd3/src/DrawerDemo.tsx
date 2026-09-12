import { useState } from 'react'
import { Button, Drawer, Radio, Switch } from 'antd'

export default function DrawerDemo() {
  const [visible, setVisible] = useState(false)
  const [hasFooter, setHasFooter] = useState(false)
  const [footerLayout, setFooterLayout] = useState<'horizontal' | 'vertical'>('horizontal')

  const close = () => setVisible(false)

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Drawer 抽屉 —— antd 3 适配层</h2>
      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">
            适用于辅助信息展示场景，相比对话框，承载信息量更多，抽屉内信息关联度更低，任务连贯性更强，页面遮挡更少。
          </p>
          <div className="demo-row">
            <Button type="primary" onClick={() => setVisible(true)}>
              打开抽屉
            </Button>
          </div>
        </div>
        <aside className="config-card config-card--wide">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">底部按钮</span>
              <Switch checked={hasFooter} onChange={setHasFooter} />
            </div>
            {hasFooter && (
              <div className="config-item">
                <span className="config-item__label">按钮布局</span>
                <Radio.Group
                  value={footerLayout}
                  onChange={(event) => setFooterLayout(event.target.value)}
                >
                  <Radio value="horizontal">水平</Radio>
                  <Radio value="vertical">垂直</Radio>
                </Radio.Group>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Drawer
        title={hasFooter ? '编辑信息' : '抽屉标题'}
        width={400}
        visible={visible}
        onClose={close}
      >
        <p style={{ color: 'var(--iflyv-text-2)' }}>这是抽屉的内容区域。</p>
        {hasFooter && (
          <div
            className={
              footerLayout === 'vertical' ? 'drawer-footer drawer-footer--vertical' : 'drawer-footer'
            }
          >
            {footerLayout === 'vertical' ? (
              <>
                <Button type="primary" onClick={close}>
                  确定
                </Button>
                <Button onClick={close}>取消</Button>
              </>
            ) : (
              <>
                <Button onClick={close}>取消</Button>
                <Button type="primary" onClick={close}>
                  确定
                </Button>
              </>
            )}
          </div>
        )}
      </Drawer>
    </section>
  )
}
