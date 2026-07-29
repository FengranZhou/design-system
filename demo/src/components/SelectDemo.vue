<template>
  <section id="select" class="demo-section">
    <h2 class="demo-section__title">Select 选择器</h2>

    <!-- 基础选择器：可清除 / 可搜索作为正交配置项（右侧开关），与 Input 一致 -->
    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">基础选择器</p>
        <div class="demo-row">
          <el-select
            v-model="selectValue"
            :clearable="clearable"
            :filterable="filterable"
            placeholder="请选择"
            style="width: 240px"
          >
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select placeholder="禁用状态" disabled style="width: 240px">
            <el-option label="选项一" value="1" />
          </el-select>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <!-- 可清除开关 + 选型指引是一个整体字段单元：hint 放在同一 el-form-item 的 content 内，
               整体与「可搜索」之间保持表单模式标准字段间距 24px（form.scss 源头定义，不覆盖）。 -->
          <el-form-item label="可清除">
            <div class="config-field">
              <!-- switch 套与 label 等高（component-size）的居中行，使其与 label 垂直居中对齐 -->
              <div class="config-field__row">
                <el-switch v-model="clearable" />
              </div>
              <p class="config-card__hint">{{ clearableHint }}</p>
            </div>
          </el-form-item>
          <el-form-item label="可搜索">
            <el-switch v-model="filterable" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">多选</p>
        <div class="demo-row">
          <el-select v-model="multiSelect" multiple :clearable="multiClearable" :filterable="multiFilterable" collapse-tags collapse-tags-tooltip :max-collapse-tags="2" placeholder="多选模式" style="width: 240px">
            <el-option v-for="item in departments" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select multiple placeholder="禁用状态" disabled style="width: 240px">
            <el-option label="选项一" value="1" />
          </el-select>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="multiConfigForm" label-width="auto">
          <el-form-item label="可清除">
            <el-switch v-model="multiClearable" />
          </el-form-item>
          <el-form-item label="可搜索">
            <el-switch v-model="multiFilterable" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">分组选择</p>
        <div class="demo-row">
          <el-select v-model="groupSelect" :multiple="groupMultiple" :clearable="groupClearable" :filterable="groupFilterable" collapse-tags collapse-tags-tooltip placeholder="请选择" style="width: 240px">
            <el-option-group v-for="group in groupOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
            </el-option-group>
          </el-select>
          <el-select placeholder="禁用状态" disabled style="width: 240px">
            <el-option label="选项一" value="1" />
          </el-select>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="groupConfigForm" label-width="auto">
          <el-form-item label="多选">
            <el-switch v-model="groupMultiple" />
          </el-form-item>
          <el-form-item label="可清除">
            <el-switch v-model="groupClearable" />
          </el-form-item>
          <el-form-item label="可搜索">
            <el-switch v-model="groupFilterable" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">树形选择器</p>
        <div class="demo-row">
          <el-tree-select
            v-model="treeSelectValue"
            :data="treeSelectData"
            :clearable="treeClearable"
            :filterable="treeFilterable"
            :multiple="treeMultiple"
            :placeholder="treeMultiple ? '多选树形选择' : '单选树形选择'"
            check-strictly
            collapse-tags
            collapse-tags-tooltip
            style="width: 240px"
          />
          <el-tree-select :data="treeSelectData" placeholder="禁用状态" disabled style="width: 240px" />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="treeConfigForm" label-width="auto">
          <el-form-item label="多选">
            <el-switch v-model="treeMultiple" />
          </el-form-item>
          <el-form-item label="可清除">
            <el-switch v-model="treeClearable" />
          </el-form-item>
          <el-form-item label="可搜索">
            <el-switch v-model="treeFilterable" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">级联选择器</p>
        <div class="demo-row">
          <!-- 级联的「可搜索」也叫 filterable（EP 原生，可跨级搜索叶子节点）；多选通过 props.multiple -->
          <!-- :key 随 multiple 变化强制重建：EP 级联仅初始化时读一次 props.multiple，动态切换需重建组件 -->
          <el-cascader :key="cascaderMultiple ? 'multi' : 'single'" v-model="cascaderValue" :options="cascaderOptions" :props="{ multiple: cascaderMultiple }" :clearable="cascaderClearable" :filterable="cascaderFilterable" collapse-tags collapse-tags-tooltip :max-collapse-tags="1" placeholder="请选择" style="width: 280px" />
          <el-cascader :options="cascaderOptions" placeholder="禁用状态" disabled style="width: 280px" />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="cascaderConfigForm" label-width="auto">
          <el-form-item label="多选">
            <el-switch v-model="cascaderMultiple" />
          </el-form-item>
          <el-form-item label="可清除">
            <el-switch v-model="cascaderClearable" />
          </el-form-item>
          <el-form-item label="可搜索">
            <el-switch v-model="cascaderFilterable" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

// 基础选择器配置项：可清除 clearable + 可搜索 filterable 正交开关（el-form 需要 model 对象）
const clearable = ref(false)
const filterable = ref(false)
const configForm = reactive({ clearable, filterable })
// 不可清除时默认选中「全部部门」语义项（呼应 hint：有默认语义项时清空会丢语义，故不可清除）；
// 可清除时置空为「未选择」。随开关切换同步默认值，让示例与选型指引一致。
const selectValue = ref('all')
watch(clearable, (v) => { selectValue.value = v ? '' : 'all' }, { immediate: true })
// 可清除选型指引：可清除与否取决于「空状态是否是合法有语义的状态」
const clearableHint = computed(() =>
  clearable.value
    ? '无默认值、靠外部标签说明时用：空 = 未选择，清空语义完整'
    : '有默认语义项（如「全部类型」）时用：清空会丢失语义，故不可清除'
)
const multiSelect = ref([])

// 多选 / 分组 / 级联各自的可清除 clearable + 可搜索 filterable 正交开关（均为 EP 原生能力）
const multiClearable = ref(false)
const multiFilterable = ref(false)
const multiConfigForm = reactive({ multiClearable, multiFilterable })
// 分组：多选开关 + 可清除 / 可搜索，单选/多选时值类型切换
const groupSelect = ref<string | string[]>('')
const groupMultiple = ref(false)
const groupClearable = ref(false)
const groupFilterable = ref(false)
watch(groupMultiple, (v) => { groupSelect.value = v ? [] : '' })
const groupConfigForm = reactive({ groupMultiple, groupClearable, groupFilterable })
// 级联：多选开关 + 可清除 / 可搜索，单选/多选时值类型切换
const cascaderValue = ref<string | string[]>([])
const cascaderMultiple = ref(false)
const cascaderClearable = ref(false)
const cascaderFilterable = ref(false)
watch(cascaderMultiple, (v) => { cascaderValue.value = v ? [] : '' })
const cascaderConfigForm = reactive({ cascaderMultiple, cascaderClearable, cascaderFilterable })
// 树形选择器：多选开关 + 可清除 / 可搜索，单选/多选时值类型切换（string | string[]）
const treeSelectValue = ref<string | string[]>('')
const treeMultiple = ref(false)
const treeClearable = ref(false)
const treeFilterable = ref(false)
// 多选开关切换时清空值，避免单选 string 和多选 string[] 类型冲突
watch(treeMultiple, (v) => { treeSelectValue.value = v ? [] : '' })
const treeConfigForm = reactive({ treeMultiple, treeClearable, treeFilterable })

// 部门列表：多选等场景直接用这份纯列表（不含语义默认项）
const departments = [
  { value: '1', label: '设计部' },
  { value: '2', label: '研发部' },
  { value: '3', label: '产品部' },
  { value: '4', label: '市场部' },
  { value: '5', label: '运营部' },
  { value: '6', label: '财务部' },
  { value: '7', label: '人事部' },
  { value: '8', label: '客服部' },
]

// 基础选择器：首项为默认语义项，不可清除时叫「全部部门」（有明确语义、清空会丢义）、
// 可清除时叫「全部」（更简洁，空 = 未选择，清空语义完整）。多选不需要该语义项。
const options = computed(() => [
  { value: 'all', label: clearable.value ? '全部' : '全部部门' },
  ...departments,
])

const groupOptions = [
  {
    label: '技术部门',
    options: [
      { value: 'fe', label: '前端开发' },
      { value: 'be', label: '后端开发' },
      { value: 'qa', label: '测试工程' },
    ],
  },
  {
    label: '业务部门',
    options: [
      { value: 'pd', label: '产品设计' },
      { value: 'op', label: '运营管理' },
      { value: 'mk', label: '市场营销' },
    ],
  },
]

const cascaderOptions = [
  { value: 'frontend', label: '前端开发', children: [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
  ]},
  { value: 'backend', label: '后端开发', children: [
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
  ]},
]

const treeSelectData = [
  {
    value: 'dev',
    label: '研发中心',
    children: [
      { value: 'fe', label: '前端组' },
      { value: 'be', label: '后端组' },
      { value: 'qa', label: '测试组' },
    ],
  },
  {
    value: 'design',
    label: '设计中心',
    children: [
      { value: 'ui', label: 'UI 组' },
      { value: 'ux', label: 'UX 组' },
    ],
  },
]
</script>

<style scoped>
/* 每个 demo 块用 bg-card 大卡片做区分（与 Input 一致，本页排版走令牌）。
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

/* 基础选择器块：左示例 + 右配置卡横向布局（与 Input 一致，纯排版不含组件外观） */
.input-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.input-showcase__main { flex: 1; min-width: 0; }
.input-showcase .demo-row { flex-wrap: wrap; }

@media (max-width: 1100px) {
  .input-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}

/* 配置卡：白底 + 细边框，与示例区分层次 */
.config-card {
  flex: 0 1 auto;
  width: 220px;
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
/* 可清除字段单元：开关 + hint 竖排为一个整体，整体与「可搜索」的间距
   由 form-item 源头 24px 承担（不覆盖 form-item margin，避免局部私货）。 */
.config-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
/* switch 行：与 label 等高（组件统一高度）并垂直居中，使 switch 与「可清除」label 中线对齐 */
.config-field__row {
  display: flex;
  align-items: center;
  height: var(--el-component-size);
}
/* 选型指引说明：浅色小字，紧跟开关下方（上距 4px） */
.config-card__hint {
  margin: var(--iflyv-spacing-1) 0 0;
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
</style>
