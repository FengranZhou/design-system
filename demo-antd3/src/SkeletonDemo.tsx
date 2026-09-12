import { Skeleton } from 'antd'

export default function SkeletonDemo() {
  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Skeleton 骨架屏 —— antd 3 适配层</h2>
      <div className="demo-block">
        <p className="demo-desc">
          可以被「加载」完全代替，但是在可用的场景下可以比 Spin 提供更好的视觉效果和用户体验。
        </p>
        <div className="skeleton-panel">
          <Skeleton active title={false} paragraph={{ rows: 3 }} />
        </div>
      </div>
    </section>
  )
}
