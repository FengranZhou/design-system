/**
 * 组件目录（catalog）—— 「复制到 CC 使用」功能的数据源
 * ============================================================================
 *
 * 这份数据供 liaison 扩展的「组件」面板消费：用户在真实页面上选好插入点位、
 * 从面板里挑一个组件并填好配置 → 拼成一段 prompt → 复制 → 粘贴进下游项目的
 * CC 窗口 → CC 按设计规范落地。
 *
 * ## 每个条目在回答三个问题
 *
 * 1. **是什么**（`name` / `group` / `desc`）—— 面板里怎么展示、怎么分组、怎么搜。
 * 2. **怎么配**（`fields`）—— 选中组件后弹出的配置表单有哪些字段。字段不是
 *    EP 全量 props，而是**这个组件在真实业务里必须当场决定的那几项**（如
 *    Input 的 label 和宽度、Select 的可否清除）。多了是噪音，少了 CC 得猜。
 * 3. **怎么落地**（`readRefs` / `mustRules` / `snippet`）—— 下游 CC 拿到 prompt
 *    后要读哪份规范、有哪些不读也必须遵守的硬约束、可照抄的骨架长什么样。
 *
 * ## 为什么是手写而非从规范自动提取
 *
 * `references/` 是给人读的自然语言，机器提取"哪些是可配项、档位有哪几个"噪音
 * 大。当前阶段先手写高频组件跑通全链路、验证交互，**数据格式按"脚本可生成"
 * 设计**（纯数据、无逻辑），将来补自动提取不用推翻重来。
 *
 * ## 维护纪律（重要）
 *
 * 本文件是**规范的投影**，不是第二个源头。`mustRules` 里的每一条都必须能在
 * `references/` 里找到出处，且口径一致——改了规范就要回来对账，否则会长出
 * 「规范说 A、面板说 B」的裂缝（正是 CLAUDE.md「改一处 = 扫全部引用」要防的）。
 *
 * `readRefs` 路径相对 `design-spec/`，与 CLAUDE.md 触发表的路径口径一致。
 */

/** 面板分组，与 demo 左侧导航保持一致（demo/src/App.vue） */
export const GROUPS = [
  { key: 'general', label: '通用' },
  { key: 'nav', label: '导航' },
  { key: 'input', label: '数据录入' },
  { key: 'display', label: '数据展示' },
  { key: 'feedback', label: '反馈' },
  { key: 'business', label: '业务组件' },
  { key: 'chart', label: '图表' },
]

/**
 * 字段类型说明（供面板渲染配置表单）
 *   text    单行文本框            { key, label, type:'text', placeholder?, default? }
 *   select  下拉单选              { key, label, type:'select', options:[{value,label,hint?}], default }
 *   switch  开关                  { key, label, type:'switch', default:false, hint? }
 *   number  数字（可带预设建议）   { key, label, type:'number', default?, suggestions?:[{value,label}], hint? }
 */

export const COMPONENTS = [
  // ── 数据录入 ──────────────────────────────────────────────────────────────
  {
    id: 'form-item-input',
    anchor: 'input',
    name: 'Input 输入框',
    group: 'input',
    desc: '表单里的文本输入字段（含标签）',
    keywords: ['输入框', 'input', '文本框', '表单项', 'form-item', '搜索', '搜索框', 'search'],
    readRefs: [
      'references/patterns/form-pattern.md',
      'references/component-interaction.md（按钮图标 / 输入框图标 段）',
    ],
    mustRules: [
      '骨架用 el-form + el-form-item，禁 div/flex 手拼',
      'label-width="auto"，禁手写固定 label-width',
      '表单一律单列，禁多列 Z 字动线',
      '本地可判的校验失焦即报，错误提示放输入域下方、文案两段式（错在哪+怎么改）',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：专业', default: '' },
      { key: 'placeholder', label: '占位符', type: 'text', placeholder: '如：请输入专业', default: '' },
      {
        key: 'width',
        label: '宽度',
        type: 'number',
        default: 320,
        suggestions: [
          { value: 120, label: '120 · 极短（验证码/年龄/数量）' },
          { value: 200, label: '200 · 短（手机号/学号/日期）' },
          { value: 320, label: '320 · 中（姓名/班级/科目）' },
          { value: 0, label: '撑满 · 长度不可预期（标题/地址/备注）' },
        ],
        hint: '宽度是"内容长度的暗示"，按字段语义取值；档位是参考不是硬约束，接近即可',
      },
      { key: 'required', label: '必填', type: 'switch', default: false },
      { key: 'textarea', label: '多行文本域', type: 'switch', default: false },
    ],
    snippet: ({ label, placeholder, width, required, textarea, clearable, showWordLimit }) => {
      const w = Number(width) === 0 ? 'width: 100%' : `width: ${width}px`
      const type = textarea ? '\n    type="textarea"\n    :rows="3"' : ''
      const extra = (clearable ? '\n    clearable' : '') +
        (showWordLimit ? '\n    maxlength="50"\n    show-word-limit' : '')
      return `<el-form-item label="${label || '标签'}"${required ? ' prop="field" :rules="[{ required: true, message: \'请输入' + (label || '') + '\', trigger: \'blur\' }]"' : ''}>
  <el-input
    v-model="form.field"${type}
    placeholder="${placeholder || '请输入' + (label || '')}"${extra}
    style="${w}"
  />
</el-form-item>`
    },
  },

  {
    id: 'search-mini',
    anchor: 'search-mini',
    variantOf: 'input',
    name: 'SearchMini 搜索框',
    group: 'input',
    desc: '实时搜索输入框（常驻展开 / 收起态）',
    keywords: ['搜索框', 'search', 'searchmini', '搜索', '查找'],
    readRefs: [
      'design-spec/components/SearchMini/SearchMini.vue（顶部速查注释）',
    ],
    mustRules: [
      '一律用业务组件 SearchMini，禁 el-input prefix-icon 复刻',
      '核心功能用常驻展开形态（collapsed=false），非核心用收起态（collapsed=true）',
      '默认实时搜索；若因技术限制，则点击图标 / Enter 触发',
    ],
    instanceFields: [
      { key: 'placeholder', label: '占位符', type: 'text', placeholder: '如：搜索课程', default: '搜索' },
      { key: 'collapsed', label: '默认收起', type: 'switch', default: false, hint: '核心功能关闭，非核心功能开启' },
    ],
    snippet: ({ placeholder, collapsed, searchCollapsed }) => {
      const c = collapsed || searchCollapsed
      return `<SearchMini
  v-model="searchQuery"
  placeholder="${placeholder || '搜索'}"${c ? '\n  collapsed' : ''}
  @search="handleSearch"
/>

<!-- 脚本 -->
import { SearchMini } from '<path>/design-spec/components'`
    },
  },

  {
    id: 'form-item-input-number',
    anchor: 'input-number',
    variantOf: 'input',
    name: 'InputNumber 数字输入框',
    group: 'input',
    desc: '数字输入（带增减按钮）',
    keywords: ['数字输入框', 'inputnumber', '数字', '计数器', '数量'],
    readRefs: ['references/patterns/form-pattern.md'],
    mustRules: [
      '一律用 el-input-number，禁 el-input type="number"',
      '必传 :min / :max 限制范围',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：数量', default: '' },
      { key: 'min', label: '最小值', type: 'number', default: 1 },
      { key: 'max', label: '最大值', type: 'number', default: 100 },
    ],
    snippet: ({ label, min, max }) => {
      return `<el-form-item label="${label || '标签'}">
  <el-input-number
    v-model="form.field"
    :min="${min ?? 1}"
    :max="${max ?? 100}"
    placeholder="请输入"
  />
</el-form-item>`
    },
  },

  {
    id: 'form-item-textarea',
    anchor: 'textarea',
    variantOf: 'input',
    name: 'Textarea 文本域',
    group: 'input',
    desc: '多行文本输入',
    keywords: ['文本域', 'textarea', '多行输入', '备注', '描述'],
    readRefs: ['references/patterns/form-pattern.md'],
    mustRules: [
      '用 el-input type="textarea" :rows="3"，不是单独的 el-textarea',
      '字数提示用 maxlength + show-word-limit 组合',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：备注', default: '' },
      { key: 'placeholder', label: '占位符', type: 'text', placeholder: '如：请输入备注', default: '' },
      { key: 'showWordLimit', label: '字数提示', type: 'switch', default: false },
      {
        key: 'width',
        label: '宽度',
        type: 'number',
        default: 400,
        suggestions: [
          { value: 320, label: '320 · 中' },
          { value: 400, label: '400 · 宽' },
          { value: 0, label: '撑满' },
        ],
      },
    ],
    snippet: ({ label, placeholder, showWordLimit, width, textareaWordLimit }) => {
      const w = Number(width) === 0 ? 'width: 100%' : `width: ${width}px`
      const limit = showWordLimit || textareaWordLimit
      const extra = limit ? '\n    maxlength="200"\n    show-word-limit' : ''
      return `<el-form-item label="${label || '标签'}">
  <el-input
    v-model="form.field"
    type="textarea"
    :rows="3"
    placeholder="${placeholder || '请输入多行文本'}"${extra}
    style="${w}"
  />
</el-form-item>`
    },
  },

  {
    id: 'form-item-select',
    anchor: 'select',
    name: 'Select 选择器',
    group: 'input',
    desc: '从固定选项里选（单选 / 多选）',
    keywords: ['选择器', 'select', '下拉', '下拉框', '多选'],
    readRefs: [
      'references/patterns/select-pattern.md',
      'references/component-interaction.md（Select 多选 段）',
    ],
    mustRules: [
      '选项 >5 用 Select；≤5 且需并排比较时 Radio 更好',
      '有默认语义项 → 不可清除；无默认值 → 可清除',
      '多选默认加 collapse-tags collapse-tags-tooltip :max-collapse-tags="2"',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：所属学科', default: '' },
      { key: 'placeholder', label: '占位符', type: 'text', placeholder: '如：请选择学科', default: '' },
      { key: 'multiple', label: '多选', type: 'switch', default: false },
      {
        key: 'clearable',
        label: '可清除',
        type: 'switch',
        default: true,
        hint: '有默认语义项时应关闭（清空后无意义）',
      },
      { key: 'filterable', label: '可搜索', type: 'switch', default: false, hint: '选项较多时开启' },
      {
        key: 'width',
        label: '宽度',
        type: 'number',
        default: 320,
        suggestions: [
          { value: 200, label: '200 · 短' },
          { value: 320, label: '320 · 中' },
          { value: 0, label: '撑满' },
        ],
      },
    ],
    snippet: ({ label, placeholder, multiple, clearable, filterable, width, groupMultiple }) => {
      multiple = multiple || groupMultiple
      const w = Number(width) === 0 ? 'width: 100%' : `width: ${width}px`
      const attrs = [
        multiple ? 'multiple\n    collapse-tags\n    collapse-tags-tooltip\n    :max-collapse-tags="2"' : '',
        clearable ? 'clearable' : '',
        filterable ? 'filterable' : '',
      ].filter(Boolean).join('\n    ')
      return `<el-form-item label="${label || '标签'}">
  <el-select
    v-model="form.field"
    placeholder="${placeholder || '请选择' + (label || '')}"${attrs ? '\n    ' + attrs : ''}
    style="${w}"
  >
    <el-option label="选项一" value="1" />
    <el-option label="选项二" value="2" />
  </el-select>
</el-form-item>`
    },
  },

  {
    id: 'form-item-select-group',
    anchor: 'select-group',
    variantOf: 'select',
    name: 'SelectGroup 分组选择器',
    group: 'input',
    desc: '选项按类别分组的下拉选择',
    keywords: ['分组选择', 'select', 'group', '选择器', '分组', '下拉'],
    readRefs: [
      'references/patterns/select-pattern.md',
      'references/component-interaction.md（Select 多选 段）',
    ],
    mustRules: [
      '用 el-select + el-option-group 结构',
      '多选默认加 collapse-tags collapse-tags-tooltip :max-collapse-tags="2"',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：所属部门', default: '' },
      { key: 'multiple', label: '多选', type: 'switch', default: false },
      { key: 'clearable', label: '可清除', type: 'switch', default: true },
      { key: 'filterable', label: '可搜索', type: 'switch', default: false },
    ],
    snippet: ({ label, multiple, clearable, filterable, groupMultiple }) => {
      const m = multiple || groupMultiple
      const attrs = [
        m ? 'multiple\n    collapse-tags\n    collapse-tags-tooltip\n    :max-collapse-tags="2"' : '',
        clearable ? 'clearable' : '',
        filterable ? 'filterable' : '',
      ].filter(Boolean).join('\n    ')
      return `<el-form-item label="${label || '标签'}">
  <el-select
    v-model="form.field"
    placeholder="请选择"${attrs ? '\n    ' + attrs : ''}
    style="width: 240px"
  >
    <el-option-group label="技术部门">
      <el-option label="前端开发" value="fe" />
      <el-option label="后端开发" value="be" />
    </el-option-group>
    <el-option-group label="业务部门">
      <el-option label="产品设计" value="pd" />
      <el-option label="运营管理" value="op" />
    </el-option-group>
  </el-select>
</el-form-item>`
    },
  },

  {
    id: 'form-item-tree-select',
    anchor: 'tree-select',
    variantOf: 'select',
    name: 'TreeSelect 树形选择器',
    group: 'input',
    desc: '树形结构选项的下拉选择',
    keywords: ['树形选择器', 'treeselect', 'tree', '树形', '层级选择'],
    readRefs: ['references/component-interaction.md（TreeSelect 段）'],
    mustRules: [
      '用 el-tree-select，必传 :data 和 check-strictly',
      '多选必加 collapse-tags collapse-tags-tooltip',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：组织架构', default: '' },
      { key: 'multiple', label: '多选', type: 'switch', default: false },
      { key: 'clearable', label: '可清除', type: 'switch', default: true },
      { key: 'filterable', label: '可搜索', type: 'switch', default: false },
    ],
    snippet: ({ label, multiple, clearable, filterable, treeMultiple }) => {
      const m = multiple || treeMultiple
      const attrs = [
        m ? ':multiple="true"' : '',
        clearable ? 'clearable' : '',
        filterable ? 'filterable' : '',
        m ? 'collapse-tags\n    collapse-tags-tooltip' : '',
      ].filter(Boolean).join('\n    ')
      return `<el-form-item label="${label || '标签'}">
  <el-tree-select
    v-model="form.field"
    :data="treeData"
    check-strictly${attrs ? '\n    ' + attrs : ''}
    placeholder="请选择"
    style="width: 240px"
  />
</el-form-item>`
    },
  },

  {
    id: 'form-item-cascader',
    anchor: 'cascader',
    variantOf: 'select',
    name: 'Cascader 级联选择器',
    group: 'input',
    desc: '多级联动选择（省市区 / 类目树）',
    keywords: ['级联选择器', 'cascader', '级联', '联动', '省市区', '类目'],
    readRefs: ['references/component-interaction.md（Cascader 段）'],
    mustRules: [
      '用 el-cascader，必传 :options',
      '多选用 :props="{ multiple: true }" 而非直接传 multiple',
      '多选必加 collapse-tags collapse-tags-tooltip :max-collapse-tags="1"',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：所属类目', default: '' },
      { key: 'multiple', label: '多选', type: 'switch', default: false },
      { key: 'clearable', label: '可清除', type: 'switch', default: true },
      { key: 'filterable', label: '可搜索', type: 'switch', default: false },
    ],
    snippet: ({ label, multiple, clearable, filterable, cascaderMultiple }) => {
      const m = multiple || cascaderMultiple
      const attrs = [
        m ? ':props="{ multiple: true }"' : '',
        clearable ? 'clearable' : '',
        filterable ? 'filterable' : '',
        m ? 'collapse-tags\n    collapse-tags-tooltip\n    :max-collapse-tags="1"' : '',
      ].filter(Boolean).join('\n    ')
      return `<el-form-item label="${label || '标签'}">
  <el-cascader
    v-model="form.field"
    :options="cascaderOptions"${attrs ? '\n    ' + attrs : ''}
    placeholder="请选择"
    style="width: 280px"
  />
</el-form-item>`
    },
  },

  {
    id: 'form-item-date',
    anchor: 'date-picker',
    name: 'DatePicker 日期选择',
    group: 'input',
    desc: '日期 / 时间 / 日期区间',
    keywords: ['日期', 'date', '时间', 'picker', '区间', '日历'],
    readRefs: ['references/component-interaction.md（DatePicker 段）'],
    mustRules: [
      '必传 value-format，否则 v-model 拿到 Date 对象还要自己转',
      '区间用 type="daterange" 一个组件搞定，禁拼两个 DatePicker（丢联动校验）',
      '禁传 prefix-icon，图标按 type 自动分流 Calendar/Clock，传了会被源头 mask 盖住',
      '展示已选日期走 formatTime（utils/format-time.ts）',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：开课日期', default: '' },
      {
        key: 'type',
        label: '类型',
        type: 'select',
        default: 'date',
        options: [
          { value: 'date', label: '日期' },
          { value: 'daterange', label: '日期区间' },
          { value: 'datetime', label: '日期时间' },
          { value: 'month', label: '月份' },
        ],
      },
      { key: 'width', label: '宽度', type: 'number', default: 320, suggestions: [{ value: 200, label: '200' }, { value: 320, label: '320' }, { value: 0, label: '撑满' }] },
    ],
    snippet: ({ label, type, width, withDateTime }) => {
      const w = Number(width) === 0 ? 'width: 100%' : `width: ${width}px`
      // demo 的「时间」开关＝要不要精确到时分秒，等价于 date → datetime
      if (withDateTime && type === 'date') type = 'datetime'
      const fmt = type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : type === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'
      const range = type === 'daterange'
      return `<el-form-item label="${label || '标签'}">
  <el-date-picker
    v-model="form.field"
    type="${type}"
    value-format="${fmt}"${range ? '\n    start-placeholder="开始日期"\n    end-placeholder="结束日期"' : '\n    placeholder="选择日期"'}
    style="${w}"
  />
</el-form-item>`
    },
  },

  {
    id: 'form-item-daterange',
    anchor: 'date-range',
    variantOf: 'date-picker',
    name: 'DateRange 日期范围选择器',
    group: 'input',
    desc: '选择起止日期区间（可带时间）',
    keywords: ['日期范围', 'daterange', '区间', '起止日期', '时间段'],
    readRefs: ['references/component-interaction.md（DatePicker 段）'],
    mustRules: [
      '必传 value-format，否则 v-model 拿到 Date 对象还要自己转',
      '用 type="daterange" 一个组件搞定，禁拼两个 DatePicker（丢联动校验）',
      '带时间用 type="datetimerange"',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：报名时间', default: '' },
      { key: 'withTime', label: '时间', type: 'switch', default: false, hint: '是否精确到时分秒' },
    ],
    snippet: ({ label, withTime }) => {
      const type = withTime ? 'datetimerange' : 'daterange'
      const fmt = withTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
      const w = withTime ? '460px' : '360px'
      const sp = withTime ? '开始时间' : '开始日期'
      const ep = withTime ? '结束时间' : '结束日期'
      return `<el-form-item label="${label || '标签'}">
  <el-date-picker
    v-model="form.field"
    type="${type}"
    value-format="${fmt}"
    range-separator="至"
    start-placeholder="${sp}"
    end-placeholder="${ep}"
    style="width: ${w}"
  />
</el-form-item>`
    },
  },

  {
    id: 'form-item-time',
    anchor: 'time-picker',
    variantOf: 'date-picker',
    name: 'TimePicker 时间选择器',
    group: 'input',
    desc: '选择具体时间（时分秒）',
    keywords: ['时间选择', 'timepicker', 'time', '时间', '时分秒'],
    readRefs: ['references/component-interaction.md（DatePicker 段）'],
    mustRules: [
      '用 el-time-picker，必传 value-format="HH:mm:ss"',
      '禁传 prefix-icon',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：上课时间', default: '' },
    ],
    snippet: ({ label }) => {
      return `<el-form-item label="${label || '标签'}">
  <el-time-picker
    v-model="form.field"
    value-format="HH:mm:ss"
    placeholder="选择时间"
    style="width: 200px"
  />
</el-form-item>`
    },
  },

  {
    id: 'form-item-radio',
    anchor: 'radio',
    name: 'Radio 单选框',
    group: 'input',
    desc: '≤5 个选项、需并排比较时',
    keywords: ['单选', 'radio', '选项'],
    readRefs: ['references/patterns/select-pattern.md'],
    mustRules: [
      '>5 个选项不建议 Radio，改用 Select',
      '多个 Radio 必须用 el-radio-group 包裹',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：课程类型', default: '' },
      { key: 'options', label: '选项', type: 'text', placeholder: '逗号分隔，如：必修,选修', default: '' },
    ],
    snippet: ({ label, options, radioShowText }) => {
      const opts = (options || '选项一,选项二').split(/[,，]/).map((o) => o.trim()).filter(Boolean)
      // 关掉文字＝只留选钮（极少用，但 demo 演示了这一形态）
      const items = opts.map((o, i) => radioShowText === false
        ? `    <el-radio value="${i + 1}" />`
        : `    <el-radio value="${i + 1}">${o}</el-radio>`).join('\n')
      return `<el-form-item label="${label || '标签'}">
  <el-radio-group v-model="form.field">
${items}
  </el-radio-group>
</el-form-item>`
    },
  },

  {
    id: 'form-item-radio-button',
    anchor: 'radio-button',
    variantOf: 'radio',
    name: 'RadioButton 单选按钮组',
    group: 'input',
    desc: '以切换按钮形式呈现（一般不默认使用）',
    keywords: ['单选按钮组', 'radiobutton', '按钮组', '切换按钮', '分段控件'],
    readRefs: ['references/patterns/select-pattern.md'],
    mustRules: [
      '用 el-radio-group + el-radio-button',
      '一般不默认使用，适合工具栏切换场景（如对齐方式）',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：对齐方式', default: '' },
      { key: 'options', label: '选项', type: 'text', placeholder: '逗号分隔，如：左对齐,居中,右对齐', default: '' },
    ],
    snippet: ({ label, options }) => {
      const opts = (options || '左对齐,居中,右对齐').split(/[,，]/).map((o) => o.trim()).filter(Boolean)
      const items = opts.map((o, i) => `    <el-radio-button value="${i + 1}">${o}</el-radio-button>`).join('\n')
      return `<el-form-item label="${label || '标签'}">
  <el-radio-group v-model="form.field">
${items}
  </el-radio-group>
</el-form-item>`
    },
  },

  {
    id: 'form-item-switch',
    anchor: 'switch',
    name: 'Switch 开关',
    group: 'input',
    desc: '二值开关（立即生效的状态切换）',
    keywords: ['开关', 'switch', '二值', '启用', '禁用'],
    readRefs: ['references/component-interaction.md（Switch 段）'],
    mustRules: [
      '文字标签默认用 active-text（右侧），禁在开关外套 span 或用 el-form-item 当 label',
      'inactive-text（置左）仅当"开关左侧无内容、右侧有其他内容"时用，与 active-text 互斥',
      'inline-prompt 未启用',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：是否公开', default: '' },
      { key: 'activeText', label: '开关文字', type: 'text', placeholder: '如：公开', default: '' },
    ],
    snippet: ({ label, activeText, switchShowText, switchTextPosition }) => {
      // 文字默认走 active-text（右侧）；仅当「开关左侧无内容、右侧有其他内容」
      // 才用 inactive-text 置左。两者互斥、只配一个。
      const txt = activeText || (switchShowText ? '启用' : '')
      const attr = !txt ? ''
        : switchTextPosition === 'left'
          ? `\n    inactive-text="${txt}"`
          : `\n    active-text="${txt}"`
      return `<el-form-item label="${label || '标签'}">
  <el-switch v-model="form.field"${attr} />
</el-form-item>`
    },
  },

  // ── 通用 ──────────────────────────────────────────────────────────────────
  {
    id: 'button',
    anchor: 'button',
    name: 'Button 按钮',
    group: 'general',
    desc: '操作按钮',
    keywords: ['按钮', 'button', '操作', '提交'],
    readRefs: [
      'references/foundations.md（主按钮贴边原则）',
      'references/component-interaction.md（按钮图标 / 纯图标按钮 / 入口引导按钮 / 按钮间距 段）',
    ],
    mustRules: [
      '主按钮贴近按钮组所在容器的对齐侧边缘：右对齐→主按钮贴右，左对齐→主按钮贴左',
      '按钮加图标一律 Lucide + #icon 插槽，禁 :icon 属性',
      '入口引导箭头（「查看更多 ›」类导航入口）用 ChevronRight 挂约定 class .btn-entry，仅限 text 文本按钮，与下拉箭头互斥、尾部只挂其一',
      '按钮组间距一律父容器 flex+gap，禁写 margin（源头已清零 EP 相邻 margin）',
      '异步操作用 el-button loading 防重复提交，不要给整个区域套遮罩',
    ],
    instanceFields: [
      { key: 'text', label: '文案', type: 'text', placeholder: '如：保存', default: '' },
      {
        key: 'type',
        label: '类型',
        type: 'select',
        default: 'primary',
        options: [
          { value: 'primary', label: '主按钮', hint: '一组里只有一个' },
          { value: 'default', label: '次按钮' },
          { value: 'danger', label: '危险操作' },
          { value: 'text', label: '文字按钮', hint: '纯图标入口也用这个' },
        ],
      },
      { key: 'loading', label: '带 loading', type: 'switch', default: false, hint: '异步操作防重复点击' },
    ],
    snippet: ({ text, type, loading, showIcon, showCaret, showEntry }) => {
      const t = type === 'default' ? '' : type === 'text' ? ' text' : ` type="${type}"`
      const parts = []
      if (showIcon) parts.push('  <template #icon><Plus /></template>')
      // 尾部箭头是互斥的同一维度：下拉（ChevronDown，全类型可用）/ 入口引导（ChevronRight，仅限 text）
      const entry = showEntry && type === 'text' ? ' <ChevronRight class="btn-entry" :size="14" :stroke-width="2" />' : ''
      const caret = showCaret ? ' <ChevronDown class="btn-caret" :size="14" :stroke-width="2" />' : ''
      parts.push('  ' + (text || '按钮') + (caret || entry))
      return `<el-button${t}${loading ? ' :loading="submitting"' : ''} @click="handleClick">
${parts.join('\n')}
</el-button>`
    },
  },

  // ── 数据展示 ──────────────────────────────────────────────────────────────
  {
    id: 'data-table',
    anchor: 'table',
    name: 'DataTable 表格',
    group: 'business',
    desc: '标准表格（列配置式，操作列/冻结列内置）',
    keywords: ['表格', 'table', '列表', '数据表'],
    readRefs: [
      'references/patterns/list-item-pattern.md',
      'design-spec/components/DataTable/DataTable.vue（顶部速查注释）',
    ],
    mustRules: [
      '标准表格直接用业务组件 DataTable（列配置式），自由度不够才退回手拼 el-table',
      'import { DataTable } from \'<path>/design-spec/components\'',
    ],
    instanceFields: [
      { key: 'columns', label: '列', type: 'text', placeholder: '逗号分隔，如：姓名,学号,成绩', default: '' },
      { key: 'actions', label: '操作列', type: 'text', placeholder: '逗号分隔，如：编辑,删除', default: '' },
      { key: 'pagination', label: '带分页', type: 'switch', default: true },
    ],
    snippet: ({ columns, actions, pagination }) => {
      const cols = (columns || '姓名,学号').split(/[,，]/).map((c) => c.trim()).filter(Boolean)
      const colDefs = cols.map((c, i) => `  { prop: 'field${i + 1}', label: '${c}' },`).join('\n')
      const acts = (actions || '').split(/[,，]/).map((a) => a.trim()).filter(Boolean)
      const actDefs = acts.length
        ? `\nconst actions = [\n${acts.map((a) => `  { label: '${a}', onClick: (row) => {} },`).join('\n')}\n]`
        : ''
      return `<!-- 模板 -->
<DataTable :data="tableData" :columns="columns"${acts.length ? ' :actions="actions"' : ''} />${pagination ? `
<div style="display:flex; justify-content:space-between; align-items:center;">
  <span>共 {{ total }} 条</span>
  <el-pagination v-model:current-page="page" :total="total" layout="prev, pager, next, sizes, jumper" />
</div>` : ''}

<!-- 脚本 -->
import { DataTable } from '<path>/design-spec/components'
const columns = [
${colDefs}
]${actDefs}`
    },
  },

  {
    id: 'tag',
    anchor: 'tag',
    name: 'Tag 标签',
    group: 'display',
    desc: '状态标签 / 分类标识',
    keywords: ['标签', 'tag', '状态'],
    readRefs: ['references/component-interaction.md（Tag 段）'],
    mustRules: [
      '状态选色按"用户看到要做什么"对号入座，别凭状态名字面挑',
      '「进行中」用 warning 不用 success——success 是"结果好"不是"运行正常"',
      '一处并列 ≤3 个为宜',
    ],
    instanceFields: [
      { key: 'text', label: '文案', type: 'text', placeholder: '如：进行中', default: '' },
      {
        key: 'type',
        label: '语义',
        type: 'select',
        default: 'info',
        options: [
          { value: 'success', label: 'success · 要庆幸（已通过/已完成）' },
          { value: 'warning', label: 'warning · 要等或要盯（进行中/待审核）' },
          { value: 'danger', label: 'danger · 要补救（已驳回/失败）' },
          { value: 'info', label: 'info · 纯中性事实（未开始/草稿）' },
          { value: 'gray', label: 'gray · 已翻篇（已结束/已归档）' },
          { value: 'outline', label: 'outline · 元信息角标（「来源」这类描边标签）' },
        ],
      },
    ],
    snippet: ({ text, type, showIcon }) => {
      // 图标为正交配置项：置于内容前，图文间距在源头（Info 为占位，按语义换 lucide 图标）
      const icon = showIcon ? '<Info :size="12" :stroke-width="2" />' : ''
      const label = text || '标签'
      if (type === 'gray') return `<el-tag class="el-tag--gray">${icon}${label}</el-tag>`
      if (type === 'outline') return `<el-tag class="el-tag--outline">${icon}${label}</el-tag>`
      return `<el-tag type="${type}">${icon}${label}</el-tag>`
    },
  },

  {
    id: 'empty',
    anchor: 'empty',
    name: 'Empty 空状态',
    group: 'display',
    desc: '无数据 / 无结果占位',
    keywords: ['空状态', 'empty', '无数据', '占位', '缺省'],
    readRefs: ['references/component-interaction.md（Empty 段）'],
    mustRules: [
      '必须用 el-empty + 设计系统插画（el-theme/assets/empty/ 选一张，import 后 :image 传入）',
      '必须加档位 class：整页 empty-page / 卡片区块 empty-block',
      '两样缺一即落回 EP 默认纸盒图 = 没接设计系统',
      '底部按钮放默认插槽、用默认态不用 primary',
    ],
    instanceFields: [
      { key: 'desc', label: '描述', type: 'text', placeholder: '如：暂无课程', default: '' },
      { key: 'action', label: '按钮文案', type: 'text', placeholder: '留空则不要按钮', default: '' },
    ],
    snippet: ({ desc, action, typeKey, withButton, container }) => {
      // 插画按场景选（typeKey 对应 el-theme/assets/empty/ 下的文件名）
      const img = typeKey || 'data'
      const cls = container === 'block' ? 'empty-block' : 'empty-page'
      const open = `<el-empty
  :image="emptyImg"
  description="${desc || '暂无数据'}"
  class="${cls}"`
      const body = (withButton && action) || action
        ? `\n>\n  <el-button>${action || '立即创建'}</el-button>\n</el-empty>`
        : withButton ? `\n>\n  <el-button>立即创建</el-button>\n</el-empty>` : '\n/>'
      return `${open}${body}

<!-- 脚本：按场景从 el-theme/assets/empty/ 选一张（暗色用 dark/ 变体） -->
import emptyImg from '<path>/design-spec/el-theme/assets/empty/${img}.png'`
    },
  },

  // ── 导航 ──────────────────────────────────────────────────────────────────
  {
    id: 'toolbar',
    anchor: 'toolbar',
    name: 'Toolbar 工具栏',
    group: 'nav',
    desc: '页面头部操作条（标题 + 筛选 + 按钮）',
    keywords: ['工具栏', 'toolbar', '页头', '操作条', '筛选'],
    readRefs: ['references/patterns/toolbar-pattern.md'],
    mustRules: [
      '一律用源头约定 class .toolbar / __left / __right / __title，禁在使用方 scoped 复刻',
      '固定顺序：标题→组件级 tab→下拉→搜索→次按钮→主按钮',
      '左右分配三分支：有标题→标题左其余右 / 无标题有筛选→筛选左按钮右 / 都无→按钮左',
      '过滤条件不超过两行，并列同义的条件必须合并',
    ],
    instanceFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '留空则无标题', default: '' },
      {
        key: 'level',
        label: '标题层级',
        type: 'select',
        default: 'page',
        options: [
          { value: 'page', label: '页面级' },
          { value: 'module', label: '模块级' },
        ],
      },
      { key: 'search', label: '带搜索', type: 'switch', default: false },
      { key: 'primaryBtn', label: '主按钮文案', type: 'text', placeholder: '如：新建课程', default: '' },
    ],
    snippet: ({ title, level, search, primaryBtn }) => `<div class="toolbar">
  <div class="toolbar__left">${title ? `\n    <h3 class="toolbar__title${level === 'module' ? ' toolbar__title--module' : ''}">${title}</h3>` : ''}
  </div>
  <div class="toolbar__right">${search ? '\n    <SearchMini v-model="keyword" placeholder="搜索" />' : ''}${primaryBtn ? `\n    <el-button type="primary">${primaryBtn}</el-button>` : ''}
  </div>
</div>`,
  },

  {
    id: 'tabs',
    anchor: 'tabs',
    name: 'Tabs 标签页',
    group: 'nav',
    desc: '页内内容切分',
    keywords: ['标签页', 'tabs', 'tab', '切换'],
    readRefs: ['references/component-interaction.md（Tabs 段）'],
    mustRules: [
      '前置硬规则：各 tab 数据必须"无交集"——一条记录只能落在一个 tab 里',
      '「我创建的/我关注的/我处理过的」不行（同一条可能三者皆是），应放筛选下拉',
      '三档选型：页面级 .tabs-page / 模块级裸 el-tabs / 组件级 .tabs-sub',
      '禁用 el-tabs 做表单分节（表单各段是同一条记录的不同部分）',
    ],
    instanceFields: [
      { key: 'items', label: '标签', type: 'text', placeholder: '逗号分隔，如：待批改,已批改', default: '' },
      {
        key: 'level',
        label: '层级',
        type: 'select',
        default: 'module',
        options: [
          { value: 'page', label: '页面级 .tabs-page' },
          { value: 'module', label: '模块级（裸 el-tabs）' },
          { value: 'sub', label: '组件级 .tabs-sub' },
        ],
      },
    ],
    snippet: ({ items, level, tabsLevel, tabsShowCount }) => {
      // level 来自手写实例参数，tabsLevel 来自 demo 形态开关——两者同义，
      // demo 的优先（它才是设计系统演示的档位口径）
      const lv = tabsLevel || level
      const cls = lv === 'page' ? ' class="tabs-page"' : lv === 'sub' ? ' class="tabs-sub"' : ''
      const list = (items || '标签一,标签二').split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      // 带计数用约定 class .tab-label-count + .tab-count（源头已定，禁 scoped 复刻）
      const panes = list.map((s, i) => tabsShowCount
        ? `  <el-tab-pane name="${i + 1}">\n` +
          `    <template #label><span class="tab-label-count">${s}` +
          `<span class="tab-count">12</span></span></template>\n  </el-tab-pane>`
        : `  <el-tab-pane label="${s}" name="${i + 1}" />`).join('\n')
      return `<el-tabs v-model="activeTab"${cls}>
${panes}
</el-tabs>`
    },
  },

  {
    id: 'step-bar',
    anchor: 'step-bar',
    name: 'StepBar 步骤条',
    group: 'nav',
    desc: '分步流程进度',
    keywords: ['步骤条', 'step', '流程', '分步', '进度'],
    readRefs: ['design-spec/components/StepBar/StepBar.vue（顶部速查注释）'],
    mustRules: [
      '一律用业务组件 StepBar，禁手写 div 拼步骤条、禁用 el-steps 复刻这套观感',
      "import { StepBar } from '<path>/design-spec/components'",
    ],
    instanceFields: [
      { key: 'steps', label: '步骤', type: 'text', placeholder: '逗号分隔，如：填写要求,生成清单,生成内容', default: '' },
      { key: 'current', label: '当前步（1-based）', type: 'number', default: 1 },
    ],
    snippet: ({ steps, current, stepCount, finished }) => {
      const list = (steps || '步骤一,步骤二,步骤三').split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      // 模板属性用双引号包裹，数组内的字符串必须用单引号，否则引号嵌套会让 Vue 编译崩
      const arr = `[${list.map((s) => `'${s}'`).join(', ')}]`
      return `<StepBar :steps="${arr}" :current="${current || 1}" />

<!-- 脚本 -->
import { StepBar } from '<path>/design-spec/components'`
    },
  },

  // ── 反馈 ──────────────────────────────────────────────────────────────────
  {
    id: 'dialog',
    anchor: 'dialog',
    name: 'Dialog 对话框',
    group: 'feedback',
    desc: '弹窗（表单 / 确认 / 富内容）',
    keywords: ['弹窗', 'dialog', '对话框', '模态框', '确认'],
    readRefs: [
      'references/patterns/dialog-pattern.md',
      'references/component-interaction.md（Dialog 段）',
    ],
    mustRules: [
      '一律用 el-dialog，禁手撸、禁 ElMessageBox',
      '内容放默认插槽（=content 区）、按钮放 #footer',
      '宽度按场景从三档选：确认/单字段=400、常规表单=640、复杂富内容=800，禁非档位宽度',
      '800 档是给内嵌表格/列表等非表单富内容的，不是给"双列表单"——表单一律单列',
      '危险操作加 class="is-danger"',
      'footer 主按钮在右（右对齐→主按钮贴右）',
    ],
    instanceFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '如：新建课程', default: '' },
      {
        key: 'width',
        label: '宽度',
        type: 'select',
        default: '640',
        options: [
          { value: '400', label: '400 · 确认 / 单字段' },
          { value: '640', label: '640 · 常规表单' },
          { value: '800', label: '800 · 复杂富内容（内嵌表格/列表）' },
        ],
      },
      { key: 'danger', label: '危险操作', type: 'switch', default: false },
      { key: 'confirmText', label: '主按钮文案', type: 'text', placeholder: '如：确定', default: '确定' },
    ],
    snippet: ({ title, danger, confirmText, dialogScene, dialogShowTip, dialogMultiTitle }) => {
      // 宽度由场景决定（三档，禁非档位值）：确认 400 / 表单 640 / 富内容 800
      const width = { confirm: 400, form: 640, rich: 800 }[dialogScene] || 640
      const tip = dialogShowTip
        ? '\n  <el-alert title="提交后不可修改" class="alert-neutral" show-icon :closable="false" />\n'
        : ''
      const titles = dialogMultiTitle
        ? '\n  <div class="dialog-titles"><span class="is-active">基本信息</span><span>高级设置</span></div>\n'
        : ''
      return `<el-dialog
  v-model="visible"
  title="${title || '标题'}"
  width="${width}px"${danger ? '\n  class="is-danger"' : ''}
>${titles}${tip}
  <!-- 内容放默认插槽 -->

  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="${danger ? 'danger' : 'primary'}" @click="handleConfirm">${confirmText || '确定'}</el-button>
  </template>
</el-dialog>`
    },
  },

  {
    id: 'tip-dialog',
    anchor: 'tip-dialog',
    variantOf: 'dialog',
    name: 'TipDialog 提示弹窗',
    group: 'feedback',
    desc: '系统提醒用户的四类语义弹窗（警告/危险/成功/信息）',
    keywords: ['提示弹窗', 'tip', 'dialog', '警告', '危险', '成功', '信息', 'messagebox'],
    readRefs: [
      'references/patterns/dialog-pattern.md',
      'references/component-interaction.md（Dialog 段 / 按钮个数 段）',
    ],
    mustRules: [
      '一律用 el-dialog + 语义 class（is-warning/is-danger/is-success/is-info）',
      '禁 ElMessageBox —— 它不是组件、定制能力弱、与设计系统割裂',
      '按钮个数：成功=纯告知单钮；其余=一退路+一进路两钮',
      'footer 主按钮在右',
    ],
    instanceFields: [
      {
        key: 'scene',
        label: '场景',
        type: 'select',
        default: 'warning',
        options: [
          { value: 'warning', label: '警告 · 离开未保存等' },
          { value: 'danger', label: '危险 · 删除等不可撤销操作' },
          { value: 'success', label: '成功 · 操作完成告知' },
          { value: 'info', label: '信息 · 版本更新等中性提醒' },
        ],
      },
      { key: 'title', label: '标题', type: 'text', placeholder: '如：离开未保存页面', default: '' },
      { key: 'body', label: '正文', type: 'text', placeholder: '如：当前页有 3 处修改未保存', default: '' },
    ],
    snippet: ({ scene, title, body, tipScene }) => {
      const s = scene || tipScene || 'warning'
      const configs = {
        warning: { class: 'is-warning', title: '离开未保存页面', body: '当前页有 3 处修改未保存，离开后将丢失。', btn1: '取消', btn2: '保存并离开', type2: 'primary' },
        danger: { class: 'is-danger', title: '删除用户「张三」', body: '此操作不可撤销，张三的所有数据将被永久删除。', btn1: '取消', btn2: '确认删除', type2: 'danger' },
        success: { class: 'is-success', title: '操作完成', body: '批量启用已成功完成，共影响 32 条数据。', btn1: '', btn2: '知道了', type2: 'primary' },
        info: { class: 'is-info', title: '新版本可用', body: 'v0.5.0 已发布，包含若干 bug 修复和新功能，建议更新。', btn1: '稍后', btn2: '立即更新', type2: 'primary' },
      }
      const cfg = configs[s]
      const buttons = cfg.btn1
        ? `    <el-button @click="visible = false">${cfg.btn1}</el-button>\n    <el-button type="${cfg.type2}" @click="handleConfirm">${cfg.btn2}</el-button>`
        : `    <el-button type="${cfg.type2}" @click="visible = false">${cfg.btn2}</el-button>`
      return `<el-dialog
  v-model="visible"
  class="${cfg.class}"
  title="${title || cfg.title}"
  width="400px"
>
  <p>${body || cfg.body}</p>
  <template #footer>
${buttons}
  </template>
</el-dialog>`
    },
  },

  {
    id: 'alert',
    anchor: 'alert',
    name: 'Alert 提示条',
    group: 'feedback',
    desc: '页面 / 弹窗内常驻说明条',
    keywords: ['提示条', 'alert', '警告', '说明', '提示'],
    readRefs: ['references/component-interaction.md（Alert 段）'],
    mustRules: [
      '主文案一律传 title 属性——默认插槽是 description 区，塞进标签中间会触发 EP 的 is-big、图标变大',
      '中性灰底用 class="alert-neutral"，禁裸 div 自配灰底、禁拿 type="info" 蓝底冒充中性',
      '默认带 show-icon',
      '禁用 el-alert 做确认/删除确认（需要用户决策的用 Dialog）',
    ],
    instanceFields: [
      { key: 'title', label: '文案', type: 'text', placeholder: '如：提交后不可修改', default: '' },
      {
        key: 'type',
        label: '语义',
        type: 'select',
        default: 'neutral',
        options: [
          { value: 'neutral', label: '中性灰底 alert-neutral' },
          { value: 'info', label: 'info 蓝' },
          { value: 'success', label: 'success 绿' },
          { value: 'warning', label: 'warning 橙' },
          { value: 'error', label: 'error 红' },
        ],
      },
      { key: 'closable', label: '可关闭', type: 'switch', default: false },
    ],
    snippet: ({ title, type, closable, alertShowDesc }) =>
      type === 'neutral'
        ? `<el-alert
  title="${title || '提示文案'}"
  class="alert-neutral"
  show-icon
  :closable="${closable}"
/>`
        : `<el-alert
  title="${title || '提示文案'}"
  type="${type}"
  show-icon
  :closable="${closable}"
/>`,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 以下条目为「导航里有、但原先没写骨架」的组件补齐。
  // mustRules 一律取自 CLAUDE.md 触发表的说明列 —— 那是各组件硬约束的浓缩，
  // 与 references 正文同源，抄它能保证三处口径一致（不另起炉灶重写一遍）。
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'breadcrumb', anchor: 'breadcrumb', name: 'Breadcrumb 面包屑', group: 'nav',
    desc: '路径导航（带返回箭头）', keywords: ['面包屑', 'breadcrumb', '路径', '导航', '返回'],
    readRefs: ['references/component-interaction.md（Breadcrumb 段）'],
    mustRules: [
      '一律用业务组件 Breadcrumb，禁手写 el-breadcrumb + span 拼返回箭头',
      '返回箭头可用性看「倒数第二项是不是可跳转实体页」而非层数',
      '分组标题/只展开子菜单的父项作上一级时须传 back-disabled',
    ],
    instanceFields: [
      { key: 'items', label: '路径', type: 'text', placeholder: '逗号分隔，如：首页,课程,详情', default: '' },
      { key: 'showBack', label: '返回箭头', type: 'switch', default: true },
    ],
    snippet: ({ items, showBack }) => {
      const list = (items || '首页,列表,详情').split(/[,，]/).map((x) => x.trim()).filter(Boolean)
      const arr = '[' + list.map((x) => `{ label: '${x}' }`).join(', ') + ']'
      return `<Breadcrumb :items="${arr}"${showBack ? ' @back="router.back()"' : ' :show-back="false"'} />

<!-- 脚本 -->
import { Breadcrumb, type BreadcrumbItem } from '<path>/design-spec/components'`
    },
  },

  {
    id: 'pagination', anchor: 'pagination', name: 'Pagination 分页', group: 'nav',
    desc: '列表翻页', keywords: ['分页', 'pagination', '翻页', '每页'],
    readRefs: ['references/component-interaction.md（分页器 段）'],
    mustRules: [
      'layout 固定顺序 prev, pager, next, sizes, jumper（不含 total）',
      '总数文本不走分页器——外层 flex + space-between，左侧放「共 N 条」、右侧放分页器',
      '必传 hide-on-single-page：不足一页整个分页器不渲染（禁自己写 v-if 手算页数）',
      '窄容器加 small 且必须同时把 layout 精简为 prev, pager, next（只加 small 不精简会挤出换行）',
    ],
    instanceFields: [],
    snippet: ({ paginationSize }) => {
      const small = paginationSize === 'small'
      return `<div style="display:flex; justify-content:space-between; align-items:center;">
  <span>共 {{ total }} 条</span>
  <el-pagination
    v-model:current-page="page"
    v-model:page-size="pageSize"
    :total="total"
    hide-on-single-page${small ? '\n    small\n    layout="prev, pager, next"' : '\n    :page-sizes="[10, 20, 50, 100]"\n    layout="prev, pager, next, sizes, jumper"'}
  />
</div>`
    },
  },

  {
    id: 'anchor', anchor: 'anchor', name: 'Anchor 锚点', group: 'nav',
    desc: '长页分节跳转', keywords: ['锚点', 'anchor', '目录', '跳转', '分节'],
    readRefs: ['references/component-interaction.md（Anchor 段）'],
    mustRules: [
      '必须传 direction="horizontal"——竖向源头未适配，而竖向恰是 EP 默认值，漏传即落到未适配形态',
      '有固定顶栏必须传 :offset（=顶栏高+间距，本项目 76）——EP 走 JS 滚动，不吃 scroll-padding-top',
      '滚动容器不是 window 时必须传 container（被 el-scrollbar 包裹时须指向其 wrap，否则完全失效）',
    ],
    instanceFields: [
      { key: 'links', label: '锚点', type: 'text', placeholder: '逗号分隔，如：基本信息,教学安排', default: '' },
    ],
    snippet: ({ links }) => {
      const list = (links || '第一节,第二节').split(/[,，]/).map((x) => x.trim()).filter(Boolean)
      const items = list.map((x, i) => `  <el-anchor-link href="#sec${i + 1}">${x}</el-anchor-link>`).join('\n')
      return `<el-anchor direction="horizontal" :offset="76">
${items}
</el-anchor>`
    },
  },

  {
    id: 'dropdown', anchor: 'dropdown', name: 'Dropdown 下拉菜单', group: 'nav',
    desc: '更多操作 / 悬浮菜单', keywords: ['下拉菜单', 'dropdown', '更多', '菜单', '操作'],
    readRefs: ['references/component-interaction.md（Dropdown 段）'],
    mustRules: [
      '一律用 el-dropdown，面板放 #dropdown 插槽，禁手撸浮层',
      '触发器尾部箭头用约定 class .dropdown-caret + @visible-change 绑 .is-expanded（展开翻转在源头，禁自写旋转动效）',
      '分组抬头用约定 class .dropdown-group-title + 裸 <li> 承载（禁用 el-dropdown-item 冒充——会带 hover 底色让用户误以为可点）',
    ],
    instanceFields: [
      { key: 'trigger', label: '触发器文案', type: 'text', placeholder: '如：更多操作', default: '' },
      { key: 'items', label: '菜单项', type: 'text', placeholder: '逗号分隔，如：编辑,复制,删除', default: '' },
    ],
    snippet: ({ trigger, items, grouped }) => {
      const list = (items || '编辑,删除').split(/[,，]/).map((x) => x.trim()).filter(Boolean)
      // 分组抬头必须用裸 <li> + .dropdown-group-title，禁用 el-dropdown-item
      // 冒充（会带 hover 底色让用户误以为可点）
      const lis = grouped
        ? '      <li class="dropdown-group-title">分组一</li>\n' +
          list.map((x) => `      <el-dropdown-item>${x}</el-dropdown-item>`).join('\n')
        : list.map((x) => `      <el-dropdown-item>${x}</el-dropdown-item>`).join('\n')
      return `<el-dropdown @visible-change="(v) => (expanded = v)">
  <el-button>${trigger || '更多操作'}<span class="dropdown-caret" :class="{ 'is-expanded': expanded }" /></el-button>
  <template #dropdown>
    <el-dropdown-menu>
${lis}
    </el-dropdown-menu>
  </template>
</el-dropdown>`
    },
  },

  {
    id: 'checkbox', anchor: 'checkbox', name: 'Checkbox 多选框', group: 'input',
    desc: '多选（需配合提交操作）', keywords: ['多选框', 'checkbox', '多选', '勾选'],
    readRefs: ['references/component-interaction.md（Checkbox 段）'],
    mustRules: [
      '文案传 label、值传 value（EP 2.6+ 语义已变，写 label 当值用是旧版写法会让 v-model 收到错误的值）',
      '多选必用 el-checkbox-group 包裹，禁再加 flex+gap',
      '半选用 indeterminate（不受 v-model 控制，须自算）',
      '文字不要在 checkbox 外套 span 手拼——字号/间距/禁用取色全在源头',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：选修方向', default: '' },
      { key: 'options', label: '选项', type: 'text', placeholder: '逗号分隔，如：语文,数学', default: '' },
    ],
    snippet: ({ label, options, checkboxShowText }) => {
      const list = (options || '选项一,选项二').split(/[,，]/).map((x) => x.trim()).filter(Boolean)
      // 文案传 label、值传 value（EP 2.6+ 语义）；关掉文字则只留勾选框
      const boxes = list.map((x, i) => checkboxShowText === false
        ? `    <el-checkbox value="${i + 1}" />`
        : `    <el-checkbox label="${x}" value="${i + 1}" />`).join('\n')
      return `<el-form-item label="${label || '标签'}">
  <el-checkbox-group v-model="form.field">
${boxes}
  </el-checkbox-group>
</el-form-item>`
    },
  },

  {
    id: 'slider', anchor: 'slider', name: 'Slider 滑块', group: 'input',
    desc: '数值区间选择', keywords: ['滑块', 'slider', '区间', '数值'],
    readRefs: ['references/component-interaction.md（Slider 段）'],
    mustRules: [
      '要数值输入用 show-input，禁在旁边拼 el-input-number',
      '离散值必须同时传 step + show-stops',
      '须有定宽容器，否则宽度塌陷',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：难度', default: '' },
      { key: 'showInput', label: '带数值输入', type: 'switch', default: false },
      { key: 'range', label: '区间选择', type: 'switch', default: false },
    ],
    snippet: ({ label, showInput, range, isRange, discrete, showMarks }) => {
      // 离散值必须 step + show-stops 同时给，只给一个不生效
      const attrs = [
        (range || isRange) ? 'range' : '',
        showInput ? 'show-input' : '',
        discrete ? ':step="10"\n      show-stops' : '',
        showMarks ? ':marks="{ 0: \'低\', 50: \'中\', 100: \'高\' }"' : '',
      ].filter(Boolean).join('\n      ')
      return `<el-form-item label="${label || '标签'}">
  <div style="width: 320px;">
    <el-slider
      v-model="form.field"${attrs ? '\n      ' + attrs : ''}
    />
  </div>
</el-form-item>`
    },
  },

  {
    id: 'rate', anchor: 'rate', name: 'Rate 评分', group: 'input',
    desc: '星级评价', keywords: ['评分', 'rate', '星级', '星星', '评价'],
    readRefs: ['references/component-interaction.md（Rate 段）'],
    mustRules: [
      '只对主观评价用星星——客观数值（85 分、完成度 60%）直接用文字+数字字阶，别降级成 5 档',
      '只读展示传 disabled（不是 readonly）+ show-score',
      '档位固定 5 星别改 :max',
      '星色/尺寸全在源头 rate.scss，禁在使用方改 --el-rate-* 变量',
    ],
    instanceFields: [
      { key: 'label', label: '标签', type: 'text', placeholder: '如：课程评分', default: '' },
      { key: 'readonly', label: '只读展示', type: 'switch', default: false },
    ],
    snippet: ({ label, readonly, allowHalf }) => `<el-form-item label="${label || '评分'}">
  <el-rate v-model="form.field"${allowHalf ? ' allow-half' : ''}${readonly ? ' disabled show-score' : ''} />
</el-form-item>`,
  },

  {
    id: 'badge', anchor: 'badge', name: 'Badge 徽标', group: 'display',
    desc: '未读数 / 消息条数', keywords: ['徽标', 'badge', '红点', '未读', '角标'],
    readRefs: ['references/component-interaction.md（Badge 段）'],
    mustRules: [
      '一律默认红色，勿传 type',
      '包裸宿主定位；挂 tab 走约定 class .badge-tabs + .tab-badge',
    ],
    instanceFields: [
      { key: 'value', label: '数值', type: 'number', default: 5 },
    ],
    snippet: ({ value, badgeType }) => {
      // 徽标包裸宿主定位；挂 tab 要走约定 class .badge-tabs + .tab-badge
      const host = {
        avatar: '<UserAvatar role="teacher-male" />',
        button: '<el-button>消息</el-button>',
        icon: '<el-button text><template #icon><Bell /></template></el-button>',
        tab: null,
      }[badgeType || 'button']
      if (host === null) {
        return `<el-tabs v-model="activeTab" class="badge-tabs">
  <el-tab-pane name="1">
    <template #label>待批改<el-badge class="tab-badge" :value="${value || 5}" /></template>
  </el-tab-pane>
</el-tabs>`
      }
      return `<el-badge :value="${value || 5}">
  ${host}
</el-badge>`
    },
  },

  {
    id: 'descriptions', anchor: 'descriptions', name: 'Descriptions 描述列表', group: 'display',
    desc: '只读的「字段名+值」信息组', keywords: ['描述列表', 'descriptions', '详情', '信息组', '只读'],
    readRefs: ['references/component-interaction.md（Descriptions 段）'],
    mustRules: [
      '只读用 Descriptions、可编辑才用 el-form——禁拿 el-form + disabled 冒充只读',
      '默认加 border；:column 按内容长短选（短字段 3~4 列 / 含长文本 1~2 列）',
      'size 三档字号源头已成套定义，不在使用方覆盖',
      '空值补「—」不留空白；时间走 formatTime',
    ],
    instanceFields: [
      { key: 'items', label: '字段', type: 'text', placeholder: '逗号分隔，如：姓名,学号,班级', default: '' },
    ],
    snippet: ({ items, descCols, descRows }) => {
      const col = descCols
      const list = (items || '姓名,学号').split(/[,，]/).map((x) => x.trim()).filter(Boolean)
      const rows = list.map((x) => `  <el-descriptions-item label="${x}">—</el-descriptions-item>`).join('\n')
      return `<el-descriptions border :column="${col || 3}">
${rows}
</el-descriptions>`
    },
  },

  {
    id: 'avatar', anchor: 'avatar', name: 'Avatar 头像', group: 'display',
    desc: '用户 / 角色标识', keywords: ['头像', 'avatar', '用户', '角色'],
    readRefs: ['references/component-interaction.md（Avatar 段）'],
    mustRules: [
      '一律用业务组件 UserAvatar，禁手拼 el-avatar + 自配图片/尺寸',
      '内置教师/学生男女四款角色图，传 role="teacher-male" 等命中；自定义图传 src',
      '尺寸只用三档 40（默认）/ 24 / 20 保持全站一致',
    ],
    instanceFields: [
      { key: 'role', label: '角色', type: 'select', default: 'teacher-male',
        options: [
          { value: 'teacher-male', label: '教师（男）' },
          { value: 'teacher-female', label: '教师（女）' },
          { value: 'student-male', label: '学生（男）' },
          { value: 'student-female', label: '学生（女）' },
        ] },
    ],
    snippet: ({ role, avatarSize, avatarMode }) => {
      // 尺寸只用三档保持全站一致；组合形态＝多个头像并排
      const sz = avatarSize && Number(avatarSize) !== 40 ? ` :size="${avatarSize}"` : ''
      const one = `<UserAvatar role="${role || 'teacher-male'}"${sz} />`
      const body = avatarMode === 'group'
        ? `<div style="display:flex; gap:var(--iflyv-spacing-2);">
  ${one}
  <UserAvatar role="student-female"${sz} />
  <UserAvatar role="student-male"${sz} />
</div>`
        : one
      return body + `

<!-- 脚本 -->
import { UserAvatar } from '<path>/design-spec/components'`
    },
  },

  {
    id: 'drawer', anchor: 'drawer', name: 'Drawer 抽屉', group: 'feedback',
    desc: '侧边浮层', keywords: ['抽屉', 'drawer', '侧边', '浮层'],
    readRefs: ['references/component-interaction.md（Drawer 段）'],
    mustRules: [
      '先按四维判据选载体：信息量大 + 任务需来回切换主页面 → 抽屉；信息量少 + 需全神贯注 → 对话框',
      '宽度 400px（轻量）或 600px（详细）',
      '有按钮时放 #footer，主按钮在右（与对话框一致）',
    ],
    instanceFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '如：编辑课程', default: '' },
      { key: 'width', label: '宽度', type: 'select', default: '600',
        options: [{ value: '400', label: '400 · 轻量' }, { value: '600', label: '600 · 详细' }] },
    ],
    snippet: ({ title, width, drawerHasFooter: withFooter, drawerFooterLayout }) => `<el-drawer v-model="visible" title="${title || '标题'}" size="${width || 600}px">
  <!-- 内容 -->${withFooter !== false ? `

  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary" @click="handleConfirm">确定</el-button>
  </template>` : ''}
</el-drawer>`,
  },

  {
    id: 'message', anchor: 'message', name: 'Message 消息提示', group: 'feedback',
    desc: '飘过即消失的即时反馈', keywords: ['消息提示', 'message', 'toast', '轻提示'],
    readRefs: ['references/component-interaction.md（Message 段）'],
    mustRules: [
      '一律传 showClose: true（源头已定制 Lucide 关闭按钮并强制常显，不传就看不到）',
      '禁用 .success() 等简写',
      '需要用户决策的一律不用 Message（用 Dialog）',
    ],
    instanceFields: [
      { key: 'text', label: '文案', type: 'text', placeholder: '如：保存成功', default: '' },
      { key: 'type', label: '类型', type: 'select', default: 'success',
        options: [
          { value: 'success', label: 'success 成功' },
          { value: 'warning', label: 'warning 警告' },
          { value: 'error', label: 'error 错误' },
          { value: 'info', label: 'info 信息' },
        ] },
    ],
    snippet: ({ text, type }) => `ElMessage({
  message: '${text || '操作成功'}',
  type: '${type || 'success'}',
  showClose: true,
})`,
  },

  {
    id: 'notification', anchor: 'notification', name: 'Notification 通知', group: 'feedback',
    desc: '右上角通知（可带操作按钮）', keywords: ['通知', 'notification', '右上角', '告知'],
    readRefs: ['references/component-interaction.md（Notification 段）'],
    mustRules: [
      '默认常驻（duration: 0），非必要不设自动消失',
      '带操作按钮必须用 h() 渲染 message + 按钮行套约定 class .notify-actions（右对齐/间距在源头）',
      '按钮「一退路+一进路」，点击调 handle.close()，禁手撸浮层/行内布局 style',
    ],
    instanceFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '如：导出完成', default: '' },
      { key: 'text', label: '正文', type: 'text', placeholder: '如：文件已生成', default: '' },
    ],
    snippet: ({ title, text, notifyActions: withAction, notifyPersist }) => withAction
      ? `const handle = ElNotification({
  title: '${title || '通知'}',
  duration: 0,
  message: h('div', [
    h('p', '${text || '正文内容'}'),
    h('div', { class: 'notify-actions' }, [
      h(ElButton, { onClick: () => handle.close() }, () => '忽略'),
      h(ElButton, { type: 'primary', onClick: () => handle.close() }, () => '查看'),
    ]),
  ]),
})`
      : `ElNotification({
  title: '${title || '通知'}',
  message: '${text || '正文内容'}',
  duration: 0,
})`,
  },

  {
    id: 'popconfirm', anchor: 'popconfirm', name: 'Popconfirm 气泡确认框', group: 'feedback',
    desc: '就地二次确认', keywords: ['气泡确认', 'popconfirm', '二次确认', '删除确认'],
    readRefs: ['references/component-interaction.md（Popconfirm 段）'],
    mustRules: [
      '低风险操作用 el-popconfirm（就地气泡，不打断），高风险 / 需全神贯注才升级 el-dialog',
      '气泡内按钮走 32px 小号（源头已定）——直接用 el-button 即自动 32px，禁硬写 height / size="small"',
      '按钮个数「一退路 + 一进路」（取消 + 确认）',
    ],
    instanceFields: [
      { key: 'title', label: '确认文案', type: 'text', placeholder: '如：确定删除这条记录？', default: '' },
      { key: 'trigger', label: '触发器文案', type: 'text', placeholder: '如：删除', default: '' },
    ],
    snippet: ({ title, trigger }) => `<el-popconfirm title="${title || '确定删除吗？'}" @confirm="handleConfirm">
  <template #reference>
    <el-button text>${trigger || '删除'}</el-button>
  </template>
</el-popconfirm>`,
  },

  {
    id: 'tooltip', anchor: 'tooltip', name: 'Tooltip 文字提示', group: 'feedback',
    desc: 'hover 出提示气泡', keywords: ['文字提示', 'tooltip', '气泡', 'hover', '说明'],
    readRefs: ['references/component-interaction.md（Tooltip 段）'],
    mustRules: [
      '纯图标入口必须配 tooltip 给全称，禁用原生 title 属性（延迟约 1s、样式失控、移动端不触发）',
      '每个 tooltip 必传 :show-after="300"（全站统一延迟，防鼠标扫过一排图标时气泡连片弹出；这是 JS prop，源头 scss 兜不住，漏传即漏）',
      'placement 按可用空间选（顶栏→bottom、底部→top）',
      '气泡外观全在源头 tooltip.scss，禁 popper-class/:deep 改；effect="dark" 未启用',
      '必读信息不进 tooltip（用 el-alert），可交互内容也不进（用 el-dropdown / el-popconfirm / el-dialog）',
    ],
    instanceFields: [
      { key: 'content', label: '提示文案', type: 'text', placeholder: '如：导出为 Excel', default: '' },
      { key: 'tooltipPlacement', label: '方位', type: 'select', default: 'top',
        options: [
          { value: 'top', label: 'top 上方' },
          { value: 'bottom', label: 'bottom 下方' },
          { value: 'left', label: 'left 左侧' },
          { value: 'right', label: 'right 右侧' },
        ] },
    ],
    snippet: ({ content, tooltipPlacement: placement }) => `<el-tooltip content="${content || '提示文案'}" placement="${placement || 'top'}" :show-after="300">
  <el-button text>
    <template #icon><Download /></template>
  </el-button>
</el-tooltip>`,
  },

  {
    id: 'loading', anchor: 'loading', name: 'Loading 加载', group: 'feedback',
    desc: '加载中状态', keywords: ['加载', 'loading', '转圈', '等待'],
    readRefs: ['references/component-interaction.md（Loading 段）'],
    mustRules: [
      '先按"等待发生在哪"选形态：按钮触发的异步操作 → 按钮自身 <el-button loading>（不要给整个区域套遮罩，这是最常见的过度实现）',
      '区域内容刷新 / 版式未知 → v-loading 指令（全屏用 ElLoading.service()）',
      '版式已知的内容加载 → 骨架屏',
      'v-loading 禁自拼转圈图标/遮罩——源头已把 EP 默认 spinner 换成四圆点动画，文案走 element-loading-text',
    ],
    instanceFields: [
      { key: 'form', label: '形态', type: 'select', default: 'area',
        options: [
          { value: 'button', label: '按钮 loading（异步操作防重复点）' },
          { value: 'area', label: '区域遮罩 v-loading' },
          { value: 'fullscreen', label: '全屏 ElLoading.service()' },
        ] },
      { key: 'text', label: '提示文字', type: 'text', placeholder: '如：加载中', default: '' },
    ],
    snippet: ({ form, text, showLoadingText }) => {
      if (showLoadingText === false) text = ''
      if (form === 'button') return `<el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>`
      if (form === 'fullscreen') return `const loading = ElLoading.service({ text: '${text || '加载中'}' })
// 完成后 loading.close()`
      return `<div v-loading="loading" element-loading-text="${text || '加载中'}">
  <!-- 内容 -->
</div>`
    },
  },

  {
    id: 'skeleton', anchor: 'skeleton', name: 'Skeleton 骨架屏', group: 'feedback',
    desc: '内容未到位的占位', keywords: ['骨架屏', 'skeleton', '占位', '加载占位'],
    readRefs: ['references/component-interaction.md（Skeleton 段）'],
    mustRules: [
      '必 animated + 必须铺在 bg-panel 白底上（灰条在 bg-card 浅灰上对比过弱＝写了等于没写）',
      '用 :loading + 默认插槽切换，禁手写 v-if/v-else 两套',
    ],
    instanceFields: [
      { key: 'rows', label: '行数', type: 'number', default: 3 },
    ],
    snippet: ({ rows }) => `<el-skeleton :loading="loading" animated :rows="${rows || 3}">
  <template #default>
    <!-- 真实内容 -->
  </template>
</el-skeleton>`,
  },

  {
    id: 'result', anchor: 'result', name: 'Result 结果页', group: 'feedback',
    desc: '操作成功/失败的整页反馈', keywords: ['结果页', 'result', '成功', '失败', '反馈'],
    readRefs: ['references/component-interaction.md（Result 段）'],
    mustRules: [
      'icon 仅 success / error 两个合法值——源头只适配这两类，传 warning/info 得到无色图标＝越界违规',
      '结构固定 title + sub-title + #extra',
    ],
    instanceFields: [
      { key: 'title', label: '标题', type: 'text', placeholder: '如：提交成功', default: '' },
      { key: 'subTitle', label: '副标题', type: 'text', placeholder: '如：作业已发布给学生', default: '' },
    ],
    snippet: ({ title, subTitle, 场景: scene, showSubtitle, showButton }) => {
      const icon = scene === 'error' ? 'error' : 'success'
      return `<el-result icon="${icon}" title="${title || '操作成功'}" sub-title="${subTitle || ''}">
  <template #extra>
    <el-button type="primary">返回列表</el-button>
  </template>
</el-result>`
    },
  },

  {
    id: 'steps', anchor: 'steps', name: 'Steps 轻量步骤条', group: 'nav',
    desc: '轻量流程指示（非 StepBar）', keywords: ['步骤', 'steps', '流程', '进度'],
    readRefs: ['references/component-interaction.md（Steps 段）'],
    mustRules: [
      '任务复杂/有先后关系时才分解成步骤',
      '需要设计系统标准观感的分步流程头部用业务组件 StepBar，不要用 el-steps 复刻',
    ],
    instanceFields: [
      { key: 'items', label: '步骤', type: 'text', placeholder: '逗号分隔，如：提交申请,审核中,通过', default: '' },
      { key: 'active', label: '当前步（0-based）', type: 'number', default: 1 },
    ],
    snippet: ({ items, active }) => {
      const list = (items || '第一步,第二步,第三步').split(/[,，]/).map((x) => x.trim()).filter(Boolean)
      const steps = list.map((x) => `  <el-step title="${x}" />`).join('\n')
      return `<el-steps :active="${active || 1}">
${steps}
</el-steps>`
    },
  },

  {
    id: 'page-frame', anchor: 'page-frame', name: 'PageFrame 页面框架', group: 'business',
    desc: '整页骨架（侧边导航 + 顶栏 + 内容区）', keywords: ['页面框架', 'pageframe', '布局', '骨架', '侧边导航'],
    readRefs: ['components/PageFrame/PageFrame.vue（顶部速查注释）'],
    mustRules: [
      '先判粒度：要整页骨架才用 PageFrame；只是页面内部加局部导航不要套（过重），用 el-tabs 或 el-anchor',
      '禁手写 aside/header 拼同款框架、禁用 el-menu/el-container 复刻（el-menu 已暂停启用）',
      '页面内容放默认插槽（白色圆角内容卡）',
    ],
    instanceFields: [],
    snippet: () => `<PageFrame
  :menus="menus"
  v-model:active="activeMenu"
  :course="course"
  :breadcrumbs="breadcrumbs"
  :notice-count="3"
  avatar-role="teacher-male"
>
  <!-- 页面内容 -->
</PageFrame>

<!-- 脚本 -->
import { PageFrame, type PageFrameMenuGroup } from '<path>/design-spec/components'`,
  },

  {
    id: 'ai-button', anchor: 'ai-button', name: 'AiButton AI 按钮', group: 'business',
    desc: 'AI 功能入口', keywords: ['ai按钮', 'aibutton', 'ai', '智能', '生成'],
    readRefs: ['components/AiButton/AiButton.vue（顶部速查注释）'],
    mustRules: [
      '一律用业务组件 AiButton，禁手拼渐变按钮 / 在 el-button 上自贴渐变复刻这套观感',
      '三形态：primary（渐变实心=AI 主操作）/ outline（白底描边渐变字=工具栏入口）/ text（行内文字链=轻量入口）',
      '四角星图标为组件内置原版切图、渐变走 AI 渐变令牌，全固化在源头',
    ],
    instanceFields: [
      { key: 'text', label: '文案', type: 'text', placeholder: '如：AI 生成', default: '' },
      { key: 'type', label: '形态', type: 'select', default: 'primary',
        options: [
          { value: 'primary', label: 'primary · 渐变实心（AI 主操作）' },
          { value: 'outline', label: 'outline · 白底描边（工具栏入口）' },
          { value: 'text', label: 'text · 行内文字链（轻量入口）' },
        ] },
      { key: 'loading', label: '带 loading', type: 'switch', default: false },
    ],
    snippet: ({ text, type, loading }) => `<AiButton type="${type || 'primary'}"${loading ? ' loading loading-text="思考中..."' : ''} @click="handleAi">${text || 'AI 生成'}</AiButton>

<!-- 脚本 -->
import { AiButton } from '<path>/design-spec/components'`,
  },

  // ── 图表（业务组件 Chart 的五种形态，形态 = 基础型 × 正交配置）─────────────
  {
    id: 'chart-donut', anchor: 'chart-donut', name: 'Donut 环形图', group: 'chart',
    desc: '占比构成（扇区 ≤5）', keywords: ['环形图', '饼图', 'donut', 'pie', '占比', '构成'],
    readRefs: ['references/display-guide.md（数据可视化 段）', 'components/Chart/Chart.vue（顶部速查注释）'],
    mustRules: [
      '画图一律用业务组件 Chart，禁页内手拼 ECharts 重写取色/主题重绘',
      "import { Chart } from '<path>/design-spec/components'；接入方自装 echarts 并配置解析映射（范本 demo/vite.config.ts）",
      '只是一个核心数字→别画图，直接用 number-display 数字字阶',
      '扇区 ≤5，超过改用堆积条形，别硬塞',
    ],
    instanceFields: [
      { key: 'centerTitle', label: '环心数字', type: 'text', placeholder: '如：104', default: '' },
      { key: 'centerLabel', label: '环心说明', type: 'text', placeholder: '如：课程资源', default: '' },
    ],
    snippet: ({ centerTitle, centerLabel }) =>
      `<Chart type="donut" :data="[{ name: '文档', value: 28 } /* …扇区 ≤5 */]"${centerTitle ? ` center-title="${centerTitle}"` : ''}${centerLabel ? ` center-label="${centerLabel}"` : ''} />`,
  },
  {
    id: 'chart-bar', anchor: 'chart-bar', name: 'Bar 柱状图', group: 'chart',
    desc: '类目比大小（类目 ≤8）', keywords: ['柱状图', 'bar', '柱图', '比大小'],
    readRefs: ['references/display-guide.md（数据可视化 段）', 'components/Chart/Chart.vue（顶部速查注释）'],
    mustRules: [
      '画图一律用业务组件 Chart，禁页内手拼 ECharts 重写取色/主题重绘',
      "import { Chart } from '<path>/design-spec/components'；接入方自装 echarts 并配置解析映射（范本 demo/vite.config.ts）",
      '只是一个核心数字→别画图，直接用 number-display 数字字阶',
      '类目 ≤8；别用折线连类目——类目间没有连续关系',
    ],
    instanceFields: [],
    snippet: () => `<Chart type="bar" :data="[{ name: '一班', value: 86 } /* …类目 ≤8 */]" />`,
  },
  {
    id: 'chart-bar-stack', anchor: 'chart-bar-stack', name: 'Stacked 堆积柱状图', group: 'chart',
    desc: '比较多个对象的构成', keywords: ['堆积柱状图', '堆叠', 'stacked', '构成对比'],
    readRefs: ['references/display-guide.md（数据可视化 段）', 'components/Chart/Chart.vue（顶部速查注释）'],
    mustRules: [
      '画图一律用业务组件 Chart，禁页内手拼 ECharts 重写取色/主题重绘',
      "import { Chart } from '<path>/design-spec/components'；接入方自装 echarts 并配置解析映射（范本 demo/vite.config.ts）",
      '只是一个核心数字→别画图，直接用 number-display 数字字阶',
      '多序列传 categories + series，stacked 开关叠加，自动出图例——勿为组合造新类型',
    ],
    instanceFields: [],
    snippet: () => `<Chart
  type="bar"
  stacked
  :categories="['一班', '二班']"
  :series="[
    { name: '选择题', data: [32, 28] },
    { name: '填空题', data: [24, 26] },
  ]"
/>`,
  },
  {
    id: 'chart-bar-horizontal', anchor: 'chart-bar-horizontal', name: 'Horizontal 条形图', group: 'chart',
    desc: '类目多 / 名称长时的比大小', keywords: ['条形图', '横向柱状图', 'horizontal', '横排'],
    readRefs: ['references/display-guide.md（数据可视化 段）', 'components/Chart/Chart.vue（顶部速查注释）'],
    mustRules: [
      '画图一律用业务组件 Chart，禁页内手拼 ECharts 重写取色/主题重绘',
      "import { Chart } from '<path>/design-spec/components'；接入方自装 echarts 并配置解析映射（范本 demo/vite.config.ts）",
      '只是一个核心数字→别画图，直接用 number-display 数字字阶',
      '类目多或名称长时用横排（horizontal 是正交配置，不是新类型）',
    ],
    instanceFields: [],
    snippet: () => `<Chart type="bar" horizontal :data="[{ name: '多媒体教材', value: 46 } /* … */]" />`,
  },
  {
    id: 'chart-line', anchor: 'chart-line', name: 'Line 折线图', group: 'chart',
    desc: '随时间的变化趋势（≤4 条）', keywords: ['折线图', 'line', '趋势', '走势'],
    readRefs: ['references/display-guide.md（数据可视化 段）', 'components/Chart/Chart.vue（顶部速查注释）'],
    mustRules: [
      '画图一律用业务组件 Chart，禁页内手拼 ECharts 重写取色/主题重绘',
      "import { Chart } from '<path>/design-spec/components'；接入方自装 echarts 并配置解析映射（范本 demo/vite.config.ts）",
      '只是一个核心数字→别画图，直接用 number-display 数字字阶',
      '多序列 ≤4 条（同柱状图传 categories + series）；时间点多别用柱状——会挤成栅栏',
    ],
    instanceFields: [],
    snippet: () => `<Chart type="line" :data="[{ name: '第1周', value: 92 } /* … */]" />`,
  },
]

/** 按 id 取组件 */
export function getComponent(id) {
  return COMPONENTS.find((c) => c.id === id) || null
}
