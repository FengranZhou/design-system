import { useState } from 'react'
import { Tag, Switch } from 'antd'
import { Check, Clock, X, Ban, Archive, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Tag 标签 —— 与 demo/src/components/TagDemo.vue 严格对位。
 *
 * 6 枚语义标签（已完成/待审核/已驳回/已关闭/已归档/来源）+ AI 标识。
 * 图标为正交配置项（默认关，开启后每枚叠加语义图标）。
 *
 * ⚠ 与 EP 写法差异：
 *   - EP `type="success"` → antd3 无 type prop，改用约定 class `tag-success`（见 tag.less）
 *   - AI 标签文字渐变需内层 span 承载：<Tag className="tag-ai"><span>...</span></Tag>
 *     （与 EP 同限制：AI 标签内图标会随渐变文字透明不可见，故 AI 不参与图标配置）
 */

const TAGS: { label: string; cls: string; icon: LucideIcon }[] = [
  { label: '已完成', cls: 'tag-success', icon: Check },
  { label: '待审核', cls: 'tag-warning', icon: Clock },
  { label: '已驳回', cls: 'tag-danger', icon: X },
  { label: '已关闭', cls: 'tag-info', icon: Ban },
  { label: '已归档', cls: 'tag-gray', icon: Archive },
  { label: '来源', cls: 'tag-outline', icon: Info },
]

export default function TagDemo() {
  // 图标为正交配置项，默认关（默认形态不带图标）
  const [showIcon, setShowIcon] = useState(false)

  return (
    <section id="tag" className="demo-section">
      <h2 className="demo-section__title">Tag 标签 —— antd 3 适配层</h2>

      <div className="demo-block control-showcase">
        <div className="control-showcase__main">
          <p className="demo-desc">尽量避免在实际使用过程中，3 个以上的标签一同出现</p>
          <div className="demo-row">
            {TAGS.map(({ label, cls, icon: Icon }) => (
              <Tag key={label} className={cls}>
                {showIcon && <Icon size={12} strokeWidth={2} />}
                {label}
              </Tag>
            ))}
            {/* AI 标识不参与图标配置：渐变文字靠 background-clip + 文字透明实现，
                图标会跟着透明不可见（源头 clip 机制限制） */}
            <Tag className="tag-ai">
              <span>AI互动课堂</span>
            </Tag>
          </div>
        </div>

        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">图标</span>
              <Switch checked={showIcon} onChange={setShowIcon} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
