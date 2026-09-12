import { useState } from 'react'
import { Descriptions, InputNumber, Tag } from 'antd'

const descPool = [
  { label: '姓名', value: '张三' },
  { label: '部门', value: '设计部' },
  { label: '职级', value: 'P6' },
  { label: '邮箱', value: 'zhangsan@example.com' },
  { label: '入职日期', value: '2024-03-15' },
  { label: '状态', value: '在职', tag: true },
  { label: '工号', value: 'D2024001' },
  { label: '手机', value: '138 0000 0000' },
  { label: '直属上级', value: '李四' },
  { label: '办公地点', value: '北京·中关村' },
  { label: '合同类型', value: '全职' },
  { label: '试用期', value: '已转正' },
]

export default function DescriptionsDemo() {
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(3)

  const count = rows * cols
  const items = Array.from({ length: count }, (_, i) => {
    const base = descPool[i % descPool.length]
    return i < descPool.length
      ? base
      : { ...base, label: `${base.label} ${Math.floor(i / descPool.length) + 1}` }
  })

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Descriptions 描述列表 —— antd 3 适配层</h2>
      <div className="demo-block descriptions-showcase">
        <div className="descriptions-showcase__main">
          <Descriptions column={cols} bordered>
            {items.map((item) => (
              <Descriptions.Item key={item.label} label={item.label}>
                {item.tag ? <Tag className="tag-success">{item.value}</Tag> : item.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">行</span>
              <InputNumber
                min={1}
                max={6}
                value={rows}
                onChange={(value) => setRows((value as number) || 1)}
              />
            </div>
            <div className="config-item">
              <span className="config-item__label">列</span>
              <InputNumber
                min={1}
                max={6}
                value={cols}
                onChange={(value) => setCols((value as number) || 1)}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
