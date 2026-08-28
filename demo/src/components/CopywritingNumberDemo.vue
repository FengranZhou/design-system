<template>
  <section id="copywriting-number" class="demo-section demo-plain">
    <h2 class="demo-section__title">Number 数字</h2>

    <div class="demo-block">
      <p class="demo-label">格式规则</p>
      <ul class="rule-list">
        <li>
          <span class="rule-list__tag">千分位</span>
          <span class="rule-list__desc">整数部分从右往左每 3 位打一个英文逗号</span>
          <span class="rule-list__eg">如 <code>5,082</code> / <code>1,234,567</code></span>
        </li>
        <li>
          <span class="rule-list__tag rule-list__tag--muted">小数</span>
          <span class="rule-list__desc">小数部分原样保留、不分组</span>
          <span class="rule-list__eg">如 <code>12,345.67</code></span>
        </li>
        <li>
          <span class="rule-list__tag rule-list__tag--muted">单位</span>
          <span class="rule-list__desc">单位不属于数字本体，由展示处单独拼接</span>
          <span class="rule-list__eg">如 <code>5,082 次</code></span>
        </li>
      </ul>
    </div>

    <div class="demo-block">
      <p class="demo-label">实例对照</p>
      <div class="num-table">
        <div class="num-table__head">
          <span>场景</span>
          <span>原始数值</span>
          <span>展示结果</span>
        </div>
        <div v-for="item in samples" :key="item.scene" class="num-table__row">
          <span class="num-table__scene">{{ item.scene }}</span>
          <span class="num-table__raw">{{ item.raw }}</span>
          <span class="num-table__result">{{ formatNumber(item.raw) }}</span>
        </div>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">格式化函数（参考实现）</p>
      <pre class="code-block"><code>{{ formatterSource }}</code></pre>
    </div>
  </section>
</template>

<script setup lang="ts">
// 通用数字格式化：引用源头唯一实现（design-spec/utils/format-number.ts），本 demo 只做展示，不重复定义规则
import { formatNumber } from '../../../design-spec/utils/format-number'

// 演示样本：四位起有逗号 / 更大位数 / 小数 / 负数 / 不足四位
const samples = [
  { scene: '四位整数', raw: 5082 },
  { scene: '七位整数', raw: 1234567 },
  { scene: '带小数', raw: 12345.67 },
  { scene: '负数', raw: -5082 },
  { scene: '不足四位', raw: 325 },
]

const formatterSource = `function formatNumber(input) {
  const raw = String(input).replace(/,/g, '').trim()
  if (!/^[-+]?\\d+(\\.\\d+)?$/.test(raw)) return String(input)  // 非纯数字原样返回
  const [intPart, decPart] = raw.replace(/^\\+/, '').split('.')
  const sign = intPart.startsWith('-') ? '-' : ''
  const digits = sign ? intPart.slice(1) : intPart
  // 从右往左每 3 位打一个逗号
  const grouped = digits.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')
  return sign + grouped + (decPart !== undefined ? '.' + decPart : '')
}`
</script>

<style scoped lang="scss">
/* 版式与「Time 通用时间」保持同款（规则清单 / 实例对照表 / 参考实现代码块） */
.rule-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-3);

  li {
    display: flex;
    align-items: center;
    gap: var(--iflyv-spacing-3);
    flex-wrap: wrap;
  }

  &__tag {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 var(--iflyv-spacing-2);
    border-radius: var(--iflyv-radius-xs);
    background: var(--iflyv-brand-bg);
    color: var(--iflyv-brand-text);
    font: var(--iflyv-font-body-min);

    &--muted {
      background: var(--iflyv-bg-inset);
      color: var(--iflyv-text-2);
    }
  }

  &__desc {
    color: var(--iflyv-text-1);
    font: var(--iflyv-font-body-sub);
  }

  &__eg {
    color: var(--iflyv-text-3);
    font: var(--iflyv-font-body-sub);
  }

  code {
    font-family: var(--iflyv-font-family-number);
    padding: var(--iflyv-spacing-0_5) var(--iflyv-spacing-1_5);
    border-radius: var(--iflyv-radius-xs);
    background: var(--iflyv-bg-inset);
    color: var(--iflyv-text-1);
  }
}

.num-table {
  border: 1px solid var(--iflyv-border-default);
  border-radius: var(--iflyv-radius-md);
  overflow: hidden;
  max-width: 560px;

  &__head,
  &__row {
    display: grid;
    grid-template-columns: 120px 1fr 1fr;
    align-items: center;
  }

  &__head {
    background: var(--iflyv-bg-inset);
    color: var(--iflyv-text-2);
    font: var(--iflyv-font-body-min);

    span {
      padding: var(--iflyv-spacing-2) var(--iflyv-spacing-3);
    }
  }

  &__row {
    border-top: 1px solid var(--iflyv-border-subtle);

    span {
      padding: var(--iflyv-spacing-3);
    }
  }

  &__scene {
    color: var(--iflyv-text-2);
    font: var(--iflyv-font-body-sub);
  }

  &__raw {
    color: var(--iflyv-text-3);
    font-family: var(--iflyv-font-family-number);
  }

  &__result {
    color: var(--iflyv-text-1);
    font-family: var(--iflyv-font-family-number);
    font-weight: var(--iflyv-font-weight-semibold);
  }
}

.code-block {
  background: var(--iflyv-bg-inset);
  border: 1px solid var(--iflyv-border-default);
  border-radius: var(--iflyv-radius-md);
  padding: var(--iflyv-spacing-4);
  /* audit-ignore 代码块的横向溢出源于内容本身不换行，非「区域内容超出要滚动」；
     包 el-scrollbar 会破坏 <pre> 的选中复制行为 */
  overflow-x: auto;
  max-width: 720px;

  code {
    font-family: var(--iflyv-font-family-number);
    font: var(--iflyv-font-body-min);
    line-height: var(--iflyv-line-height-20);
    color: var(--iflyv-text-1);
    white-space: pre;
  }
}
</style>
