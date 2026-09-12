import { useState } from 'react'
import { Alert, Button, Checkbox, Modal, Radio, Switch } from 'antd'

const dialogScenes = [
  { value: 'confirm', label: '确认/单字段', width: 400 },
  { value: 'form', label: '常规表单', width: 640 },
  { value: 'complex', label: '复杂/双列', width: 800 },
]

type TipScene = {
  value: string
  label: string
  title: string
  body: string
  buttons: { label: string; type?: 'primary' | 'danger' }[]
}

const tipScenes: TipScene[] = [
  {
    value: 'warning',
    label: '警告',
    title: '离开未保存页面',
    body: '当前页有 3 处修改未保存，离开后将丢失。',
    buttons: [{ label: '取消' }, { label: '保存并离开', type: 'primary' }],
  },
  {
    value: 'danger',
    label: '危险',
    title: '删除用户「张三」',
    body: '此操作不可撤销，张三的所有数据将被永久删除。',
    buttons: [{ label: '取消' }, { label: '确认删除', type: 'danger' }],
  },
  {
    value: 'success',
    label: '成功',
    title: '操作完成',
    body: '批量启用已成功完成，共影响 32 条数据。',
    buttons: [{ label: '知道了', type: 'primary' }],
  },
  {
    value: 'info',
    label: '信息',
    title: '新版本可用',
    body: 'v0.5.0 已发布，包含若干 bug 修复和新功能，建议更新。',
    buttons: [{ label: '稍后' }, { label: '立即更新', type: 'primary' }],
  },
]

const dialogTitles = ['标题一', '标题二', '标题三']

export default function DialogDemo() {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [scene, setScene] = useState('confirm')
  const [showTip, setShowTip] = useState(false)
  const [multiTitle, setMultiTitle] = useState(false)
  const [footerLeft, setFooterLeft] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [activeTitle, setActiveTitle] = useState(0)
  const [dontRemind, setDontRemind] = useState(false)

  const [tipVisible, setTipVisible] = useState(false)
  const [tipScene, setTipScene] = useState('warning')

  const width = dialogScenes.find((s) => s.value === scene)?.width ?? 400
  const activeTip = tipScenes.find((s) => s.value === tipScene) ?? tipScenes[0]

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Dialog 对话框 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-label">操作弹窗</p>
          <p className="demo-desc">
            操作弹窗主要用于在弹窗内进行表单填写等操作行为的载体，适用于承载信息量更少、信息关联度更高、任务连贯性更弱、页面遮挡更多的场景。
          </p>
          <div className="demo-row">
            <Button type="primary" onClick={() => setDialogVisible(true)}>
              打开操作弹窗
            </Button>
          </div>
        </div>
        <aside className="config-card config-card--wide">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">场景</span>
              <Radio.Group value={scene} onChange={(event) => setScene(event.target.value)}>
                {dialogScenes.map((s) => (
                  <Radio key={s.value} value={s.value}>
                    {s.label}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
            <div className="config-item">
              <span className="config-item__label">提示信息</span>
              <Switch checked={showTip} onChange={setShowTip} />
            </div>
            <div className="config-item">
              <span className="config-item__label">多标题</span>
              <Switch checked={multiTitle} onChange={setMultiTitle} />
            </div>
            <div className="config-item">
              <span className="config-item__label">底部左侧内容</span>
              <Switch checked={footerLeft} onChange={setFooterLeft} />
            </div>
            <div className="config-item">
              <span className="config-item__label">全屏</span>
              <Switch checked={fullscreen} onChange={setFullscreen} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-label">提示弹窗</p>
          <p className="demo-desc">提示弹窗主要用于传达系统给用户的提醒，需要打断用户，信息常常较为重要。</p>
          <div className="demo-row">
            <Button onClick={() => setTipVisible(true)}>打开提示弹窗</Button>
          </div>
        </div>
        <aside className="config-card config-card--wide">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">场景</span>
              <Radio.Group value={tipScene} onChange={(event) => setTipScene(event.target.value)}>
                {tipScenes.map((s) => (
                  <Radio key={s.value} value={s.value}>
                    {s.label}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          </div>
        </aside>
      </div>

      <Modal
        className={`demo-dialog-basic${fullscreen ? ' is-fullscreen' : ''}`}
        visible={dialogVisible}
        title={
          multiTitle ? (
            <div className="dialog-titles">
              {dialogTitles.map((t, i) => (
                <span
                  key={t}
                  className={`dialog-title-item${activeTitle === i ? ' is-active' : ''}`}
                  onClick={() => setActiveTitle(i)}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            '弹窗标题'
          )
        }
        width={fullscreen ? undefined : width}
        wrapClassName={fullscreen ? 'dialog-fullscreen-wrap' : undefined}
        onCancel={() => setDialogVisible(false)}
        footer={
          <div className="dialog-footer">
            {footerLeft && (
              <div className="dialog-footer-left">
                <Checkbox checked={dontRemind} onChange={(e) => setDontRemind(e.target.checked)}>
                  不再提示
                </Checkbox>
              </div>
            )}
            <Button onClick={() => setDialogVisible(false)}>取消</Button>
            <Button type="primary" onClick={() => setDialogVisible(false)}>
              确认
            </Button>
          </div>
        }
      >
        {showTip && (
          <Alert className="alert-neutral" type="info" closable={false} message="提示信息" />
        )}
        <div className="dialog-content-slot">内容区域</div>
      </Modal>

      <Modal
        className={`demo-tip-dialog is-${activeTip.value}`}
        visible={tipVisible}
        title={activeTip.title}
        width={400}
        onCancel={() => setTipVisible(false)}
        footer={activeTip.buttons.map((btn) => (
          <Button key={btn.label} type={btn.type} onClick={() => setTipVisible(false)}>
            {btn.label}
          </Button>
        ))}
      >
        <p>{activeTip.body}</p>
      </Modal>
    </section>
  )
}
