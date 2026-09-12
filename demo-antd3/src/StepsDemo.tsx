import { Steps } from 'antd'

const { Step } = Steps

export default function StepsDemo() {
  return (
    <section className="demo-section">
      <h2 className="demo-section__title">Steps 轻量步骤条 —— antd 3 适配层</h2>
      <div className="demo-block">
        <p className="demo-desc">
          引导用户按照流程完成任务的导航条，当任务复杂或者存在先后关系时，将其分解成一系列步骤，从而简化任务。
        </p>
        <Steps className="steps-simple" current={1} labelPlacement="horizontal">
          <Step title="提交申请" />
          <Step title="审核中" />
          <Step title="审核通过" />
        </Steps>
      </div>
    </section>
  )
}
