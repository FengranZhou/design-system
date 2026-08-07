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
| **STRONG** | 引入视觉 bug / 隐式依赖被破坏 / 间距乱码 | 间距叠加（gap + margin）、icon 贴文字（裸 svg 不走 #icon 插槽）、纯图标不加 `.btn-icon-square`（80×32 长方形）、基线错位（`<el-button link>` 与 `<span>` 混排）、覆盖全局清零规则 |
| **SOFT** | 偏离最佳实践但功能正常 | 缺 `aria-busy` / `aria-label`、硬编码 `style="height: 40px"` 替代 `size` 属性、`rules` 不带 `trigger`、表单不加 `ref` |

**使用方判读建议**：
- BLOCKING 反模式应被 lint / CR 严格阻断
- STRONG 反模式发现后应立即修复
- SOFT 反模式可纳入下一轮代码改进，不阻塞发布

---

## 基础交互规范

组件使用惯例参考 **Ant Design 设计规范**，包括但不限于：

- **表单**：必填项标红星号在左侧，校验信息在字段下方展示。两种标签布局：

| 布局 | 适用场景 |
|------|---------|
| 顶部标签 `label-position="top"` | 表单为主的整页/半页（创建页、编辑页）；侧抽屉；多列并排表单 |
| 右侧文字标签 `label-position="right"` + `label-width` | 弹窗内表单；页面局部表单区域（筛选、设置项）。label 文字右对齐紧贴 input，配对关系最强 |

> **注意**：`label-position="left"`（label 在左、文字左对齐）**不在设计系统推荐清单**——同一系统内只用 `top` / `right` 两种，避免视觉切换割裂。

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

**触发条件**：按钮内只有 icon 且无任何文字标签时，必须加 `class="btn-icon-square"`。

**理由**：所有 `el-button` 默认强制 `min-width: 80px`（见 `button.scss` 的 min-width 强制段），单 icon 按钮不加 `.btn-icon-square` 会变成 80×32 的长方形。`.btn-icon-square` 在 `:not(.btn-icon-square)` 排除列表里，用它即可解除 80px 约束并提供等宽等高方形样式。

```vue
<!-- ✅ 推荐：纯图标必须用 .btn-icon-square -->
<el-button type="primary" class="btn-icon-square">
  <template #icon><Pencil :size="16" :stroke-width="2" /></template>
</el-button>

<!-- ❌ 禁止：使用 circle 属性（视觉与本设计系统不符） -->
<el-button type="primary" :icon="Pencil" circle />

<!-- ❌ 禁止：纯图标按钮不加 .btn-icon-square -->
<el-button type="primary">
  <template #icon><Pencil :size="16" :stroke-width="2" /></template>
</el-button>
<!-- 后果：被 min-width: 80px 撑开成长方形 -->
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

### Select 多选
默认使用 `collapse-tags collapse-tags-tooltip :max-collapse-tags="2"`，显示 2 个 tag 后折叠，hover 展示全部

### Checkbox 多选框
**何时用**：单独使用可以表示两种状态之间的切换，和 switch 类似。区别在于切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。

### Switch 开关
**何时用**：需要表示开关状态/两种状态之间的切换时使用，和 checkbox 的区别是，切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。

### Slider 滑块
**何时用**：当用户需要在数值区间/自定义区间内进行选择时，可为连续或离散值。

### Tag 标签（选色 + 数量克制）

**选色约定（源头 `tag.scss`）**：本系统品牌色是绿色，与 success 语义绿撞色，普通标签用品牌绿易被误读为「成功态」。因此：

- **无语义含义的普通标签，优先 `type="info"`（蓝色）作为默认色**；仅确需品牌强调时才用默认 / `type="primary"`（品牌绿）。
- 有状态语义的标签照常走语义色（success/warning/danger/info）。
- 另有两个源头扩展类型：`el-tag--gray`（灰色中性标签，text-2 + inset 底）与 `el-tag--ai`（AI 标识：蓝→绿渐变底 + 渐变文字，走 AI 渐变令牌）——AI 相关标签一律用 `--ai`，不自拼渐变。

**数量克制**：**尽量避免在同一处（同一行/同一区域）一次性并列出现 3 个以上标签**（即 ≤3 个为宜，4 个及以上应避免）。

- **为什么**：标签是"轻量强调"，靠稀疏才有识别力；一排堆太多会让每个都失去焦点、色彩互相打架，退化成噪音（违背「装饰有度、主色克制」）。
- **反例**：状态列 / 卡片头一次平铺 4~6 个彩色 Tag。
- **例外**：demo / 规范展示页为了**枚举全部状态色板**（如本页一次列出「已完成/待审核/已驳回…」）不受此限——那是"展示所有可选项"，非真实业务里的单条记录并列。

### Badge 徽标
**何时用**：用于显示需要处理的消息条数，通过醒目视觉形式吸引用户处理。

- **一律默认红色，引用方勿传 `type`**（源头 `badge.scss` 使用约定）：徽标语义单一（有未读/有新增），红色最醒目也最符合直觉，不做 success/warning/primary 等多彩区分。
- **挂宿主的方式**：头像/按钮/图标是规整盒子，`el-badge` **直接包宿主**、EP 原生定位即正确（图标场景包**裸图标**——若图标外还有更大的点击热区容器，badge 包图标而不是包热区，否则角标锚到热区角上、飘离图标）。挂 **tab** 时用 `.badge-tabs` + `.tab-badge` 组合约定，见上方 Tabs 段。

### Dropdown 下拉菜单（面板 + 触发器）

**何时用**：常与"触发器"（按钮、图标、下拉选择器等）组合使用，当页面上的操作命令过多时，用此组件可以收纳操作元素。

`el-dropdown` 由**两部分**组成：**下拉面板本身**（菜单项 / 分隔线 / 禁用项 / hover，样式归 `el-theme` 源头）+ **触发器**（用户点/hover 后弹出面板的那个元素）。

- **触发器不是固定形态**：`el-dropdown` **常与「触发器」组合使用**——触发器可以是**按钮、图标、下拉选择器、轻量文字**等多种形态，按场景选，不写死成某一种。
  - **主操作 / 显式入口** → 用**按钮**触发（`<el-button>`，图标 + 文字规范见按钮章节）。
  - **紧凑 / 操作列 / 工具栏** → 用**纯图标**触发（如 `MoreHorizontal` 更多，配 `.btn-icon-square`）。
  - **次要 / 行内轻量入口**（如"更多操作 ⌄"）→ 用**轻量文字 + 箭头**触发。
- **强制做法**：触发器放在 `el-dropdown` 默认插槽、菜单放 `#dropdown` 插槽的 `<el-dropdown-menu>`；分隔用 `<el-dropdown-item divided>`；禁用项用 `disabled`；危险项文字走 `--iflyv-danger-primary`。
- **触发器尾部箭头必须用约定 class `.dropdown-caret`**（源头 `dropdown.scss`：垂直居中 + 展开时翻转 180° 带过渡）。EP 的 `el-dropdown` 展开态没有稳定纯 CSS 钩子，**展开 class `.is-expanded` 需由使用方用 `@visible-change` 绑定**——这是唯一要使用方做的事，翻转规则/过渡全在源头：

  ```vue
  <el-dropdown @visible-change="open = $event">
    <span>更多 <ChevronDown class="dropdown-caret" :class="{ 'is-expanded': open }" /></span>
    <template #dropdown>…</template>
  </el-dropdown>
  ```

  > 与按钮的 `.btn-caret` 区分：`.btn-caret` 是「hover 按钮时」转（纯 CSS，button.scss）；`.dropdown-caret` 是「下拉展开时」转。箭头与文字的间距由触发器父容器 flex gap 提供，不要在箭头上加 margin（会与 gap 叠加）。
- **反例**：手撸一个绝对定位的浮层当下拉；触发器和菜单不用 `el-dropdown` 组合而各写各的；把本该是按钮/图标的主入口硬做成裸文字（或反之）；「文字 + 箭头」触发器的箭头不用 `.dropdown-caret` 而在页面 scoped 里自写旋转动效。

### 按钮间距
design-spec 已**全局清零** EP 原生的 `.el-button + .el-button { margin-left: 12px }`（见 `el-theme/components/button.scss`）。

**统一约定**：按钮组的间距**一律由父容器 `display: flex; gap: <token>` 提供**，推荐 `gap: var(--iflyv-spacing-3)`（12px）；紧凑场景 `var(--iflyv-spacing-2)`（8px）。

**禁止**：
- 不要在按钮上写 `margin-left` / `margin-right` / `margin-inline-start` / `margin-inline-end`
- 不要在使用方写 `.el-button + .el-button { ... }` 这种相邻按钮间距规则——它会和父容器 gap 叠加导致重复间距

**例外**：
- `.el-button-group` 内部按钮按 EP 默认行为（边框 -1px 重叠），不要包裹 flex+gap。
- `.el-button.table-operation`（表格操作列文字按钮）使用 `<td>` 内 inline 排版，间距由 `el-theme/components/table.scss` 的 `.table-operation + .table-operation { margin-inline-start: spacing-3 }` 相邻选择器自带，**不要包裹 flex+gap**，也不要在使用方覆盖 margin。

> **相关：表单控件（checkbox / radio）间距说明**
>
> `.el-checkbox` / `.el-radio` 在 `el-theme/components/{checkbox,radio}.scss` 中把相邻项水平间距统一为 `margin-inline-end: var(--iflyv-spacing-4)`（16px，覆盖了 EP 原生的 30px）——**这不是反模式**，与上述按钮间距规则不冲突。差异：表单控件有标准 group 容器（`<el-checkbox-group>` / `<el-radio-group>`），间距是 group 内部实现细节，使用方一律用 group 包装即可，**不需要也不应该再加 flex+gap**。这 16px 是横排选项间距的单一数据源，使用方不覆盖。

### Breadcrumb 面包屑（带返回箭头）
面包屑 = **前置返回箭头（可选）+ 路径导航**。**一律用业务组件 `Breadcrumb`**（源头 `design-spec/components/Breadcrumb/`），不要自己用 `el-breadcrumb` + 手写返回 `span` 拼装。

- **强制做法**：
  ```vue
  import { Breadcrumb, type BreadcrumbItem } from '<path>/design-spec/components'

  <Breadcrumb :items="items" @back="router.back()" />
  ```
  - `items`：路径项数组 `{ label, to? }[]`；**最后一项自动为当前页**（不可点击，`text-1`），带 `to` 的项可点击跳转（透传 EP 路由）。
  - `@back`：点返回箭头触发——**真实项目里通常接 `router.back()`**（或跳固定上级路由）。返回行为是业务才知道的事，由使用方在此提供。
  - `back-disabled`：无上一级时传 `true`，箭头自动切禁用态（`icon-4`、不可点、不 emit）。
  - `show-back="false"`：不需要返回箭头时隐藏（只留路径导航）。
  - `max-items`：**深层级折叠**。默认 `0`=不折叠（全量平铺）。层级很深时传 `≥2` 的值（如 `:max-items="4"`）：超过它时**保留首项 + 末项当前页**，中间超出的层级折进一个 `…` 项，**hover 弹下拉菜单**展开被折叠层级（每项可点跳转），可见项数即 `max-items`。做**下钻很深的路径**（如"首页 › 学院 › 课程 › 章节 › 小节 › 作业 › 提交详情"）时用，避免面包屑撑爆一行。
  - `@item-click`：点击某一路径项（含 `…` 下拉里的项）触发，回调 `(item, index)`；真实项目按 `item.to` 走 `router.push`，或据 `index` 定位层级。
- **返回箭头外观**（图标 / 与首项 8px 间距 / 激活 `icon-2` / 禁用 `icon-4`）单一数据源在 `el-theme/components/breadcrumb.scss` 的约定 class `.breadcrumb-back`，`Breadcrumb` 组件内部引用它——**使用方不碰外观，只传 `items` + 接 `@back`**。可点击项 hover 变品牌绿、`…` 折叠触发器同色，均在源头统一，使用方不覆盖。
- **反例**：用 `el-breadcrumb` 自己在前面塞一个 `<span>` 挂 `@click` 手拼返回箭头（脱离组件、间距/色态/禁用逻辑各处不一致、源头更新不同步）；把 `@back` 写成空函数让箭头点了没反应；深层级路径**不传 `max-items` 硬让十几级全平铺**撑爆一行（应传 `max-items` 折叠）。

### Tabs 标签页（三档选型 + 组合约定）
**何时用**：提供平级的区域将大块内容进行收纳和展现，保持界面整洁。

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
**何时用**：需要展现当前页面上可供跳转的锚点链接，以及快速在锚点之间跳转。

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

- **强制**：小型档必须同时做两件事——加 `:small` **和**精简 layout；只加 `small` 不精简 layout，会在窄容器里挤出换行/溢出。
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

一律用 `el-empty`，且**必须同时传两样**——设计系统插画 + 承载档位 class。**缺任何一样都会落回 EP 默认纸盒插画（反例，等于没接设计系统）**：

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
**何时用**：希望不打断用户操作，并给予轻量提示。

### Alert 警告
**何时用**：当提示内容较重要，并需要吸引用户查看时使用。

### Notification 通知（场景 / 常驻 / 操作按钮）

- **应用场景**：适用于**较长时间的结果通知**——期间用户不必停留等待、可去做其他操作，完成后通知从右上角弹出告知。区别于 Message（一句即时轻反馈）与 Dialog（需当场打断处理）。

通知一律用 `ElNotification`，能力按**正交配置项**建模，自由叠加，不穷举具名类型：

| 配置项 | prop | 说明 |
|---|---|---|
| **场景**（语义色 + 图标） | `type: 'success' \| 'warning' \| 'error' \| 'info'` | 四类语义，决定左侧图标与色 |
| **是否常驻** | `duration` | 常驻 = `0`（不自动关闭，需用户手动关或代码 `handle.close()`）；非常驻 = 默认 `4500`（毫秒后自动消失）。**取向**：通知**默认常驻**（结果类信息重要、用户可能不在场，让其自行确认关闭）；**非必要不设临时**（自动消失易被用户错过）。带操作按钮时必常驻 |
| **操作按钮** | 无原生 prop —— 见下 | 通知内需要放操作按钮时的标准做法 |

- **带操作按钮的通知（强制做法）**：`ElNotification` **没有 footer / 按钮 prop**，操作按钮**必须**用 `h()` 把「一段正文 + 一行按钮」渲染成 VNode 传给 `message`，**禁止**为此手撸浮层或改用别的组件。按钮行**必须**套约定 class **`.notify-actions`**（右对齐 + 间距全在源头 `notification.scss` 统一处理，下游只写这一个 class、不写行内布局 style）。按钮遵循「按钮个数」规范：**一退路（次按钮，如"忽略"）+ 一进路（主按钮，如"查看详情"）**。按钮 `onClick` 里调 `handle.close()` 关闭当前通知（`handle = ElNotification({...})` 的返回值）。
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

**背景**：本设计系统**统一使用 Dialog**（不引入 `ElMessageBox` 命令式 API）。为了让 Dialog 也能表达「警示 / 危险 / 成功 / 信息」语义，提供 4 个变体类——使用方加一个 class 即可在标题前自动渲染圆形彩色底板 + 白色 Lucide 图标。

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

**反模式**：

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
  - **有 footer 时**：按钮水平排列，次按钮（取消）在左、主按钮（确定）在右（与对话框顺序一致）。
  - **窄抽屉（≤400px）时**：按钮可垂直排列（主按钮在上、次按钮在下），外层加 `.drawer-footer--vertical` class（见 `drawer.scss`）。
- **抽屉 vs 对话框 vs 页面**：上表适用于"已判定需浮层"的场景。若操作是页面主线（如创建/编辑核心资源、需填完整多 section 表单），应走独立页面，不要用浮层塞；详见 `patterns/dialog-pattern.md` 四维判据。

**反例**：
- ❌ 用抽屉做删除确认、版本提示等轻量二次确认（信息量少 + 需聚焦 → 该用对话框）。
- ❌ 用对话框承载复杂详情页、多 tab 切换内容（信息量大 + 关联度低 → 该用抽屉或独立页面）。
- ❌ 抽屉 footer 按钮顺序与对话框相反（混淆用户习惯）。

