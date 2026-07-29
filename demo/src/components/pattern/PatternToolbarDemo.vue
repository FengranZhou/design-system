<template>
  <section id="pattern-toolbar" class="demo-section">
    <h2 class="demo-section__title">Toolbar 工具栏布局</h2>

    <!-- 配置项卡片（最上）：标题（4 选 1 + 显隐）/ 筛选（三项各显隐）/ 操作（两项各显隐），
         统管下方标准范例的实时布局（自动体现三分支左右分配）。本身即用「表单布局模式」实现。 -->
    <div class="pattern-card">
      <p class="pattern-card__title">配置项</p>
      <!-- 三区卡片（标题区 / 筛选区 / 操作区），与模式规则的三区视觉一致（淡蓝胶囊标题 + 卡片）。
           每张卡内是该区配置表单，按 form-pattern 走：el-form 纵排、label-position=right、label 宽度统一、控件左对齐。 -->
      <div class="anatomy">
        <div class="zone">
          <span class="zone__tag">标题区</span>
          <el-form label-position="right" label-width="72px">
            <el-form-item label="标题">
              <el-switch v-model="showTitle" />
            </el-form-item>
            <el-form-item label="标题类型">
              <el-select v-model="titleType" :disabled="!showTitle" style="width: 100%">
                <el-option v-for="t in titleTypes" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <div class="zone">
          <span class="zone__tag">筛选区</span>
          <el-form label-position="right" label-width="88px">
            <el-form-item label="组件级 tab">
              <el-switch v-model="showTab" />
            </el-form-item>
            <el-form-item label="下拉选择器">
              <el-switch v-model="showSelect" />
            </el-form-item>
            <el-form-item label="搜索框">
              <el-switch v-model="showSearch" />
            </el-form-item>
          </el-form>
        </div>

        <div class="zone">
          <span class="zone__tag">操作区</span>
          <el-form label-position="right" label-width="72px">
            <el-form-item label="次按钮">
              <el-switch v-model="showSecondaryBtn" />
            </el-form-item>
            <el-form-item label="主按钮">
              <el-switch v-model="showPrimaryBtn" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 模式规则 —— 只讲固定顺序（左右分配 / 间距等规则内化进下方标准范例，由配置项实时体现） -->
    <div class="pattern-card">
      <p class="pattern-card__title">模式规则</p>
      <p class="pattern-card__desc">
        工具栏 = 一条固定顺序 + 一套左右分配规则。
      </p>

      <!-- 三区拆解：标题区 / 筛选区 / 操作区，横向三列，每区淡色胶囊标题 + 元素清单 -->
      <div class="anatomy">
        <div v-for="z in zones" :key="z.key" class="zone">
          <span class="zone__tag">{{ z.tag }}</span>
          <ul class="zone__rules">
            <li v-for="el in z.elements" :key="el">{{ el }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 标准范例 —— 由上方配置项实时驱动，左右分配 / 顺序 / 间距等规则内化于此 -->
    <div class="pattern-card">
      <p class="pattern-card__title">标准范例</p>

      <!-- 工具栏：外层 space-between 分左右两组，组内 gap 12，内边距上下16左右24。
           每个元素按三分支 filterSide/actionSide 落在左组还是右组。
           标题为「模块级」（模块标题 / 模块级 tab 栏）时，标题更轻，工具栏 padding-bottom 收为 12（is-module-title）。 -->
      <div class="toolbar" :class="{ 'is-module-title': titleSide === 'left' && isModuleTitle }">
          <div class="toolbar__left">
            <!-- 标题：4 选 1，仅在归左时渲染 -->
            <template v-if="titleSide === 'left'">
              <h3 v-if="titleType === 'page'" class="toolbar__title">项目列表</h3>
              <h4 v-else-if="titleType === 'module'" class="toolbar__title toolbar__title--module">我的项目</h4>
              <el-tabs v-else :class="titleType === 'page-tab' ? 'tabs-page' : ''" v-model="pageTab">
                <el-tab-pane label="概览" name="overview" />
                <el-tab-pane label="统计" name="stat" />
              </el-tabs>
            </template>
            <!-- 筛选类（归左时） -->
            <template v-if="filterSide === 'left'">
              <el-tabs v-if="showTab" class="tabs-sub" v-model="view">
                <el-tab-pane label="全部" name="all" />
                <el-tab-pane label="进行中" name="doing" />
                <el-tab-pane label="已完成" name="done" />
              </el-tabs>
              <el-select v-if="showSelect" v-model="type" placeholder="全部类型" style="width: 140px">
                <el-option label="全部类型" value="" />
                <el-option label="课程" value="course" />
                <el-option label="作业" value="homework" />
              </el-select>
              <SearchMini v-if="showSearch" v-model="keyword" placeholder="搜索项目" />
            </template>
            <!-- 操作类（归左时，仅分支③） -->
            <template v-if="actionSide === 'left'">
              <el-button v-if="showSecondaryBtn">导出</el-button>
              <el-button v-if="showPrimaryBtn" type="primary">
                <template #icon><Plus :size="16" :stroke-width="2" /></template>
                新建项目
              </el-button>
            </template>
          </div>

          <div v-if="hasRight" class="toolbar__right">
            <!-- 筛选类（归右时） -->
            <template v-if="filterSide === 'right'">
              <el-tabs v-if="showTab" class="tabs-sub" v-model="view">
                <el-tab-pane label="全部" name="all" />
                <el-tab-pane label="进行中" name="doing" />
                <el-tab-pane label="已完成" name="done" />
              </el-tabs>
              <el-select v-if="showSelect" v-model="type" placeholder="全部类型" style="width: 140px">
                <el-option label="全部类型" value="" />
                <el-option label="课程" value="course" />
                <el-option label="作业" value="homework" />
              </el-select>
              <SearchMini v-if="showSearch" v-model="keyword" placeholder="搜索项目" />
            </template>
            <!-- 操作类（归右时，分支①②） -->
            <template v-if="actionSide === 'right'">
              <el-button v-if="showSecondaryBtn">导出</el-button>
              <el-button v-if="showPrimaryBtn" type="primary">
                <template #icon><Plus :size="16" :stroke-width="2" /></template>
                新建项目
              </el-button>
            </template>
          </div>
        </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { SearchMini } from '../../../../design-spec/components'

// —— 模式规则：三区拆解（标题区 / 筛选区 / 操作区，每区可放的元素类型）——
const zones = [
  { key: 'title', tag: '标题区', elements: ['页面标题', '模块标题', '页面级 tab 栏', '模块级 tab 栏'] },
  { key: 'filter', tag: '筛选区', elements: ['组件级 tab 栏', '下拉选择器', '搜索框'] },
  { key: 'action', tag: '操作区', elements: ['次按钮', '主按钮'] },
]

// —— 标准范例：配置项 ——
const titleTypes = [
  { value: 'page', label: '页面标题' },
  { value: 'module', label: '模块标题' },
  { value: 'page-tab', label: '页面级 tab 栏' },
  { value: 'module-tab', label: '模块级 tab 栏' },
]
const showTitle = ref(true)
const titleType = ref('page')
const showTab = ref(true)
const showSelect = ref(true)
const showSearch = ref(true)
const showSecondaryBtn = ref(true)
const showPrimaryBtn = ref(true)

// 交互态
const view = ref('all')
const type = ref('')
const keyword = ref('')
const pageTab = ref('overview')

// 模块级标题（模块标题 / 模块级 tab 栏）：比页面级更轻，工具栏下边距收为 12
const isModuleTitle = computed(() => titleType.value === 'module' || titleType.value === 'module-tab')

// —— 三分支左右分配 —— 顺序恒定：标题→组件级tab→下拉→搜索→次按钮→主按钮
const hasTitle = computed(() => showTitle.value)
const hasFilter = computed(() => showTab.value || showSelect.value || showSearch.value)
const hasAction = computed(() => showSecondaryBtn.value || showPrimaryBtn.value)

// 每类元素落哪侧（'left' | 'right' | 'none'）
const titleSide = computed(() => (hasTitle.value ? 'left' : 'none'))
const filterSide = computed(() => {
  if (!hasFilter.value) return 'none'
  return hasTitle.value ? 'right' : 'left'        // ① 有标题→右；② 无标题→左
})
const actionSide = computed(() => {
  if (!hasAction.value) return 'none'
  if (hasTitle.value) return 'right'              // ①
  if (hasFilter.value) return 'right'             // ②
  return 'left'                                   // ③
})
const hasRight = computed(() => filterSide.value === 'right' || actionSide.value === 'right')
</script>

<style scoped>
/* 纯本页排版，全部走令牌。上下两块 bg-card 大卡片（与其它 Pattern demo 一致）。 */
.pattern-card {
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.pattern-card + .pattern-card { margin-top: var(--iflyv-spacing-6); }
.pattern-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
.pattern-card__desc {
  margin: 0 0 var(--iflyv-spacing-6);
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}

/* 配置项三区卡片内的表单：末项去掉底部 margin，避免卡片底部多余留白 */
.zone :deep(.el-form-item:last-child) { margin-bottom: 0; }

/* 三区拆解：横向三列等宽，窄屏换行（与 List Item 的 .anatomy / .zone 一致） */
.anatomy {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--iflyv-spacing-4);
}
@media (max-width: 1100px) {
  .anatomy { grid-template-columns: 1fr; }
}
.zone {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-3);
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-lg);
}
.zone__tag {
  align-self: flex-start;
  padding: var(--iflyv-spacing-1) var(--iflyv-spacing-3);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-info-bg);
  color: var(--iflyv-info-primary);
  font: var(--iflyv-font-title-component);
}
.zone__rules {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-2);
  margin: 0;
  padding-left: var(--iflyv-spacing-6);
  list-style: disc;
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-body-sub);
}


/* 标准范例工具栏：外层 space-between 分左右两组，组内 gap 12，内边距上下16左右24 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--iflyv-spacing-3);
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-6);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-lg);
}
/* 标题为「模块级」（模块标题 / 模块级 tab 栏）时：标题层级更轻，下边距收为 12（spacing-3） */
.toolbar.is-module-title {
  padding-bottom: var(--iflyv-spacing-3);
}
.toolbar__left,
.toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-3);
}
.toolbar__title {
  margin: 0;
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-page);
}
.toolbar__title--module {
  font: var(--iflyv-font-title-module);
}

/* tab 在工具栏内无内容面板，清掉 EP header 默认下边距 */
.toolbar :deep(.el-tabs__header) {
  margin-bottom: 0;
}
</style>
