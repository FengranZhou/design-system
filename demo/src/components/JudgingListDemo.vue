<template>
  <section id="judging-list" class="demo-section">
    <div class="jc-head">
      <h2 class="demo-section__title">Checklist 检查清单</h2>
      <el-tooltip
        content="复制一段指令，粘到目标项目的 Claude Code 窗口即可自动评分"
        placement="top"
        :show-after="300"
      >
        <el-button @click="copyPrompt">
          <template #icon>
            <component :is="copied ? Check : Copy" :size="16" :stroke-width="2" />
          </template>
          {{ copied ? '已复制' : '复制评分指令' }}
        </el-button>
      </el-tooltip>
    </div>

    <!-- 按类别分组陈列。设计措辞为主、技术措辞为辅 -->
    <div v-for="group in groups" :key="group.cat" class="demo-block">
      <p class="demo-label">{{ group.cat }}（{{ group.items.length }} 条）</p>
      <div class="jc-table">
        <div class="jc-row jc-row--head">
          <span>条目</span>
          <span>分级</span>
          <span>详见规范</span>
        </div>
        <div v-for="item in group.items" :key="item.id" class="jc-row">
          <span class="jc-row__title">
            {{ item.designTitle }}
            <!-- 技术措辞是规则的准确表述，供研发与评分器对齐口径。
                 两者相同（即该条无独立设计措辞）时不重复显示 -->
            <span v-if="item.title !== item.designTitle" class="jc-row__tech">{{ item.title }}</span>
          </span>
          <span>
            <el-tag :type="levelTagType(item.level)" round>{{ levelText(item.level) }}</el-tag>
          </span>
          <span class="jc-row__source">{{ specName(item.source) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Copy, Check } from 'lucide-vue-next'
// 条目由 scripts/extract-rules.mjs 从 references 的 @rule 标记提取——
// 本页只渲染，不重复定义任何规则（单一数据源）。
import rules from '../../../design-spec/references/rules.generated.json'
import { levelText, levelTagType, specName } from './judging-criteria'

const data = rules

/** 按类别顺序分组（空类别不出现） */
const groups = computed(() =>
  data.categoryOrder
    .map((cat) => ({ cat, items: data.items.filter((i) => i.cat === cat) }))
    .filter((g) => g.items.length > 0),
)

// 一键复制给下游项目的 CC：让它自己跑评分脚本并按报告修。
// 指令里写清「脚本在哪、扫什么、怎么解读结果」——下游 CC 拿到就能执行，
// 不必先去翻文档搞清评分体系。
const copied = ref(false)

const AUDIT_PROMPT = `请对本项目做设计规范评分。

执行：
  node <设计系统仓库路径>/scripts/audit-page.mjs <你的源码目录>

例如设计系统与本项目同级时：
  node ../xiaoya3.0设计规范/scripts/audit-page.mjs ./src

评分口径：
- 分级 必须(权重3) / 应该(2) / 建议(1)，得分 = 通过权重 ÷ 适用权重 × 100
- 85 分合格；但只要有一条「必须」未通过即判不合规，与总分无关
- 报告末尾的「需人工确认」项机器判不了，不计入分数，需你逐条看代码判断

拿到报告后：
1. 先修全部「必须」项——每条报告都给了 hint（该怎么改）与规范出处
2. 「应该」项若确有理由保留，在代码里该行上方写注释说明：
   // audit-ignore <理由>
3. 修完重跑脚本确认，并把「需人工确认」清单逐条核对后回报结论

规则详情见设计系统仓库的 design-spec/references/judging-criteria.md。`

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(AUDIT_PROMPT)
    copied.value = true
    ElMessage({ message: '评分指令已复制，粘到目标项目的 CC 窗口即可', type: 'success', showClose: true })
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    ElMessage({ message: '复制失败，请检查浏览器剪贴板权限', type: 'error', showClose: true })
  }
}
</script>

<style scoped>
/* 标题与操作按钮同排：按钮靠右。
   标题自带的下边距被清掉以便与按钮对齐，故由本容器接管这段间距 */
.jc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--iflyv-spacing-4);
  margin-bottom: var(--iflyv-spacing-4);
}

.jc-head .demo-section__title {
  margin-bottom: 0;
}

/* 条目表：本页私有展示件，非复刻 el-table */
.jc-table {
  display: flex;
  flex-direction: column;
}

.jc-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 80px 140px;
  gap: var(--iflyv-spacing-4);
  align-items: center;
  padding: var(--iflyv-spacing-3) 0;
  border-bottom: 1px solid var(--iflyv-border-default);
}

.jc-row:last-child {
  border-bottom: none;
}

.jc-row--head {
  font: var(--iflyv-font-label-primary);
  color: var(--iflyv-text-3);
  padding-top: 0;
}

.jc-row__title {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-1);
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-1);
}

.jc-row__tech {
  font: var(--iflyv-font-body-min);
  color: var(--iflyv-text-3);
}

.jc-row__source {
  font: var(--iflyv-font-body-min);
  color: var(--iflyv-text-3);
  overflow-wrap: anywhere;
}
</style>
