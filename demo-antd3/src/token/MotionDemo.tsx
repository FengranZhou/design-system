import React, { useState } from 'react'
import { Button } from 'antd'

import { copyToken, useTokenValues } from './useTokens'
import './token-demo.less'

/**
 * Motion 动效 —— 与 demo/src/components/token/MotionDemo.vue 对位。
 * 点击「播放」让小球按各时长 / 缓动令牌运动，直观比较曲线差异。
 */

const MOTION_TOKENS = [
  { name: '--iflyv-duration-fast', desc: '微交互：hover / 聚焦 / 开关', kind: 'duration' },
  { name: '--iflyv-duration-normal', desc: '常规：展开折叠 / Tab / 弹窗', kind: 'duration' },
  { name: '--iflyv-duration-slow', desc: '页面级：路由 / 骨架屏 / 大区域', kind: 'duration' },
  { name: '--iflyv-ease-default', desc: '通用缓动（尺寸 / 颜色变化）', kind: 'easing' },
  { name: '--iflyv-ease-decelerate', desc: '减速：元素出现', kind: 'easing' },
  { name: '--iflyv-ease-accelerate', desc: '加速：元素消失', kind: 'easing' },
]

export default function MotionDemo() {
  const { rootRef, rawValues } = useTokenValues(MOTION_TOKENS.map((t) => t.name))
  const [playing, setPlaying] = useState(false)
  const [replayKey, setReplayKey] = useState(0)

  const replay = () => {
    setPlaying(false)
    setReplayKey((k) => k + 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)))
  }

  return (
    <section className="demo-section demo-plain" ref={rootRef}>
      <h2 className="demo-section__title">Motion 动效</h2>

      <div className="demo-block">
        <p className="demo-label">
          动效 Animation — 时长三档 × 缓动三条；点击「播放」看小球运动曲线差异
        </p>
        <div className="token-motion-list">
          {MOTION_TOKENS.map((t) => (
            <div key={t.name} className="token-motion-row">
              <span
                className="token-motion-row__head"
                onClick={() => copyToken(t.name)}
                title={`点击复制 var(${t.name})`}
              >
                <span className="token-name">{t.name.replace('--iflyv-', '')}</span>
                <span className="token-value">{rawValues[t.name] || '…'}</span>
                <span className="token-desc">{t.desc}</span>
              </span>
              <span className="token-motion-track">
                <span
                  key={`${t.name}-${replayKey}`}
                  className="token-motion-ball"
                  style={{
                    transitionDuration: t.kind === 'duration' ? `var(${t.name})` : '0.8s',
                    transitionTimingFunction: t.kind === 'easing' ? `var(${t.name})` : 'ease',
                    transform: playing ? 'translateX(160px)' : 'translateX(0)',
                  }}
                />
              </span>
            </div>
          ))}
          <Button style={{ alignSelf: 'flex-start' }} onClick={replay}>
            播放
          </Button>
        </div>
      </div>
    </section>
  )
}
