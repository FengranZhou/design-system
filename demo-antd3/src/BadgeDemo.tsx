import { useState } from 'react'
import { Badge, Button, Radio, Tabs } from 'antd'
import { Bell, Heart, Mail, MessageSquare } from 'lucide-react'
import UserAvatar from './components/UserAvatar'

const { TabPane } = Tabs

type BadgeType = 'avatar' | 'button' | 'icon' | 'tab'

export default function BadgeDemo() {
  const [type, setType] = useState<BadgeType>('avatar')

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Badge 徽标 —— antd 3 适配层</h2>
      <div className="demo-block badge-showcase">
        <div className="badge-showcase__main">
          <p className="demo-desc">用于显示需要处理的消息条数，通过醒目视觉形式吸引用户处理。</p>

          {type === 'avatar' && (
            <div className="demo-row" style={{ gap: 'var(--iflyv-spacing-6)' }}>
              <Badge dot>
                <UserAvatar size={28} role="teacher-male" />
              </Badge>
              <Badge count={12}>
                <UserAvatar size={28} role="teacher-female" />
              </Badge>
              <Badge count={100} overflowCount={99}>
                <UserAvatar size={28} role="student-male" />
              </Badge>
              <Badge count="new">
                <UserAvatar size={28} role="student-female" />
              </Badge>
            </div>
          )}

          {type === 'button' && (
            <div className="demo-row">
              <Badge dot>
                <Button>通知</Button>
              </Badge>
              <Badge count={5}>
                <Button>消息</Button>
              </Badge>
              <Badge count={100} overflowCount={99}>
                <Button>待处理</Button>
              </Badge>
              <Badge count="hot">
                <Button>活动</Button>
              </Badge>
            </div>
          )}

          {type === 'icon' && (
            <div className="demo-row" style={{ gap: 'var(--iflyv-spacing-8)' }}>
              <Badge dot>
                <Mail size={20} strokeWidth={2} style={{ color: 'var(--iflyv-icon-2)', cursor: 'pointer' }} />
              </Badge>
              <Badge count={8}>
                <Bell size={20} strokeWidth={2} style={{ color: 'var(--iflyv-icon-2)', cursor: 'pointer' }} />
              </Badge>
              <Badge count={100} overflowCount={99}>
                <MessageSquare size={20} strokeWidth={2} style={{ color: 'var(--iflyv-icon-2)', cursor: 'pointer' }} />
              </Badge>
              <Badge count="new">
                <Heart size={20} strokeWidth={2} style={{ color: 'var(--iflyv-icon-2)', cursor: 'pointer' }} />
              </Badge>
            </div>
          )}

          {type === 'tab' && (
            <Tabs className="badge-tabs">
              <TabPane tab={<Badge dot className="tab-badge">待审核</Badge>} key="1" />
              <TabPane tab={<Badge count={3} className="tab-badge">全部任务</Badge>} key="2" />
              <TabPane tab={<Badge count={100} overflowCount={99} className="tab-badge">已完成</Badge>} key="3" />
              <TabPane tab={<Badge count="new" className="tab-badge">最新</Badge>} key="4" />
            </Tabs>
          )}
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">类型</span>
              <Radio.Group value={type} onChange={(event) => setType(event.target.value)}>
                <Radio value="avatar">头像</Radio>
                <Radio value="button">按钮</Radio>
                <Radio value="icon">图标</Radio>
                <Radio value="tab">tab 栏</Radio>
              </Radio.Group>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
