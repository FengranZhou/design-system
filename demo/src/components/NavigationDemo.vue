<template>
  <section id="navigation" class="demo-section">
    <h2 class="demo-section__title">Navigation 导航组件</h2>

    <!-- Tabs 三级（页面级 / 大模块级 / 小模块级）合并为一块，由「级别」分段切换 class。
         级别是三选一具名类型 → 用 radio-button；页面级=.tabs-page、大模块级=默认、小模块级=.tabs-sub。 -->
    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">Tabs 标签页</p>
        <el-tabs v-model="tabsActive" :class="tabsLevelClass">
          <el-tab-pane
            v-for="item in tabsItems"
            :key="item.name"
            :label="item.label"
            :name="item.name"
            :disabled="item.disabled"
          />
        </el-tabs>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="tabsConfigForm" label-width="auto">
          <el-form-item label="级别">
            <el-radio-group v-model="tabsLevel">
              <el-radio value="page">页面级</el-radio>
              <el-radio value="module">大模块级</el-radio>
              <el-radio value="sub">小模块级</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <!-- Tabs + 数字徽标：同样三级合并，由「级别」分段切换（.tab-count 数字徽标在各级都保留） -->
    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">Tabs 标签页 + 数字</p>
        <el-tabs v-model="tabsCountActive" :class="tabsCountLevelClass">
          <el-tab-pane
            v-for="item in tabsCountItems"
            :key="item.name"
            :name="item.name"
          >
            <template #label><span class="tab-label-count">{{ item.label }}<span class="tab-count">{{ item.count }}</span></span></template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="tabsCountConfigForm" label-width="auto">
          <el-form-item label="级别">
            <el-radio-group v-model="tabsCountLevel">
              <el-radio value="page">页面级</el-radio>
              <el-radio value="module">大模块级</el-radio>
              <el-radio value="sub">小模块级</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block">
      <p class="demo-label">Breadcrumb 面包屑</p>
      <div class="demo-row">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>项目管理</el-breadcrumb-item>
          <el-breadcrumb-item>项目详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Dropdown 下拉菜单</p>
      <p class="demo-desc">下拉面板本身（菜单项 / 分隔线 / 禁用项 / hover）。触发器形态多样（按钮见 Button 章节），此处用轻量文字触发。</p>
      <div class="demo-row">
        <el-dropdown @visible-change="dropdownVisible = $event">
          <span class="dropdown-trigger">
            更多操作
            <ChevronDown
              :size="14" :stroke-width="2"
              class="dropdown-caret"
              :class="{ 'is-expanded': dropdownVisible }"
            />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>编辑</el-dropdown-item>
              <el-dropdown-item>复制</el-dropdown-item>
              <el-dropdown-item>移动</el-dropdown-item>
              <el-dropdown-item divided disabled>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 步骤条</p>
      <el-steps :active="1" align-center>
        <el-step title="提交申请" description="填写表单信息" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 竖向步骤条</p>
      <el-steps :active="1" direction="vertical" style="height: 240px;">
        <el-step title="提交申请" description="填写表单信息并提交" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 简洁模式（simple · 3步）</p>
      <el-steps :active="1" simple>
        <el-step title="提交申请" />
        <el-step title="审核中" />
        <el-step title="审核通过" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 简洁模式（simple · 5步）</p>
      <el-steps :active="2" simple>
        <el-step title="需求收集" />
        <el-step title="方案设计" />
        <el-step title="专家评审" />
        <el-step title="修订完善" />
        <el-step title="发布实施" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 简洁模式（simple · 7步）</p>
      <el-steps :active="3" simple>
        <el-step title="提交申请" />
        <el-step title="院系初审" />
        <el-step title="教务复核" />
        <el-step title="专家评审" />
        <el-step title="修订反馈" />
        <el-step title="终审批准" />
        <el-step title="归档备案" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Anchor 锚点</p>
      <div class="demo-row">
        <el-anchor direction="horizontal">
          <el-anchor-link href="#navigation" title="导航组件" />
          <el-anchor-link href="#data-display" title="数据展示" />
          <el-anchor-link href="#form" title="表单组件" />
          <el-anchor-link href="#feedback" title="反馈组件" />
        </el-anchor>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Pagination 分页</p>
      <div class="demo-row">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="80"
          layout="prev, pager, next, sizes, jumper"
        />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Pagination 分页（小型）</p>
      <div class="demo-row">
        <el-pagination
          v-model:current-page="currentPageSm"
          :page-size="10"
          :total="80"
          small
          layout="prev, pager, next"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

// —— Tabs 三级合并：级别 → class + tab 项集合的映射 ——
// 级别 class：页面级 .tabs-page、大模块级 默认（无 class）、小模块级 .tabs-sub（外观归 el-theme 源头）
const LEVEL_CLASS = { page: 'tabs-page', module: '', sub: 'tabs-sub' } as const
// 三级共用同一套 tab 项：文案即状态名（选中项/未选中项/禁用项），级别只切外观不切项。
const TABS_ITEMS = [
  { label: '选中项', name: 'a' },
  { label: '未选中项', name: 'b' },
  { label: '禁用项', name: 'c', disabled: true },
]
// 带数字徽标版本：状态名 + 各自 count
const TABS_COUNT_ITEMS = [
  { label: '选中项', name: 'a', count: 5 },
  { label: '未选中项', name: 'b', count: 12 },
  { label: '禁用项', name: 'c', count: 3, disabled: true },
]

// 无数字块：级别切 class（tab 项固定为状态名三项）
const tabsItems = TABS_ITEMS
const tabsLevel = ref<'page' | 'module' | 'sub'>('page')
const tabsConfigForm = reactive({ tabsLevel })
const tabsLevelClass = computed(() => LEVEL_CLASS[tabsLevel.value])
const tabsActive = ref('a')

// 带数字块：级别切 class（tab 项固定为状态名三项 + 数字徽标）
const tabsCountItems = TABS_COUNT_ITEMS
const tabsCountLevel = ref<'page' | 'module' | 'sub'>('page')
const tabsCountConfigForm = reactive({ tabsCountLevel })
const tabsCountLevelClass = computed(() => LEVEL_CLASS[tabsCountLevel.value])
const tabsCountActive = ref('a')

// Dropdown 展开态：驱动触发器箭头翻转
const dropdownVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const currentPageSm = ref(1)
</script>

<style scoped>
/* Dropdown 轻量文字触发器（纯本页装扮：本 demo 的触发器排版，走令牌；面板外观归 el-theme 源头） */
.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--iflyv-spacing-1);
  color: var(--iflyv-text-1);
  cursor: pointer;
}
.dropdown-trigger:hover {
  color: var(--iflyv-brand-primary);
}
/* 箭头翻转（展开时 180°+ 过渡）已归源头约定 .dropdown-caret（dropdown.scss），
   demo 只传展开真值 .is-expanded，不在此重复定义。 */

/* 纯 demo 布局：补 tab 头与内容区间距（不改组件外观，仅调本演示的排版留白） */
.demo-block :deep(.el-tabs__header) {
  margin-bottom: var(--iflyv-spacing-4);
}

/* Tabs 块：左示例 + 右配置卡横向布局（与 Input / FormControl 配置式范式一致，纯本页排版，不含组件外观） */
.control-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.control-showcase__main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .control-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}

/* 配置卡：白底 + 细边框区分层次（与 Input 一致） */
.config-card {
  flex: 0 1 auto;
  width: auto;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
</style>
