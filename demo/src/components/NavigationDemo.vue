<template>
  <section id="navigation" class="demo-section">
    <h2 class="demo-section__title">Navigation 导航组件</h2>

    <!-- Tabs 三级（页面级 / 模块级 / 组件级）合并为一块，由「级别」分段切换 class。
         级别是三选一具名类型 → 用 radio-button；页面级=.tabs-page、模块级=默认、组件级=.tabs-sub。 -->
    <div class="demo-block control-showcase" :class="{ 'is-outlined': tabsLevel === 'sub' }">
      <div class="control-showcase__main">
        <p class="demo-label">标签页</p>
        <el-tabs v-model="tabsActive" :class="tabsLevelClass">
          <el-tab-pane
            v-for="item in tabsItems"
            :key="item.name"
            :name="item.name"
            :disabled="item.disabled"
          >
            <template #label>
              <span class="tab-label-count">{{ item.label }}<span v-if="tabsShowCount" class="tab-count">{{ item.count }}</span></span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="tabsConfigForm" label-width="auto">
          <el-form-item label="级别">
            <el-radio-group v-model="tabsLevel">
              <el-radio value="page">页面级</el-radio>
              <el-radio value="module">模块级</el-radio>
              <el-radio value="sub">组件级</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="数字">
            <el-switch v-model="tabsShowCount" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">面包屑</p>
        <!-- 一个带返回箭头 + 深层折叠的面包屑：8 级路径按「当前层级」截断到第 N 级，
             超过 max-items 时中间折进 `…`（hover 展开）；每项带 to 可点击跳转（demo 里跳转打日志示意）。 -->
        <div class="demo-row">
          <Breadcrumb
            :items="breadcrumbItems"
            :max-items="4"
            :back-disabled="breadcrumbItems.length <= 1"
            @back="onBreadcrumbBack"
            @item-click="onBreadcrumbItemClick"
          />
        </div>
      </div>
      <aside class="config-card config-card--breadcrumb">
        <p class="config-card__title">配置项</p>
        <el-form :model="breadcrumbConfigForm" label-width="auto">
          <el-form-item label="当前层级">
            <el-select v-model="breadcrumbCurrent" style="width: 100%">
              <el-option
                v-for="i in BREADCRUMB_FULL.length"
                :key="i"
                :label="`第 ${i} 级`"
                :value="i"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block">
      <p class="demo-label">下拉菜单</p>
      <p class="demo-desc">常与"触发器"（按钮、图标、下拉选择器等）组合使用。</p>
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

    <!-- ⏸ 暂停展示：步骤条（align-center）。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">步骤条</p>
      <el-steps :active="1" align-center>
        <el-step title="提交申请" description="填写表单信息" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>
    -->

    <!-- ⏸ 暂停展示：竖向步骤条。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">竖向步骤条</p>
      <el-steps :active="1" direction="vertical" style="height: 240px;">
        <el-step title="提交申请" description="填写表单信息并提交" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>
    -->

    <div class="demo-block">
      <p class="demo-label">轻量步骤条</p>
      <el-steps :active="1" simple>
        <el-step title="提交申请" />
        <el-step title="审核中" />
        <el-step title="审核通过" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">锚点</p>
      <div class="demo-row">
        <el-anchor direction="horizontal">
          <el-anchor-link href="#navigation" title="导航组件" />
          <el-anchor-link href="#data-display" title="数据展示" />
          <el-anchor-link href="#form" title="表单组件" />
          <el-anchor-link href="#feedback" title="反馈组件" />
        </el-anchor>
      </div>
    </div>

    <!-- 分页：常规 / 小型 二选一，由右侧配置项切换（small 属性 + layout 精简）。
         常规=页面/弹窗等多数场景（带 sizes/jumper 完整功能）；小型=内嵌子模块等较小容器（仅翻页）。 -->
    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">分页</p>
        <div class="demo-row">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="80"
            :small="paginationSize === 'small'"
            :layout="paginationSize === 'small' ? 'prev, pager, next' : 'prev, pager, next, sizes, jumper'"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form label-width="auto">
          <el-form-item label="尺寸">
            <!-- 控件 + 释义包进纵向 config-field，使释义落到单选下方（与 Select demo 一致，不覆盖 el-form-item__content 容器） -->
            <div class="config-field">
              <el-radio-group v-model="paginationSize">
                <el-radio value="normal">常规</el-radio>
                <el-radio value="small">小型</el-radio>
              </el-radio-group>
              <p class="config-card__hint">{{ paginationSizeHint }}</p>
            </div>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { Breadcrumb } from '../../../design-spec/components'

// 面包屑：8 级全量路径，每项带 to（可点击跳转；demo 里跳转仅打日志示意，真实项目走 vue-router）。
// 「当前层级」配置项把路径截断到第 N 级（第 N 项即当前页、不可点）；超过 max-items(4) 时中间折进 `…`。
const BREADCRUMB_FULL = [
  { label: '首页', to: '/' },
  { label: '计算机学院', to: '/college' },
  { label: '数据结构', to: '/college/ds' },
  { label: '第三章 树', to: '/college/ds/ch3' },
  { label: '3.2 二叉树', to: '/college/ds/ch3/binary-tree' },
  { label: '课后作业', to: '/college/ds/ch3/binary-tree/homework' },
  { label: '学生提交列表', to: '/college/ds/ch3/binary-tree/homework/submissions' },
  { label: '学生提交详情', to: '/college/ds/ch3/binary-tree/homework/submissions/detail' },
]

// 当前选中层级（1-based，默认末级=8）；面包屑按此截断到前 N 项
const breadcrumbCurrent = ref(BREADCRUMB_FULL.length)
const breadcrumbItems = computed(() => BREADCRUMB_FULL.slice(0, breadcrumbCurrent.value))
const breadcrumbConfigForm = computed(() => ({ current: breadcrumbCurrent.value }))

// 点返回 = 回退一级（当前层级 -1）；到只剩首页时箭头禁用。真实项目里 @back 通常接 router.back()。
const onBreadcrumbBack = () => {
  if (breadcrumbCurrent.value > 1) breadcrumbCurrent.value -= 1
}
// 点击某一路径项（含 `…` 下拉里的项）：定位到该层级 = 把「当前层级」设为该项层级，面包屑随之截断。
// 真实项目里会用 item.to 走 vue-router 跳转；此处 index 即该项在全量路径中的 0-based 下标。
const onBreadcrumbItemClick = (_item: { label: string; to?: unknown }, index: number) => {
  breadcrumbCurrent.value = index + 1
}

// —— Tabs 三级合并：级别 → class 映射 ——
// 级别 class：页面级 .tabs-page、模块级 默认（无 class）、组件级 .tabs-sub（外观归 el-theme 源头）
const LEVEL_CLASS = { page: 'tabs-page', module: '', sub: 'tabs-sub' } as const
// 三级共用同一套 tab 项：文案即状态名（选中项/未选中项/禁用项）+ 数字徽标，级别只切外观不切项。
// 数字徽标由「显示数字」开关（tabsShowCount）控制显隐。
const tabsItems = [
  { label: '选中项', name: 'a', count: 5 },
  { label: '未选中项', name: 'b', count: 12 },
  { label: '禁用项', name: 'c', count: 3, disabled: true },
]
const tabsLevel = ref<'page' | 'module' | 'sub'>('page')
const tabsShowCount = ref(false)
const tabsConfigForm = reactive({ tabsLevel, tabsShowCount })
const tabsLevelClass = computed(() => LEVEL_CLASS[tabsLevel.value])
const tabsActive = ref('a')

// Dropdown 展开态：驱动触发器箭头翻转
const dropdownVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
// 分页尺寸：常规（多数场景，带 sizes/jumper）/ 小型（较小容器，仅翻页）
const paginationSize = ref<'normal' | 'small'>('normal')
// 随所选尺寸变化的释义（与 component-interaction.md 分页尺寸选型口径一致）
const paginationSizeHint = computed(() =>
  paginationSize.value === 'small'
    ? '适用于较小的容器内部，如内嵌子模块等'
    : '适用于多数场景，如页面、弹窗等'
)
</script>

<style scoped>
/* 每个 demo 块用 bg-card 大卡片做区分（与 Select / Input 一致，本页排版走令牌）。
   卡间垂直间距统一 24（spacing-6）；覆盖全局 .demo-block 自带的 48px margin，避免叠加。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.demo-section .demo-block + .demo-block {
  margin-top: var(--iflyv-spacing-6);
}

/* 级别选中「组件级」时：整个大卡片从灰底切换为白底 + 描边，与组件级 tab 外观呼应 */
.demo-section .demo-block.is-outlined {
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
}

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

/* Tabs 示例无内容面板，清掉 EP header 默认下边距 */
.demo-block :deep(.el-tabs__header) {
  margin-bottom: 0;
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
/* 控件 + 释义纵向容器：使释义换行落到控件下方（与 Select demo 一致，避免覆盖 el-form-item__content） */
.config-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
/* 释义说明：浅色小字，紧跟单选下方（上距 4px），随所选项变化（与 Select/Input demo 一致） */
.config-card__hint {
  margin: var(--iflyv-spacing-1) 0 0;
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
/* 面包屑配置卡内容窄（仅一个下拉），固定一档合理宽度，避免被内容撑得过窄 */
.config-card--breadcrumb { width: 280px; }
@media (max-width: 1100px) {
  .config-card--breadcrumb { width: 100%; }
}
</style>
