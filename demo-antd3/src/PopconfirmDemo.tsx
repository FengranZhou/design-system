import { Button, Popconfirm, message } from 'antd'

export default function PopconfirmDemo() {
  const onConfirm = () => {
    message.success('操作已确认')
  }

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Popconfirm 气泡确认框 —— antd 3 适配层</h2>
      <div className="demo-block">
        <p className="demo-desc">目标元素的操作需要用户进一步完成交互形式更轻量的确认时使用。</p>
        <div className="demo-row">
          <Popconfirm
            title="确定要删除这条记录吗？"
            okText="删除"
            okType="danger"
            cancelText="取消"
            onConfirm={onConfirm}
          >
            <Button type="danger">删除记录</Button>
          </Popconfirm>
        </div>
      </div>
    </section>
  )
}
