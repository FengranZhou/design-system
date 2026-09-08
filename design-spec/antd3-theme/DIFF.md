# antd 3 适配层 —— 偏差登记表

> **这是本适配层最重要的交付物。** 目标是「与 EP 版一模一样」，凡做不到的，
> 必须在此登记并说明**为什么做不到**、**替代方案是什么**、**是否需要你决策**。
>
> 状态说明：
> - ✅ **已抹平** —— 用覆盖层解决了，调用方无感知
> - ⚠️ **写法变化** —— 视觉一致，但调用方要写得不一样（研发需知晓）
> - ⛔ **能力缺失** —— 效果做不出来或语义不同，**需要你决策**
>
> 试点范围：Button（`el-theme/components/button.scss` 479 行 → `antd3-theme/components/button.less`）。
> 状态标注为「待验证」的，指覆盖层已写、但尚未在浏览器中实测确认。

---

## ⛔ 需要你决策的（3 条）

### DIFF #1 —— 危险按钮：`type="danger"` → `className="btn-danger"`

| | EP 版 | antd 3 |
|---|---|---|
| 写法 | `<el-button type="danger">` | `<Button className="btn-danger">` |

**为什么**：antd 3 确实有 `type="danger"`，但它的色值、hover/active 状态机、禁用态处理与本设计系统的
`--iflyv-danger-*` 语义色不同。若沿用 `type="danger"`，等于让 antd 的状态机和我们的覆盖层打架
（它会在多处用 `!important` 级别的具体选择器争夺）。改用独立约定 class，语义与 EP 版一一对应、状态机完全由我们控制。

**影响**：调用方写法变了。规则条目 `button-type-whitelist`（MUST）的措辞需要为 antd3 栈另写一份。

**待你决策**：接受 `className="btn-danger"`，还是希望我尝试强行覆盖 antd 的 `type="danger"`？
后者可行但会引入大量高特异度选择器，长期维护更脆。**我的建议是接受约定 class。**

---

### DIFF #2 —— 文本按钮：`text` 属性 → `className="btn-text"`

| | EP 版 | antd 3 |
|---|---|---|
| 写法 | `<el-button text>` | `<Button className="btn-text">` |

**为什么**：antd 3 **没有 text 形态**。它最接近的是 `type="link"`，但那是蓝色链接语义
（你的规范里 `el-link` 已在勿用清单，正是因为语义偏"跳转导航"过于狭隘）。
故新建约定 class。

**影响**：`<el-button text>` 在你的规范里是高频形态——纯图标入口、入口引导按钮、表格操作列都用它。
这意味着 antd3 栈上这批写法全部要改。

**待你决策**：同 #1，接受约定 class 还是另想办法。**建议接受。**

---

### DIFF #6 —— 换品牌色与暗色模式：**能力缺失**

| | EP 版 | antd 3 |
|---|---|---|
| 换品牌色 | 改 `<html data-brand="…">` 运行时即刻生效 | ⛔ 不支持 |
| 暗色模式 | CSS 变量语义层覆盖，运行时切换 | ⛔ 不支持 |

**为什么**：你的令牌体系是**运行时 CSS 变量**；antd 3 的换肤是**构建期 less `modifyVars`**，
变量在编译时就烧进 CSS 了。两者是代差，不是配置问题。

**当前处置**：按你的决定，**当前阶段只保留品牌绿、不支持暗色**，故此项暂不阻塞。

⚠️ **但要记录一个后果**：`design-spec/CLAUDE.md` 里「新项目首次接入 / 换品牌色 / 配 `data-brand`」
那条触发行，在 antd3 栈上是**不成立的**。下游 CC 若读到它并照做，会写出不生效的代码且**不报错**。
需要在规则层为 antd3 栈标注例外。

---

## ⚠️ 写法变化（研发需知晓，视觉一致）

### DIFF #3 —— 按钮图标：`#icon` 插槽 → `className="btn-icon"`

| | EP 版 | antd 3 |
|---|---|---|
| 写法 | `<template #icon><Plus /></template>` | `<Plus className="btn-icon" />` 直接作 children |

**为什么**：EP 会把 `#icon` 插槽内容包进 `.el-icon` 容器，你的覆盖层大量依赖这个容器
（图标↔文字 4px 间距、图标弱一档取 `icon-2`、纯图标判据 `:has(.el-icon):not(:has(span))`、
loading 时 mask 替换）。**antd 3 没有 icon 插槽**——它的 `icon` prop 只接受字符串图标名
（antd 自己的 `<Icon type="plus">`），塞不进 Lucide 图标。

故改用约定 class `.btn-icon` 承载，覆盖层据此实现同样的四类行为。

**代价**：调用方必须记得加 `className="btn-icon"`。漏加则图标间距、色阶、loading 替换全部失效，
且**不报错**——这正是你规范里反复警惕的"静默偏离"。

**建议**：这条应进 antd3 栈的 hook 拦截规则（检测 Button 内有 svg 但无 `.btn-icon`）。

---

### DIFF #4 —— 禁用态判据：`.is-disabled` → `[disabled]`

EP 用 `.is-disabled` 类，antd 3 用原生 `[disabled]` 属性。覆盖层已全部对位改写，**调用方无感知**
（两边都是写 `disabled`）。登记此条是因为**将来改这个文件的人需要知道**：
antd3 层里不能照抄 EP 版的 `.is-disabled` 选择器。

---

### DIFF #5 —— 加载态判据：`.is-loading` → `.ant-btn-loading`

同上，已对位。但有一个**真实差异**：

EP 的 loading 是把 `#icon` 插槽的图标 mask 成 Lucide LoaderCircle；
antd 3 的 loading 会**额外插入一个 `<i class="anticon anticon-loading">` 节点**，自带 antd 风格转圈图标。

覆盖层的处置：隐藏 antd 自带 svg，用同一个 Lucide LoaderCircle 的 mask 重绘 + 自定义 `@keyframes`。
**待验证**：antd 3 的 loading 图标节点位置（在文字前）与 EP 是否一致，以及 antd 自带的
`opacity` 变化是否已被完全压掉。

---

### DIFF #8 —— 两字中文按钮自动加宽字距（**试点中实测发现，最隐蔽的一处**）

antd 3 对**恰好两个汉字**的按钮文案自动挂 `.ant-btn-two-chinese-chars`，
加 `letter-spacing: .34em` 把「确定」撑成「确 定」（源码判据：`/^[一-龥]{2}$/`）。
EP **无此行为**。

**影响面极大**：你产品里两字按钮遍地都是——确定 / 取消 / 保存 / 删除 / 编辑 / 提交 / 返回 / 新增。
不处理的话，antd3 栈上这些按钮**全部比 EP 版宽一截且字距不同**。

**⚠️ 这条不能靠 CSS 解决——必须走 JS 开关。**

antd 3 做了**两件事**，容易只看到其中一件：
1. 加 `.ant-btn-two-chinese-chars` 类（CSS 层，`letter-spacing: .34em`）
2. **`insertSpace()` 直接往 DOM 里插入一个真实空格字符**（`'确定'.split('').join(' ')` → `'确 定'`）

第 ② 件是 **JS 行为，任何 CSS 都压不掉**（实测：`letter-spacing` 已是 `normal`、
`.ant-btn-two-chinese-chars` 类也没挂上，按钮文本仍然是 `"确 定"`）。

**正确解法（接入方必做，一次性全局设置）**：

```tsx
import { ConfigProvider } from 'antd'

<ConfigProvider autoInsertSpaceInButton={false}>
  <App />
</ConfigProvider>
```

覆盖层里那段 `letter-spacing: normal` 作为**双保险**保留（防止调用方漏配 ConfigProvider 时
至少不会再叠加 CSS 字距），但**它不是主解法**。

> **这条是本试点最有价值的发现**：
> ① 只有**恰好两个汉字**才触发，比对单字/三字按钮都发现不了；
> ② 我第一版当成纯 CSS 问题、写了 `letter-spacing: normal` 就以为修好了，
> **在浏览器里实测才发现文本里是真的插了空格**——纸面推演会漏掉这类问题；
> ③ 它需要**调用方配合**（ConfigProvider），不是改覆盖层就能全部解决。
>
> **推论**：剩下 51 个组件里大概率还埋着同类「JS 行为差异」，而这类差异
> **无法靠读 CSS 源码发现，必须逐个跑起来实测**。这直接影响工时估算。

---

## ✅ 已抹平（调用方无感知）

| # | 项 | 处置 |
|---|---|---|
| — | 圆角 / 字阶 / 高度 36px / min-width 80px | 令牌直接套用，与 EP 版同值 |
| — | antd 3 基类自带 `box-shadow: 0 2px 0 rgba(0,0,0,.015)` | 已压成 `none`（EP 版无阴影） |
| — | antd 3 primary 自带 `text-shadow` 提亮 | 已压成 `none` |
| — | 按下反馈 `translateY(1px)` | 已对位实现 |
| — | `:focus` 无框 / `:focus-visible` 有框（a11y） | 已对位实现，含 danger 变色 |
| — | 下拉箭头 hover 旋转 180° / Dropdown 展开旋转 | `.btn-caret` / `.dropdown-caret` 已对位 |
| — | 入口引导箭头 hover 前移 2px、仅限 text 形态 | `.btn-entry` 已对位，同样限定在 `.btn-text` 下 |
| — | 按钮组间距靠父容器 flex+gap，源头清零相邻 margin | 已对位 |
| — | **点击蓝色波纹（wave）** —— antd 3 点击后扩散一圈 `#1890ff` 蓝波纹，EP 版只有下沉 1px | 已压掉 `::after` 的 shadow/animation/display，并把 `--antd-wave-shadow-color` 设为 transparent |
| — | **按钮内部布局** —— antd 是 `inline-block`+`vertical-align`，中文下图标/箭头比文字低 1.3px | 改为 `inline-flex`+`align-items:center`（对齐 EP 基类），三者中心偏移归 0 |

---

## DIFF #10 —— 特异度战争：antd 3 的自带状态样式会压过覆盖层（**实测翻车两次**）

antd 3 的基础样式里有一批**高特异度的状态规则**，覆盖层若只写常态选择器，
hover/focus 时会被它们压过去，**静态查规则查不出来，必须真实 hover 才暴露**。

**翻车实例 1：文本款 hover 变成绿色实心胶囊**（用户截图发现）

`.ant-btn.ant-btn-primary:hover:not([disabled])`（特异度 0,4,1）压过
`.ant-btn.btn-text:hover`（0,3,1）→ 文本款+主色 hover 时被填上品牌绿实心底 + 白字，
文字和图标全部"消失"在绿底里。

**修法**：给所有实心态的 hover/active 规则加 `:not(.btn-text)`。

**翻车实例 2：loading 态文本款 hover 变 antd 蓝**

antd 的 `.ant-btn:hover, .ant-btn:focus { color: rgb(64,169,255) }` 与
`.ant-btn-primary:hover { color: #fff }` 会把 loading 态文本款的文字刷成
antd 原生蓝 / 白色（**完全脱离设计令牌**）。

**修法**：loading 段必须把 `:hover` / `:focus` 显式列进选择器，不能只写常态。

**翻车实例 3：点击后颜色/边框不还原**（用户截图发现）

修实例 1、2 时我**过度修正**：给 `:focus` 配了和 `:hover` 一样的外观。
后果是**点击会留下 focus，鼠标移开后外观停在 hover 态不还原**——
文本按钮点完一直是绿色，主按钮点完一直是 hover 色。

同时 antd 的 `.ant-btn:focus` 还会给文本款加一圈**蓝色边框**（文本款本是无边框形态）。

**正解（对齐 EP 版口径）**：EP 写的是 `&:not(.is-text):not(.is-link):focus:not(:hover)`，含两层意思：
1. **文本款完全不吃 focus 变色**（`:not(.is-text)`）
2. **实心款的 focus 只在非 hover 时生效**，且是**复位到常态**、不是套用 hover 外观（`:focus:not(:hover)`）

antd3 层照此实现：`:focus:not(:hover):not(:active)` → 复位常态色 + 文本款 focus 清掉 border。
键盘可达性仍由 `:focus-visible` 的 outline 提供，不受影响。

> **教训**：修 A 状态时顺手给 B 状态套同样的值，是很容易犯的过度修正。
> **`:focus` 尤其危险——它由点击触发且会持续存在**，配错了用户每点一次就留一个错误外观。
> 凡涉及 focus，必须模拟「点击 → 鼠标移开」验证是否还原，光看 hover 发现不了。

> **这条对剩下 51 个组件是通用警示**：
> ① antd 3 的状态样式特异度普遍偏高（大量 `.ant-btn-primary:hover` 这种双类名），
>    覆盖层**每个状态都要显式对位**，不能指望常态规则自然继承；
> ② **静态查 CSS 规则「存不存在」查不出这类问题**——我第一轮查了 7 条交互规则全部"✓ 存在"，
>    但实际渲染是错的。必须**逐个状态计算最终生效值**（或真实 hover）才能发现；
> ③ 判据：凡最终生效值里出现 **antd 原生裸色**（`rgb(64,169,255)` 等）而非 `var(--iflyv-*)`，
>    即为脱离设计系统，必须修。

---

## DIFF #9 —— 工具链摩擦：antd 3 在 Vite 5 下需要两处 shim（**与设计系统无关，但影响接入成本**）

试点搭建过程中实测踩到，**研发那边大概率也会遇到**，先记下来：

**① `ReferenceError: global is not defined`（会导致整页白屏）**

antd 3 的依赖链（`resize-observer-polyfill` 等）是 CommonJS 时代产物，直接引用 Node 全局变量 `global`：

```js
if (typeof global !== "undefined" && global.Math === Math) { return global }
```

webpack 4 会自动注入 Node polyfill，**Vite 5 不会**。必须在任何模块加载前 shim：

```html
<!-- index.html，务必放在 <script type="module"> 之前 -->
<script>window.global = window.globalThis</script>
```

⚠️ **Vite 的 `define: { global: 'globalThis' }` 对此无效**——`define` 不重写已预打包的
`node_modules/.vite/deps/*`，实测替换后裸 `global` 仍有 39 处。只能走 index.html 的 shim。

**② less 需要 `javascriptEnabled: true`**

antd 3 的 less 用了内联 JS 表达式，Vite 需显式开启：

```ts
css: { preprocessorOptions: { less: { javascriptEnabled: true } } }
```

**③ 依赖预打包缓存失效会白屏且无报错**

改动 lockfile（如补装依赖）后，运行中的 dev server 仍按旧哈希提供模块，
浏览器请求的 URL 对不上 → ES module 加载阶段失败，**`window.onerror` 捕获不到、页面全白**。
重启 dev server（`--force`）即可。开发期会反复遇到，研发需知晓。

> **对接入成本的意义**：React 16 + Vite 5 本身就是有摩擦的组合（Vite 5 面向现代 React，
> `@vitejs/plugin-react` v4 官方支持 17+）。这些坑与设计系统无关，但会计入"接入这套东西要多久"。

---

## DIFF #11 —— loading 的实现机制不同：antd 会撑宽按钮（**需你决策**）

| | EP 版 | antd 3 |
|---|---|---|
| 机制 | 把**已有的** `.el-icon` 用 mask 换成 LoaderCircle | **插入一个新节点** `<i class="anticon-loading">` |
| 无图标时 loading | **不显示任何 spinner**（没有 `.el-icon` 可替换） | 仍插入 spinner |
| 宽度 | **不变**（原地替换） | **+18px**（多一个节点 + 间距，实测 80 → 98） |

后果：同一列按钮在「常态 / 禁用 / 加载」三行之间**宽度会跳变**，而 EP 版三行等宽。
批量渲染的列表操作列里，点一下按钮整行会轻微位移。

**三个可选方向（需你定）**：
1. **接受**——认为 loading 时宽度变化可接受（antd 原生行为，研发也习惯）
2. **绝对定位 spinner**——把 `.anticon-loading` 脱离文档流覆盖在按钮上，宽度不变，
   但文字会被 spinner 压住（需再调透明度或缩进）
3. **对齐 EP：无图标时不显示 spinner**——最贴近 EP，但会让"加载中"缺少视觉反馈，
   且与 antd 使用者的预期相悖

我倾向 **①接受 + 在规则文档里写明**：这是两个组件库的机制差异，
强行对齐（方案 2/3）都会引入新的怪异行为，代价大于收益。**但这属于"不一样的地方"，按你的要求交你决定。**

---

## DIFF #12 —— 其它组件尚未适配（当前试点只覆盖 Button）

demo 页里的 **Switch 开关**目前是 **antd 原生灰色胶囊**，而 EP 版是品牌绿——
因为 `antd3-theme/components/` 下**只有 `button.less`**，Switch/Input/Table 等 51 个组件尚未适配。

这不是 bug，是试点范围。但它直观说明了**未适配组件的样子**：
拿到的是 antd 原生观感，**不报错、页面照跑**，只是完全脱离设计系统——
与你规范里「⏸ 勿用清单」描述的静默脱钩风险是同一回事。

---

## DIFF #7 —— 架构发现：组件高度令牌不在共用层

**这不是 antd 3 的问题，是本设计系统的一个既有裂缝**，试点时暴露出来：

组件高度 36px 目前只定义在 `el-theme/var-mapping.scss` 的 `--el-component-size`，
**不在 `design-token/` 共用令牌层**。antd3 层不能依赖 EP 映射层，只好先在本层
定义临时变量 `--iflyv-a3-component-size` 兜住。

**正解**：把组件尺寸令牌上提进 `design-token/css/spacing.scss`（或新建 `sizing.scss`），
让 EP 层和 antd3 层都引用同一份。这样才符合你「共用底座」的架构。

⚠️ **但这会改动 `design-token/`**，属于会影响现有 EP 链路的动作——按你「不影响现有 EP」的前提，
**我没有擅自改，等你确认**。改法是安全的（新增令牌 + 让 `var-mapping.scss` 引用它，
EP 侧计算值不变），但仍需你点头。

---

## 尚未验证的部分

以下需要 demo 跑起来后逐格比对，当前**尚未确认**：

- [ ] 三种类型 × 四种状态（常态/hover/active/focus-visible）的实际色值是否与 EP 版一致
- [ ] 禁用态：antd 3 的 `[disabled]` 是否还有未压掉的自带样式
- [ ] loading：图标位置、转速、颜色是否与 EP 版一致
- [ ] 纯图标 text 按钮：`:only-child` 判据在 antd 3 的 DOM 下是否成立
  （antd 可能会额外包 `<span>`，届时判据要改）
- [ ] 图标 + 文字的 4px 间距是否生效（依赖 `.btn-icon + span` 相邻选择器）
- [ ] `min-width: 80px` 与 antd 3 自带 padding 是否冲突

> **依赖安装受阻**：公司内网 registry `depend.iflytek.com` 当前不可达（连接被重置），
> 已改用公网 npm 安装。若你在内网环境复现，需要先解决 registry 连通性。
