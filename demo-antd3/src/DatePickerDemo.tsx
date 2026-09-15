import { useEffect, useState } from 'react'
import { DatePicker, Switch, TimePicker } from 'antd'
import type { Moment } from 'moment'

const { RangePicker } = DatePicker

export default function DatePickerDemo() {
  const [withDateTime, setWithDateTime] = useState(false)
  const [dateValue, setDateValue] = useState<Moment | null>(null)
  useEffect(() => {
    setDateValue(null)
  }, [withDateTime])

  const [withTime, setWithTime] = useState(false)
  const [rangeValue, setRangeValue] = useState<[Moment, Moment] | null>(null)
  useEffect(() => {
    setRangeValue(null)
  }, [withTime])

  const [timeValue, setTimeValue] = useState<Moment | null>(null)

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Picker 时间/日期选择器 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-label">日期选择</p>
          <div className="demo-row">
            <DatePicker
              value={dateValue}
              showTime={withDateTime}
              format={withDateTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
              placeholder={withDateTime ? '选择日期时间' : '选择日期'}
              style={{ width: withDateTime ? 280 : 240 }}
              onChange={(value) => setDateValue(value)}
            />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">时间</span>
              <Switch checked={withDateTime} onChange={setWithDateTime} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-label">日期范围</p>
          <div className="demo-row">
            <div style={{ width: withTime ? 460 : 360 }}>
              <RangePicker
                value={rangeValue}
                showTime={withTime}
                format={withTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
                placeholder={withTime ? ['开始时间', '结束时间'] : ['开始日期', '结束日期']}
                style={{ width: '100%' }}
                onChange={(value) => setRangeValue(value as [Moment, Moment] | null)}
              />
            </div>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">时间</span>
              <Switch checked={withTime} onChange={setWithTime} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block">
        <p className="demo-label">时间选择</p>
        <div className="demo-row">
          <TimePicker
            value={timeValue}
            placeholder="选择时间"
            format="HH:mm:ss"
            style={{ width: 200 }}
            onChange={(value) => setTimeValue(value)}
          />
        </div>
      </div>
    </section>
  )
}
