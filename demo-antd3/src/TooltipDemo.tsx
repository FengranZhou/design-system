import { useState } from 'react'
import { Tooltip, Button, Radio } from 'antd'
const { Group: RadioGroup } = Radio

/**
 * Tooltip 文字提示 —— 与 demo/src/components/TooltipDemo.vue 严格对位。
 *
 * 单条实时示例：弹出方向由右侧「方向」配置项控制（切换方向时用 key 触发重挂载）。
 * 仅 4 个方向（上/右/下/左），与 EP 版一致。
 *
 * ⚠ 对齐 EP 的 show-after=300：全站统一延迟，避免鼠标路过一排图标时 tooltip 连片闪烁。
 *   antd3 用 mouseEnterDelay（单位秒）对应，故传 0.3。
 */

type Placement = 'top' | 'right' | 'bottom' | 'left'

const PLACEMENTS: { value: Placement; label: string }[] = [
  { value: 'top', label: '上方' },
  { value: 'right', label: '右侧' },
  { value: 'bottom', label: '下方' },
  { value: 'left', label: '左侧' },
]

export default function TooltipDemo() {
  const [placement, setPlacement] = useState<Placement>('top')

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Tooltip 文字提示 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <div className="demo-row">
            <Tooltip
              key={placement}
              title="这是一段文字提示内容"
              placement={placement}
              mouseEnterDelay={0.3}
            >
              <Button>悬停查看提示</Button>
            </Tooltip>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">方向</span>
              <RadioGroup value={placement} onChange={(e) => setPlacement(e.target.value)}>
                {PLACEMENTS.map((p) => (
                  <Radio key={p.value} value={p.value}>
                    {p.label}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
