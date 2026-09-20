<template>
  <section id="tab-bar" class="demo-section">
    <h2 class="demo-section__title">TabBar 标签页
      <CopyToCC anchor="tab-bar" :values="configForm" />
    </h2>

    <div class="demo-block">
      <p class="demo-desc">
        页内分区切换。与直接写标签页的区别只有一点：<strong>单项文案太长时自动收成省略号，鼠标悬停出全称</strong>。
        分区名来自业务数据、由用户自己命名、或接口返回时长度不可控，用它兜住。
      </p>

      <div class="tab-bar-demo__stage">
        <div class="toolbar">
          <div class="toolbar__left">
            <TabBar
              v-model="active"
              :tabs="tabs"
              :level="configForm.level"
              :max-label-width="configForm.ellipsis ? 200 : 0"
            />
          </div>
          <div class="toolbar__right">
            <el-button type="primary">图谱管理</el-button>
          </div>
        </div>
      </div>

      <p class="demo-tip">
        最后一项是超长文案。开着「单项省略」时它收成一行省略号、悬停可看全称；
        关掉则原样撑开——这正是线上「整条被撑破」的样子。
      </p>
    </div>

    <div class="demo-block">
      <p class="demo-label">配置项</p>
      <div class="tab-bar-demo__config">
        <div class="tab-bar-demo__config-row">
          <span class="tab-bar-demo__config-label">层级</span>
          <el-radio-group v-model="configForm.level">
            <el-radio value="page">页面级</el-radio>
            <el-radio value="module">模块级</el-radio>
            <el-radio value="sub">组件级</el-radio>
          </el-radio-group>
        </div>
        <div class="tab-bar-demo__config-row">
          <span class="tab-bar-demo__config-label">单项省略</span>
          <el-switch v-model="configForm.ellipsis" active-text="超长收成省略号" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CopyToCC from '../CopyToCC.vue'
import { TabBar } from '../../../../design-spec/components'

const tabs = [
  '知识图谱',
  '问题图谱',
  '能力图谱',
  '自定义知识图谱',
  '自定义能力图谱自定义能力图谱自定义能力图谱自定义能力图谱',
]
const active = ref('知识图谱')

const configForm = ref<{ level: 'page' | 'module' | 'sub'; ellipsis: boolean }>({
  level: 'page',
  ellipsis: true,
})
</script>

<style scoped>
/* 纯本页排版：给演示台一个受限宽度，好让「撑破 / 收住」的对比看得出来
   （不限宽则页面很宽时超长项也放得下，演示不出问题） */
.tab-bar-demo__stage {
  max-width: 720px;
  overflow: hidden;
}

/* 配置卡：与其它带配置项的 demo 同一版式（见 design-spec/CLAUDE.md 配置式组件范式） */
.tab-bar-demo__config {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-4);
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.tab-bar-demo__config-row {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-3);
}
.tab-bar-demo__config-label {
  min-width: 72px;
  color: var(--iflyv-text-2);
  font: var(--iflyv-font-body-sub);
}
.demo-tip {
  margin-top: var(--iflyv-spacing-3);
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
</style>
