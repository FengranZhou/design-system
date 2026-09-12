import { useState } from 'react'
import { Button, Empty, Radio, Select, Switch } from 'antd'

import noData from '../../design-spec/el-theme/assets/empty/no-data.png'
import noNetwork from '../../design-spec/el-theme/assets/empty/no-network.png'
import noSearchResult from '../../design-spec/el-theme/assets/empty/no-search-result.png'
import noCourse from '../../design-spec/el-theme/assets/empty/no-course.png'
import noUser from '../../design-spec/el-theme/assets/empty/no-user.png'
import noGraph from '../../design-spec/el-theme/assets/empty/no-graph.png'
import noReply from '../../design-spec/el-theme/assets/empty/no-reply.png'
import noExam from '../../design-spec/el-theme/assets/empty/no-exam.png'

const { Option } = Select

const types = [
  { key: 'data', image: noData, label: '无资源', action: '立即创建' },
  { key: 'network', image: noNetwork, label: '无网络', action: '重新加载' },
  { key: 'search', image: noSearchResult, label: '无搜索结果', action: '清空筛选' },
  { key: 'course', image: noCourse, label: '无课程', action: '添加课程' },
  { key: 'user', image: noUser, label: '无用户', action: '邀请成员' },
  { key: 'graph', image: noGraph, label: '无图谱', action: '去创建' },
  { key: 'reply', image: noReply, label: '无回复', action: '去回复' },
  { key: 'exam', image: noExam, label: '无考试/作业/测验/笔记', action: '去布置' },
]

export default function EmptyDemo() {
  const [typeKey, setTypeKey] = useState('data')
  const [withButton, setWithButton] = useState(false)
  const [container, setContainer] = useState<'page' | 'block'>('page')

  const current = types.find((t) => t.key === typeKey) ?? types[0]

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Empty 空状态 —— antd 3 适配层</h2>
      <div className="demo-block empty-showcase">
        <div className="empty-preview">
          <Empty
            className={container === 'page' ? 'empty-page' : 'empty-block'}
            image={current.image}
            description={current.label}
          >
            {withButton && <Button type="primary">{current.action}</Button>}
          </Empty>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">类型</span>
              <Select
                value={typeKey}
                placeholder="选择类型"
                style={{ width: '100%' }}
                onChange={(value) => setTypeKey(value)}
              >
                {types.map((t) => (
                  <Option key={t.key} value={t.key}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="config-item">
              <span className="config-item__label">按钮</span>
              <Switch checked={withButton} onChange={setWithButton} />
            </div>
            <div className="config-item">
              <span className="config-item__label">级别</span>
              <Radio.Group value={container} onChange={(event) => setContainer(event.target.value)}>
                <Radio value="page">页面级</Radio>
                <Radio value="block">模块级</Radio>
              </Radio.Group>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
