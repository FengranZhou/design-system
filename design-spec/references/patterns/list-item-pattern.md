# 列表条目模式 (List Item Pattern)

> 设计模式层规则。接到「做表格 / 列表 / 信息流，一行（一条卡片）代表一条记录」的任务时，**动手前必读本文件**：先按「四区模型」把一条记录拆成区、每个区按「元素类型清单」选定用哪个组件、再「拼装」成行，避免每次凭直觉硬写一版各页不一致的表格。
>
> **核心思想**：一条记录 ≠ 一坨字段平铺，而是**四个功能区的拼装**。区的职责固定、每区可放的元素类型有清单、每类元素对应一个已有的基础 / 业务组件。这样既统一又能灵活拼出各种业务场景（表格行 / 卡片列表 / 信息流条目都适用，表格只是其中一种呈现）。

---

## 一、何时用（触发条件）

命中以下任一，即用本模式：

- 要做**表格**（`el-table` + 列），每行是一条记录。
- 要做**列表 / 信息流 / 卡片列表**，每个条目代表一条记录（任务、课程、审批、文件…）。
- 任何"多条同构记录，逐条展示 + 可操作"的场景。

> 反过来：**不要把一行当成"若干字段随便排"**。先按四区拆，再决定每个字段落在哪个区、用什么元素——这样全站的表格 / 列表才会长得一致、可维护。

---

## 二、核心模型：一条记录 = 四个功能区

把一条记录（表格的一行 / 列表的一个条目）从左到右拆成四个区，**职责固定**：

| 区 | 职责（一句话） | 回答用户什么问题 | 放什么元素 |
|---|---|---|---|
| **01 全局功能区** | 对整条记录的**整体操作** | "我能对这条做什么（结构性）" | 勾选（复选框）、排序手柄、展开/收起、置顶、拖拽 |
| **02 主题区** | 让用户知道**这是什么**（概览、身份） | "这是什么" | 名称/标题、头像/图标、时间、人员、图片、摘要、类目；修饰：强调/推荐/私密/危险/标星/排行 |
| **03 关键信息区** | 展示核心数据，让用户**有什么**（分析、感知） | "这条里有什么关键数据" | 状态标签、项目/时间进度、Mini Chart、元数据、数值、数据概览、信息备注、文件分类 |
| **04 操作区** | 基于业务的**具体操作** | "我能对这条做什么（业务）" | 编辑 / 查看 / 复制 / 删除 / 更多（下拉）等按钮 |

> 来源：该四区模型是列表条目"元素拆解"的成熟方法论——先穷举单模块元素覆盖度不够、不能自生长，改为**按区拆解 + 每区元素穷举**，才保证后期拼装替换的灵活性。

**判断入口**：动手前先把这条记录的每个字段问一遍——"它是整条的结构操作（→01）？是身份概览（→02）？是关键数据（→03）？还是业务操作（→04）？" 归好区，再选元素。

---

## 三、元素类型 → 用哪个组件（强制映射）

每类元素**一律用已有的基础 / 业务组件**，不手拼、不各页各写一套：

| 元素类型 | 用什么 | 说明 |
|---|---|---|
| 勾选 / 多选 | `el-table` 的 `type="selection"` 列 或 `el-checkbox` | 全局功能区 |
| 排序 | `el-table-column` 的 `sortable` | 表头单元格「带排序」类型 |
| 展开 | `el-table` 的 `type="expand"` | 全局功能区 |
| 名称 / 纯文字 | 纯文本单元格（`prop` 直出 或 `formatter`） | 主题区 / 关键信息区最常见 |
| 头像 | 业务组件 `UserAvatar`（`design-spec/components`） | 主题区 |
| 状态 / 分类标签 | `el-tag`（状态语义色；`round` 胶囊） | 关键信息区，**状态一律用标签，不用裸文字** | <!-- @rule id=list-status-use-tag level=MUST cat=设计模式 detect=regex dtitle=列表里的状态应是彩色标签，不是一段裸文字 title=列表/表格的状态列一律用 el-tag，禁裸文字 -->
| 日期 / 时间 | 纯文本（统一格式，见文案规范 Time 模块） | 关键信息区 |
| 数值 / 金额 | 纯文本 + `formatter`（如 `¥1,200`），**右对齐** | 关键信息区 |
| 进度 | ⏸ `el-progress` **当前暂停启用**（见 `component-interaction.md` 文末「勿用清单」）——需展示进度先与设计负责人确认 | 关键信息区 |
| 操作按钮 | `<el-button class="table-operation">` + **图标(lucide)+ 文字**；多操作收进 `el-dropdown`「更多」(纯文字) | 操作区，**固定右侧**。表格操作列用源头约定类 `.table-operation`（一个 class 全包：无底/紧贴文案/相邻间距 12/hover 绿），不用再加 text/link |

> 表头单元格类型收敛为三类：**纯文字 / 复选框（selection 列）/ 带排序（sortable）**。内容单元格类型即上表——按数据语义选，别混。

---

## 四、强制做法

1. **先分区再落元素**：任何一行/条目，先按四区归位每个字段，再按上表选组件。不要字段平铺、不分主次。
2. **状态必用标签**：状态 / 分类字段用 `el-tag`（走状态语义色 + `round`），**不要用纯文字**表示状态（无法一眼区分）。
3. **操作区固定右侧、样式统一**：表格操作按钮一律 `<el-button class="table-operation">` + **图标（lucide）+ 文字**（如「✎ 编辑」，用约定类不用 text/link）；≥3 个操作时，主操作外露、其余收进 `el-dropdown`「更多」（下拉项走纯文字）。表格里操作列 `fixed="right"`。「更多」触发器同样走源头约定：`<el-dropdown class="table-operation">` + 内层 `<span class="table-operation__more"><MoreHorizontal :size="16" /></span>`（**纯图标形态**，与业务组件 `DataTable` 一致；对齐/间距/色号全在 `table.scss` 源头）——**纯图标入口必须外包 `el-tooltip content="更多操作" :show-after="300"`**；**危险操作**（删除等）在按钮上加 `.table-operation--danger`（常态即危险红、hover 加深，不手写 color）。
4. **数值右对齐**：金额 / 数量等数值列右对齐，便于比较。
5. **列宽与冻结**：关键信息区按内容给合理 `width` / `min-width`。
   - **默认冻结规则（无特殊情况即遵守）**：当**列内容总宽超出表格展示宽度（会触发横向滚动）时，默认必须启用首尾列冻结** <!-- @rule id=table-freeze-columns level=MUST cat=设计模式 detect=regex dtitle=表格横向滚动时，首列与操作列应固定不动 title=表格内容超宽触发横滚时，必须冻结主题列(fixed=left)与操作列(fixed=right) --> —— 主题区（姓名/名称）`fixed="left"`、操作区 `fixed="right"`。理由：横滚时用户仍需随时看到「这是谁（主题列）」和「能干什么（操作列）」，否则滚到中间就找不到行主体、够不到操作。
   - 列不多、不横滚（内容宽 ≤ 容器宽）时无需冻结。
   - **用 DataTable 时已自动**：DataTable 内置 `auto-freeze`（默认开），会测量列总宽 vs 容器宽，**超宽即自动给主题列补 `fixed:left`**（操作列 `fixed:right` 本就内置）——无需手动传 fixed。特殊场景可 `:auto-freeze="false"` 关闭，或在 columns 里手动指定 fixed（优先于自动）。
   - 手写 el-table 时：按本规则自行给主题列 `fixed="left"`、操作列 `fixed="right"`。
   - ⚠️ **RTL（阿语等从右到左语境）下固定列被主动降级**：源头 `table.scss` 在 RTL 下取消了 sticky 定位，`fixed` 列会变成普通列。承接 RTL 业务时**需提前告知业务方这一限制**，不要在使用方自己写 sticky 去补（会与源头打架）。
6. **至少留一列弹性（防右侧空白列）**：表格设 `width: 100%`（撑满容器）时，**不要把每一列都写死 `width`**——否则当"固定列宽总和 < 容器宽"时，`el-table` 会把剩余宽度补成一个**空白列**，右侧留一大片空。**至少让一列用 `min-width`（或不写宽）做弹性列**，吸收剩余宽度。通常让内容最长、最该伸展的那列（如主题区名称列或操作区）承担弹性。
   - `el-table` 默认列宽分配（原生行为，源头不改）：**所有列都不写宽 → 等分铺满**；**部分写死、部分不写 → 剩余宽等分给未写宽的列**；**全部写死且总和 < 容器 → 才补空白列**。所以只要有一列不写死，就不会出现右侧空白。
   - **弹性列该选哪一列**：挑**内容最长、最值得伸展**的那列，按业务类型对号入座——用户列表→邮箱/账号，订单列表→商品名/订单号，设备列表→设备名/型号，文章列表→标题，申请列表→申请理由/备注。
     **反过来不要选**姓名、状态、金额、日期这类**短且定长**的列做弹性——数据短时会被拉得空荡荡，一行里出现大片空白。
   - **万一所有列都短、没有合适的弹性候选**，三选一：① 外层包一个 `max-width` 容器，让表格不必撑满整行；② 表格去掉 `width: 100%`，让列宽自然累加（表格比容器窄，靠左排布）；③ 退而求其次，让相对最长的主信息列承担弹性。
7. **长文本列加 `show-overflow-tooltip`**：标题、备注、简介这类长度不可预期的列，给 `<el-table-column>` 加此属性——EP 原生能力，**自带单行截断 + hover 弹 tooltip 补全**，不要手动包 `el-tooltip`、也不要自写 `text-overflow: ellipsis`。
   - **用 DataTable 时**：在该列配置里写 `showOverflowTooltip: true`。
8. **状态标签的灰色变体走 class 不走 type**：`el-tag--gray`（已结束 / 已归档等非活跃状态）是**约定类**，`type` 表达不了它。
   - **手拼 el-table 时**：`<el-tag class="el-tag--gray" round>已结束</el-tag>`。
   - **用 DataTable 时**：行数据里放 `${prop}Class` 字段（如状态列 `prop:'status'` → 行里写 `statusClass: 'el-tag--gray'`），组件自动透传；走语义色的行该字段留空即可，两者可在同一列共存。字段名要改用 `tagClassProp` 指定。
   - 选色判据见 `component-interaction.md` Tag 段的状态对照表。
9. **拼装而非硬写**：把行看成"四区拼装"，同类记录复用同一套列定义；不要每个页面重写一版结构和样式。

---

## 五、反例（禁止）

- ❌ **一行字段平铺、不分区**——主次不分，用户扫不出"这是什么 / 有什么 / 能干什么"。
- ❌ **给表格加 `stripe` 斑马纹**——本设计系统**不使用斑马纹**，行与行的区分靠 hover 高亮 + `border-subtle` 行线（符合「层级即导航、线条为辅」）。斑马纹会让表格显得沉重、且与卡片底色叠加后层次混乱。
- ❌ **状态用裸文字**（如直接写"进行中"纯文本）——应 `el-tag`，一眼区分状态。
- ❌ **操作按钮各页各样**（有的实心、有的描边、有的位置飘）——统一 `.table-operation` + 固定右侧 + 「更多」下拉。
- ❌ **表格 `width:100%` 时把每一列都写死 `width`**——固定列宽总和 < 容器宽时，`el-table` 会补一个空白列，右侧留一大片空。至少留一列 `min-width`（或不写宽）做弹性列吸收剩余宽度。
- ❌ **在使用方 scoped 里覆盖 `el-table` / `el-tag` / `el-button` 外观**（`:deep(.el-table__cell){…}` 改字号/边框/底色等）——表格/标签/按钮外观归各自 `el-theme` 源头，手写即私货、不同步。
- ❌ **操作按钮用 `<span class="table-operation">` 代替 `<el-button>`**——视觉一模一样，但丢了键盘可达性（Tab 到不了）、丢了屏幕阅读器的按钮语义。**看起来像按钮不等于是按钮。**
- ❌ **「更多」下拉用 `<span>` + 自写显示隐藏**代替 `<el-dropdown>`——丢了原生的键盘 ↑↓ 切换、Esc 关闭、焦点陷阱。
- ❌ **自造排序箭头** <!-- @rule id=table-use-sortable level=MUST cat=设计模式 detect=regex dtitle=表头排序应是标准箭头样式，与全站一致 title=表格排序一律用 el-table 的 sortable，禁自造排序箭头 -->（在表头塞两个三角图标自己接 click）——会丢 `el-table` 内置的 `sort-change` 事件、多列排序、默认排序能力，且箭头视觉与源头 `table.scss` 统一替换的 Lucide 风格对不上。**排序一律用列的 `sortable` 属性。**
- ❌ **把整套"带状态+操作"的表格逻辑在每个页面重抄一遍**——同构记录应复用列定义（将来可抽成业务组件）。

---

## 六、可照抄骨架

```vue
<template>
  <el-table :data="rows" highlight-current-row style="width: 100%">
    <!-- 01 全局功能区：勾选 -->
    <el-table-column type="selection" width="48" />

    <!-- 02 主题区：名称（左固定），如需头像用 UserAvatar -->
    <el-table-column prop="name" label="姓名" width="120" fixed="left" />

    <!-- 03 关键信息区：状态用 el-tag / 日期纯文本 / 金额右对齐 formatter -->
    <el-table-column prop="status" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.statusType" round>{{ row.status }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="date" label="日期" width="150" sortable />
    <el-table-column
      prop="amount" label="金额" width="120" align="right" sortable
      :formatter="(_r, _c, v) => `¥${v.toLocaleString()}`"
    />

    <!-- 04 操作区：.table-operation 约定类，右固定；多操作收进「更多」下拉 -->
    <el-table-column label="操作" width="180" fixed="right">
      <template #default>
        <!-- 外露操作：图标 + 文字（图标用 lucide） -->
        <el-button class="table-operation"><template #icon><SquarePen :size="14" /></template>编辑</el-button>
        <el-button class="table-operation"><template #icon><Eye :size="14" /></template>查看</el-button>
        <!-- 「更多」触发器：el-dropdown 也挂 .table-operation（对齐兄弟按钮），内层用约定容器 __more；
             纯图标入口必须配 tooltip（含 :show-after="300"），否则语义靠猜 -->
        <el-dropdown class="table-operation">
          <el-tooltip content="更多操作" placement="top" :show-after="300">
            <span class="table-operation__more"><MoreHorizontal :size="16" :stroke-width="2" /></span>
          </el-tooltip>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>复制</el-dropdown-item>
              <el-dropdown-item divided>
                <span style="color: var(--iflyv-danger-primary)">删除</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>
</template>
```

> 照抄要点：**先按四区排列列的顺序**（全局功能→主题→关键信息→操作），状态用 `el-tag`、数值右对齐、操作 `.table-operation` 按钮固定右侧；表格 / 标签 / 按钮的外观一律不在使用方手写——全由各自 `el-theme` 源头保证。卡片列表 / 信息流条目同理：按四区从左到右拼装同样的元素，只是容器从 `el-table` 换成卡片。
