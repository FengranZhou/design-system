import React, { useState } from 'react'
import { Switch, Radio } from 'antd'
const { Group: RadioGroup } = Radio

/**
 * Switch 全形态矩阵 —— 与 demo/src/components/SwitchDemo.vue 严格对位。
 *
 * 状态：开关（可交互）/ 关闭禁用 / 开启禁用。
 * 文字：默认关闭；开启后显示各自状态名。位置默认右侧，可切左侧（互斥，一个开关一个标签）。
 *
 * ⚠ 与 EP 差异：EP 用 el-switch 的 active-text/inactive-text 内建外置文字；
 *   antd3 的 checkedChildren/unCheckedChildren 是「内嵌」在轨道里的，语义不同。
 *   为对齐 EP 的「文字外置于开关两侧」版式，这里用外层 span 自行渲染文字，
 *   不走 antd3 内嵌文字（见 antd3-theme/DIFF.md 的 Switch 文字位置差异）。
 */
function LabeledSwitch(props: {
  label: string
  showText: boolean
  position: 'left' | 'right'
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}) {
  const { label, showText, position, checked, disabled, onChange } = props
  const text = showText ? <span className="switch-label">{label}</span> : null
  return (
    <span className="switch-field">
      {position === 'left' && text}
      <Switch checked={checked} disabled={disabled} onChange={onChange} />
      {position === 'right' && text}
    </span>
  )
}

export default function SwitchDemo() {
  const [value, setValue] = useState(true)
  const [showText, setShowText] = useState(false)
  const [position, setPosition] = useState<'left' | 'right'>('right')

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Switch 开关 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">
            需要表示开关状态/两种状态之间的切换时使用，和 checkbox 的区别是，切换 switch
            会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。
          </p>
          <div className="demo-row">
            <LabeledSwitch
              label="开关"
              showText={showText}
              position={position}
              checked={value}
              onChange={setValue}
            />
            <LabeledSwitch label="关闭禁用" showText={showText} position={position} disabled checked={false} />
            <LabeledSwitch label="开启禁用" showText={showText} position={position} disabled checked />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">文字</span>
              <Switch checked={showText} onChange={setShowText} />
            </div>
            <div className="config-item">
              <span className="config-item__label">文字位置</span>
              <RadioGroup
                value={position}
                disabled={!showText}
                onChange={(e) => setPosition(e.target.value)}
              >
                <Radio value="right">右侧</Radio>
                <Radio value="left">左侧</Radio>
              </RadioGroup>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
