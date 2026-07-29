<template>
  <section id="copywriting-time" class="demo-section">
    <h2 class="demo-section__title">Time 通用时间</h2>

    <div class="demo-block">
      <p class="demo-label">格式规则</p>
      <ul class="rule-list">
        <li>
          <span class="rule-list__tag">本年内</span>
          <span class="rule-list__desc">省略年份，展示为 <code>MM-DD HH:mm</code></span>
          <span class="rule-list__eg">如 <code>03-25 13:00</code></span>
        </li>
        <li>
          <span class="rule-list__tag">非本年</span>
          <span class="rule-list__desc">展示完整年份，格式 <code>YYYY-MM-DD HH:mm</code></span>
          <span class="rule-list__eg">如 <code>2024-12-21 13:00</code></span>
        </li>
        <li>
          <span class="rule-list__tag rule-list__tag--muted">精度</span>
          <span class="rule-list__desc">时间根据需求展示，若需要则精确至分钟即可（不展示秒）</span>
        </li>
      </ul>
    </div>

    <div class="demo-block">
      <p class="demo-label">实例对照</p>
      <div class="time-table">
        <div class="time-table__head">
          <span>场景</span>
          <span>原始时间</span>
          <span>展示结果</span>
        </div>
        <div v-for="item in samples" :key="item.raw" class="time-table__row">
          <span class="time-table__scene">{{ item.scene }}</span>
          <span class="time-table__raw">{{ item.raw }}</span>
          <span class="time-table__result">{{ formatTime(item.raw) }}</span>
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
// 通用时间格式化：引用源头唯一实现（design-spec/utils/format-time.ts），本 demo 只做展示，不重复定义规则
import { formatTime } from '../../../design-spec/utils/format-time'

// 演示样本：一个本年内、一个跨年
const currentYear = new Date().getFullYear()
const samples = [
  { scene: '本年内', raw: `${currentYear}-03-25 13:00` },
  { scene: '非本年', raw: '2024-12-21 13:00' },
]

const formatterSource = `function formatTime(input) {
  const d = new Date(input)
  const pad = (n) => String(n).padStart(2, '0')
  const M = pad(d.getMonth() + 1), D = pad(d.getDate())
  const h = pad(d.getHours()), m = pad(d.getMinutes())
  const isThisYear = d.getFullYear() === new Date().getFullYear()
  return isThisYear
    ? \`\${M}-\${D} \${h}:\${m}\`          // 03-25 13:00
    : \`\${d.getFullYear()}-\${M}-\${D} \${h}:\${m}\`  // 2024-12-21 13:00
}`
</script>

<style scoped lang="scss">
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
    padding: 2px 6px;
    border-radius: var(--iflyv-radius-xs);
    background: var(--iflyv-bg-inset);
    color: var(--iflyv-text-1);
  }
}

.time-table {
  border: 1px solid var(--iflyv-border-default);
  border-radius: var(--iflyv-radius-md);
  overflow: hidden;
  max-width: 560px;

  &__head,
  &__row {
    display: grid;
    grid-template-columns: 100px 1fr 1fr;
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
  overflow-x: auto;
  max-width: 720px;

  code {
    font-family: var(--iflyv-font-family-number);
    font-size: var(--iflyv-font-size-12);
    line-height: var(--iflyv-line-height-20);
    color: var(--iflyv-text-1);
    white-space: pre;
  }
}
</style>
