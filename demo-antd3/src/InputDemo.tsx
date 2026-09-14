import { useState } from 'react'
import { Input, InputNumber, Switch } from 'antd'

import SearchMini from './components/SearchMini'

const { TextArea } = Input

/**
 * Input 输入框 —— 与 demo/src/components/InputDemo.vue 严格对位。
 *
 * 区块顺序（与 Vue 版一致）：
 *   1. 基础输入框：正常（可清除 + 字数提示）+ 禁用；配置卡：可清除 / 字数提示
 *   2. 搜索框：业务组件 SearchMini；配置卡：默认收起（+ 选型指引 hint）
 *   3. 数字输入框
 *   4. 文本域：正常（字数提示）；配置卡：字数提示
 *
 * ⚠ 与 EP 写法差异：
 *   - EP `clearable` → antd3 `allowClear`
 *   - EP `show-word-limit` 内建 → antd3 3.x 无内建，用 suffix / 定位容器手动渲染计数
 *     （计数外观由 antd3-theme/input.less 的 .a3-input-count 提供，对齐 EP）
 */

export default function InputDemo() {
  // —— 基础输入框 ——
  const [basicValue, setBasicValue] = useState('')
  const [clearable, setClearable] = useState(false)
  const [showWordLimit, setShowWordLimit] = useState(false)

  // —— 搜索框 ——
  const [searchValue, setSearchValue] = useState('')
  const [searchCollapsed, setSearchCollapsed] = useState(false)
  // 选型指引：关闭（常驻展开）= 核心功能；开启（收起态）= 非核心功能
  const searchCollapsedHint = searchCollapsed
    ? '应用场景中非核心功能'
    : '应用场景中为核心功能'

  // —— 数字输入框 ——
  const [numberValue, setNumberValue] = useState<number | null>(1)

  // —— 文本域 ——
  const [textareaValue, setTextareaValue] = useState('')
  const [textareaWordLimit, setTextareaWordLimit] = useState(false)

  const MAX_INPUT = 50
  const MAX_TEXTAREA = 200

  return (
    <section id="input" className="demo-section">
      <h2 className="demo-section__title">Input 输入框 —— antd 3 适配层</h2>

      {/* 1. 基础输入框 */}
      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">基础输入框</p>
          <div className="demo-row">
            {/* 字数提示走 suffix；开可清除时 allowClear 的清除叉与计数共存于 suffix 区 */}
            <Input
              value={basicValue}
              onChange={(e) => setBasicValue(e.target.value)}
              placeholder="请输入内容"
              allowClear={clearable}
              maxLength={showWordLimit ? MAX_INPUT : undefined}
              suffix={
                showWordLimit ? (
                  <span className="a3-input-count">
                    {basicValue.length}/{MAX_INPUT}
                  </span>
                ) : (
                  <span />
                )
              }
              style={{ width: 240 }}
            />
            <Input placeholder="禁用状态" disabled style={{ width: 240 }} />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">可清除</span>
              <Switch checked={clearable} onChange={setClearable} />
            </div>
            <div className="config-item">
              <span className="config-item__label">字数提示</span>
              <Switch checked={showWordLimit} onChange={setShowWordLimit} />
            </div>
          </div>
        </aside>
      </div>

      {/* 2. 搜索框 */}
      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">搜索框</p>
          <p className="demo-desc">
            默认实时搜索，若因技术限制，则点击图标 / Enter 触发搜索动作
          </p>
          <div className="demo-row">
            <SearchMini
              value={searchValue}
              onChange={setSearchValue}
              collapsed={searchCollapsed}
              placeholder="搜索"
            />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            {/* 默认收起开关 + 选型指引是一个整体字段单元 */}
            <div className="config-field">
              <div className="config-field__row">
                <span className="config-item__label">默认收起</span>
                <Switch checked={searchCollapsed} onChange={setSearchCollapsed} />
              </div>
              <p className="config-card__hint">{searchCollapsedHint}</p>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. 数字输入框 */}
      <div className="demo-block">
        <p className="demo-label">数字输入框</p>
        <div className="demo-row">
          <InputNumber
            value={numberValue}
            onChange={(val) => setNumberValue(val as number | null)}
            min={1}
            max={100}
            placeholder="请输入"
          />
        </div>
      </div>

      {/* 4. 文本域 */}
      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">文本域</p>
          <div className="demo-row">
            <span className="a3-textarea-count-wrap">
              <TextArea
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={3}
                placeholder="请输入多行文本"
                maxLength={textareaWordLimit ? MAX_TEXTAREA : undefined}
                style={{ width: 400 }}
              />
              {textareaWordLimit && (
                <span className="a3-input-count a3-input-count--textarea">
                  {textareaValue.length}/{MAX_TEXTAREA}
                </span>
              )}
            </span>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">字数提示</span>
              <Switch checked={textareaWordLimit} onChange={setTextareaWordLimit} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
