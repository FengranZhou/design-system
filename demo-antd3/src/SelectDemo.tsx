import { useEffect, useState } from 'react'
import { Cascader, Select, Switch, TreeSelect } from 'antd'

const { Option, OptGroup } = Select
const { TreeNode } = TreeSelect

const departments = [
  { value: '1', label: '设计部' },
  { value: '2', label: '研发部' },
  { value: '3', label: '产品部' },
  { value: '4', label: '市场部' },
  { value: '5', label: '运营部' },
  { value: '6', label: '财务部' },
  { value: '7', label: '人事部' },
  { value: '8', label: '客服部' },
]

const groupOptions = [
  {
    label: '技术部门',
    options: [
      { value: 'fe', label: '前端开发' },
      { value: 'be', label: '后端开发' },
      { value: 'qa', label: '测试工程' },
    ],
  },
  {
    label: '业务部门',
    options: [
      { value: 'pd', label: '产品设计' },
      { value: 'op', label: '运营管理' },
      { value: 'mk', label: '市场营销' },
    ],
  },
]

const cascaderOptions = [
  {
    value: 'frontend',
    label: '前端开发',
    children: [
      { value: 'vue', label: 'Vue' },
      { value: 'react', label: 'React' },
    ],
  },
  {
    value: 'backend',
    label: '后端开发',
    children: [
      { value: 'java', label: 'Java' },
      { value: 'python', label: 'Python' },
    ],
  },
]

export default function SelectDemo() {
  const [clearable, setClearable] = useState(false)
  const [filterable, setFilterable] = useState(false)
  const [selectValue, setSelectValue] = useState<string | undefined>('all')

  useEffect(() => {
    setSelectValue(clearable ? undefined : 'all')
  }, [clearable])

  const [multiValue, setMultiValue] = useState<string[]>([])
  const [multiClearable, setMultiClearable] = useState(false)
  const [multiFilterable, setMultiFilterable] = useState(false)

  const [groupMultiple, setGroupMultiple] = useState(false)
  const [groupClearable, setGroupClearable] = useState(false)
  const [groupFilterable, setGroupFilterable] = useState(false)
  const [groupValue, setGroupValue] = useState<string | string[] | undefined>(undefined)
  useEffect(() => {
    setGroupValue(groupMultiple ? [] : undefined)
  }, [groupMultiple])

  const [treeMultiple, setTreeMultiple] = useState(false)
  const [treeClearable, setTreeClearable] = useState(false)
  const [treeFilterable, setTreeFilterable] = useState(false)
  const [treeValue, setTreeValue] = useState<string | string[] | undefined>(undefined)
  useEffect(() => {
    setTreeValue(treeMultiple ? [] : undefined)
  }, [treeMultiple])

  const [cascaderMultiple, setCascaderMultiple] = useState(false)
  const [cascaderClearable, setCascaderClearable] = useState(false)
  const [cascaderFilterable, setCascaderFilterable] = useState(false)
  const [cascaderValue, setCascaderValue] = useState<string[]>([])
  useEffect(() => {
    setCascaderValue([])
  }, [cascaderMultiple])

  const clearableHint = clearable
    ? '无默认值、靠外部标签说明时用：空 = 未选择，清空语义完整'
    : '有默认语义项（如「全部类型」）时用：清空会丢失语义，故不可清除'

  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Select 选择器 —— antd 3 适配层</h2>

      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">基础选择器</p>
          <div className="demo-row">
            <Select
              value={selectValue}
              allowClear={clearable}
              showSearch={filterable}
              optionFilterProp="children"
              placeholder="请选择"
              style={{ width: 240 }}
              onChange={(value) => setSelectValue(value)}
            >
              <Option value="all">{clearable ? '全部' : '全部部门'}</Option>
              {departments.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
            <Select placeholder="禁用状态" disabled style={{ width: 240 }}>
              <Option value="1">选项一</Option>
            </Select>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">可清除</span>
              <div className="config-field">
                <div className="config-field__row">
                  <Switch checked={clearable} onChange={setClearable} />
                </div>
                <p className="config-card__hint">{clearableHint}</p>
              </div>
            </div>
            <div className="config-item">
              <span className="config-item__label">可搜索</span>
              <Switch checked={filterable} onChange={setFilterable} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">多选</p>
          <div className="demo-row">
            <Select
              mode="multiple"
              value={multiValue}
              allowClear={multiClearable}
              showSearch={multiFilterable}
              optionFilterProp="children"
              maxTagCount={2}
              placeholder="多选模式"
              style={{ width: 240 }}
              onChange={(value) => setMultiValue(value)}
            >
              {departments.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
            <Select mode="multiple" placeholder="禁用状态" disabled style={{ width: 240 }}>
              <Option value="1">选项一</Option>
            </Select>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">可清除</span>
              <Switch checked={multiClearable} onChange={setMultiClearable} />
            </div>
            <div className="config-item">
              <span className="config-item__label">可搜索</span>
              <Switch checked={multiFilterable} onChange={setMultiFilterable} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">分组选择</p>
          <div className="demo-row">
            <Select
              mode={groupMultiple ? 'multiple' : undefined}
              value={groupValue as never}
              allowClear={groupClearable}
              showSearch={groupFilterable}
              optionFilterProp="children"
              maxTagCount={2}
              placeholder="请选择"
              style={{ width: 240 }}
              onChange={(value) => setGroupValue(value)}
            >
              {groupOptions.map((group) => (
                <OptGroup key={group.label} label={group.label}>
                  {group.options.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
            <Select placeholder="禁用状态" disabled style={{ width: 240 }}>
              <Option value="1">选项一</Option>
            </Select>
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">多选</span>
              <Switch checked={groupMultiple} onChange={setGroupMultiple} />
            </div>
            <div className="config-item">
              <span className="config-item__label">可清除</span>
              <Switch checked={groupClearable} onChange={setGroupClearable} />
            </div>
            <div className="config-item">
              <span className="config-item__label">可搜索</span>
              <Switch checked={groupFilterable} onChange={setGroupFilterable} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">树形选择器</p>
          <div className="demo-row">
            <TreeSelect
              value={treeValue as never}
              multiple={treeMultiple}
              allowClear={treeClearable}
              showSearch={treeFilterable}
              treeNodeFilterProp="title"
              maxTagCount={2}
              placeholder={treeMultiple ? '多选树形选择' : '单选树形选择'}
              style={{ width: 240 }}
              onChange={(value) => setTreeValue(value)}
            >
              <TreeNode value="dev" title="研发中心">
                <TreeNode value="fe" title="前端组" />
                <TreeNode value="be" title="后端组" />
                <TreeNode value="qa" title="测试组" />
              </TreeNode>
              <TreeNode value="design" title="设计中心">
                <TreeNode value="ui" title="UI 组" />
                <TreeNode value="ux" title="UX 组" />
              </TreeNode>
            </TreeSelect>
            <TreeSelect placeholder="禁用状态" disabled style={{ width: 240 }} />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">多选</span>
              <Switch checked={treeMultiple} onChange={setTreeMultiple} />
            </div>
            <div className="config-item">
              <span className="config-item__label">可清除</span>
              <Switch checked={treeClearable} onChange={setTreeClearable} />
            </div>
            <div className="config-item">
              <span className="config-item__label">可搜索</span>
              <Switch checked={treeFilterable} onChange={setTreeFilterable} />
            </div>
          </div>
        </aside>
      </div>

      <div className="demo-block input-showcase">
        <div className="input-showcase__main">
          <p className="demo-label">级联选择器</p>
          <div className="demo-row">
            <Cascader
              key={cascaderMultiple ? 'multi' : 'single'}
              value={cascaderValue}
              options={cascaderOptions}
              allowClear={cascaderClearable}
              showSearch={cascaderFilterable}
              placeholder="请选择"
              style={{ width: 280 }}
              onChange={(value) => setCascaderValue(value as string[])}
            />
            <Cascader options={cascaderOptions} placeholder="禁用状态" disabled style={{ width: 280 }} />
          </div>
        </div>
        <aside className="config-card">
          <p className="config-card__title">配置项</p>
          <div className="config-form">
            <div className="config-item">
              <span className="config-item__label">多选</span>
              <Switch checked={cascaderMultiple} onChange={setCascaderMultiple} />
            </div>
            <div className="config-item">
              <span className="config-item__label">可清除</span>
              <Switch checked={cascaderClearable} onChange={setCascaderClearable} />
            </div>
            <div className="config-item">
              <span className="config-item__label">可搜索</span>
              <Switch checked={cascaderFilterable} onChange={setCascaderFilterable} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
