---
author: myjin2
updated: 2026-05-10
---

# 组件交互规范

> 触发场景：使用表单/表格/弹窗/反馈等组件、编写页面交互逻辑时查阅。

---

## 反模式优先级判定

`design-spec/examples/*.examples.vue` 中所有 ❌ 反模式都带优先级标签 `[BLOCKING] / [STRONG] / [SOFT]`。统一判定标准：

| 优先级 | 判定 | 典型场景 |
|--------|------|---------|
| **BLOCKING** | **名单越界** / 功能直接断裂 / a11y 直接破坏 | 使用名单外的 type 值（`type="success"`）、宽度越界（`width="480px"`）、不写 `v-model`、不写 `prop`、`<span>` 替代 `<el-button>`、使用被禁的属性（`circle`、`stripe`） |
| **STRONG** | 引入视觉 bug / 隐式依赖被破坏 / 间距乱码 | 间距叠加（gap + margin）、icon 贴文字（裸 svg 不走 #icon 插槽）、纯图标用实心/描边按钮（被 min-width 80 撑成长方形，应用 `text`）、覆盖全局清零规则 |
| **SOFT** | 偏离最佳实践但功能正常 | 缺 `aria-busy` / `aria-label`、硬编码 `style="height: 40px"` 替代 `size` 属性、`rules` 不带 `trigger`、表单不加 `ref` |

**使用方判读建议**：
- BLOCKING 反模式应被 lint / CR 严格阻断
- STRONG 反模式发现后应立即修复
- SOFT 反模式可纳入下一轮代码改进，不阻塞发布

---

## 基础交互规范

组件使用惯例参考 **Ant Design 设计规范**，包括但不限于：

- **表单**：必填项标红星号在左侧，校验信息在字段下方展示。 <!-- @rule id=form-label-left level=MUST cat=设计模式 detect=regex dtitle=表单标签一律在左侧、右对齐，全站只此一种布局 title=表单标签一律在左（label-width="auto"），label-position="top" 未启用 -->**标签一律在左**（`label-width="auto"` + 默认右对齐），全站只此一种布局；**顶部标签 `label-position="top"` 暂不启用**。

  > **完整规则在 `references/patterns/form-pattern.md`**（标签宽度为何用 `auto`、文字对齐、必填星号、间距、控件宽度、校验、可照抄骨架）——做表单时以那份为准，本条只作索引。⚠️ 别把 EP 的 `label-position` 值望文生义：`right` 指的是**标签文字的对齐方式**（标签仍在控件左侧），不是"标签摆在右边"。

- **表格**：操作列固定在最右侧，超过 3 个操作使用"更多"收纳；**不使用 stripe（斑马纹）**，通过 hover 行高亮区分行


| 宽度 | 适用场景 | 内容特征 |
|------|---------|---------|
| 400px | 确认提示、单字段输入、简短信息 | 单列、1\~3 个表单项或纯文本 |
| 640px | 常规表单、详情预览 | 单列多字段表单、中等信息量 |
| 800px | 复杂表单、内嵌表格/列表 | 双列表单、表格选择器、富内容 |
- **反馈**：操作成功使用轻量 Message 提示，危险操作前需 Popconfirm 或 Modal 二次确认

---

## 本项目补充规范

### 按钮图标（icon + 文字）

统一使用 Lucide 图标库，`stroke-width: 2`，`currentColor` 继承按钮色。**图标必须通过 `#icon` 插槽传递**，不使用 EP 的 `:icon` 属性（属性方式只能传组件构造函数，无法精确指定 `:size` / `:stroke-width`，与 input 前后缀图标同理）。

```vue
<!-- ✅ 推荐：#icon 插槽 + Lucide -->
<el-button type="primary">
  <template #icon><Search :size="16" :stroke-width="2" /></template>
  搜索
</el-button>

<!-- ❌ 禁止：把 <svg> / Lucide 组件直接塞 default slot -->
<el-button type="primary">
  <Search /> 搜索
</el-button>
<!-- 后果：button.scss 中 .el-icon + span { margin-inline-start: 6px } 不触发，icon 和文字贴在一起 -->

<!-- ❌ 禁止：用 :icon 属性 -->
<el-button type="primary" :icon="Search">搜索</el-button>
<!-- 后果：无法控制 size / stroke-width，与设计令牌不一致 -->
```

### 纯图标按钮（只有 icon，没有文字）

> ⏸ **`.btn-icon-square` 当前暂停启用**（源头 `button.scss` 已注释该类，`min-width` 选择器里的 `:not(.btn-icon-square)` 豁免也已同步移除）。**现阶段不要写这个 class** —— 写了既没有方形样式、也解除不了 80px 约束。恢复启用时源头两段规则一并放开，本段随之更新。

**现阶段的纯图标按钮**：直接写 `<el-button>` + `#icon` 插槽，不加任何 class。

- **实心 / 描边类**（`type="primary"` / 默认态等）：仍受 `min-width: 80px` 约束，会呈长方形——**现阶段不适合做纯图标**，请带上文字，或改用下面的文字按钮形态。
- **文字按钮**（`text`）：`min-width` 选择器已排除 `.is-text`，不受 80px 约束，是**现阶段纯图标入口的标准形态**（表格操作列、行内删除、顶栏图标等）。源头已按「有 `.el-icon` 无 `<span>`」的结构判据自动给它 `icon-2` 色阶，使用方**什么都不用加**。

```vue
<!-- ✅ 现阶段纯图标入口：text 按钮 + #icon 插槽，无需任何 class -->
<el-tooltip content="删除" placement="top" :show-after="300">
  <el-button text>
    <template #icon><Trash2 :size="16" :stroke-width="2" /></template>
  </el-button>
</el-tooltip>

<!-- ❌ 禁止：使用 circle 属性（视觉与本设计系统不符） -->
<el-button type="primary" :icon="Pencil" circle />

<!-- ❌ 现阶段勿用：.btn-icon-square 已暂停启用，写了不生效 -->
<el-button type="primary" class="btn-icon-square">
  <template #icon><Pencil :size="16" /></template>
</el-button>
```

> **纯图标入口一律配 tooltip**（见下方 Tooltip 段）——没有文字标签时，图标含义只能靠 tooltip 给出。

### Tooltip 文字提示（纯图标入口必配 / 长文本截断补全）

**触发条件**（命中任一即用 `el-tooltip`）：

1. **纯图标入口**（顶栏图标按钮、表格操作列图标、工具栏图标按钮等**没有任何文字标签**的可点元素）——**必须**配 tooltip 给出全称，否则用户只能靠猜图标含义。
2. **被截断的文本**（列表标题、表格单元格、卡片名）——用 tooltip 补出完整内容。
   > **表格列直接用 `show-overflow-tooltip`**（EP 原生，自带截断 + hover 补全），不要手动包 `el-tooltip`。非表格场景才自己写截断样式 + 包 tooltip，见下方骨架。
3. 需要一句话补充说明的表单项 / 状态标识（说明属**辅助信息**，不是必读；必读信息用 `el-alert` 常驻，别藏进 hover）。

**强制做法**：

- **一律 `el-tooltip` + `content` 属性** <!-- @rule id=tooltip-no-native-title level=MUST cat=组件用法 detect=regex dtitle=悬停提示应是设计系统的白底气泡，不是浏览器默认的黑色小方块 title=文字提示一律用 el-tooltip，禁用原生 title 属性 -->（多行/富文本才用 `#content` 插槽），**禁用原生 `title` 属性**——原生 tooltip 延迟约 1s、样式不可控、移动端不触发，与设计系统气泡完全两套观感。
- **`placement` 按可用空间选**，不写死一个值：顶栏 / 页面顶部元素 → `bottom`（上方无空间）；底部操作条 / 表格末行 → `top`；侧栏窄条 → `right`。
- **一律传 `:show-after="300"`（全站统一延迟，每个 tooltip 都要写）** <!-- @rule id=tooltip-show-after level=MUST cat=组件用法 detect=regex dtitle=鼠标扫过一排图标时气泡不应连片弹出，需停留片刻才提示 title=每个 el-tooltip 必传 :show-after="300"（源头兜不住，漏传即漏） --> —— 不加延迟时，鼠标扫过一排图标（侧栏导航、表格操作列、工具栏）会沿途把每个气泡都点亮、同时挂着好几个，视觉噪音极大；300ms 让"路过"不触发、"停留"才提示。
  > ⚠️ **这条必须逐个传，源头兜不住**：延迟是 EP 的 JS prop，不是 CSS——`tooltip.scss` 只能管外观，改不了行为。所以它不像颜色字号那样"改源头处处生效"，写 tooltip 时漏传就是漏了。
- **气泡外观一律不覆盖**：白底、无箭头、圆角 <!-- @rule id=tooltip-no-override level=MUST cat=组件用法 view=impl detect=regex title=tooltip 气泡外观一律不覆盖（禁 popper-class / :deep 改样式） -->、`body-sub` 字阶（14/20）、上下 8 左右 12 内边距、与触发器 8px 贴合间距，全部固化在源头 `el-theme/components/tooltip.scss`。使用方**不写任何 `:deep(.el-popper)` / `popper-class` 改外观**。
- **超长文案不必自己截断**：源头已给 `max-width: 318px`（超出自动换行）+ `max-height: 240px`（超出滚动），长英文串 / URL 也已 `overflow-wrap: anywhere` 强制断行。
- **暗色 tooltip 未启用**：本项目 light 与 dark 已在源头统一成同一套白底风格，传 `effect="dark"` 得到的仍是白底——**不要用它来做视觉区分**。

**反例（禁止）**：

- ❌ 纯图标按钮**不配 tooltip**——图标语义靠猜，是可用性缺陷。
- ❌ 用原生 `title="帮助中心"` 代替（延迟长、样式失控、移动端无效）。
- ❌ **漏传 `:show-after="300"`** —— 鼠标扫过一排图标时气泡连片弹出、同屏挂好几个（真实翻车：PageFrame 收起态侧栏一路划过，三个"一级导航"气泡同时亮着）。
- ❌ 自己另定一个延迟值（`:show-after="500"` / `100`）——延迟是全站统一体感，各处不一致比没有更糟。
- ❌ 把**必读**信息（操作后果、错误原因、必填说明）塞进 tooltip——hover 才可见 = 大概率看不见，该用 `el-alert` / 表单 `help` 文案。
- ❌ 用 `popper-class` / `:deep` 改气泡底色字号（源头已定，改了就是脱离源头的局部私货）。
- ❌ 给 tooltip 内容塞按钮 / 表单等**可交互元素** <!-- @rule id=tooltip-no-interactive level=MUST cat=组件用法 detect=ast dtitle=提示气泡里不应放按钮等要点击的内容（鼠标移过去就消失，够不着） title=禁给 tooltip 塞可交互元素，需要可交互浮层用 dropdown/popconfirm/dialog -->——鼠标移过去气泡就消失，够不着。需要可交互浮层时：一组操作项用 `el-dropdown`、就地确认用 `el-popconfirm`、承载多个控件用 `el-dialog`（`el-popover` 当前暂停启用，见文末「勿用清单」）。

```vue
<!-- ✅ 纯图标入口：补全称，顶栏元素向下展开；show-after 300 全站统一 -->
<el-tooltip content="帮助中心" placement="bottom" :show-after="300">
  <el-button text>
    <template #icon><CircleHelp :size="16" :stroke-width="2" /></template>
  </el-button>
</el-tooltip>

<!-- ✅ 表格单元格截断：用 EP 原生 show-overflow-tooltip，自带截断 + hover 补全，
     不要自己包 el-tooltip、也不要自写省略号样式 -->
<el-table-column prop="title" label="标题" show-overflow-tooltip />

<!-- ✅ 非表格场景（卡片标题、列表项）：容器自己写截断，再包 tooltip 补全。
     截断样式属"页面排版"、不是组件外观，写在使用方 scoped 里是合规的 -->
<el-tooltip :content="item.title" placement="top" :show-after="300">
  <span class="card__title">{{ item.title }}</span>
</el-tooltip>
<!-- scoped:
     .card__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } -->

<!-- ❌ 原生 title：延迟约 1s、样式不可控、移动端不触发 -->
<button title="帮助中心"><CircleHelp :size="16" /></button>

<!-- ❌ 漏传 show-after：鼠标扫过一排图标时气泡连片弹出 -->
<el-tooltip content="帮助中心" placement="bottom" />

<!-- ❌ 覆盖气泡外观：源头已定死，此处即局部私货 -->
<el-tooltip content="帮助中心" popper-class="my-tip" />
```

### 输入框图标

输入框的前后缀图标统一使用 **Lucide 图标 + `#prefix` / `#suffix` 插槽**，不使用 EP 的 `:prefix-icon` / `:suffix-icon` 属性（属性方式无法精确控制尺寸和 stroke-width）。

```vue
<!-- ✅ 推荐：slot 方式，显式指定尺寸 -->
<el-input placeholder="搜索">
  <template #prefix><Search :size="16" :stroke-width="2" /></template>
</el-input>

<!-- ❌ 禁止：prop 方式 -->
<el-input :prefix-icon="Search" placeholder="搜索" />
```

| 属性 | Default / Large | Small |
|------|----------------|-------|
| `:size` | `16`（CSS 兜底值） | `14`（CSS 兜底值） |
| `:stroke-width` | `2` | `2` |

> **自动缩放**：`el-theme/components/input.scss` 已通过 CSS 将 slot 内 Lucide SVG 的 `width` / `height` 覆盖为 rem 值（`1rem` / `0.875rem`），切换字号档位（S/M/L/XL）时图标自动等比缩放。模板中的 `:size` 仅作为 CSS 未加载时的兜底。

**常用图标对照表**：

| 场景 | 图标 | 位置 |
|------|------|------|
| 搜索 | `Search` | prefix |
| 用户名/账号 | `User` | prefix |
| 密码 | `Lock` | prefix |
| 邮箱 | `Mail` | prefix |
| 手机号 | `Phone` | prefix |
| 链接/网址 | `Link` | suffix |
| 日历（非 DatePicker） | `Calendar` | prefix |
| 时间（非 TimePicker） | `Clock` | prefix |

> **注意**：DatePicker / TimePicker 的日历/时钟图标由 `el-theme/components/datepicker.scss` 通过 CSS mask 全局替换为 Lucide 风格，无需在模板中手动处理

### DatePicker / TimePicker 日期时间选择

**何时用**：选择日期、时间、或日期区间。表单里的日期字段一律用它，不要用文本框让用户手输日期。

**强制做法**：

- **图标按 `type` 自动分流，不要自己传**：源头按 `type` 用 CSS mask 替换图标——`date` / `daterange` / `week` / `month` / `year` → Lucide **Calendar**；`time` / `datetime` / `datetimerange` → Lucide **Clock**。
  ⚠️ **不要传 `prefix-icon` / `suffix-icon` 自定义图标**——会被源头的 mask 盖住、显示不出来，白写。
- **区间选择用 `type="daterange"` / `"datetimerange"`**，不要拼两个独立的 DatePicker（拿不到 EP 的区间联动校验与"开始不能晚于结束"约束）。
- **必须传 `value-format`**，否则 `v-model` 拿到的是 Date 对象 <!-- @rule id=datepicker-value-format level=MUST cat=组件用法 detect=regex dtitle=日期选择后展示格式应统一，不出现时间戳或英文日期 title=el-date-picker 必须传 value-format -->、提交给后端还要自己转。常用 `value-format="YYYY-MM-DD"`（日期）或 `"YYYY-MM-DD HH:mm:ss"`（日期时间）。
- **区间选择建议配 `start-placeholder` / `end-placeholder`**（默认的"开始日期/结束日期"过于笼统时）。

**已知实现细节（不必自己处理，但改动时要知道）**：

- `datetime` / `datetimerange` 面板头部的日期、时间两个小输入框高度被源头强制为 **32px**。⚠️ 它们读的是 `--el-component-size-small` 而非 `--el-component-size`——**要调这里的高度必须改 `-small` 变量**，改常规尺寸变量无效。
- 面板文字色、"今天"高亮、区间内日期底色（`in-range` / `start-date` / `end-date` 的圆角衔接）全在源头，使用方不覆盖。

```vue
<!-- ✅ 单个日期：value-format 让 v-model 直接拿到字符串 -->
<el-date-picker
  v-model="date"
  type="date"
  placeholder="请选择日期"
  value-format="YYYY-MM-DD"
/>

<!-- ✅ 日期区间：一个组件搞定，自带联动校验 -->
<el-date-picker
  v-model="range"
  type="daterange"
  start-placeholder="开始日期"
  end-placeholder="结束日期"
  value-format="YYYY-MM-DD"
/>
```

**反例**：

- ❌ 传 `prefix-icon` 自定义图标（被源头 mask 覆盖，显示不出来）。
- ❌ 用两个独立 DatePicker 拼区间（丢失区间联动与前后校验）。
- ❌ 不传 `value-format`，在提交前自己 `dayjs().format()` 转一遍（多余，且各处格式容易不一致）。
- ❌ 用 `el-input` 让用户手输日期（无格式约束、无校验、无日历辅助）。

**只选时间、不选日期**（排课时间段、上课起止时刻）用 **`el-time-picker`**——它与 DatePicker 共用同一套源头适配（图标自动分流为 Lucide **Clock**、面板尺寸与字号已对齐），用法规则同上：

- **必传 `value-format`**（如 `"HH:mm"` / `"HH:mm:ss"`），否则拿到 Date 对象。 <!-- @rule id=timepicker-value-format level=MUST cat=组件用法 view=impl detect=regex title=el-time-picker 必传 value-format -->
- **时间区间**用 `is-range` + `start-placeholder` / `end-placeholder`（一个组件搞定，同样不要拼两个）。
- **限制可选范围**（如只能选 8:00~22:00）用 `:disabled-hours` / `:disabled-minutes`。 <!-- @rule id=timepicker-disabled-range level=SHOULD cat=组件用法 view=impl detect=manual title=限制时间可选范围用 :disabled-hours/:disabled-minutes，不自己过滤 -->
- 固定间隔的时间点（如每 30 分钟一档）用 `el-time-select` + `start` / `step` / `end`，它更适合"节次"这类离散时间。

```vue
<!-- 单个时刻 -->
<el-time-picker v-model="startTime" placeholder="选择时间" value-format="HH:mm" />

<!-- 时间区间：上课起止 -->
<el-time-picker v-model="range" is-range start-placeholder="开始" end-placeholder="结束" value-format="HH:mm" />
```

> **展示已选中的日期时**（非输入态，如详情页、表格单元格），走文案规范的 `formatTime`——见 `references/copywriting/time.md`，不要直接打印原始时间戳。

### Select 多选
默认使用 `collapse-tags collapse-tags-tooltip :max-collapse-tags="2"`，显示 2 个 tag 后折叠，hover 展示全部

### Checkbox 多选框

**何时用**：单独使用可以表示两种状态之间的切换，和 switch 类似。区别在于切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。

**强制做法**：

1. **文案传 `label`、值传 `value`**（EP 2.6+ 起 `label` 是「显示文案」、`value` 才是「选中值」）。写 `<el-checkbox label="vue">` 当值用是旧版写法，在新版里会让 v-model 收到错误的值。文字也**不要**在 checkbox 外面套 `<span>` 手拼——标签的字号/间距/禁用取色全在源头 `checkbox.scss`。
2. **多选一律用 `<el-checkbox-group>` 包**：选项间距（`margin-inline-end: spacing-4` = 16px）是 group 内部实现，**不要再给父容器加 flex+gap**（会与之叠加）。详见上方「按钮间距」段末的表单控件间距说明。
3. **半选用 `indeterminate`**：它**不受 v-model 控制**，需自己按「部分选中」算并显式传。源头已为 `is-indeterminate` 及其禁用组合做了 Lucide 图标替换，是被支持的一等状态。
4. **禁用态不要在使用方补 `opacity`**，源头已处理。

**未启用（不要用）**：`el-checkbox-button` 源头虽有字号/圆角兜底规则，但**本系统未将其作为标准形态**（同 `select-pattern.md` 对 `radio-button` 的表态）；需要按钮式多选先与用户确认。`border` / `min` / `max` 同样未表态。

**可照抄骨架（含全选行）**：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const OPTIONS = ['Vue', 'React', 'Angular']
const checked = ref<string[]>(['Vue'])

// indeterminate 不受 v-model 控制，须自己算
const isAll = computed(() => checked.value.length === OPTIONS.length)
const isIndeterminate = computed(
  () => checked.value.length > 0 && !isAll.value,
)
const onCheckAll = (val: boolean) => {
  checked.value = val ? [...OPTIONS] : []
}
</script>

<template>
  <el-checkbox
    :model-value="isAll"
    :indeterminate="isIndeterminate"
    label="全选"
    @change="onCheckAll"
  />
  <el-checkbox-group v-model="checked">
    <el-checkbox v-for="o in OPTIONS" :key="o" :label="o" :value="o" />
  </el-checkbox-group>
</template>
```

**反例**：
- ❌ `<el-checkbox label="vue" />` 把 `label` 当值用（EP 2.6+ 已改为文案，v-model 会收到显示文案而非值）。
- ❌ `<el-checkbox>` 外面套 `<span>文案</span>` 手拼标签 <!-- @rule id=checkbox-label-prop level=MUST cat=组件用法 view=impl detect=regex title=多选框文案传 label 属性，禁外套 <span> 手拼标签 -->（字号/间距/禁用取色脱离源头）。
- ❌ 给包 checkbox 的父容器加 `display:flex; gap:...`（与源头 16px 叠加成双倍间距）。

### Switch 开关

**何时用**：需要表示开关状态/两种状态之间的切换时使用，和 checkbox 的区别是，切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。

**强制做法**：

1. **配文字标签默认用 `active-text`**，文字在开关**右侧**（EP 默认渲染位置）。字重、与开关本体的 `spacing-2` 间距、常态/禁用态取色全部固化在源头 `el-theme/components/switch.scss`——**这是本段最容易翻车的一条**，见下方反例。
2. **【窄条件例外】仅当「开关左侧无内容、且右侧存在其他内容」时，改用 `inactive-text` 把文字置于开关左侧**——否则文字会与右侧内容挤在一起、归属不清（读者分不出这行文字是开关的标签还是右侧那块内容的）。典型场景：一行的末尾是「开关 + 操作按钮」，此时文字应落在开关左边。
   > 除此之外一律用右侧。**两者互斥，一个开关只配一个标签**——左右各配一份会破坏全站一致性。
3. **禁用态不要在使用方补 `opacity`**：源头已把 `opacity` 从容器移到 `core`（只让开关本体降淡、文字用实色 text-4），使用方再叠会双重变淡、且与 Checkbox 禁用文字不一致。

**未启用（不要用）**：`inline-prompt`（文字内嵌开关内部）——源头注释明确写着「`--wide` 变体当前未启用宽开关」，用了会得到没有配套样式的形态。`size` 档位、`active-value`/`inactive-value` 非布尔值、`before-change` 异步拦截均未表态，需要时先与用户确认。

**可照抄骨架**：

```vue
<template>
  <!-- 默认：文字走 active-text 落右侧，字重/间距/取色全在源头，使用方一行即可 -->
  <el-switch v-model="expandable" active-text="可展开" />

  <!-- 例外：开关右侧还有别的内容（这里是操作按钮），文字改用 inactive-text 置左，
       否则「可展开」会与右侧按钮挤在一起、看不出它是谁的标签 -->
  <div class="row">
    <span>一级导航</span>
    <el-switch v-model="expandable" inactive-text="可展开" />
    <el-button text><template #icon><Trash2 :size="16" /></template></el-button>
  </div>
</template>
```

**反例**：
- ❌ 用 `el-form` + `el-form-item label="可展开"` 包一个孤立开关来配文字——**用错容器凑布局**，还得再写 `:deep(.el-form-item){margin-bottom:0}` 去修它带来的副作用（本仓库真实翻车案例）。表单模式是给「一组标签+控件的信息组织」用的，单个行内开关不适用。
- ❌ 开关外面套 `<span>可展开</span>` 手拼标签 <!-- @rule id=switch-text-prop level=MUST cat=组件用法 view=impl detect=regex title=开关文字标签用 active-text/inactive-text，禁外套 <span> 手拼 -->（间距/取色脱离源头，禁用态不会跟着变灰）。
- ❌ 同时传 `active-text` 与 `inactive-text` 给一个开关配左右两份标签（一个开关只有一个语义，两份会破坏全站一致性）。
- ❌ 开关右侧明明还有按钮/其他内容，却仍把文字放右侧——文字夹在开关与右侧内容之间，归属不清（应按例外条改置左）。
- ❌ 在使用方给 `.el-switch` 补 `opacity` 做禁用态（源头已处理，会双重变淡）。

### Slider 滑块

**何时用**：当用户需要在数值区间/自定义区间内进行选择时，可为连续或离散值。

**形态选型**：

| 需求 | prop | 说明 |
|---|---|---|
| 需要精确输入具体数值 | `show-input` | 右侧带数字输入框，源头已为其留出 `margin-inline-end: 30px`，**不要**自己在旁边拼一个 `el-input-number` |
| 选一个区间（如价格从…到…） | `range` | 双滑块。⚠️ **与 `show-input` 互斥**：EP 源码为 `showInput && !range`，区间模式下数字输入框**不会渲染**（静默失效，不报错）。区间要精确输入只能自己在外面配两个输入框 |
| 离散值（只能取固定档） | `step` + `show-stops` | 「可为离散值」的落地方式，光写 `step` 不显示档位点 |
| 需要标注关键刻度 | `marks` | 源头已为 `.el-slider__marks` 写好定位 |

**强制做法**：
- **必须有显式宽度的容器**：slider 默认撑满父级 <!-- @rule id=slider-width-container level=MUST cat=组件用法 detect=regex dtitle=滑块不应拉满整行，需放在定宽区块内 title=el-slider 必须有显式宽度的容器（默认撑满父级） -->，直接放进宽容器会拉成整行。放在定宽区块或给父容器设宽度。
- 轨道颜色、滑块尺寸（14×14）全在源头 `slider.scss`，使用方不覆盖。

**未启用（不要用）**：`vertical` 竖向（源头仅有 RTL 兜底定位，未作为标准形态表态）、`format-tooltip` 自定义格式（与文案规范层口径未定）——需要时先与用户确认。

**反例**：
- ❌ 用裸 `<el-slider>` 后在旁边手拼 `el-input-number` 显示数值（应直接 `show-input`，间距源头已定）。
- ❌ 写了 `step` 却没有 `show-stops`，用户看不出可选档位在哪。
- ❌ 不给宽度直接放进整行容器，滑块被拉到全宽。

### Descriptions 描述列表（详情信息展示）

**何时用**：**只读**地展示一个对象的多组「字段名 + 值」——详情页基本信息、弹窗里的信息回显、审核详情。

**与表单的分工**：需要**编辑**用 `el-form`（见 `patterns/form-pattern.md`）；只是**看**用 Descriptions。别拿 `el-form` + `disabled` 冒充只读详情——禁用态是给"暂时不能改"用的，不是给"本来就不可改"用的，且禁用文字色更淡、可读性差。

**强制做法**：

- **默认加 `border`**：带边框的表格式排布，字段与值的对应关系最清晰。源头已处理外圈边框（容器 `overflow: hidden` + 圆角，内部单元格首尾边框已消除），**使用方不要再给 cell 补边框**。
- **用 `:column` 控制每行几列**，按内容长短选：短字段（状态、日期、数量）可 3~4 列；含长文本（地址、备注、说明）用 1~2 列，或给该项单独设 `:span` 占满整行。
- **`size` 三档字号已由源头成套定义**（默认 16 / `large` 14 / `small` 12——注意 EP 的档位命名与字号是反直觉的，源头按本系统字阶重新映射过）。**不要在使用方覆盖字号**。
- **值为空时给占位**（`—` 或「暂无」），不要留空白单元格——空白会让用户以为是渲染失败。
- 时间类字段走 `formatTime`（见 `references/copywriting/time.md`），不直接打印原始时间戳。

```vue
<el-descriptions :column="3" border>
  <el-descriptions-item label="课程名称">数据结构</el-descriptions-item>
  <el-descriptions-item label="授课教师">张三</el-descriptions-item>
  <el-descriptions-item label="状态">
    <el-tag type="info" round>进行中</el-tag>
  </el-descriptions-item>
  <!-- 长文本占满整行 -->
  <el-descriptions-item label="课程简介" :span="3">
    {{ course.intro || '—' }}
  </el-descriptions-item>
</el-descriptions>
```

**反例**：

- ❌ 用 `el-form` + `disabled` 做只读详情 <!-- @rule id=descriptions-not-disabled-form level=MUST cat=组件用法 detect=regex dtitle=只读信息应是清晰的字段展示，不应是一片灰掉的表单 title=只读详情用 el-descriptions，禁用 el-form + disabled 冒充 -->（禁用态文字过淡、语义也不对）。
- ❌ 用 `div` + flex 手拼「字段名：值」（丢掉对齐与边框规范，各页各样）。
- ❌ 在使用方覆盖 cell 的字号 / 边框（源头已成套定义，含 `size` 三档与外圈边框消除）。
- ❌ 空值留空白单元格（补 `—`）。

### InputNumber 数字输入框

**何时用**：需要用户输入**精确数值**且带增减步进（数量、分数、时长、阈值）。

**与邻近控件的分工**：

- **在滑块旁边显示数值** → **不要**拼 `el-input-number`，用 `<el-slider show-input>`（源头已为其留好间距，见 Slider 段）。
- **纯粹输入数字、不需要步进** → 用 `el-input`（`type="number"` 或自行校验）即可，不必上 InputNumber。
- **需要"点一下加一"的步进交互** → InputNumber。

**形态（源头已适配三种，按场景选）**：

| 形态 | 写法 | 何时用 |
|---|---|---|
| 默认（左右两侧按钮） | `<el-input-number>` | 常规场景 |
| 右侧堆叠按钮 | `controls-position="right"` | 横向空间紧张时（上下箭头叠在右端，更窄） |
| 无按钮 | `:controls="false"` | 只要数字输入框的外观、不需要步进（如表单里与其他输入框对齐） |

- 增减图标已由源头替换为 Lucide **Minus / Plus**，不要自定义。
- **必须传 `:min` / `:max`**（业务允许的范围） <!-- @rule id=inputnumber-min-max level=MUST cat=组件用法 detect=regex dtitle=数字输入框应有合理上下限，不应能填负数或超大值 title=el-input-number 必须传 :min / :max -->，否则用户可输入负数或超大值；有小数时配 `:precision` + `:step`。

```vue
<el-input-number v-model="count" :min="1" :max="99" />

<!-- 空间紧张：按钮堆到右侧 -->
<el-input-number v-model="score" :min="0" :max="100" controls-position="right" />
```

**反例**：

- ❌ 在 `el-slider` 旁边拼一个 InputNumber 显示数值（应用 `show-input`）。
- ❌ 不传 `:min` / `:max`，让用户能填出业务上非法的值。
- ❌ 自定义增减图标（源头已统一 Lucide）。

### Rate 评分

**何时用**：**主观评价**的打分输入或展示——教学评价、课程评分、作业星级。

> ⚠️ **注意**：客观数值（分数 85 分、完成度 60%）**不要用星星**——那是"把精确值降级成 5 档"的信息损失。数值直接用文字 + 字阶（`number-display` 见 `foundations.md`）。

**强制做法**：

- **只读展示传 `disabled`**（不是 `readonly`——EP 用的是 `disabled`），并配 `:show-score` 或旁边给出具体分值。
- **半星**用 `allow-half`（评价类常见，如 4.5 分）。
- **档位固定 5 星**（`:max` 用默认） <!-- @rule id=rate-max-5 level=SHOULD cat=组件用法 detect=regex dtitle=评分星级固定 5 颗，不应出现 10 颗星 title=el-rate 档位固定 5 星，不改 :max -->，不要改成 10 星——星级的可读性来自"一眼数得清"。

```vue
<!-- 输入：可打半星 -->
<el-rate v-model="score" allow-half />

<!-- 只读展示：带分值 -->
<el-rate v-model="course.score" disabled show-score score-template="{value} 分" />
```

**外观全在源头 `rate.scss`，使用方不覆盖**：

- **星色取 `warning-primary`（橙）而非品牌绿**——星级表达的是「评价程度」，不是品牌操作；品牌绿在本系统专用于主操作与关键强调（见 `foundations.md` 配色原则）。
- 空星走 `border-strong`、禁用态空星走 `border-default`、分值文字走 `text-2` + 14px 字阶。
- **图标尺寸与间距已 rem 化**，跟随 S/M/L/XL 字号档位缩放（EP 原生写死 18px，切 L/XL 档时星星不跟着变大、与文字比例失衡）。
- ❌ 不要在使用方改 `--el-rate-fill-color` 等变量（属局部私货，改源头才处处同步）。

### Tag 标签（选色 + 数量克制）

**选色约定（源头 `tag.scss`）**：本系统品牌色是绿色，与 success 语义绿撞色，普通标签用品牌绿易被误读为「成功态」。因此：

- **无语义含义的普通标签，优先 `type="info"`（蓝色）作为默认色**；仅确需品牌强调时才用默认 / `type="primary"`（品牌绿）。
- 另有两个源头扩展类型：`el-tag--gray`（灰色中性标签，text-2 + inset 底）与 `el-tag--ai`（AI 标识：蓝→绿渐变底 + 渐变文字，走 AI 渐变令牌）——AI 相关标签一律用 `--ai`，不自拼渐变。

**状态标签选色：按「这个状态对用户意味着什么」对号入座**（不要凭状态名的字面感觉挑）：

| 这个状态意味着 | 用什么 | 典型状态词 |
|---|---|---|
| **流程正常终结、结果是好的** | `type="success"` | 已通过、已完成、审核通过、已发布 |
| **正在进行中 / 等待处理**（既没成也没败，需要关注） | `type="warning"` | 进行中、待审核、待批改、审核中、待提交 |
| **失败 / 被拒 / 异常**（需要用户介入补救） | `type="danger"` | 已驳回、未通过、已失效、提交失败 |
| **中性事实，无好坏之分** | `type="info"` | 未开始、草稿、待发布 |
| **已归档 / 非活跃**（不再需要关注，视觉上要"退后") | `el-tag--gray` | 已结束、已归档、已关闭、已取消 |

> **判断入口**：先问"用户看到这个状态，需要做什么？"——**要庆幸**（成了）→ success；**要等或要盯**（在跑/待办）→ warning；**要补救**（败了）→ danger；**啥也不用做、只是个事实** → info；**已经翻篇了** → gray。
>
> ⚠️ **「进行中」不要用 success**。`success` 的语义是"结果好"，不是"运行正常"——而本系统品牌色也是绿，一片绿会让用户误以为都已完成（见 `foundations.md` 功能色表对 success 的告警）。进行中属"待关注"，走 warning。
>
> ⚠️ **`el-tag--gray` 与 `type="info"` 的区别**：info 是**中性但仍需关注**（未开始的任务用户还要去做）；gray 是**已经不需要关注**（已结束的课程只是历史记录）。判据是"这条还要不要用户再看一眼"。

**数量克制**：**尽量避免在同一处（同一行/同一区域）一次性并列出现 3 个以上标签**（即 ≤3 个为宜，4 个及以上应避免）。

- **为什么**：标签是"轻量强调"，靠稀疏才有识别力；一排堆太多会让每个都失去焦点、色彩互相打架，退化成噪音（违背「装饰有度、主色克制」）。
- **反例**：状态列 / 卡片头一次平铺 4~6 个彩色 Tag。
- **例外**：demo / 规范展示页为了**枚举全部状态色板**（如本页一次列出「已完成/待审核/已驳回…」）不受此限——那是"展示所有可选项"，非真实业务里的单条记录并列。

### Badge 徽标

**何时用**：显示**需要用户处理**的消息条数 / 新增提醒，用醒目视觉吸引处理。**不是装饰**——没有"待处理"语义就别挂徽标。

**两种形态（按"数量重不重要"选）**：

| 形态 | 写法 | 何时用 |
|---|---|---|
| **计数** | `<el-badge :value="12">` | 用户需要知道**具体多少条**（未读消息、待批改作业） |
| **圆点** | `<el-badge is-dot>` | 只需知道**有没有**新的，数量无意义（有更新、有新回复） |

**强制做法**：

- **一律默认红色，勿传 `type`** <!-- @rule id=badge-default-red level=SHOULD cat=组件用法 detect=regex dtitle=徽标未读数一律红色，不应出现其他颜色的徽标 title=Badge 一律默认红色，勿传 type -->：徽标语义单一（有未读/有新增），红色最醒目也最符合直觉，不做 success/warning/primary 多彩区分。
- **计数上限用 `:max`**：超过即显示 `99+` <!-- @rule id=badge-max-99 level=SHOULD cat=组件用法 detect=regex dtitle=未读数超过 99 应显示 99+，不撑破角标 title=Badge 未读数场景一律加 :max="99" -->，避免三位数撑破角标。**未读数场景一律加 `:max="99"`**。
- **`:value="0"` 时自动隐藏**（EP 原生行为），不必自己写 `v-if`。
- **挂宿主**：头像/按钮/图标是规整盒子，`el-badge` **直接包宿主**即可。⚠️ 图标场景**包裸图标**——若图标外还有更大的点击热区容器，badge 要包图标而不是包热区，否则角标锚到热区角上、飘离图标。
- 挂 **tab** 时用 `.badge-tabs` + `.tab-badge` 组合约定（补偿选中态下沉），见上方 Tabs 段。

```vue
<!-- 计数 + 上限：超 99 显示 99+，为 0 时自动不显示 -->
<el-badge :value="unreadCount" :max="99">
  <el-button text>
    <template #icon><Bell :size="16" :stroke-width="2" /></template>
  </el-button>
</el-badge>

<!-- 圆点：只提示"有新的" -->
<el-badge is-dot><span>课程资源</span></el-badge>
```

**反例**：

- ❌ 传 `type="warning"` 等改色（徽标只有一种语义，源头已定红色）。
- ❌ 计数不传 `:max`，出现 `1284` 撑破角标。
- ❌ 用 `v-if="count > 0"` 手动控制显隐（`:value="0"` 已自动隐藏）。
- ❌ 拿徽标当**装饰或状态标签**用（那是 `el-tag` 的活，见 Tag 段）。
- ❌ badge 包住整个点击热区容器而非裸图标（角标飘到热区角上）。

### Dropdown 下拉菜单（面板 + 触发器）

**何时用**：常与"触发器"（按钮、图标、下拉选择器等）组合使用，当页面上的操作命令过多时，用此组件可以收纳操作元素。

`el-dropdown` 由**两部分**组成：**下拉面板本身**（菜单项 / 分隔线 / 禁用项 / hover，样式归 `el-theme` 源头）+ **触发器**（用户点/hover 后弹出面板的那个元素）。

- **触发器不是固定形态**：`el-dropdown` **常与「触发器」组合使用**——触发器可以是**按钮、图标、下拉选择器、轻量文字**等多种形态，按场景选，不写死成某一种。
  - **主操作 / 显式入口** → 用**按钮**触发（`<el-button>`，图标 + 文字规范见按钮章节）。
  - **紧凑 / 操作列 / 工具栏** → 用**纯图标**触发（如 `MoreHorizontal` 更多，用 `<el-button text>` 或表格里的 `.table-operation__more`；纯图标必配 tooltip）。
  - **次要 / 行内轻量入口**（如"更多操作 ⌄"）→ 用**轻量文字 + 箭头**触发。
- **强制做法**：触发器放在 `el-dropdown` 默认插槽、菜单放 `#dropdown` 插槽的 `<el-dropdown-menu>`；分隔用 `<el-dropdown-item divided>`；禁用项用 `disabled`；危险项文字走 `--iflyv-danger-primary`。 <!-- @rule id=dropdown-use-slots level=MUST cat=组件用法 detect=regex dtitle=下拉菜单的面板观感应与全站一致，不应是自己拼的浮层 title=下拉面板放 #dropdown 插槽的 <el-dropdown-menu>，禁手撸浮层 -->
- **触发器尾部箭头必须用约定 class `.dropdown-caret`** <!-- @rule id=dropdown-caret-class level=MUST cat=组件用法 detect=regex dtitle=下拉触发器的箭头应在展开时翻转，动效与全站一致 title=下拉触发器箭头必须用约定 class .dropdown-caret + @visible-change 绑 .is-expanded -->（源头 `dropdown.scss`：垂直居中 + 展开时翻转 180° 带过渡）。EP 的 `el-dropdown` 展开态没有稳定纯 CSS 钩子，**展开 class `.is-expanded` 需由使用方用 `@visible-change` 绑定**——这是唯一要使用方做的事，翻转规则/过渡全在源头：

  ```vue
  <el-dropdown @visible-change="open = $event">
    <span>更多 <ChevronDown class="dropdown-caret" :class="{ 'is-expanded': open }" /></span>
    <template #dropdown>…</template>
  </el-dropdown>
  ```

  > 与按钮的 `.btn-caret` 区分：`.btn-caret` 是「hover 按钮时」转（纯 CSS，button.scss）；`.dropdown-caret` 是「下拉展开时」转。箭头与文字的间距由触发器父容器 flex gap 提供，不要在箭头上加 margin（会与 gap 叠加）。

- **配置项「分组」——菜单项按语义分段，每段前加一行抬头**（正交配置，可与触发器各形态自由叠加）：
  - **何时开**：选项较多（约 7 条以上）**且**能按语义归类时；选项少或归类牵强就别开，硬分组反而增加阅读负担。
  - **强制做法**：抬头用**约定类 `.dropdown-group-title`**（源头 `dropdown.scss`），**用裸 `<li>` 承载、不要用 `el-dropdown-item`**——抬头不是可选项，做成 item 会带上 hover 底色与点击手势，用户会去点它。
  - 抬头与选项**同高（36）同左缩进**，仅字号更小、颜色为 `text-3` 灰 —— 层级拉开靠字号色阶，不靠额外留白。口径与 Select 的分组下拉（`.el-select-group__title`）一致，两处观感统一。

  ```vue
  <template #dropdown>
    <el-dropdown-menu>
      <li class="dropdown-group-title">基础操作</li>
      <el-dropdown-item>编辑</el-dropdown-item>
      <el-dropdown-item>复制</el-dropdown-item>
      <li class="dropdown-group-title">危险操作</li>
      <el-dropdown-item disabled>删除</el-dropdown-item>
    </el-dropdown-menu>
  </template>
  ```

  > **这个能力对所有 dropdown 使用方开放，谁要分组谁直接用**——业务组件 `PageFrame` 收起态的侧栏 hover 浮层就是纯使用方（抬头 = 一级导航名、选项 = 其下二级导航），它**完全继承本约定、没有自己另定一套分组标题样式**。这正是「配置式组件设计范式」的落法：能力沉在源头，使用方只写约定 class。
- **反例**：手撸一个绝对定位的浮层当下拉；触发器和菜单不用 `el-dropdown` 组合而各写各的；把本该是按钮/图标的主入口硬做成裸文字（或反之）；「文字 + 箭头」触发器的箭头不用 `.dropdown-caret` 而在页面 scoped 里自写旋转动效；**分组抬头用 `el-dropdown-item` 冒充（带 hover 底色，用户会去点）或在使用方另写一套抬头样式（脱离源头，改源头它不动）**。

### 按钮间距
design-spec 已**全局清零** EP 原生的 `.el-button + .el-button { margin-left: 12px }`（见 `el-theme/components/button.scss`）。

**统一约定**：按钮组的间距**一律由父容器 `display: flex; gap: <token>` 提供**。

**档位按「按钮有没有可见边界」选**——这是唯一判据，不靠手感： <!-- @rule id=button-gap-by-boundary level=MUST cat=设计令牌 detect=manual -->

| 按钮组构成 | gap | 为什么 |
|---|---|---|
| **含任一有底色/描边的按钮**（实心主按钮、次按钮、危险按钮…） | `var(--iflyv-spacing-3)`（12px） | 底色与描边本身就是可见边界，12px 空白已足够分隔两个色块 |
| **全部是无底色按钮**（`<el-button text>` 文本按钮 / 纯图标按钮） | `var(--iflyv-spacing-4)`（16px） | 没有底色，按钮边界只能靠文字轮廓判断。12px 会被读成"文字间的普通空格"，两个按钮糊成一句话——**加宽是为了补偿缺失的视觉边界**，让"这是两个独立可点区域"成立 |

> **判据是「有没有底色/描边」，不是「按钮类型叫什么」**：一组里只要**混有**实心按钮，就按 12px（有边界的那个已经把节奏定下来了）；**全组都无底色**才升到 16px。
>
> ⚠️ **别把 16px 理解成"文本按钮更重要所以更宽"**——它补偿的是边界缺失，与重要性无关。同理，纯图标按钮（`<el-button text>` + `#icon`）没有文字轮廓、边界更弱，同样走 16px。
>
> **图标之间一律 16px**，无论可点与否（可点的图标按钮、不可点的展示型图标同档）。曾有「一组紧凑图标之间 = 8px」的表述，**已作废**——它与本表的 16px 档语义重叠，下游遇到"一排图标按钮"时会看到两个互相矛盾的值。8px 现在只用于「列表项内子元素间距」。

**禁止**：
- 不要在按钮上写 `margin-left` / `margin-right` / `margin-inline-start` / `margin-inline-end`
- 不要在使用方写 `.el-button + .el-button { ... }` 这种相邻按钮间距规则——它会和父容器 gap 叠加导致重复间距

**例外**：
- `.el-button-group` 内部按钮按 EP 默认行为（边框 -1px 重叠），不要包裹 flex+gap（会破坏 -1px 边框重叠）。
  > ⚠️ **能力边界：`el-button-group` 只是「视觉聚合」，不是分段控件**。它**不提供** ARIA radio group / toolbar 语义，**不支持** ←/→ 箭头键切换焦点——每个按钮仍是独立的 Tab 停靠点。**需要"从几个选项里选一个"的分段切换，用 `el-radio-group`**（见 `patterns/select-pattern.md`），不要拿 button-group 冒充。
- `.el-button.table-operation`（表格操作列文字按钮）使用 `<td>` 内 inline 排版，间距由 `el-theme/components/table.scss` 的 `.table-operation + .table-operation { margin-inline-start: spacing-3 }` 相邻选择器自带，**不要包裹 flex+gap**，也不要在使用方覆盖 margin。
  > 注：**间距值为 `spacing-4`（16px），与上表「全组无底色按钮」档一致**——操作列正是这种构成，不是例外。此处的例外只在于**间距的提供方式**（td 内 inline 排版用相邻选择器，而非父容器 flex+gap），不在于取值。值由源头统一提供，使用方无需也不应关心。

> **相关：表单控件（checkbox / radio）间距说明**
>
> `.el-checkbox` / `.el-radio` 在 `el-theme/components/{checkbox,radio}.scss` 中把相邻项水平间距统一为 `margin-inline-end: var(--iflyv-spacing-4)`（16px，覆盖了 EP 原生的 30px）——**这不是反模式**，与上述按钮间距规则不冲突。差异：表单控件有标准 group 容器（`<el-checkbox-group>` / `<el-radio-group>`），间距是 group 内部实现细节，使用方一律用 group 包装即可，**不需要也不应该再加 flex+gap**。这 16px 是横排选项间距的单一数据源，使用方不覆盖。

### AiButton AI 按钮（业务组件）

**何时用**：AI 功能入口——AI 生成、智能出题、AI 提交等由 AI 驱动的操作。普通操作按钮仍用 `el-button`。

**强制做法**：
- **一律用业务组件 `AiButton`**（源头 `design-spec/components/AiButton/`），`import { AiButton } from '<path>/design-spec/components'`。**禁在 `el-button` 上自贴渐变、或手拼一个渐变按钮**复刻这套观感——四角星图标是组件内置原版切图、渐变走 AI 渐变令牌，全固化在源头。 <!-- @rule id=aibutton-use-component level=MUST cat=组件选用 detect=regex dtitle=AI 功能入口应是统一的渐变按钮样式，不应各处自调渐变 title=AI 按钮一律用业务组件 AiButton，禁在 el-button 上自贴渐变复刻 -->
- **`type` 三形态互斥**（默认 `primary`）：`primary` 渐变实心＝AI 主操作；`outline` 白底描边渐变字＝工具栏 AI 入口；`text` 行内文字链＝轻量 AI 入口。
- `loading` 为四角星旋转，文案可自定（如「思考中...」）；`disabled` 走组件内置禁用态。

> ⚠️ **AiButton 的 `type` 与 `el-button` 的 `type` 是两套**：前者是三种 AI 形态、后者是 default/primary/danger 语义档。「按钮类型白名单」那条规则约束的是 `el-button`，不适用于 AiButton。

**反例**：
- ❌ `<el-button style="background: linear-gradient(...)">AI 生成</el-button>` —— 手拼渐变，脱离源头、各处观感不一。
- ❌ 用 `el-button` 加自定义 class 去复刻四角星 + 渐变字。

---

### Breadcrumb 面包屑（带返回箭头）
面包屑 = **前置返回箭头（可选）+ 路径导航**。**一律用业务组件 `Breadcrumb`**（源头 `design-spec/components/Breadcrumb/`），不要自己用 `el-breadcrumb` + 手写返回 `span` 拼装。

- **强制做法**：
  ```vue
  import { Breadcrumb, type BreadcrumbItem } from '<path>/design-spec/components'

  <Breadcrumb :items="items" @back="router.back()" />
  ```
  - `items`：路径项数组 `{ label, to? }[]`；**最后一项自动为当前页**（不可点击，`text-1`），带 `to` 的项可点击跳转（透传 EP 路由）。
  - `@back`：点返回箭头触发——**真实项目里通常接 `router.back()`**（或跳固定上级路由）。返回行为是业务才知道的事，由使用方在此提供。
  - `back-disabled`：无上一级时传 `true`，箭头自动切禁用态（`icon-4`、不可点、不 emit）。**判据是「倒数第二项是不是可跳转的实体页面」，不是「面包屑有几层」**——路径里常混有**非实体层级**（侧栏分组标题、只负责展开子菜单的可折叠父项、纯分类名等），它们只是文案、没有自己的路由，**以它们为上一级时必须禁用箭头**。写法：`:back-disabled="!items[items.length - 2]?.to"`（把可跳转层级的 `to` 填好，非实体层级不给 `to`，禁用态自然成立）。
  - `show-back="false"`：不需要返回箭头时隐藏（只留路径导航）。
  - `max-items`：**深层级折叠**。默认 `0`=不折叠（全量平铺）。层级很深时传 `≥2` 的值（如 `:max-items="4"`）：超过它时**保留首项 + 末项当前页**，中间超出的层级折进一个 `…` 项，**hover 弹下拉菜单**展开被折叠层级（每项可点跳转），可见项数即 `max-items`。做**下钻很深的路径**（如"首页 › 学院 › 课程 › 章节 › 小节 › 作业 › 提交详情"）时用，避免面包屑撑爆一行。
  - `@item-click`：点击某一路径项（含 `…` 下拉里的项）触发，回调 `(item, index)`；真实项目按 `item.to` 走 `router.push`，或据 `index` 定位层级。
- **返回箭头外观**（图标 / 与首项 8px 间距 / 激活 `icon-2` / 禁用 `icon-4`）单一数据源 <!-- @rule id=breadcrumb-use-component level=MUST cat=组件选用 detect=regex dtitle=面包屑返回箭头应各页一致 title=面包屑一律用业务组件 Breadcrumb，禁手拼 el-breadcrumb + span 返回箭头 -->在 `el-theme/components/breadcrumb.scss` 的约定 class `.breadcrumb-back`，`Breadcrumb` 组件内部引用它——**使用方不碰外观，只传 `items` + 接 `@back`**。可点击项 hover 变品牌绿、`…` 折叠触发器同色，均在源头统一，使用方不覆盖。
- **反例**：用 `el-breadcrumb` 自己在前面塞一个 `<span>` 挂 `@click` 手拼返回箭头（脱离组件、间距/色态/禁用逻辑各处不一致、源头更新不同步）；把 `@back` 写成空函数让箭头点了没反应；**用层数判断返回可用性**（如 `items.length > 1` 就放行——上一级是分组标题/可折叠父项这类非实体层级时，箭头亮着却退不回任何页面）；深层级路径**不传 `max-items` 硬让十几级全平铺**撑爆一行（应传 `max-items` 折叠）。 <!-- @rule-skip dup 反例行，正面规则已由 breadcrumb-use-component 覆盖 -->

### Tabs 标签页（三档选型 + 组合约定）
**何时用**：提供平级的区域将大块内容进行收纳和展现，保持界面整洁。

**⛔ 前置硬规则：各 tab 的数据必须「无交集」**——tab 是对同一批数据做**互斥切分**，一条记录只能落在其中一个 tab 里。**切分维度有交集就不能用 tab**，否则同一条记录在多个 tab 重复出现，用户无法理解"这是几条数据"，计数也永远对不上。

- ✅ **可以当 tab**：状态 / 流程节点这类**天然互斥**的维度（作业「待批改 / 已批改 / 已退回」，一份作业同时只处于一个状态）。列表页里**权重最高的那个互斥维度**尤其适合升为 tab，比塞进筛选下拉更省一次点击、且当前所处切分一眼可见。
- ❌ **不能当 tab**：`我创建的 / 我关注的 / 我处理过的`——同一条记录可能三者皆是，数据互相耦合。这类**并列关系的身份/角色维度应放筛选下拉**，不是 tab。
- **另一条约束**：tab 项数不宜过多、单个 tab 文字不宜过长（个数多或字长会同时拖垮阅读与操作）。切分维度取值很多时，改用筛选下拉。

**三档选型（约定 class，源头 `el-theme/components/tabs.scss`）**——按 tab 所处层级选档，不要一律写裸 `el-tabs`：

| 档位 | 写法 | 规格 | 何时用 |
|---|---|---|---|
| **页面级** | `<el-tabs class="tabs-page">` | 18px/28px，高 64px | 页面顶部一级内容切换（充当页面标题层） |
| **模块级**（默认） | `<el-tabs>` | 16px/24px，高 40px | 页面内模块 / 卡片里的内容切换 |
| **组件级** | `<el-tabs class="tabs-sub">` | 14px/20px，高 36px | 工具栏内等更小颗粒的切换（toolbar-pattern 的组件级 tab 即此档） |

- **反例**：页面级 tab 写裸 `el-tabs`（拿到的是模块级观感、层级失真）；在使用方 scoped 里自调 tab 字号/高度凑档位（脱离源头）。

**组合约定（全在源头，使用方只写约定 class，禁止在页面 scoped 里复刻 overflow/字重/offset）**：

- **tab 带计数**（「全部 12 / 进行中 5」这类）：label 里包 `.tab-label-count`、数字用 `.tab-count`（数字色 text-4、选中变 text-3、与文字间距 4，均在源头）：

  ```vue
  <el-tab-pane name="all">
    <template #label><span class="tab-label-count">全部<span class="tab-count">12</span></span></template>
  </el-tab-pane>
  ```

- **tab 挂徽标**（角标数字/圆点/new）：`el-tabs` 加 `class="badge-tabs"`（让角标溢出 tab 头不被 nav 裁切 + 统一 badge 字重），徽标本体用 `<el-badge class="tab-badge">`（补偿模块级选中项 padding-top 导致的角标下沉，源头 `badge.scss`）：

  ```vue
  <el-tabs class="badge-tabs">
    <el-tab-pane name="todo">
      <template #label><el-badge :value="3" class="tab-badge">全部任务</el-badge></template>
    </el-tab-pane>
  </el-tabs>
  ```

- **反例**：角标被裁后在页面 scoped 写 `overflow: visible` 修补；给 tab 上的 badge 手写 offset 对齐选中态——这两类正是 `.badge-tabs` / `.tab-badge` 要防的局部私货。

### Anchor 锚点

**何时用**：需要展现当前页面上可供跳转的锚点链接，以及快速在锚点之间跳转。用作页内 tab 式分节导航（长页分节、表单分组跳转）。

**⛔ 只用横向：必须传 `direction="horizontal"`**——竖向（EP 默认值）**源头未适配，不要用**。源头 `anchor.scss` 只为 `--horizontal` 写了 marker 规格（`height: 3px` + `clip-path` 裁出居中 16px 短条）；`--vertical` 下**只有 RTL 兜底、没有任何外观定义**，拿到的是 EP 原生细长竖条，与本设计系统不一致。`direction` 的 EP 默认值就是竖向，**漏传即落到未适配形态**。

> ⚠️ **用户明确要「侧边目录 / 左侧导航跳转 / 竖着的目录」时，这是需求与规范的冲突，不是你漏传了参数**——按最高铁律「规范与需求冲突时必须先问」，**停下来说明「本设计系统的锚点只有横向形态」并给出选项**（改用横向分节目录 / 由设计负责人决定是否新增竖向适配），**不要默默改成横向交付**。用户要的是"侧边"，你给了"顶部"却不说，等于替他砍掉了需求。<!-- @rule id=anchor-vertical-ask-first level=MUST cat=组件选用 detect=manual -->



**强制做法（五条都是「不写就必然出 bug」）**：

1. **有固定顶栏时必须传 `:offset`（= 顶栏高度 + 间距）**。`el-anchor` 点击走 **JS 滚动**，**不吃** CSS 的 `scroll-padding-top`——不传 offset，跳转后目标标题会被固定顶栏盖住。本项目取 `:offset="76"`（topbar 64 + spacing-3 12，见 `demo/src/styles/global.scss`）。
2. **滚动容器不是 window 时必须传 `container`**。⚠️ **与「滚动条」段的交叉盲区**：本系统要求内部滚动区一律用 `el-scrollbar`（见文末滚动条段），而一旦内容区被 `el-scrollbar` 包裹，Anchor 默认监听 window 滚动就**完全失效**（既不高亮也不跳转），必须把 `container` 指向该 scrollbar 的 wrap 元素。
3. **第一节就在容器顶部时必须传 `select-scroll-top`**。EP 内部 `getCurrentHref()` 有一条特判：`scrollTop === 0` 时，若未开启 `selectScrollTop` 就**返回空串**——即**滚动回到顶部后所有锚点一起失去高亮**（首项明明在视口里却不亮）。这不是 bug 是 EP 默认行为，但对"第一节紧贴容器顶部"的常见版式（表单分组跳转、长页分节）几乎总是错的，**须显式开启**。<!-- @rule id=anchor-select-scroll-top level=MUST cat=组件用法 detect=regex dtitle=页面滚回顶部时锚点导航不应全部失去高亮 title=第一节紧贴容器顶部时，el-anchor 必须传 select-scroll-top -->

4. **容器不是 window 时，还须 `@click` 拦掉浏览器的原生锚跳**：`el-anchor-link` 渲染的是真 `<a href="#…">`，而 EP 的 `handleClick` **不调 `preventDefault()`**。于是点击时发生两次滚动——EP 的 `animateScrollTo` 写 `container.scrollTop`（正确，限制在容器内），浏览器的原生锚跳又把 `#target` 滚进视口（**页面级滚动，会把整个模块顶走**）。绑 `@click="e => e.preventDefault()"` 即可，**只拦默认行为，滚动与高亮仍归 EP**。

5. **页面用 hash 导航时，`el-anchor` 挂载前须清掉 `location.hash`**：EP 在 `onMounted` 里会读一次全局 hash 并跳过去——
   ```js
   const hash = decodeURIComponent(window.location.hash)
   if (getElement(hash)) scrollTo(hash)
   ```
   它读的是**整个页面**的 hash，不区分是不是自己的锚点。所以只要页面别处用了原生 `<a href="#…">` 导航（侧边目录、章节跳转…），地址栏就残留着上次点的 id；此时**条件渲染出一个 `el-anchor`（v-if 切换形态、进入某个 tab、打开弹窗）**，它一挂载就跳到那个**毫不相干的位置**去。表现为"我只是切了个选项，页面自己跳走了"。挂载前 `history.replaceState(null, '', location.pathname + location.search)` 清掉即可（若高亮是按滚动位置算的，清 hash 不影响导航）。<!-- @rule id=anchor-stale-hash level=MUST cat=组件用法 detect=manual -->

> ⚠️ **拦 `@click` 仅限 `preventDefault()`，不要顺手接管滚动和高亮**。前几条任一漏传时表现都是"不高亮"，很容易误判成「EP 的高亮在本用法下整个不生效」，转而自己监听 `@scroll` 算 active——**那是错的**：EP 内部 `watch(() => props.container)` 会在 container 异步到位后自行重新绑定滚动监听（**无需 `:key` 强制重建组件**），marker 的 `left`/`width` 也由它的 JS 按当前 link 实测写入，**手工 class 驱动不了 marker**（源头 `.is-active` 只管文字颜色，且挂在内层 `.el-anchor__link` 上；把 class 加到 `<el-anchor-link>` 根节点会落到 `.el-anchor__item`、完全不匹配）。正确姿势是**把参数传对 + 只拦默认行为，其余交给 EP**。

**其它**：`el-anchor-link` 的 `href` 必须与目标元素的 `id` 严格对应；`title` 与页面上的标题文案保持一致。链接字号（16/24）、横向 marker 的 16px 居中条（clip-path 裁出）全在源头 `anchor.scss`，使用方不覆盖。

**可照抄骨架**：

```vue
<template>
  <!-- ① 页面级滚动（容器就是 window）：只需 offset -->
  <!-- offset=76：EP 走 JS 滚动、不吃 scroll-padding-top，须显式传等值偏移 -->
  <el-anchor direction="horizontal" :offset="76">
    <el-anchor-link href="#section-a" title="第一节" />
    <el-anchor-link href="#section-b" title="第二节" />
  </el-anchor>

  <!-- ② 容器内滚动（内容区包了 el-scrollbar）：container + select-scroll-top + 拦默认行为 -->
  <el-anchor
    :container="scrollWrap"
    direction="horizontal"
    :offset="0"
    select-scroll-top
    @click="(e) => e.preventDefault()"
  >
    <el-anchor-link href="#sec-a" title="第一节" />
    <el-anchor-link href="#sec-b" title="第二节" />
  </el-anchor>
  <el-scrollbar ref="scrollRef" height="360px">
    <div id="sec-a">…</div>
    <div id="sec-b">…</div>
  </el-scrollbar>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
const scrollRef = ref()
const scrollWrap = ref()
// container 要等 scrollbar 挂载才拿得到；EP 内部 watch(props.container) 会自行重绑，
// 不必用 :key 强制重建组件
onMounted(async () => {
  await nextTick()
  scrollWrap.value = scrollRef.value?.wrapRef
})
</script>
```

**反例**：
- ❌ 页面有固定顶栏却不传 `:offset`（跳过去标题被顶栏遮住，是必踩 bug）。
- ❌ 内容区包了 `el-scrollbar` 却不传 `container`（Anchor 完全失效——这是两条规则的交叉盲区，最易漏）。
- ❌ 指望 `html { scroll-padding-top }` 对 Anchor 生效（那只作用于浏览器原生锚跳，EP 是 JS 滚动）。
- ❌ 首节贴顶却不传 `select-scroll-top`（回到顶部后全部锚点失去高亮）。
- ❌ 用了 `container` 却不拦 `@click` 的默认行为（浏览器原生锚跳叠加，整个模块被顶出视口——**容器内滚动看着"顺带把页面也滚了"就是这个**）。
- ❌ 页面有 hash 导航，却在条件渲染里直接挂 `el-anchor`（它挂载时读全局 hash 就跳走了——**"只是切了个选项，页面自己跳到别处"** 就是这个，别去 Anchor 的滚动逻辑里找原因）。
- ❌ 监听 `@scroll` 自维护 active、或给 `<el-anchor-link>` 手加 `is-active`（marker 由 EP 的 JS 定位，class 驱动不了；`is-active` 挂错层级也不生效——见上方强制做法后的提醒）。
- ❌ 用 `:key` 绑 container 强制重建 Anchor（EP 自己 watch 了 `props.container`，多此一举）。

### ColorPicker 颜色选择器

**何时用**：让用户**自选任意颜色**（主题定制、标注色、图表配色自定义）。

> ⚠️ **先想清楚：真的需要任意色吗？** 界面元素的颜色应走设计令牌（见 `foundations.md`），**不要**用 ColorPicker 让用户改 UI 配色——那会绕过整套令牌体系。它只适合"颜色本身是业务数据"的场景（如给课程标签配色、给标注分类配色）。

**强制做法**：

- **面板宽度已由源头改为 360px**（内部色板/色相条/透明度条 340px）。原因：EP 原生面板写死 300px，而本系统的按钮尺寸与字号档位更大，底部「输入框 + 清空 + 确定」一行会超出 300px、面板出横向滚动条且按钮显示不全——源头**加宽而非压缩**，才能在放大字号档位（L/XL）下完整放下。
  ⚠️ **不要按 300px 去做定位或容器约束**（如给触发器父级设 `max-width: 300px`、或按 300 计算浮层偏移），会错位。
- 需要透明度时传 `show-alpha`；固定几个预设色用 `:predefine`。
- 颜色值格式用 `color-format`（`hex` / `rgb` / `hsl`），**存进业务数据前统一格式**，避免各处存的格式不一。

```vue
<el-color-picker v-model="tagColor" :predefine="['#23b283', '#0077ff', '#f56c6c']" />
```

**反例**：

- ❌ 用它让用户自定义**界面主题色 / 组件配色**（应走设计令牌与品牌色注册机制）。
- ❌ 按 EP 原生的 300px 做布局假设（源头已改 360）。
- ❌ 在使用方覆盖面板尺寸（源头是为字号档位适配算过的，改了在 L/XL 档会重新溢出）。

### 分页器默认用法

**何时用**：分页器用于分隔长列表，每次只加载一个页面。

```vue
<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="[10, 20, 50, 100]"
  :total="total"
  layout="prev, pager, next, sizes, jumper"
/>
```

- layout 顺序：`prev, pager, next, sizes, jumper`（不含 `total`）
- **分页器区域布局**：外层容器使用 `flex` + `justify-content: space-between`，左侧放总数文本（如"共 128 条"），右侧放 `el-pagination`。总数不通过分页器的 `total` layout 项展示

#### 尺寸选型：常规 vs 小型（二选一）

分页器分两档尺寸，按**所在容器大小**选择，不要凭喜好混用：

| 档位 | 何时用 | 属性 / layout |
|---|---|---|
| **常规**（默认） | 适用于**多数场景**，如整页列表、弹窗内列表等标准容器 | 不加 `small`；layout 用完整 `prev, pager, next, sizes, jumper`（可切每页条数、可跳页） |
| **小型** | 适用于**较小的容器内部**，如内嵌子模块、卡片内列表、抽屉里的小列表等空间受限处 | 加 `small`；layout 精简为 `prev, pager, next`（只保留翻页，去掉 sizes/jumper 以省空间） |

- **强制**：小型档必须同时做两件事——加 `:small` **和**精简 layout <!-- @rule id=pagination-small-layout level=MUST cat=组件用法 detect=regex dtitle=窄容器里的分页器应精简且不换行 title=分页小型档必须同时加 small 且精简 layout 为 prev,pager,next -->；只加 `small` 不精简 layout，会在窄容器里挤出换行/溢出。
- **反例**：在整页大列表用小型档（翻页按钮过小、丢了切每页条数能力）；在窄卡片里塞常规档完整 layout（sizes/jumper 挤爆容器）。

### Steps 轻量步骤条（el-steps simple）

**何时用**：引导用户按照流程完成任务的导航条，当任务复杂或者存在先后关系时，将其分解成一系列步骤，从而简化任务。

```vue
<el-steps :active="1" simple>
  <el-step title="提交申请" />
  <el-step title="审核中" />
  <el-step title="审核通过" />
</el-steps>
```

> 步数多时的左右内边距由源头 `steps.scss` 按步数自适应（≤3 步 12%、4~5 步 8%、≥6 步 4%），自动生效——**不要**在使用方手动调 padding 防挤。

### 空状态（Empty）

一律用 `el-empty`，且**必须同时传两样** <!-- @rule id=empty-image-and-class level=MUST cat=状态设计 detect=regex dtitle=空状态应使用设计系统插画，不是默认的灰色纸盒图 title=el-empty 必须同时传设计系统插画 :image 与档位 class（empty-page/empty-block） -->——设计系统插画 + 承载档位 class。**缺任何一样都会落回 EP 默认纸盒插画（反例，等于没接设计系统）**：

- **插画（`:image`）**：用 `el-theme/assets/empty/` 下的场景插画，import 后把 URL 传给 `:image`。按场景选图（8 种）：

  | 场景 | 文件 |
  |---|---|
  | 无资源/无数据 | `no-data.png` |
  | 无网络 | `no-network.png` |
  | 无搜索结果 | `no-search-result.png` |
  | 无课程 | `no-course.png` |
  | 无用户 | `no-user.png` |
  | 无图谱 | `no-graph.png` |
  | 无回复 | `no-reply.png` |
  | 无考试/作业/测验/笔记 | `no-exam.png` |

  暗色主题用 `dark/` 目录下的同名变体。
- **档位 class**：整页空态加 `class="empty-page"`（插图 120、留白大）；卡片/区块内空态加 `class="empty-block"`（插图 80、留白小）。尺寸与间距全在 `el-theme/components/empty.scss` 源头，下游不自行覆盖。
- **底部操作按钮**：放默认插槽，使用**默认态**（`<el-button>`），不使用 `type="primary"`——空状态按钮属于辅助引导，遵循「主操作唯一」原则

可照抄骨架：

```vue
<script setup lang="ts">
import noData from '<path>/design-spec/el-theme/assets/empty/no-data.png'
</script>

<template>
  <el-empty class="empty-page" :image="noData" description="暂无数据">
    <el-button>立即创建</el-button>
  </el-empty>
</template>
```

### Message 消息提示

**何时用**：希望不打断用户操作，并给予轻量提示（一句话的即时反馈，如「保存成功」「删除失败」）。区别于 Notification（右上角、可带操作按钮、默认常驻）与 Alert（嵌在页面里的常驻提示条）。

**强制做法**：
- **一律传 `showClose: true`** <!-- @rule id=message-show-close level=MUST cat=组件用法 detect=regex dtitle=轻提示右侧应始终有关闭按钮 title=ElMessage 一律传 showClose: true -->：源头 `message.scss` 专门为关闭按钮做了 Lucide X 替换并设 `opacity: 1`（强制始终可见，非 hover 才现）——不传就看不到这个已定制好的关闭按钮。
- `type` 走四语义（`success` / `warning` / `error` / `info`），底色与描边由源头按语义配好，使用方不自配。

**可照抄骨架**：

```ts
import { ElMessage } from 'element-plus'

ElMessage({ message: '保存成功', type: 'success', showClose: true })
```

**反例**：
- ❌ 用 `ElMessage.success('x')` 简写（拿不到 `showClose`，关闭按钮不显示）。
- ❌ 用 Message 承载需要用户决策的内容（要决策就该用 Dialog / Popconfirm；Message 是无需响应的即时反馈）。

### Alert 警告

**何时用**：当提示内容较重要、需要常驻在页面或弹窗里吸引用户查看时使用。区别于 Message（飘过即消失的即时反馈）。

**五种场景（含中性）**：

| 场景 | 写法 |
|---|---|
| 成功 / 警告 / 错误 / 信息 | `type="success" / "warning" / "error" / "info"` |
| **中性说明**（无语义色，灰底） | `class="alert-neutral"`（源头 `alert.scss` 约定类） |

> `.alert-neutral` 是**通用变体，不限弹窗内使用**——页面里需要一条不带语义色的说明条时同样用它，不要裸 `div` 自配灰底，也不要拿 `type="info"`（蓝底）冒充中性。

**强制做法**：
- 默认带 `show-icon`。
- **主文案一律传 `title` 属性**，辅助说明才放 `description`（正交配置项，可与 `title` 叠加）。 <!-- @rule id=alert-title-prop level=MUST cat=组件用法 view=impl detect=regex title=el-alert 主文案必须传 title 属性，禁塞默认插槽（插槽=description 区，会触发大图标） -->
  > ⚠️ **`el-alert` 的默认插槽 = `description` 区，不是 title 区**。把单行提示文案直接塞进标签中间（`<el-alert>文案</el-alert>`）等同于「只有 description、没有 title」，EP 会给图标加 `is-big` —— **图标变大、右边距从 8px 撑到 12px**，与同页其它单行 alert 一眼看出不一致。单行提示只传 `title`，不要用默认插槽。
- 内边距、字号、关闭按钮（Lucide X）全在源头，使用方不覆盖。

**可照抄骨架**：

```vue
<!-- ✅ 单行中性提示：文案走 title，图标为小号 -->
<el-alert class="alert-neutral" title="标为「不涉及」的条目不计入分母" :closable="false" show-icon />

<!-- ✅ 标题 + 辅助说明：此时图标自动放大，是 EP 的预期行为 -->
<el-alert type="warning" title="配额即将用尽" description="剩余 3 次调用，请及时联系管理员扩容。" show-icon />
```

**反例**：
- ❌ 用 `el-alert` 实现确认 / 警示 / 删除确认等**需要用户决策**的交互（应走 `el-dialog` 的语义变体或 `el-popconfirm`）。
- ❌ 用品牌绿底承载普通提示（品牌绿是主操作色，不是提示底色）。
- ❌ 需要中性灰提示时用 `type="info"`（那是蓝色信息态，不是中性）。
- ❌ **把单行提示文案塞进默认插槽**（`<el-alert>文案</el-alert>`）—— 那是 description 区，会拿到大图标，与规范展示页的中性提示对不上。

### Loading 加载（按钮 loading / `v-loading` / `ElLoading`）

**先选形态：等待发生在哪，加载态就出现在哪**——这一步选错，做出来就是过度实现。

| 等待的触发点 | 用什么 | 说明 |
|---|---|---|
| **用户点了某个按钮**（提交、导出、删除、生成…） | **`<el-button loading>`** | 加载态就在按钮上，**同时自动禁用防重复提交**。⚠️ **不要为此给整个区域套 `v-loading` 遮罩**——用户点的是按钮，反馈就该在按钮上；盖住整块内容是过度实现，还会挡住用户想同时看的信息 |
| **区域内容整体刷新**（切 tab、换筛选条件、翻页） | **`v-loading` 指令** | 内容要整体替换、且版式未知时用 |
| **首次进入、版式已知** | **骨架屏** | 见下段 Skeleton |
| **整页阻塞**（路由切换、全局初始化） | **`ElLoading.service({ fullscreen: true })`** | 慎用——会阻断全部交互 |

```vue
<!-- ✅ 按钮触发的异步操作：加载态在按钮上，自动防重复点 -->
<el-button type="primary" :loading="exporting" @click="onExport">批量导出</el-button>

<!-- ❌ 过度实现：用户点的是按钮，却把整个表格盖住 -->
<div v-loading="exporting"><el-table … /></div>
```

> 带图标的按钮进入 loading 时，EP 会把 `#icon` 插槽内容替换为加载图标，**不需要自己切换图标**。

**以下是 `v-loading` / `ElLoading` 的用法**（按钮 loading 走 `el-button` 的 `loading` prop，无需下列配置）：

**强制做法**：

- **一律用 `v-loading` 指令**（或 `ElLoading.service()` 做全屏） <!-- @rule id=loading-no-custom-spinner level=MUST cat=组件用法 detect=regex dtitle=加载动画应是设计系统的四圆点，不是自拼的转圈图标 title=区域加载一律用 v-loading 指令，禁自拼转圈图标/遮罩层 -->，**不要自己拼转圈图标 / 遮罩层**。本系统已把 EP 默认的转圈 spinner **整体替换为四圆点动画**（2×2 网格、透明度阶梯、整组旋转，颜色跟随 `--iflyv-brand-primary`），自己手写的加载态与全站观感完全不一致。
- **加载文案用 `element-loading-text`**（源头已配好 `text-3` 色阶与 12px 间距），不要在遮罩里自己塞 `<p>`。
- **遮罩带背景模糊**（`backdrop-filter`），无需也不要自己加半透明底色。
- **全屏加载自动反白**：`fullscreen` 时四圆点与文字自动切成白色系（源头已处理），使用方不必改色。

```vue
<!-- ✅ 区域加载：指令 + 文案 -->
<div v-loading="submitting" element-loading-text="正在提交...">…</div>

<!-- ✅ 全屏加载 -->
<script setup lang="ts">
import { ElLoading } from 'element-plus'
const loading = ElLoading.service({ fullscreen: true, text: '加载中...' })
// …完成后
loading.close()
</script>
```

**反例**：

- ❌ 自己写一个转圈 svg / 半透明遮罩当加载态（与全站四圆点观感不符，且不随品牌色切换）。
- ❌ 用 `v-loading` 做**版式已知**的内容加载（应上骨架屏，遮罩会盖住整块、体验更"卡"）。
- ❌ 在使用方覆盖 `.el-loading-spinner` / `.circular` 的样式（四圆点实现全在源头 `loading.scss`，改了就脱离单一数据源）。

### Skeleton 骨架屏

**何时用**：内容加载中、且已知内容大致版式时，用骨架屏替代 loading 遮罩，视觉体验更平滑。内容版式不确定或操作型等待（提交中）仍用 `v-loading`（见上段）。

**强制做法**：
- **必须 `animated`**（无动画版本本系统不使用）。 <!-- @rule id=skeleton-animated level=MUST cat=状态设计 detect=regex dtitle=骨架屏应有流动动画，且在底色上看得清 title=el-skeleton 必须传 animated -->
- **必须铺在白底上**：骨架灰条在 `bg-card`（浅灰）上对比过弱几乎看不见 <!-- @rule id=skeleton-on-panel level=MUST cat=状态设计 detect=regex dtitle=骨架屏应铺在白底上，灰底上会看不清 title=骨架屏承载容器必须用 bg-panel 白底（bg-card 浅灰上对比过弱） -->，承载容器要用 `var(--iflyv-bg-panel)`。这是本组件最容易「写了等于没写」的一条。
- 用 `:loading` + 默认插槽做加载态与真实内容的切换，不要手写 `v-if/v-else` 两套结构。

**可照抄骨架**：

```vue
<template>
  <!-- 白底衬托：灰条铺在浅灰底上对比弱 -->
  <div class="skeleton-host">
    <el-skeleton :loading="loading" :rows="3" animated>
      <template #default>真实内容</template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.skeleton-host {
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-md);
}
</style>
```

**反例**：
- ❌ 把骨架屏直接铺在 `bg-card` 浅灰底上（对比不足，用户看不到骨架）。
- ❌ 不传 `animated`（静态灰条不像加载中，像坏掉的布局）。

### Result 结果页

**何时用**：对重要操作给出复杂或重要的**整页结果反馈**（如批量导入完成、提交失败详情）。轻量结果用 Message；弹窗内的结果汇总用 `el-dialog` 的 `is-success` 语义变体。

**强制做法**：
- **`icon` 只允许 `success` / `error` 两个值** <!-- @rule id=result-icon-two-values level=MUST cat=组件用法 detect=regex dtitle=结果页图标只有成功（绿）和失败（红）两种，不应出现无颜色的图标 title=el-result 的 icon 仅允许 success/error，传 warning/info 属名单越界 -->：源头 `result.scss` 只为 `.icon-success`（绿）与 `.icon-error`（红）配了语义色，传 `warning` / `info` 会得到没有配色的图标。**名单越界属违规**。
- 结构固定三段：`title`（主结论）+ `sub-title`（补充说明）+ `#extra`（后续操作按钮）。
- 图标为无底板纯语义色 40×40，源头已定，不自定义 `#icon` 插槽塞插画（那是 Empty 的做法，两者不通用）。

**可照抄骨架**：

```vue
<template>
  <el-result icon="success" title="提交成功" sub-title="预计 3 个工作日内完成审核">
    <template #extra>
      <el-button type="primary">返回列表</el-button>
    </template>
  </el-result>
</template>
```

**反例**：
- ❌ `icon="warning"` / `icon="info"`（源头未适配，图标无语义色）。
- ❌ 给 Result 硬塞 Empty 的空状态插画（两者语义不同：Empty 是「没有内容」，Result 是「操作有了结果」）。

### Notification 通知（场景 / 常驻 / 操作按钮）

- **应用场景**：适用于**较长时间的结果通知**——期间用户不必停留等待、可去做其他操作，完成后通知从右上角弹出告知。区别于 Message（一句即时轻反馈）与 Dialog（需当场打断处理）。

通知一律用 `ElNotification`，能力按**正交配置项**建模，自由叠加，不穷举具名类型：

| 配置项 | prop | 说明 |
|---|---|---|
| **场景**（语义色 + 图标） | `type: 'success' \| 'warning' \| 'error' \| 'info'` | 四类语义，决定左侧图标与色 |
| **是否常驻** | `duration` | 常驻 = `0`（不自动关闭，需用户手动关或代码 `handle.close()`）；非常驻 = 默认 `4500`（毫秒后自动消失）。**取向**：通知**默认常驻**（结果类信息重要、用户可能不在场，让其自行确认关闭）；**非必要不设临时**（自动消失易被用户错过）。带操作按钮时必常驻 |
| **操作按钮** | 无原生 prop —— 见下 | 通知内需要放操作按钮时的标准做法 |

- **带操作按钮的通知（强制做法）**：`ElNotification` **没有 footer / 按钮 prop** <!-- @rule id=notification-h-actions level=MUST cat=组件用法 view=impl detect=regex title=通知里的操作按钮必须用 h() 渲染 + .notify-actions 约定类，禁手撸布局 -->，操作按钮**必须**用 `h()` 把「一段正文 + 一行按钮」渲染成 VNode 传给 `message`，**禁止**为此手撸浮层或改用别的组件。按钮行**必须**套约定 class **`.notify-actions`**（右对齐 + 间距全在源头 `notification.scss` 统一处理，下游只写这一个 class、不写行内布局 style）。按钮遵循「按钮个数」规范：**一退路（次按钮，如"忽略"）+ 一进路（主按钮，如"查看详情"）**。按钮 `onClick` 里调 `handle.close()` 关闭当前通知（`handle = ElNotification({...})` 的返回值）。
  ```ts
  let handle: NotificationHandle
  handle = ElNotification({
    title: '操作成功', type: 'success', duration: 0,   // 带操作按钮通常配常驻(0)，给用户决策时间
    message: h('div', [
      h('p', { style: 'margin: 0;' }, '数据已成功保存到系统中。'),
      h('div', { class: 'notify-actions' }, [                                             // ← 约定 class，布局全在源头
        h(ElButton, { size: 'small', onClick: () => handle?.close() }, () => '忽略'),          // 退路(次按钮)
        h(ElButton, { size: 'small', type: 'primary', onClick: () => handle?.close() }, () => '查看详情'), // 进路(主按钮)
      ]),
    ]),
  })
  ```
- **反例**：为"通知里加个按钮"另写一个绝对定位浮层 / 自造 Toast 组件；把操作按钮塞进 `title`；或用行内 `style` 手写按钮行布局（应走 `.notify-actions`）。

### Skeleton 骨架屏
**何时用**：可以被「加载」完全代替，但是在可用的场景下可以比 Spin 提供更好的视觉效果和用户体验。

### Result 结果页
**何时用**：当有重要操作需告知用户处理结果，且反馈内容较为复杂/重要时使用。

### Popconfirm 气泡确认（轻量二次确认）

**何时用**：目标元素的操作需要用户进一步完成交互形式更轻量的确认时使用。

删除、离开等**低风险**操作的二次确认，用 `el-popconfirm`（就地气泡，不打断全屏）；高风险 / 需要用户全神贯注的确认才升级到 `el-dialog`（见上方 Dialog 段）。

- **气泡内按钮走 32px 小号规格（源头已定，下游不覆盖）**：本主题按钮默认 `default=36px`，但气泡是**轻量浮层**，36px 在小气泡里显大。源头 `popconfirm.scss` 在气泡按钮行**局部**把 `--el-component-size` / `--el-component-size-small` 覆写为 **32px**——**仅作用于气泡内**，不影响全局 default/small 档与别处按钮。
  - **落地含义**：气泡内直接用 `<el-button>` 即可，会自动渲染成 32px；**不要**在使用方给气泡按钮硬写 `height` / `size="small"` 去凑小号（尺寸已由源头 EP 尺寸变量统一给定，硬写会脱离源头、切档时不同步）。
  - 按钮个数遵循「一退路 + 一进路」（取消 + 确认），间距由源头 `.el-popconfirm__action` 统一提供，使用方不加 flex+gap。
- **反例**：为"就地确认"手撸一个绝对定位小浮层；给气泡内按钮写 `style="height:32px"` 或 `size="small"` 凑小号（应让源头尺寸变量生效）；低风险操作也弹全屏 `el-dialog`（过重、打断感强）。

### Dialog 两类：操作弹窗 vs 提示弹窗（先分清是哪类）

弹窗按「用户来干嘛」分两类，先判类别再定形态（宽度 / 语义变体 / 按钮）：

| 类别 | 用途 | 特征 | 形态要点 |
|---|---|---|---|
| **操作弹窗** | 在弹窗内**进行操作**（表单填写、编辑、配置等）的载体 | 信息量更少、信息关联度更高、任务连贯性更弱、页面遮挡更多 | 宽度按场景三档（确认/单字段 400、常规表单 640、复杂/双列 800）；内含表单再叠 form-pattern；高度下限 240px |
| **提示弹窗** | **传达系统给用户的提醒**——需要打断用户、信息较重要 | 内容轻（一两行文案 + 按钮），不承载复杂操作 | 加语义变体类（is-warning/is-danger/is-success/is-info，见下）；宽度多为 400；高度下限 160px |

- **判断入口**：先问「用户是要在这弹窗里*做一件事*（填表/编辑），还是系统要*提醒/打断*用户？」——做事 → 操作弹窗；提醒 → 提示弹窗。
- 两类都用 `el-dialog`（下方语义变体、按钮个数等规则通用）；载体是否该用弹窗（vs 页面/抽屉）另见 `references/patterns/dialog-pattern.md` 的四维判据。

### Dialog 语义化标题（4 种变体）

**背景**：本设计系统**统一使用 Dialog**（不引入 `ElMessageBox` 命令式 API） <!-- @rule id=dialog-no-messagebox level=MUST cat=组件选用 detect=regex dtitle=所有弹窗观感一致（标题/按钮/圆角同一套），不应有长得不一样的系统弹窗 title=弹窗统一用 el-dialog，不引入 ElMessageBox 命令式 API -->。为了让 Dialog 也能表达「警示 / 危险 / 成功 / 信息」语义，提供 4 个变体类——使用方加一个 class 即可在标题前自动渲染圆形彩色底板 + 白色 Lucide 图标。

**4 个变体的语义与使用场景**：

| 变体类 | 视觉 | 使用场景 |
|--------|------|---------|
| `is-warning` | 橙色圆底 + 感叹号「!」 | **警示但非危险**：未保存离开、配额接近上限、操作可逆但需提醒 |
| `is-danger` | 红色圆底 + 叉号「X」 | **危险且不可逆**：删除、清除、永久禁用、批量销毁 |
| `is-success` | 绿色圆底 + 勾「✓」 | **操作完成结果反馈**：批量操作成功、流程完成 |
| `is-info` | 蓝色圆底 + 字母「i」 | **中性信息提示**：版本更新、功能说明、用户引导 |

**用法**：

```vue
<!-- ✅ 推荐：危险操作，标题语义化 + type="danger" 主按钮 -->
<el-dialog class="is-danger" title="删除用户「张三」" width="400px">
  <p>此操作不可撤销，张三的所有数据将被永久删除。</p>
  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="danger" @click="handleDelete">确认删除</el-button>
  </template>
</el-dialog>

<!-- ✅ 推荐：警示提醒，主按钮用 primary（操作本身不危险） -->
<el-dialog class="is-warning" title="离开未保存页面" width="400px">
  <p>当前页有 3 处修改未保存。</p>
  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary" @click="handleLeave">保存并离开</el-button>
  </template>
</el-dialog>
```

**按钮个数（footer 放几个按钮）——拆成「退路」和「进路」两部分分别数**：

- **退路**（用户"不往前做"的出口，如 取消 / 稍后 / 留下）：最多 **1 个**。要么给一个退路，要么（纯告知类）不给。
- **进路**（用户"往前做"的正向动作，如 确认删除 / 保存并离开）：**1 个或多个并列分支**。当"往前"有多种走法且它们地位并列（不是主次），就是多个进路。

由此得出的常见形态：

| 弹窗性质 | 按钮数 | 组成 | 典型 |
|---|---|---|---|
| **纯结果告知 / 无需抉择** | **1 个** | 仅一个进路（关闭） | 操作完成反馈（知道了）、单纯信息通知（确定） |
| **一退路 + 一进路** | **2 个** | 退路在左 + 进路（主按钮）在右 | 删除确认（取消 / 确认删除）、版本更新（稍后 / 立即更新） |
| **一退路 + 多个并列进路** | **3 个（或更多）** | 退路在最左 + 若干并列进路在右 | 离开未保存（取消 / 不保存离开 / 保存并离开）：「取消」是退路，「不保存离开」「保存并离开」是两条并列的"往前走"分支 |

- **判断入口**：先分「用户往前走有几种走法」（进路数）+「要不要留一个不做的出口」（退路 0 或 1）。二者相加即按钮数。
- **三钮的合法前提是"多出来的是并列进路"**：三个及以上按钮，仅在多出来的确实是**并列的正向分支**（地位平等、都是"往前走"的不同走法）时才成立。若多出来的是**不相关的第四类动作**（如在删除确认里塞"另存为""导出"），说明它已超出简单确认——回 `dialog-pattern.md` 判据改用更重载体（页面/抽屉），而非在 footer 堆无关按钮。
- **进路里可再分主次**：多个并列进路中，可把最推荐的一个设为 `type="primary"`（如「保存并离开」为主、「不保存离开」用默认样式），但它们语义上仍是并列走法，不是"主操作 + 退路"。
- 按钮**顺序**：退路在最左，进路依次在右；主推荐的进路放最右。**type** 按上文与语义匹配。

**标题必须写清操作对象**：禁用「确认操作」「提示」「警告」这类通用文案 <!-- @rule id=dialog-title-specific level=MUST cat=文案规范 detect=manual title=弹窗标题必须写清操作对象，禁「确认操作」「提示」这类通用文案 -->，写成「删除用户「张三」」「停用课程「数据结构」」。两层理由——① 屏幕阅读器用户只听得到标题，通用文案等于没说；② 多个弹窗先后弹出时，视觉用户也会分不清当前确认的是哪一个。

**异步提交期间必须锁住全部关闭路径（三处联动，只加 loading 不够）**：

提交请求在飞行中时，用户仍可能通过**点遮罩**或**按 Esc** 关掉弹窗——此时请求还会回来，造成"弹窗已关但数据变了"或重复提交。因此三处要一起随 `submitting` 状态变化：

```vue
<el-dialog
  v-model="visible"
  title="删除用户「张三」"
  width="400px"
  class="is-danger"
  :close-on-click-modal="!submitting"
  :close-on-press-escape="!submitting"
>
  <p>此操作不可撤销。</p>
  <template #footer>
    <el-button :disabled="submitting" @click="visible = false">取消</el-button>
    <el-button type="danger" :loading="submitting" @click="onConfirm">确认删除</el-button>
  </template>
</el-dialog>
```

- **含表单的弹窗**：无论是否异步，都建议常驻 `:close-on-click-modal="false"`——误点遮罩会丢掉已填内容。
- **多步骤 / 可切换视图的弹窗**：加 `destroy-on-close`，否则关闭后再打开会残留上次的步骤位置与表单状态（配合「多标题切换」结构件使用时尤其明显，见下段）。

**反模式**：

- ❌ **标题写「确认操作」「提示」等通用文案** —— 屏幕阅读器用户听不出要确认什么；多弹窗并存时视觉用户也会混淆。

- ❌ **异步提交只给主按钮加 `loading`** —— 用户仍能点遮罩 / 按 Esc 关窗，请求照样回来，导致数据不一致或重复提交。三处要联动（见上）。

- ❌ **多步骤弹窗不设 `destroy-on-close`** —— 关闭再打开时停在上次的步骤、表单残留旧值。

- ❌ **混用语义色与按钮 type**：`class="is-warning"` 配 `type="danger"` 主按钮——语义不一致（警告色标题但危险色按钮，让用户困惑是不是危险操作）。**正确**：变体类与主按钮 type 应匹配语义（is-danger 配 type="danger"，is-warning / is-info / is-success 配 type="primary"）。

- ❌ **不带变体类的危险操作**：`<el-dialog title="删除"><el-button type="danger">确认</el-button></el-dialog>` —— 标题前无视觉警示，仅靠按钮颜色提醒，警示强度弱。**正确**：危险操作一律加 `class="is-danger"`。

- ❌ **滥用 is-success 做"完成态弹窗"**：`is-success` 用于反馈"操作已完成"（多见于批量操作结果汇总、复杂流程完结）。**禁止**用于普通成功提示——后者用 `ElMessage.success()` 即可，不需要弹窗。

- ❌ **变体类用错语义层级**：误把"未保存离开"用 `is-danger`、"删除"用 `is-warning`——会让用户对警示等级的认知失准。**判断标准**：
  - is-warning = "你确定要这么做吗？做错了能反悔"
  - is-danger = "做了就回不去了"

**实现细节见**：`el-theme/components/dialog.scss` 的「语义化标题图标变体」段。
**示例代码见**：`design-spec/examples/dialog.examples.vue` 的「语义化标题」section。

### Dialog 结构件：提示信息条 / 多标题切换（约定 class，源头 dialog.scss）

- **弹窗内提示信息条**：弹窗需要一句全局引导/说明（操作前提、影响范围、填写须知）时，放在 **content 区顶部**（header 之下、主内容之上），用中性灰底 alert 承载；与下方内容的 20px 间距由源头统一给，使用方不再写间距：

  ```vue
  <el-alert class="alert-neutral" type="info" :closable="false" title="提示信息" />
  ```

  语义级别：一般引导用中性灰底（`.alert-neutral`）；仅当提示本身是警告/危险语义时才改用对应 `type`。**不要用品牌绿底承载普通提示**（品牌色仅用于强调，与 Tag 选色约定同理）。

- **多标题切换头部**（一个弹窗内多视图切换，如「标题一/标题二」）：`#header` 具名插槽里放标题组，容器加 `.dialog-titles`、每个标题用 `.dialog-title-item`、当前项加 `.is-active`（选中态字重/色阶、标题间距 20px 全在源头）：

  ```vue
  <template #header>
    <div class="dialog-titles">
      <span class="dialog-title-item is-active">标题一</span>
      <span class="dialog-title-item" @click="switchTo(2)">标题二</span>
    </div>
  </template>
  ```

- **反例**：提示条用裸 `div` + 自配底色；多标题用页面 scoped 自写字重/间距切换态——两者都是脱离源头的私货。

### Drawer 抽屉（何时用抽屉 vs 对话框）

**使用判据**：当需要辅助信息展示或操作承载时，按以下四个维度判断该用抽屉（`el-drawer`）还是对话框（`el-dialog`）：

| 维度 | 对话框（Dialog） | 抽屉（Drawer） |
|---|---|---|
| **承载信息量** | 更少（确认文案 / 简单表单） | **更多**（详细表单 / 多层信息 / 大量字段） |
| **信息关联度** | 更高（一次任务的核心内容） | **更低**（辅助信息、补充说明、松散编辑项） |
| **任务连贯性** | 更弱（打断用户完成当前任务） | **更强**（可边看主内容边操作抽屉里的内容） |
| **页面遮挡** | 更多（居中遮挡主区域） | **更少**（从侧边滑出，主内容仍部分可见） |

**判断入口**：先问"这块内容承载信息量大吗？用户边操作边看主页面的需求强吗？"——信息量大 + 任务需来回切换 → 抽屉；信息量少 + 需全神贯注 → 对话框。

**强制做法**：
- 抽屉从右侧滑出（`direction` 默认 `rtl`），宽度建议 `400px`（轻量表单）或 `600px`（详细信息）。
- **底部按钮布局**：
  - **默认无 footer** — 只读信息展示（如查看详情、历史记录），无需操作按钮。
  - **有 footer 时**：按钮水平排列，次按钮（取消）在左、主按钮（确定）在右（与对话框顺序一致——两者 footer 都是右对齐，按**主按钮贴边原则**（见 `foundations.md`）主按钮同样贴右缘）。
  - **窄抽屉（≤400px）时**：按钮可垂直排列（主按钮在上、次按钮在下），外层加 `.drawer-footer--vertical` class（见 `drawer.scss`）。
- **抽屉 vs 对话框 vs 页面**：上表适用于"已判定需浮层"的场景。若操作是页面主线（如创建/编辑核心资源、需填完整多 section 表单），应走独立页面，不要用浮层塞；详见 `patterns/dialog-pattern.md` 四维判据。

**反例**：
- ❌ 用抽屉做删除确认、版本提示等轻量二次确认（信息量少 + 需聚焦 → 该用对话框）。
- ❌ 用对话框承载复杂详情页、多 tab 切换内容（信息量大 + 关联度低 → 该用抽屉或独立页面）。
- ❌ 抽屉 footer 按钮顺序与对话框相反（混淆用户习惯）。


### 滚动条（内部滚动区一律 el-scrollbar）

**使用判据**：只要一个区域需要**内部滚动**（内容超出容器高/宽而非撑长页面），就用基础组件 `<el-scrollbar>` 包裹，**不要**在 div 上直接写 `overflow: auto / scroll` <!-- @rule id=scrollbar-no-raw-overflow level=MUST cat=组件用法 detect=regex dtitle=区域滚动条应是细长半透明的设计系统样式，不是浏览器默认灰色滚动条 title=内部滚动区一律用 el-scrollbar，禁在 div 上直接写 overflow:auto/scroll -->。

| 场景 | 做法 |
|---|---|
| 侧边导航、面板、卡片内长列表 | `<el-scrollbar>` 包裹 |
| 弹窗 / 抽屉的可滚内容区 | `<el-scrollbar>` 包裹 |
| 表格 / 下拉等 EP 组件自带的滚动 | EP 内部已用 el-scrollbar，无需处理 |
| 页面主滚动（body 撑长，浏览器级滚动条） | 不用包，源头已统一样式（见下） |

**为什么必须是 el-scrollbar**：浏览器原生滚动条在 Chrome 上是「覆盖层滚动条」，**样式几乎不可控**——`::-webkit-scrollbar-track` 之外的白底去不掉，而一旦给 `::-webkit-scrollbar` 自身设任何属性，Chrome 立刻切成「经典占位滚动条」，会把容器内容挤宽错位。`el-scrollbar` 是自绘条：浮在内容上不占位、无原生 track 白底、hover 才显形，且样式完全可控。

**强制做法**：
- 内部滚动区一律 `<el-scrollbar>`；滚动内容的排布（flex 方向 / gap / 内边距）写在 `view-class` 指定的 view 上 <!-- @rule id=scrollbar-view-class level=SHOULD cat=组件用法 view=impl detect=regex title=滚动内容的排布写在 view-class 指定的 view 上，不写在 el-scrollbar 外壳 -->，**不要**写在 el-scrollbar 外壳上（滚动发生在 view 这一层）。
- 外壳负责在父级 flex 里占位（如 `flex: 1; min-height: 0`）。
- **滚动条外观（粗细 / 颜色 / 圆角 / 过渡）全部在源头 `el-theme/components/scrollbar.scss`**，接入方一律不覆盖。页面主滚动条（`html`/`body`）也已在该文件统一为与 el-scrollbar 一致的观感（宽 6px、hover 8px、圆角 4px、thumb 半透明、track 透明），接入方同样不再自写。 <!-- @rule-skip dup 已由 scrollbar-no-raw-overflow 与 ssot-no-scoped-override 覆盖 -->

**可照抄骨架**：
```vue
<template>
  <aside class="sidebar">
    <div class="sidebar__fixed">固定不滚的部分</div>

    <el-scrollbar class="sidebar__scroll" view-class="sidebar__scroll-view">
      滚动内容
    </el-scrollbar>
  </aside>
</template>

<style scoped lang="scss">
.sidebar { display: flex; flex-direction: column; min-height: 0; }
/* 外壳只负责占位 */
.sidebar__scroll { flex: 1; min-height: 0; }
/* 内容排布放 view 上（滚动发生在这一层） */
:deep(.sidebar__scroll-view) {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-3);
}
</style>
```

**反例**：
- ❌ 在 div 上直接写 `overflow-y: auto` 做内部滚动区（拿到不可控的原生滚动条，白底/占位错位问题随之而来）。
- ❌ 在使用方写 `::-webkit-scrollbar` 系列规则调滚动条外观（属于组件外观私货，且给 `::-webkit-scrollbar` 自身设属性会让 Chrome 切成占位滚动条、挤宽内容）。
- ❌ 把滚动内容的 flex/gap 写在 el-scrollbar 外壳上（滚动发生在内部 view，写外壳上不生效）。
- ❌ 自己封一个「滚动条组件」包住 el-scrollbar（另起炉灶，el-scrollbar 本身就是标准基础组件）。

---

## ⏸ 暂停启用的组件与形态（勿用清单）

> **下列组件 / 形态当前不在本设计系统的启用范围内**——demo 已下架展示，部分连源头样式都未编译进产物。**做需求时不要选用它们** <!-- @rule id=component-no-suspended level=MUST cat=组件选用 detect=regex dtitle=组件观感应与规范展示页一致，不应出现明显偏离设计系统的原生样式控件 title=不得使用「勿用清单」内已停用的组件（el-popover/el-menu/el-link/el-collapse/el-progress/el-timeline 等） -->；确有需要请先与设计负责人确认后恢复，而不是直接写进业务代码。
>
> **为什么要显式列出**：这些组件在 Element Plus 里是存在的、写出来也不报错，但拿到的是 **EP 原生观感**而非本设计系统的样式——与全站不一致，且不随源头更新。不写这份清单，下游只会以为"能用"。
>
> **「停用范围」栏有三种写法，含义不同**：
> - **整体停用 / 仅某形态** → 曾经启用过、现已下架（demo 有 `⏸` 标记）。
> - **未纳入** → **从未纳入本设计系统**，源头零适配。写出来同样是 EP 原生观感。部分还会**与既有机制冲突**（如 `el-space` 绕过间距令牌、`el-text` 与语义字阶并行、`el-splitter` 与栅格模型冲突、`el-affix` 与 z-index 层级契约冲突）——这类即使"看起来能用"也不要用。
> - **不引入** → 有等价的标准做法，刻意不用它（如 `ElMessageBox` → 统一走 `el-dialog`）。
>
> **两类停用，看「替代方案」栏区分**：
> - **有替代方案** → 直接改用替代品即可（如链接→`<el-button text>`、折叠面板→`el-tabs`）。
> - **标 🚧「将来以业务组件形式补」** → 该能力本设计系统**尚未提供**，正等着按产品调性做成业务组件。这是**有计划的留白，不是漏写**——当前遇到就**停下来与设计负责人确认**，不要临时拿 EP 原生组件顶上（顶上去的观感将来还要返工，且脱离源头）。

| 组件 / 形态 | 停用范围 | 替代方案 |
|---|---|---|
| **`el-backtop` 回到顶部** | **源头样式未编译**（`el-theme/index.scss` 的 `@use` 已注释）+ demo 下架 | 长页导航用 `el-anchor` 锚点；确需回顶请先确认再恢复 |
| **`el-popover` 气泡卡片** | 整体停用 | 一句说明 → `el-tooltip`；一组操作项 → `el-dropdown`；就地确认 → `el-popconfirm`；需承载多个控件 → `el-dialog` |
| **`el-upload` 上传** | 整体停用 | 🚧 **暂无替代，将来以业务组件形式补**（按产品调性重做，不走 EP 原生）。当前需要上传功能时**先与设计负责人确认**，不要临时用 `el-upload` 顶上 |
| **`el-transfer` 穿梭框** | 整体停用 | 多选场景用 `el-select` 多选（见 `patterns/select-pattern.md`） |
| **`el-tree` 树形控件** | 停用**独立的树控件**；**`el-tree-select` 不在停用范围、正常可用**（源头 `tree.scss` 专门为 `.el-tree-select__popper` 写了适配，demo `SelectDemo` 有展示） | 有层级的单选：下拉形态用 `el-tree-select`，或用 `el-cascader`（见 `patterns/select-pattern.md`） |
| **`el-timeline` 时间线** | 整体停用 | 🚧 **暂无替代，将来以业务组件形式补**（学习轨迹 / 操作日志等场景按产品调性重做）。当前需要时**先与设计负责人确认**，不要临时用 `el-timeline` 顶上 |
| **`el-progress` 进度条** | 整体停用 | 🚧 **暂无替代，将来以业务组件形式补**（成绩 / 完成度 / 任务进度等场景按产品调性重做）。当前需要时**先与设计负责人确认**，不要临时用 `el-progress` 顶上 |
| **`el-collapse` 折叠面板** | 整体停用 | 分段内容用 `el-tabs`（见 Tabs 段）；长表单分节见 `patterns/form-pattern.md` §8 |
| **`el-link` 链接** | 整体停用 | 行内文字操作用 `<el-button text>`（无底、hover 变色，能力等价） |
| **`ElMessageBox` 命令式弹窗**（`.confirm()` / `.alert()` / `.prompt()`；渲染出的是 `el-message-box`） | 不引入 | **本设计系统统一用 `<el-dialog>`**——命令式 API 拿不到设计系统的语义变体（`is-danger` 等 4 种）、宽度三档、footer 按钮规范。确认场景见 Dialog 段与 Popconfirm 段 |
| **`el-menu` 导航菜单** | 整体停用。**源头 `menu.scss` 只有 RTL 兜底、零外观适配**——写出来拿到的是纯 EP 原生观感 | 整页框架的侧边导航一律用业务组件 **`PageFrame`**（`:menus` 分组配置，选中态/折叠/浮层全内置）；一组收纳的操作项用 `el-dropdown` |
| **`el-input-tag` 标签输入** | 整体停用。源头只有字号变量 + focus ring，**无完整外观适配** | 从固定选项里多选用 `el-select` 多选（`collapse-tags`，见 `patterns/select-pattern.md`） |
| **`el-autocomplete` 输入建议** | 未纳入。能力与 `el-select` 的 `filterable` 重叠 | 从固定选项里选（含搜索）用 `el-select` + `filterable`（见 `patterns/select-pattern.md`） |
| **`el-card` 卡片** | 未纳入。本系统的"卡片"由**背景令牌 + 圆角令牌**自行组合（`bg-card` / `bg-panel` + `radius-md`），不使用 EP 的 Card 组件——两套并行会导致同一页出现两种卡片观感 | 卡片容器自己写：`background: var(--iflyv-bg-card); border-radius: var(--iflyv-radius-md); padding: var(--iflyv-spacing-6)`（档位见 `foundations.md`） |
| **`el-countdown` 倒计时** | 未纳入。当前业务无场景，源头零适配 | 需要时先与设计负责人评估（注：`copywriting/time.md` 目前只定义绝对时间格式，无相对时间/倒计时口径） |
| **`el-segmented` 分段控件** | 未纳入。能力与 Tabs 组件级档（`.tabs-sub`）、`radio-button` 重叠 | 少量互斥项切换用 **Tabs 组件级档 `.tabs-sub`**（见 Tabs 段三档选型） |
| **`el-table-v2` 虚拟表格** | 未纳入。API 与 `el-table` 完全不同、源头零适配，启用需整套新写适配 | 长列表当前统一走**分页**（见分页器段）；确有超大数据量需求先与设计负责人评估 |
| **`el-carousel` 走马灯** | 未纳入。当前业务无场景，源头零适配 | 需要时先与设计负责人评估 |
| **`el-image` / `el-image-viewer` 图片与预览** | 未纳入。源头零适配 | 简单图片展示用原生 `<img>`（尺寸/圆角走令牌）；需要预览/懒加载等能力先评估 |
| **`el-affix` 固钉** | 未纳入。⚠️ 与本系统的固定顶栏 + `--iflyv-z-sticky` 层级契约易冲突 | 吸顶需求先与设计负责人评估，不要自行 affix |
| **`el-mention` 提及** | 未纳入。当前业务无场景，源头零适配 | 需要时先评估 |
| **`el-splitter` 分栏面板** | 未纳入。⚠️ 与栅格系统（`.grid` 24 列固定水槽）的布局模型冲突 | 分栏用栅格 `.grid__col-*`（见 `efficiency-guide.md`） |
| **`el-check-tag` 可选标签** | 未纳入。与 Checkbox / Select 多选能力重复 | 多选用 `el-checkbox-group` 或 `el-select` 多选 |
| **`el-tree-v2` 虚拟树** | 未纳入（独立树控件本就停用，见上方 `el-tree` 行） | 同 `el-tree` 行 |
| **`el-space` 间距组件** | 未纳入。⚠️ **与「间距一律走令牌」纪律冲突**——它用 JS 计算间距，绕过 spacing 令牌 | 间距一律父容器 `flex + gap: var(--iflyv-spacing-*)` |
| **`el-text` 文字组件** | 未纳入。⚠️ 它的 `type`/`size` 与本系统的**语义字阶令牌**（12 档）是两套并行体系，混用会失控 | 文字一律用语义字阶：`font: var(--iflyv-font-body-sub)` 等（见 `foundations.md`） |
| **`el-watermark` 水印** | 未纳入。当前业务无场景，源头零适配 | 需要时先评估 |
| **`el-infinite-scroll` 无限滚动** | 未纳入。列表加载策略当前统一走**分页**（见分页器段） | 长列表用 `el-pagination`；超大数据量的选型先与设计负责人评估 |
| **`el-tour-step`** | 随 `el-tour` —— `el-tour` 在「✅ 无额外规矩」清单里，其子组件同 | 见「✅ 无额外规矩」清单的 `el-tour` 行 |
| **`el-steps` 的 `align-center` / 竖向形态** | 仅这两个形态 | 横向 `simple` 形态正常可用（见 Steps 段）；分步流程头部用业务组件 `StepBar` |
| **`el-skeleton` 的无动画 / `:loading` 切换演示** | 仅这两种用法的 demo 下架 | 骨架屏本身正常可用，但**必须 `animated`**（见 Skeleton 段） |

> **恢复某项时的对账**（避免只恢复一半）：① demo 对应 `*Demo.vue` 里的 `⏸ 暂停展示` 注释块 + `App.vue` 的导航项 / import；② 若源头 `el-theme/index.scss` 的 `@use` 也被注释（目前仅 `backtop`），一并放开；③ **回本清单删除该行**，并按需在上文补用法条目 + 在 `CLAUDE.md` 触发表加触发行——**三步做完才算恢复**，否则又会退化成「能用但没人知道怎么用」。

---

## ✅ 无额外规矩的组件（直接按 EP 官方用法用）

> 下列组件**正常启用**，但源头只做了「令牌对齐（字号/颜色走本系统令牌）+ RTL 逻辑属性平移」，**没有形态选择、没有约定 class、没有需要下游知道的坑**——因此本文档不为它们单列用法条目。
>
> **按 Element Plus 官方文档用即可**，外观会自动跟随本设计系统（字号、颜色、圆角等已由源头对齐）。列出它们是为了消除歧义：**"文档里查不到"不等于"不让用"**——不在这份表、也不在上面「勿用清单」里的组件，才需要按最高铁律先与设计负责人确认。

| 组件 | 源头做了什么 |
|---|---|
| `el-divider` 分割线 | 分割线文字走 `text-3` + 14px 字号；RTL 下 `is-left`/`is-right` 位置翻转 |
| `el-statistic` 统计数值 | 标题行高对齐令牌；前后缀间距 RTL 化。⚠️ 大号强调数字请用字阶 `--iflyv-font-number-display`（见 `foundations.md`） |
| `el-page-header` 页头 | 行高与左侧间距对齐令牌 + RTL 化。⚠️ **整页骨架请用业务组件 `PageFrame`**，本组件仅用于独立的返回式页头 |
| `el-tour` 引导 | 正文 14 / 标题 16 字号对齐令牌 |
| `el-avatar` 头像 | 默认底色走令牌；头像组间距 RTL 化。⚠️ **人员头像一律用业务组件 `UserAvatar`**（内置角色图 + 三档尺寸），裸 `el-avatar` 仅用于非人员的图形占位 |
| `el-popper` 浮层底座 | 各类浮层（下拉/气泡/提示）共用的定位与阴影底座，**由上层组件自动使用，下游不直接写** |
