import { useEffect, useState } from 'react'
import { InputNumber, Slider, Switch } from 'antd'

const MARKS = { 0: '0', 50: '50', 100: '100' }

export default function SliderDemo() {
  const [showInput, setShowInput] = useState(false)
  const [isRange, setIsRange] = useState(false)
  const [discrete, setDiscrete] = useState(false)
  const [showMarks, setShowMarks] = useState(false)
  const [value, setValue] = useState<number | [number, number]>(30)

  useEffect(() => {
    setValue(isRange ? [20, 60] : 30)
  }, [isRange])

  const step = discrete ? 20 : 1

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Slider 滑块 —— antd 3 适配层</h2>
      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">当用户需要在数值区间/自定义区间内进行选择时，可为连续或离散值。</p>
          <div className="slider-host">
            <Slider
              range={isRange}
              value={value as never}
              step={step}
              marks={showMarks ? MARKS : undefined}
              onChange={(next) => setValue(next as number | [number, number])}
            />
            {showInput && !isRange && (
              <InputNumber
                min={0}
                max={100}
                step={step}
                value={value as number}
                onChange={(next) => setValue((next as number) ?? 0)}
                style={{ marginTop: 12 }}
              />
            )}
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">数值输入框</span>
              <div className="config-field">
                <div className="config-field__row">
                  <Switch checked={showInput} disabled={isRange} onChange={setShowInput} />
                </div>
                {isRange && <p className="config-card__hint">区间模式下 antd 3 不支持</p>}
              </div>
            </div>
            <div className="config-item">
              <span className="config-item__label">区间选择</span>
              <Switch checked={isRange} onChange={setIsRange} />
            </div>
            <div className="config-item">
              <span className="config-item__label">离散值</span>
              <Switch checked={discrete} onChange={setDiscrete} />
            </div>
            <div className="config-item">
              <span className="config-item__label">刻度标签</span>
              <Switch checked={showMarks} onChange={setShowMarks} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
