import { useState } from 'react'
import { Rate, Switch } from 'antd'

export default function RateDemo() {
  const [rateValue, setRateValue] = useState(3)
  const [allowHalf, setAllowHalf] = useState(false)

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Rate 评分 —— antd 3 适配层</h2>
      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">
            用于教学评价、课程评分等主观打分；客观数值（85 分、完成度 60%）不要降级成 5 档星星。
          </p>

          <p className="demo-label">评分</p>
          <div className="demo-row">
            <Rate value={rateValue} allowHalf={allowHalf} onChange={setRateValue} />
          </div>

          <p className="demo-label">只读展示</p>
          <div className="demo-row">
            <Rate value={4.5} allowHalf disabled />
            <span className="ant-rate-text">4.5 分</span>
          </div>

          <p className="demo-label">禁用</p>
          <div className="demo-row">
            <Rate value={2} disabled />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">半星</span>
              <div className="config-field">
                <div className="config-field__row">
                  <Switch checked={allowHalf} onChange={setAllowHalf} />
                </div>
                <p className="config-card__hint">评价类常见（如 4.5 分）；打分粒度只需整星时不必开</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
