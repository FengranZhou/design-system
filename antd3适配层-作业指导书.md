# antd 3 适配层 —— 作业指导书

> **这份文档是给 Claude Code 执行的作业指导书。**
> 在本仓库根目录下用 CC 打开它，即可开始把 Element Plus 设计系统迁移到 React 16 + antd 3。
> **下文所有路径都相对于本仓库根目录。**
>
> **文档来源**：不是理论推演，是 Button 组件的完整试点实测——12 条差异、6 轮返工、
> 2 次「机器自查通过后仍被人工点出 bug」。每条规则背后都有一次真实翻车。
>
> **配套产物**（都在本仓库里，已可运行）：
> - `design-spec/antd3-theme/components/button.less` —— 唯一的完整样板，**照它写**
> - `design-spec/antd3-theme/DIFF.md` —— Button 的 12 条差异全记录，**格式照它记**
> - `design-spec/antd3-theme/迁移方法论.md` —— 试点复盘（本文档的详细版）
> - `design-spec/stack-mapping.md` —— EP ↔ antd 3 组件与 prop 映射表（见 §6）
> - `demo-antd3/` —— 可运行的 React16+antd3 验证环境，**新组件加进这里测**
>
> **先看效果**：双击仓库根目录的 `双击这里打开 antd3 预览.command`（端口 5174），
> 与 `双击这里打开 EP 预览.command`（端口 5173）**可同时打开并排比对**。

---

## 〇、先读这段：这件事的性质

**目标**：让 antd 3 项目的界面，与 Element Plus 版**观感与交互一致**，且共用同一份设计令牌——
改令牌源头，两边一起变。

**做法**：新增 `design-spec/antd3-theme/` 一层 less 覆盖，贴着 antd 3 的 DOM 写。
**不动**现有 `el-theme/`（Element Plus 层）一个字节。

**必须建立的预期 —— 请如实转达给设计负责人**：

> **做不到"零差异一次转完"。**
> Button 一个组件的 12 条差异里，**约 1/3 只能在浏览器里跑起来才会暴露**
> （antd 的 JS 会改 DOM、注入属性，CSS 层面完全看不见）。
>
> 正确的目标是：**所有差异都被发现、被记录、有明确处置**，而不是假装没有差异。
> 每个组件都必须产出 DIFF 记录，这是交付物的一部分，不是可选项。

---

## 一、环境准备（一次性，约 30 分钟）

### 1.1 技术栈与已验证版本

```
React 16.14.0 + antd 3.26.20 + Vite 5.4.21 + less 4 + sass
```

> sass 是必须的——设计令牌层是 `.scss`，即使你自己只写 less 也要装。

### 1.2 三个必踩的坑（不配好，页面直接白屏且难定位）

**① `global is not defined` → 整页白屏**

antd 3 的依赖链（`resize-observer-polyfill` 等）是 CommonJS 时代产物，直接引用 Node 的
`global`。webpack 4 会自动注入 polyfill，**Vite 5 不会**。

必须在 `index.html` 里 shim，且**位置要在所有 module script 之前**：

```html
<head>
  <script>window.global = window.globalThis</script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

> ⚠️ **Vite 的 `define: { global: 'globalThis' }` 对此无效**——`define` 不重写已预打包的
> `node_modules/.vite/deps/*`。实测替换后裸 `global` 仍有 39 处。只能走 index.html。

**② less 需要开 JS 表达式**

```ts
// vite.config.ts
css: { preprocessorOptions: { less: { javascriptEnabled: true } } }
```

**③ 改动依赖后白屏、且控制台无报错**

改 lockfile（补装依赖）后，运行中的 dev server 仍按旧哈希提供模块，浏览器请求的 URL 对不上 →
**ES module 在加载阶段失败，`window.onerror` 捕获不到，页面全白**。

**解法**：重启 dev server 并加 `--force`。开发期会反复遇到，**遇到白屏先想这个**。

### 1.3 样式加载顺序（固定，错了覆盖全部失效）

```ts
// main.tsx
import 'antd/dist/antd.css'                              // ① antd 基础
import '<设计系统路径>/design-spec/design-token/index.scss' // ② 设计令牌（与 EP 版共用同一份）
import '<设计系统路径>/design-spec/antd3-theme/index.less'  // ③ antd3 覆盖层
```

> **令牌层与 EP 版共用同一份源头，严禁拷贝**。拷贝 = 脱钩，源头更新它不动。

### 1.4 全局必配项（ConfigProvider）

有些 antd 行为**是 JS 改 DOM，CSS 压不掉**，只能靠 ConfigProvider 关闭。应用根部包一层：

```tsx
import { ConfigProvider } from 'antd'

<ConfigProvider autoInsertSpaceInButton={false}>
  <App />
</ConfigProvider>
```

> `autoInsertSpaceInButton={false}` 关掉「两字中文自动插空格」——
> antd 3 会把「确定」在 DOM 里真的改成「确 定」（`'确定'.split('').join(' ')`）。
> **不是 CSS 字距，是真的插了个空格字符**，任何 CSS 都改不回来。
> 你产品里两字按钮遍地都是（确定/取消/保存/删除/提交），必须关。
>
> **新组件遇到类似 JS 行为时，第一反应是去 ConfigProvider 找官方开关**（见 §3.1）。

---

## 二、单组件转换标准流程

> **每个组件都走完这五步。跳步的代价见 §5「真实翻车实录」。**

### Step 1 —— 读 EP 源头，列出「能力清单」

打开 `design-spec/el-theme/components/<组件>.scss`：

- **重点读顶部的「接入方速查」注释**——它已经把该组件对外的全部能力列清楚了
- 把「类型 / 状态 / 配置项 / 约定 class / 特殊交互」整理成一张表

**这张表就是验收基准。** 转换完成 = 表上每一项在 antd 3 上都成立。

### Step 2 —— 查 antd 3 的 DOM 与 JS，先找「结构性断裂」

**这步最容易跳过，也最贵。** 三个必查项：

```bash
# ① DOM 类名与状态类（覆盖层要挂在这些钩子上）
grep -oE 'ant-<组件>[a-z-]*' node_modules/antd/lib/<组件>/*.js | sort -u

# ② JS 行为：有没有改 DOM 内容 / 插入节点 / 注入属性
grep -nE 'insertSpace|cloneElement|createElement|setAttribute|Wave|classNames' \
  node_modules/antd/lib/<组件>/*.js

# ③ 有没有官方开关能关掉这些行为
grep -rn 'configConsumerProps' node_modules/antd/lib/config-provider/index.js
```

**判据**：凡 antd 在 JS 里**改了 DOM 内容或插入了节点**的，都是 CSS 压不掉的硬差异，
必须走 ConfigProvider 或调用方配合 —— **立刻记进 DIFF，不要试图用 CSS 硬修。**

**同时确认三件事**（EP 与 antd 常在这里断裂）：

| 项 | 怎么查 | Button 的实例 |
|---|---|---|
| **有没有对应插槽** | EP 常用具名插槽，antd 3 多用 prop | EP 有 `#icon` 插槽，antd 3 没有 → 改用约定 class `.btn-icon` |
| **状态类怎么写** | EP 是 `.is-xxx`，antd 是别的 | EP `.is-disabled` → antd 原生 `[disabled]`；EP `.is-loading` → `.ant-btn-loading` |
| **有没有等价形态** | 某些形态 antd 根本没有 | antd 3 无 text 形态 → 新建约定 class `.btn-text` |

### Step 3 —— 写覆盖层，遵守五条硬纪律

**① 每个状态显式对位，别指望继承**

antd 的状态样式特异度普遍偏高（`.ant-btn-primary:hover` 是双类名 0,4,1），
你的常态规则**不会**自然传导到 hover/active/focus。**三态各写一遍。**

**② `:focus` 必须写成 `:focus:not(:hover):not(:active)`，且复位到「常态」外观**

> ⚠️ **这是本次最大的坑，务必看懂。**
>
> `:focus` 由**点击触发**且**持续存在**。如果给它配 hover 的外观，用户点完把鼠标移开，
> 外观会**停在 hover 态不还原**（按钮一直是绿的）。
>
> EP 的写法 `&:not(.is-text):focus:not(:hover)` 早就把这件事写对了，含两层意思：
> - 无底形态（text）**完全不吃 focus 变色**
> - 实心形态的 focus **只在非 hover 时生效**，且是**复位到常态**、不是套用 hover 外观
>
> 写 focus 的唯一目的：**压掉 antd 自带的蓝色**（`.ant-btn:focus{color:#40a9ff}`），
> 而不是给它一个新外观。

**③ 无底形态（text 类）要从所有实心规则里排除**

给实心态的 hover/active/focus 全部加 `:not(.btn-text)`，
否则实心规则特异度更高，会把文本按钮**填成实心色块，文字消失在底色里**。

**④ 内部布局对齐 EP 的 flex 模型**

antd 3 组件多是 `display: inline-block` + `vertical-align` 排内容。
而 **`vertical-align: middle` 对齐的是 x-height 中线，不是盒中心**——
**中文字符没有 x-height 概念，必然偏移**（Button 实测偏 1.3px）。

对齐 EP 基类改成：

```less
display: inline-flex;
align-items: center;
justify-content: center;
```

> ⚠️ **不要顺手加 `line-height: 1`**。虽然 EP 基类里有这行，但设计系统覆盖层的
> `font: var(--iflyv-font-xxx)` 在其之后，最终 EP 渲染出来是完整行高。
> 你若在 font 之后写 `line-height:1`，等于**把字阶整档拆散**，
> 违反设计系统「多档位体系必须整档取用」的铁律。

**⑤ 关掉 antd 的点击波纹（wave）**

antd 3 点击后会扩散一圈**硬编码的 `#1890ff` 蓝波纹**，EP 版没有这个动效。

它由 JS 注入属性 + 动态插 `<style>`，拦不住注入，但可以把效果压掉：

```less
[ant-click-animating-without-extra-node='true']::after,
[ant-click-animating='true']::after,
.ant-click-animating-node {
  display: none !important;
  animation: none !important;
  box-shadow: none !important;
  opacity: 0 !important;
}
```

> **这条应放进公共基座**（见 §4.1）——不只按钮，antd 的 Switch/Checkbox/Radio 都有波纹。

**⑥ 所有样式值必须走设计令牌**

```less
/* ✅ */ color: var(--iflyv-text-1);
/* ❌ */ color: #12151A;
```

找不到对应令牌时**停下来问设计负责人**，不要就地硬编码，也不要拆基础令牌自拼档位。

### Step 4 —— 浏览器实测（**不可跳过，这是唯一有效的验收**）

> ⚠️ **「静态查 CSS 规则存不存在」是无效验收。**
> 实测教训：曾查了 7 条交互规则，全部「✓ 存在」，但实际渲染全是错的——
> **被 antd 更高特异度的规则压掉了。存在 ≠ 生效。**

必须在真实浏览器里跑这四项：

| 检查 | 方法 | 通过判据 |
|---|---|---|
| **色值 / 尺寸** | 读 `getComputedStyle` | 与令牌真值逐项一致 |
| **三态最终值** | 对 hover / active / focus **逐状态计算最终生效值** | 出现 antd 裸色（`rgb(64,169,255)`、`#1890ff` 等）即失败 |
| **点击还原** | 模拟 `mousedown→mouseup→click→focus→mouseout` | 外观必须**完全回到**点击前（含 border / shadow） |
| **垂直对齐** | 各子元素中心 vs 容器中心 | 偏移 < 0.6px |

**⚠️ 自己写的检查器也会骗人。** 实测中我的 `:not()` 解析逻辑有 bug，误报了 2 处。
**最终判据永远是浏览器的 `getComputedStyle`**，不是自己解析 CSS 规则表。

### Step 5 —— 人工点检（**机器替代不了，必做**）

Step 4 全绿之后**仍然要人去点**。实测中两个 bug 正是这样发现的：
文本款 hover 变成绿色实心胶囊、点击后颜色不还原。

**必点清单**（每种形态都过一遍）：

- [ ] hover 一次，看观感
- [ ] 点击一次，**然后把鼠标移开**，看是否还原
- [ ] Tab 键走一遍，看键盘聚焦框是否正常
- [ ] 禁用态、加载态各看一眼
- [ ] **如果组件有中文文案，特别留意两字词**（确定/取消/保存/删除）

---

## 三、通用坑清单（写任何组件前先扫一遍）

### 3.1 JS 行为类（CSS 无解 —— 最危险的一类）

antd 3 有一批行为是**在 JS 里改 DOM**，样式层完全无能为力：

| 行为 | 表现 | 解法 |
|---|---|---|
| 两字中文插空格 | 「确定」→「确 定」 | `ConfigProvider autoInsertSpaceInButton={false}` |
| 点击波纹 | 扩散一圈 `#1890ff` | 压 `::after`（见 §2 Step3 ⑤） |
| loading 插入节点 | 组件宽度跳变 | 记进 DIFF，与设计负责人确认接受或另想办法 |

> **这三条是 Button 一个组件发现的。**
> **其它组件必然有各自的 JS 行为**（Table 的排序/展开、Select 的 tag 收起、
> DatePicker 的 moment 对象、Form 的 `Form.create` HOC）。
> **每个组件的 Step 2 都要重新查一遍，不能假设「Button 查过了」。**

### 3.2 特异度战争类

- antd 状态规则多是双类名（特异度 0,4,1），你的单类名规则（0,3,1）**会输**
- **判据**：最终生效值里出现 antd 原生裸色 = 脱离设计系统 = 必须修
- **别用 `!important` 硬压**（波纹那种 JS 注入的除外）——会让后续维护无从下手，
  用等价或更高特异度的选择器

### 3.3 API 写法差异类（视觉能一致，写法必然变）

antd 没有等价 prop 时，**新建一个约定 class**，并在 DIFF 里登记：

| EP 写法 | antd 3 写法 | 原因 |
|---|---|---|
| `<el-button text>` | `<Button className="btn-text">` | antd 3 无 text 形态 |
| `<el-button type="danger">` | `<Button className="btn-danger">` | antd 的 danger 色值/状态机与设计令牌不同 |
| `<template #icon>` | `<Icon className="btn-icon" />` | antd 3 无 icon 插槽 |

> **约定 class 的命名规则**：`<组件缩写>-<语义>`，全小写连字符。
> **必须写进该组件覆盖层顶部的「接入方速查」注释**，让调用方复制即用。
>
> ⚠️ **这类差异的风险是「漏挂 class 不报错」**——调用方忘了写 `className="btn-icon"`，
> 图标间距/色阶/loading 替换全部失效，**页面照跑、无任何警告**。
> 建议在项目里加 lint 规则或 hook 拦截。

### 3.4 工具链类

见 §1.2，三个坑配好一次就不用管了。

---

## 四、整体推进策略（51 个组件怎么排）

### 4.1 先建「公共基座」，省掉 51 次重复劳动

Button 里有一批规则是**所有组件通用**的，应先抽成 `antd3-theme/base.less`：

- 关掉全局点击波纹（Switch / Checkbox / Radio / Button 都有）
- 压掉 antd 默认的 `box-shadow` / `text-shadow`
- 统一 focus 口径（`:focus:not(:hover)` 复位常态）
- 统一禁用态口径（antd 用 `[disabled]` 属性而非 class）
- 组件尺寸、圆角、字阶的基础对齐

**这步做在最前面，收益最大。**

### 4.2 按「业务频次」分批 —— 不按字母序，也不按难度

> ⚠️ **这个排序是实测反推出来的，不是拍脑袋。**
>
> 做过一次真实验证：让一个全新的 CC 在业务项目里做「删除课程的二次确认弹窗 + 说明提示」——
> 这是最普通不过的需求，结果**一次性撞上三个未适配组件**（Modal / Tooltip / Popconfirm），
> 直接卡住无法交付。
>
> **推论**：适配顺序必须由「业务用得多不多」决定，而不是「做起来难不难」。
> 否则会出现「简单的都做完了，但业务还是干不了活」的尴尬局面。

| 批次 | 组件 | 为什么这个顺序 |
|---|---|---|
| **第一批（解锁业务）**<br>⭐ 最优先 | Modal / Tooltip / Popconfirm / Input / Select / Table / Form / Tag / Empty | **覆盖绝大多数业务场景**。补完这批，业务项目就能正常开工，剩下的可以边用边补。<br>⚠️ 其中 Table / Form 有 API 级断裂（见下），要预留评估时间 |
| **第二批（高频补充）** | Checkbox / Radio / Switch / Pagination / Dropdown / Drawer / Alert / message | 表单与列表页的常客，第一批之后最先遇到 |
| **第三批（低频/展示类）** | Badge / Divider / Skeleton / Result / Steps / Descriptions / Rate / Slider / Breadcrumb / Tabs / Anchor | 纯展示或低频，**无状态机、无 JS 行为，可批量快速做** |
| **第四批（单独评估）** | DatePicker / Cascader / Upload / Table / Form | **不只是样式问题**，见下 |

**⛔ 第四批为什么要单独评估**：

- `DatePicker` —— antd 3 用 **moment 对象**（EP 是字符串 + `value-format`），
  所有取值处都要 `.format()`，且整个项目依赖 moment.js
- `Form` —— antd 3 是 **`Form.create()` HOC + `getFieldDecorator`** 的老式写法，
  与 EP 的 `v-model` 双向绑定完全不同，校验与错误提示的组织方式都要重写
- `Table` —— 列定义是 **`columns` 配置数组**（EP 是 `<el-table-column>` 子组件），
  排序用 `sorter`（EP 是 `sortable`）

这三个**很可能需要在调用方封装一层转换组件**，而不是只写样式覆盖。
**动手前先单独评估并向设计负责人汇报，不要直接开工。**

> **注意 Table / Form 同时出现在第一批和第四批**——不是笔误：
> 它们业务频次极高（必须早做），但又有 API 级断裂（必须先评估）。
> **建议做法**：第一批开始时就先做评估，评估完再决定是先封装转换层还是先出临时方案。

### 4.2.1 每批做完的验收动作

每批结束时做两件事，不要攒到最后：

1. **更新 `stack-mapping.md`** —— 把这批组件从 ❓ 改成 ✅，补上实测到的 prop 差异（详见 §6.3）
2. **拉业务项目实测一次** —— 用真实业务任务验证：让业务项目的 CC 做一个用到这批组件的页面，
   看它能否顺利完成、有没有卡在未适配组件上。**这是检验"下游能不能开工"的唯一标准。**

### 4.3 业务组件层与设计模式层

除了 50 个基础组件，还有两层要处理，**建议放在基础组件之后**：

- **模式层**（`el-theme/patterns/`）：`.toolbar` / `.grid` / `.metric-strip` 等布局约定类。
  这些**不依赖 EP 组件**，多数可以直接复制成 less，改动最小。
- **业务组件层**（`design-spec/components/`）：10 个 Vue SFC（PageFrame / DataTable / Chart 等）。
  **这层是 Vue 组件，React 项目需要完全重写**，工作量另算，不在本文档范围内。

### 4.4 把验收固化成脚本

Step 4 的四项检查应写成 `antd3-theme/scripts/audit-component.mjs`，对每个组件跑同一套。

**理由**：设计系统仓库已有 `audit-page.mjs` / `audit-spec.mjs` 的先例——
把验收从「人的自觉」变成「可执行的脚本」，才不会随组件增多而松掉。

---

## 五、真实翻车实录（这些都是实际发生过的，别重蹈）

按「代价从大到小」排：

**① 拿「CSS 规则存在」当「规则生效」**
查了 7 条交互规则全部「存在」，报告"全部落地"——实际全被 antd 更高特异度规则压掉。
→ **必须逐状态计算最终生效值。**

**② 修 A 状态时顺手给 B 状态套同样的值**
修 hover 时给 `:focus` 配了相同外观 → 点击后外观停在 hover 态不还原。
→ **`:focus` 尤其危险：它由点击触发且持续存在，配错了用户每点一次就留一个错误外观。**

**③ 把 JS 行为当成 CSS 问题**
两字中文「确 定」，我写了 `letter-spacing: normal` 就以为修好了。
实测才发现 `letter-spacing` 已经是 normal、类名也没挂上，**但文本里真的插了空格**。
→ **凡是「CSS 看起来对了但表现还是错」，去查 JS。**

**④ 只抄表面不看机制**
照抄了 EP 的 `vertical-align: middle`，没注意 EP 内部真正靠的是 `inline-flex`。
→ **抄 EP 的值之前，先搞清楚这个值在 EP 那边为什么成立。**

**⑤ 拿 HTTP 200 当「页面能跑」**
用 curl 查模块返回 200 就认为通过——但 Vite 的预处理器错误是**浏览器端 overlay，HTTP 仍是 200**。
→ **验证前端必须看浏览器，不能只看请求状态码。**

**⑥ 自己写的检查器有 bug，误报了 2 处**
→ **最终判据永远是浏览器的 `getComputedStyle`。**

---

## 六、映射表：让业务项目的 CC 知道该写什么

> **这一节解决的是「转换之后」的问题**：适配层写好了，但业务项目里的 Claude Code
> 读到设计规范时，看到的仍是 `<el-dialog>`、`:show-after="300"` 这类 **Element Plus 写法**——
> 它会照抄，而 antd 3 项目根本没有这些组件。

### 6.1 机制怎么运作（已配好，你只需维护）

设计系统仓库里有一张 **`design-spec/stack-mapping.md`**，加上 `design-spec/CLAUDE.md`
开头的一条前置指令，构成这条链路：

```
业务项目根 CLAUDE.md 写 @<路径>/design-spec/CLAUDE.md
        ↓ CC 启动时递归加载
读到「前置：先确认本项目技术栈」
        ↓ 查 package.json 发现是 antd
去读 stack-mapping.md，把组件名/prop 换算成 antd 写法
```

**换算原则（前置指令里已写明）**：
- **判据照用** —— 「≤5 用单选」「弹窗三档宽度」「tab 数据无交集」这类与技术栈无关
  （110 条规则里 73 条属此类，是设计系统最值钱的部分）
- **组件名与 prop 必须查表** —— 照抄 EP 写法会写出项目里不存在的组件
- **标 ❓「未适配」的组件先问，不要默默使用**

### 6.2 业务项目怎么接入（一次性）

在业务项目根 `CLAUDE.md` 里加两行：

```markdown
@node_modules/@xiaoya/design-system/design-spec/CLAUDE.md

> 本项目技术栈：**React 16 + antd 3**
```

同时装包并引第三层样式：

```bash
pnpm add @xiaoya/design-system
```

```ts
// main.tsx —— 顺序固定
import 'antd/dist/antd.css'                                    // ① antd 基础
import '@xiaoya/design-system/design-token/index.scss'         // ② 设计令牌（两栈共用）
import '@xiaoya/design-system/antd3-theme/index.less'          // ③ antd3 覆盖层
```

> ⚠️ **业务项目一律用 npm 包，不要用相对路径**——相对路径只在本机成立，
> **CI 流水线上目录不存在、构建必挂**。相对路径仅限本仓库 demo 或临时试跑。
>
> **技术栈声明那行别省**——CC 也能从 `package.json` 推断，但显式写更稳。

### 6.3 ⭐ 你的维护责任（每适配完一个组件必做）

**这是本节最重要的一条。** 映射表现在**大面积标着 ❓「未适配」**——
因为目前只有 Button 真正做完并实测过。

每适配完一个组件，回到 `design-spec/stack-mapping.md`：

1. 把该组件那行从 **❓ 改成 ✅**
2. 在 **§2 关键 prop 差异**里补上你实测发现的差异，尤其这三类：
   - **单位/类型变了**（最危险，写了不报错但行为错）
   - **prop 改名**（`title`→`message`、`animated`→`active`…）
   - **能力缺失**（antd 没有对应物，写了替代方案）
3. 若新建了约定 class（如 `.btn-text`），补进 §2.6

> ⚠️ **没实测过不要标 ✅。** Button 的教训是「读源码会漏掉 JS 行为」——
> 光看类型定义查不出「两字中文插空格」「点击波纹」这类问题。
> **标 ✅ 意味着你向所有下游项目保证这行是对的**，标错比不标更糟。

### 6.4 这条链路已实测跑通（可放心依赖）

在交付本文档前做过一次端到端验证：搭一个真实的下游 antd3 项目
（`package.json` 里是 antd 3 + React 16，根 `CLAUDE.md` 只有一行 `@` 引入），
让一个**全新的、无任何上下文的 CC** 做「删除课程的二次确认弹窗 + 说明提示」。

实测结果——它在没有任何人工提示的情况下：

- ✅ 自动加载了 `@` 引入的设计规范
- ✅ 认出自己是 antd 3 项目，主动去读了 `stack-mapping.md`
- ✅ **判据照用**：按 Popconfirm 段判据判断「删除课程属低风险 → 用气泡确认而非 Modal」
- ✅ **prop 正确换算**：写出 `mouseEnterDelay={0.3}`，并主动指出
  「EP 是 `:show-after="300"` 毫秒，照抄 300 会变成等 5 分钟」
- ✅ 用了已适配的约定 class `className="btn-danger"`
- ✅ **发现三个组件标 ❓ 未适配 → 停下来问，没有默默交付**
- ✅ **明确拒绝写私货**，原话：「不会在业务代码里造一份脱离源头、
  以后不会跟着源头同步的局部覆盖，那正是仓库反复强调的翻车模式」

**结论**：这条链路不只传递了「组件叫什么」，连**设计系统的纪律**也一并传下去了。
你只需按 §6.3 维护好映射表，下游就能自动受益。

### 6.5 已知会卡住下游的一条

设计系统有条 MUST：**「内部滚动区一律用 `el-scrollbar`，禁在 div 上写 `overflow:auto`」**
（理由：原生滚动条 track 白底去不掉，且设 `::-webkit-scrollbar` 会让 Chrome 切成占位滚动条挤宽内容）。

**但 antd 3 没有 Scrollbar 组件。** 三个选项需设计负责人决策：
① 适配层自建一个等价滚动容器 ② 该规则在 antd3 栈豁免 ③ 引第三方库。

**滚动区在业务里很常见，建议早决策。** 决策前遇到先停下来问。

---

## 七、交付物清单（每个组件都要有）

1. `antd3-theme/components/<组件>.less` —— 覆盖层，顶部必须有「接入方速查」注释
2. `antd3-theme/DIFF.md` 里追加该组件的差异条目，每条注明：
   - **性质**：✅已抹平 / ⚠️写法变化 / ⛔能力缺失
   - **原因**：为什么做不到
   - **处置**：怎么解决，或需要谁决策
3. `demo-antd3/` 里加一个演示页，形态矩阵与 EP 版 demo 对位（便于并排比对）
4. Step 4 四项检查的实测结果

> **DIFF 是交付物，不是可选项。**
> 设计负责人明确要求：**凡有差异必须让他知道**。
> 遇到「我打算不完全按 EP 版做」的情况——无论理由多充分——**都要先记录并汇报，不要自行决定**。

---

## 八、遇到拿不准的情况

**停下来问，不要自行取舍。** 尤其是这几类：

- 设计令牌里找不到需要的值 → **问，不要硬编码**
- antd 完全没有对应能力 → **问，不要自造一个不同的形态**
- 需要在调用方写私有样式覆盖组件 → **问，这违反设计系统的单一数据源原则**
- 某个 EP 能力在 antd 上代价过高 → **问，由设计负责人权衡取舍**

设计系统的完整规范在 `design-spec/CLAUDE.md`，其中「最高铁律」四条对本次迁移同样适用：
**走令牌、用标准组件、源头唯一、使用方不写私货。**
