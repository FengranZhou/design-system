import { Button, Dropdown, Menu, Table, Tag, Tooltip } from 'antd'
import { Eye, MoreHorizontal, SquarePen } from 'lucide-react'

const headerColumns = [
  { title: '', dataIndex: 'sel', width: 60 },
  { title: '标题', dataIndex: 'a', width: 200 },
  { title: '标题', dataIndex: 'b', sorter: true },
]

const moreMenu = (
  <Menu>
    <Menu.Item key="copy">复制</Menu.Item>
    <Menu.Divider />
    <Menu.Item key="delete">
      <span style={{ color: 'var(--iflyv-danger-primary)' }}>删除</span>
    </Menu.Item>
  </Menu>
)

const contentColumns = [
  { title: '', dataIndex: 'name', width: 160 },
  {
    title: '',
    dataIndex: 'status',
    width: 160,
    render: (_: unknown, row: { status: string }) => <Tag className="tag-success">{row.status}</Tag>,
  },
  { title: '', dataIndex: 'date', width: 180 },
  {
    title: '',
    dataIndex: 'amount',
    width: 160,
    align: 'right' as const,
    render: (value: number) => `¥${value.toLocaleString()}`,
  },
  {
    title: '',
    dataIndex: 'op',
    render: () => (
      <>
        <Button className="table-operation" icon={<SquarePen size={14} strokeWidth={2} />}>
          编辑
        </Button>
        <Button className="table-operation" icon={<Eye size={14} strokeWidth={2} />}>
          查看
        </Button>
        <Dropdown overlay={moreMenu} className="table-operation">
          <Tooltip title="更多操作" placement="top" mouseEnterDelay={0.3}>
            <span className="table-operation__more">
              <MoreHorizontal size={16} strokeWidth={2} />
            </span>
          </Tooltip>
        </Dropdown>
      </>
    ),
  },
]

const contentRow = [
  { key: '1', name: '作业测练', status: '已完成', date: '03-10 13:00', amount: 1200 },
]

export default function CellDemo() {
  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Cell 单元格 —— antd 3 适配层</h2>

      <div className="demo-block">
        <p className="demo-label">表头单元格</p>
        <p className="demo-desc">三类：复选框 / 纯文字 / 带排序</p>
        <Table
          columns={headerColumns}
          dataSource={[]}
          rowSelection={{}}
          pagination={false}
          locale={{ emptyText: ' ' }}
          style={{ width: '100%' }}
        />
      </div>

      <div className="demo-block">
        <p className="demo-label">内容单元格</p>
        <p className="demo-desc">六类：复选框 / 纯文字 / 标签 / 日期 / 数值 / 操作</p>
        <Table
          columns={contentColumns}
          dataSource={contentRow}
          rowSelection={{}}
          showHeader={false}
          pagination={false}
          style={{ width: '100%' }}
        />
      </div>
    </section>
  )
}
