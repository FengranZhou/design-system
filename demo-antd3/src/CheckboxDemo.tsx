import React, { useState } from 'react'
import { Checkbox, Switch } from 'antd'
const CheckboxGroup = Checkbox.Group

/**
 * Checkbox 全形态矩阵 —— 与 demo/src/components/CheckboxDemo.vue 严格对位。
 *
 * 状态清单顺序：选中 / 未选 / 半选 / 选中禁用 / 未选禁用 / 半选禁用
 * （三个常态在前、三个禁用态在后）。仅「选中」「未选」两项进 group 的受控值；
 * 半选、三个禁用态均为纯状态展示（indeterminate / disabled 直接置位，不进 group）。
 * 用 checkbox-inline-row 让 group 内两项与后面四个独立项在 flex 里平级等距。
 */
export default function CheckboxDemo() {
  const [value, setValue] = useState<string[]>(['vue'])
  const [showText, setShowText] = useState(true)

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Checkbox 多选框 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">
            单独使用可以表示两种状态之间的切换，和 switch 类似。区别在于切换 switch
            会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。
          </p>
          <div className="demo-row checkbox-inline-row">
            <CheckboxGroup value={value} onChange={(v) => setValue(v as string[])}>
              <Checkbox value="vue">{showText ? '选中' : ''}</Checkbox>
              <Checkbox value="react">{showText ? '未选' : ''}</Checkbox>
            </CheckboxGroup>
            <Checkbox indeterminate>{showText ? '半选' : ''}</Checkbox>
            <Checkbox checked disabled>{showText ? '选中禁用' : ''}</Checkbox>
            <Checkbox disabled>{showText ? '未选禁用' : ''}</Checkbox>
            <Checkbox indeterminate disabled>{showText ? '半选禁用' : ''}</Checkbox>
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
    </section>
  )
}
