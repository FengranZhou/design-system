<template>
  <section id="judging-intro" class="demo-section">
    <h2 class="demo-section__title">Overview 说明</h2>

    <div class="demo-block">
      <p class="demo-label">这份清单是什么</p>
      <p class="jc-intro">
        接入本设计系统的项目 / 页面，验收时按这些标准检查。实际检查由脚本自动跑，本页用于查阅有哪些标准。
      </p>

      <!-- 规模 2 张 + 分级 3 张，同一行 5 张卡片。
           统一三层结构：标签 → 大数字+单位 → 说明；分级卡的数字取对应语义色 -->
      <div class="jc-cards">
        <div class="jc-card">
          <el-tag class="el-tag--gray">检查类别</el-tag>
          <p class="jc-card__figure">
            <span class="jc-card__num">{{ categoryCount }}</span>
            <span class="jc-card__unit">个</span>
          </p>
          <p class="jc-card__desc">覆盖令牌、组件、模式、文案各层。</p>
        </div>
        <div class="jc-card">
          <el-tag class="el-tag--gray">检查标准</el-tag>
          <p class="jc-card__figure">
            <span class="jc-card__num">{{ data.total }}</span>
            <span class="jc-card__unit">条</span>
          </p>
          <p class="jc-card__desc">全部来自已定义的规范条文。</p>
        </div>
        <div v-for="lv in levelCards" :key="lv.level" class="jc-card">
          <el-tag :type="levelTagType(lv.level)">{{ levelText(lv.level) }}</el-tag>
          <p class="jc-card__figure">
            <span class="jc-card__num" :class="`is-${lv.level.toLowerCase()}`">{{ countOf(lv.level) }}</span>
            <span class="jc-card__unit">条</span>
          </p>
          <p class="jc-card__desc">{{ lv.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 条目由 scripts/extract-rules.mjs 从 references 的 @rule 标记提取——
// 本页只渲染，不重复定义任何规则（单一数据源）。
import rules from '../../../design-spec/references/rules.generated.json'
import { levelCards, levelText, levelTagType } from './judging-criteria'

const data = rules

const countOf = (level: string) => data.items.filter((i) => i.level === level).length
const categoryCount = data.categoryOrder.filter(
  (cat) => data.items.some((i) => i.cat === cat),
).length
</script>

<style scoped>
/* 本页仅排版留白与概览卡片（本页私有展示件），不触碰任何组件外观 */
.jc-intro {
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-2);
  margin-bottom: var(--iflyv-spacing-4);
}

/* 概览与分级：同一行 5 张白底卡片（灰底卡片上的一层纵深）。
   卡内三行用 subgrid 继承父级行轨道，五张卡的同层自然对齐 */
.jc-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: auto auto auto;
  gap: var(--iflyv-spacing-3);
}

.jc-card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
  justify-items: start;
  gap: var(--iflyv-spacing-3);
  padding: var(--iflyv-spacing-5) var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-md);
}

.jc-card__figure {
  display: flex;
  align-items: baseline;
  gap: var(--iflyv-spacing-1);
}

.jc-card__num {
  /* 语义复合令牌整套用，不拆开自拼字阶 */
  font: var(--iflyv-font-number-display);
  color: var(--iflyv-text-1);
}

/* 分级卡的数字取对应语义色，与标签同源 */
.jc-card__num.is-must {
  color: var(--iflyv-danger-primary);
}

.jc-card__num.is-should {
  color: var(--iflyv-warning-primary);
}

.jc-card__num.is-may {
  color: var(--iflyv-info-primary);
}

.jc-card__unit {
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-3);
}

.jc-card__desc {
  font: var(--iflyv-font-body-min);
  color: var(--iflyv-text-2);
}
</style>
