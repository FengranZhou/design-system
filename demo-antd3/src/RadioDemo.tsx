import React, { useState } from 'react'
import { Radio, Switch } from 'antd'
const { Group: RadioGroup, Button: RadioButton } = Radio

/**
 * Radio 全形态矩阵 —— 与 demo/src/components/RadioDemo.vue 严格对位。
 *
 * 版式与 EP 版一致：
 *   - 「基础单选」一组正常单选 + 一组展示禁用/选中禁用
 *   - 「单选按钮组」一组正常 + 一组禁用/选中禁用
 *   - 右侧配置卡控制文字显隐（关闭则只留圆点本体）
 * 目的是让两边能逐格并排比对，凡对不上的登记进 antd3-theme/DIFF.md。
 */
export default function RadioDemo() {
  const [value, setValue] = useState('2')
  const [buttonValue, setButtonValue] = useState('center')
  const [showText, setShowText] = useState(true)

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Radio 单选框 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-label">基础单选</p>
          <p className="demo-desc">
            与 select 相比，Radio 所有选项默认可见，方便用户在比较中选择；适合选项 ≤5
            且需并排比较，选项 &gt;5 则改用 select 下拉
          </p>
          {/* 两个 RadioGroup：一组正常单选、一组展示禁用/选中禁用（与 EP 版同结构）
              用 radio-inline-row 让两组视觉上连续等距排列 */}
          <div className="demo-row radio-inline-row">
            <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
              <Radio value="1">{showText ? '未选' : ''}</Radio>
              <Radio value="2">{showText ? '选中' : ''}</Radio>
            </RadioGroup>
            <RadioGroup value="on">
              <Radio value="off" disabled>{showText ? '禁用' : ''}</Radio>
              <Radio value="on" disabled>{showText ? '选中禁用' : ''}</Radio>
            </RadioGroup>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">文字</span>
              <Switch checked={showText} onChange={setShowText} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block">
        <p className="demo-label">单选按钮组</p>
        <p className="demo-desc">以切换按钮形式呈现，一般不默认使用</p>
        <div className="demo-row">
          <RadioGroup
            buttonStyle="solid"
            value={buttonValue}
            onChange={(e) => setButtonValue(e.target.value)}
          >
            <RadioButton value="left">左对齐</RadioButton>
            <RadioButton value="center">居中</RadioButton>
            <RadioButton value="right">右对齐</RadioButton>
          </RadioGroup>
          <RadioGroup value="on">
            <RadioButton value="off" disabled>禁用</RadioButton>
            <RadioButton value="off2" disabled>禁用</RadioButton>
            <RadioButton value="on" disabled>选中禁用</RadioButton>
          </RadioGroup>
        </div>
      </div>
    </section>
  )
}
