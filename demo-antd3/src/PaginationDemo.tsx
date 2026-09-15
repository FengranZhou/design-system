import { useState } from 'react'
import { Pagination, Radio } from 'antd'

export default function PaginationDemo() {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [size, setSize] = useState<'normal' | 'small'>('normal')
  const isSmall = size === 'small'

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Pagination 分页 —— antd 3 适配层</h2>
      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">分页器用于分隔长列表，每次只加载一个页面。</p>
          <div className="demo-row">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={80}
              pageSizeOptions={['10', '20', '50', '100']}
              showSizeChanger={!isSmall}
              showQuickJumper={!isSmall}
              size={isSmall ? 'small' : undefined}
              onChange={(page, nextPageSize) => {
                setCurrent(page)
                setPageSize(nextPageSize || pageSize)
              }}
              onShowSizeChange={(page, nextPageSize) => {
                setCurrent(page)
                setPageSize(nextPageSize)
              }}
            />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item pagination-size-item">
              <span className="config-item__label">尺寸</span>
              <div className="config-field">
                <Radio.Group value={size} onChange={(event) => setSize(event.target.value)}>
                  <Radio value="normal">常规</Radio>
                  <Radio value="small">小型</Radio>
                </Radio.Group>
                <p className="config-card__hint">
                  {isSmall ? '适用于较小的容器内部，如内嵌子模块等' : '适用于多数场景，如页面、弹窗等'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
