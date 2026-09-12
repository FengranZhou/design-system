import { Anchor } from 'antd'

const { Link } = Anchor

export default function AnchorDemo() {
  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Anchor 锚点 —— antd 3 适配层</h2>
      <div className="demo-block">
        <p className="demo-desc">需要展现当前页面上可供跳转的锚点链接，以及快速在锚点之间跳转。</p>
        <div className="demo-row">
          <Anchor affix={false}>
            <Link href="#anchor-demo-a" title="锚点" />
            <Link href="#anchor-demo-b" title="轻量步骤条" />
            <Link href="#anchor-demo-c" title="下拉菜单" />
            <Link href="#anchor-demo-d" title="输入框" />
          </Anchor>
        </div>
      </div>
    </section>
  )
}
