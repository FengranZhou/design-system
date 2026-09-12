import { Button, message } from 'antd'

const messageTexts: Record<string, string> = {
  success: '操作成功，数据已保存',
  warning: '请注意，该操作不可撤销',
  error: '操作失败，请稍后重试',
  info: '这是一条信息提示',
}

export default function MessageDemo() {
  const show = (type: 'success' | 'warning' | 'error' | 'info') => {
    message[type](messageTexts[type])
  }

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Message 消息提示 —— antd 3 适配层</h2>
      <div className="demo-block">
        <p className="demo-desc">希望不打断用户操作，并给予轻量提示。</p>
        <div className="demo-row">
          <Button onClick={() => show('success')}>Success</Button>
          <Button onClick={() => show('warning')}>Warning</Button>
          <Button onClick={() => show('error')}>Error</Button>
          <Button onClick={() => show('info')}>Info</Button>
        </div>
      </div>
    </section>
  )
}
