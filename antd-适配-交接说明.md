# antd 适配 —— 交接说明

> **给接手这件事的研发同事。** 读完这一份就知道：要做成什么、现在到哪了、接下来怎么推。
>
> 配套文档（都在本仓库）：
> - **`antd3适配层-作业指导书.md`** —— 单个组件怎么转，**动手前必读**，本文不重复其内容
> - `design-spec/antd3-theme/DIFF.md` —— Button 试点的 12 条差异，**新组件的记录格式照它**
> - `design-spec/stack-mapping.md` —— EP ↔ antd 组件与 prop 映射表，**每适配完一个要回来更新**
> - `design-spec/CLAUDE.md` —— 设计系统完整规范（下游 CC 也读这份）

---

## 一、最终目标（一句话）

**把现在这套以 Element Plus 为底的设计系统，无损地扩展出 antd 3 和 antd 6 两套底子，
三套在同一个仓库里共存，下游项目的 Claude Code 能自动识别技术栈、调用对应的那套。**

拆开说，"无损"指下面每一层都要有对应实现，且**下游用起来的体感一致**：

| 层 | 现状（EP） | 目标 |
|---|---|---|
| 设计令牌 | `design-spec/design-token/`（9 个 scss） | **三栈共用同一份**，不复制 |
| 基础组件样式 | `el-theme/components/`（50 个启用 / 4305 行） | antd3、antd6 各一套对位实现 |
| 模式层 | `el-theme/patterns/`（4 个：toolbar/grid/metric-strip/flyout） | 各一套 |
| 业务组件 | `design-spec/components/`（10 个 Vue SFC） | React 版重写 |
| 典型页面 | `demo/src/components/page/`（4 页） | 各一套 |
| 规则文档 | `references/`（112 条 @rule） | **判据共用**，组件名/prop 走映射表 |
| 检测器 / 评分器 | `scripts/`（Vue 模板解析） | 需 JSX 版 |
| 防护 hook | `.claude/hooks/`（2 个，匹配 `el-*`） | 需按栈分流 |
| 技术栈识别 | `stack-mapping.md` + CLAUDE.md 前置指令 | **已建好，可直接用** |

> **判断"做完了"的标准**：一个 React+antd 项目接入后，它的 CC 能像 Vue+EP 项目一样，
> 命中同样的规则、写出同样观感的界面、被同样的检测器打分。

---

## 二、当前进度（截至交接时）

### ✅ 已完成

| 项 | 说明 |
|---|---|
| **架构与机制** | 三栈共存的目录结构、技术栈识别链路（已端到端实测通过，见 §2.1） |
| **Button 组件（antd3）** | `antd3-theme/components/button.less`（483 行），与 EP 版 479 行基本 1:1 |
| **差异记录范式** | `DIFF.md` 12 条，含 3 条"CSS 无解、必须 JS 配合"的硬差异 |
| **作业指导书** | 单组件转换的五步流程 + 四类通用坑 + 六条翻车实录 |
| **验证环境** | `demo-antd3/`（React 16.14 + antd 3.26.20 + Vite 5），双击根目录 `.command` 即可跑 |

#### 2.1 技术栈识别链路已跑通（这是整件事能成立的地基）

做过端到端实测：搭一个真实的 antd3 下游项目，让一个**全新、无上下文的 CC** 做
「删除课程的二次确认弹窗」。它在无人提示的情况下自动完成了：

- 读到 `@` 引入的设计规范 → 认出自己是 antd 3 项目 → 主动查 `stack-mapping.md`
- **判据照用**（按 Popconfirm 段判断"低风险 → 用气泡确认而非 Modal"）
- **prop 正确换算**，并主动指出「EP 是 `:show-after="300"` 毫秒，antd 是
  `mouseEnterDelay={0.3}` **秒**，照抄数字会变成等 5 分钟」
- 发现 Modal/Tooltip/Popconfirm 标着"未适配" → **停下来问，没有默默交付**
- 明确拒绝在业务代码里写私货覆盖

**结论**：这条链路传递的不只是"组件叫什么"，连设计系统的纪律也一并传下去了。
你只要按 §4 维护好映射表，下游自动受益。

### ⬜ 未开始

| 项 | 量 |
|---|---|
| antd3 基础组件 | **49 / 50**（只做了 Button） |
| antd3 模式层 | 0 / 4 |
| antd3 业务组件 | 0 / 10（Vue SFC → React 重写） |
| antd3 典型页面 | 0 / 4 |
| **antd 6 整套** | **完全没开始**（机制与 antd3 不同，见 §5） |
| JSX 检测器 / 评分器 | 未做（现有的是 Vue 模板解析器） |
| hook 按栈分流 | 未做（现有 2 个 hook 只匹配 `el-*`） |

---

## 三、必须先建立的三个认知

**不接受这三条会走弯路，请先看完。**

### 3.1 "一次性完美"做不到，但可以"一轮收敛"

Button 一个组件挖出 12 条差异，其中 **约 1/3 只能在浏览器里跑起来才会暴露**——
antd 的 JS 会改 DOM、注入属性，CSS 层面完全看不见。

典型例子：antd 3 对**恰好两个汉字**的按钮文案（确定/取消/保存/删除）
会**在 DOM 里真的插入一个空格**（`'确定'.split('').join(' ')`）——
我第一版当成 CSS 字距问题修，`letter-spacing` 改完了文本还是「确 定」。
正解是 `<ConfigProvider autoInsertSpaceInButton={false}>`，**CSS 永远修不好**。

所以正确的目标不是"一次做对"，而是**用固定流程让每个组件一到两轮收敛**。
流程在作业指导书 §二，五步，别跳步。

### 3.2 机器验收替代不了人工点检

Button 做完后我"自查通过"，结果设计负责人**手动点了两下就找出两个 bug**
（文本按钮 hover 变成绿色实心块、点击后颜色不还原）。

原因是我一开始用"查 CSS 规则存不存在"验收——7 条规则全部"✓ 存在"，
但实际渲染是错的，**被 antd 更高特异度的规则压掉了**。

**规则存在 ≠ 规则生效。** 作业指导书 §Step 4 给了四项必做的浏览器实测，
§Step 5 是人工点检清单，两个都不能省。

### 3.3 差异必须记录，不能自行取舍

设计负责人的明确要求：**凡是"我打算不完全按 EP 版做"，无论理由多充分，都要先记录并汇报。**

所以 `DIFF.md` 是**交付物**，不是可选项。每个组件都要产出，格式照 Button 那份：
标明性质（✅已抹平 / ⚠️写法变化 / ⛔能力缺失）、原因、处置。

---

## 四、推进节奏（建议顺序）

### 第 0 步：先跑通环境，看懂样板（半天）

1. 双击根目录 `双击这里打开 EP 预览.command`（5173）和 `双击这里打开 antd3 预览.command`（5174），
   **两个可以同时开**，并排比对
2. 读 `antd3-theme/components/button.less` —— 唯一的完整样板，**后面照它写**
3. 读 `DIFF.md` —— 理解差异要记成什么样
4. 通读 `antd3适配层-作业指导书.md`

### 第 1 步：建"公共基座"（1~2 天，收益最大）

Button 里有一批规则是**所有组件通用**的，先抽成 `antd3-theme/base.less`，
省掉后面 49 次重复：

- 关掉全局点击波纹（antd 的 Switch/Checkbox/Radio/Button 都有，硬编码 `#1890ff`）
- 压掉 antd 默认的 `box-shadow` / `text-shadow`
- 统一 focus 口径（`:focus:not(:hover)` 复位常态——**这是最大的坑，见指导书 §Step3②**）
- 统一禁用态口径（antd 用 `[disabled]` 属性，EP 用 `.is-disabled` 类）
- 内部布局统一 `inline-flex`（antd 的 `inline-block` + `vertical-align` 在中文下会偏 1.3px）
- ConfigProvider 必配项清单

### 第 2 步：基础组件，按业务频次分四批（主体工作量）

> ⚠️ **顺序按"业务用得多不多"，不是"做起来难不难"**。
> 这是实测反推的：让 CC 做「删除确认弹窗」这种最普通的需求，
> 一次撞上三个未适配组件直接卡住。若按难度排，会出现"简单的都做完了、业务还是干不了活"。

| 批次 | 组件 | 说明 |
|---|---|---|
| **一（解锁业务）** | Modal / Tooltip / Popconfirm / Input / Select / Table / Form / Tag / Empty | 补完这批，业务项目就能正常开工 |
| **二（高频补充）** | Checkbox / Radio / Switch / Pagination / Dropdown / Drawer / Alert / message | 表单与列表页常客 |
| **三（低频/展示）** | Badge / Divider / Skeleton / Result / Steps / Descriptions / Rate / Slider / Breadcrumb / Tabs / Anchor | 无状态机、可批量快速做 |
| **四（单独评估）** | DatePicker / Cascader / Upload / Table / Form | **不只是样式问题**，见下 |

**⛔ 第四批为什么要单独评估**（动手前先评估并汇报，不要直接开工）：

- `DatePicker` —— antd 3 用 **moment 对象**（EP 是字符串 + `value-format`），
  所有取值处都要 `.format()`，整个项目依赖 moment.js
- `Form` —— antd 3 是 **`Form.create()` HOC + `getFieldDecorator`** 老式写法，
  与 EP 的 `v-model` 完全不同，校验与错误提示的组织方式都要重写
- `Table` —— 列定义是 **`columns` 配置数组**（EP 是 `<el-table-column>` 子组件），
  排序用 `sorter`（EP 是 `sortable`）

这三个**很可能需要在调用方封装一层转换组件**，而不是只写样式覆盖。

**每批做完两件事，不要攒到最后**：
1. 更新 `stack-mapping.md`（把该组件从 ❓ 改成 ✅ + 补 prop 差异）
2. **拉业务项目实测一次** —— 用真实任务验证 CC 能否顺利完成、有没有卡在未适配组件上。
   这是检验"下游能不能开工"的唯一标准。

### 第 3 步：模式层（0.5~1 天）

`el-theme/patterns/` 那 4 个（toolbar / grid / metric-strip / page-frame-flyout）
**不依赖 EP 组件**，多数可以直接复制成 less，改动最小。

### 第 4 步：业务组件（工作量另算，需单独排期）

那 10 个是 **Vue SFC，React 项目要完全重写**——不是样式适配，是组件重写。
建议做完基础组件后单独评估，优先做下游真正用到的（PageFrame / DataTable 大概率优先）。

### 第 5 步：工具链（可与前面并行）

- **JSX 检测器**：现有 `scripts/template-ast.mjs` 是**手写的 Vue 模板解析器**，
  JSX 是表达式语法（`{cond && <Button/>}`、`.map()`），**一行都用不上**，要基于 babel/oxc 重做
- **评分器**：`audit-page.mjs` 里 `if (!file.endsWith('.vue'))` 意味着——
  **现在拿它扫 React 代码，模板结构类规则会静默失效，不报错、只是查不出来**
- **hook**：`.claude/hooks/` 两个脚本只匹配 `el-*`，需按栈分流
- 建议把作业指导书 §Step4 的四项检查固化成 `audit-component.mjs`，对每个组件跑同一套

### 第 6 步：antd 6（见 §5）

---

## 五、antd 6 的特殊性（别照搬 antd 3 的做法）

**antd 6 与 antd 3 是两套完全不同的换肤机制，不要复制 antd3 的方案。**

| | antd 3 | antd 6 |
|---|---|---|
| 换肤 | 构建期 less 变量 / CSS 覆盖 | **运行时 Design Token**（`ConfigProvider theme`） |
| 官方建议 | — | **优先用 Token，CSS 覆盖是最后手段**（官方称 Token 能覆盖 95% 场景） |
| Token 结构 | 无 | SeedToken → MapToken → AliasToken 三层 + 每组件 ComponentToken |
| CSS 变量 | 无 | v6 **默认走纯 CSS Variables 模式** |

**含义**：
1. antd 6 的适配层**主体应该是一份 theme token 映射**（`--iflyv-*` → antd token），
   而不是像 antd3 那样写几千行 CSS 覆盖——**工作量可能远小于 antd 3**
2. 但 antd 6 的 CSS 变量被**约束在 hash class 选择器内**（为主题隔离），
   不是简单全局覆盖，接的时候要按它的机制来
3. 我**没有实测过 antd 6**，上面是查官方文档得出的。**动手前先做一个小试点验证**，
   不要直接按这个结论铺开

> 建议：antd 3 做到第二批之后再启动 antd 6，那时你对"差异都出在哪"已有手感。

---

## 六、几条硬纪律（来自设计系统规范，对本次工作同样生效）

1. **令牌三栈共用一份** —— `design-token/` 不复制、不分叉。改一处，三栈同步
2. **样式只在源头定义** —— 组件外观只允许写在 `<栈>-theme/components/`，
   **严禁在业务代码 / demo 的 scoped 里覆盖**（那叫"局部私货"，脱离源头不再同步）
3. **所有样式值走令牌** —— 禁裸值（hex 色、px 魔法数）。找不到令牌先问，不要就地硬编码
4. **拿不准就问，不要自行取舍** —— 尤其：令牌里没有需要的值 / antd 完全没有对应能力 /
   某个 EP 能力在 antd 上代价过高
5. **差异必须记进 DIFF.md** —— 见 §3.3

完整规范见 `design-spec/CLAUDE.md`，其中「最高铁律」四条对本次工作全部适用。

---

## 七、已知的坑（省你踩一遍）

### 环境类（不配好会白屏且难定位）

| 坑 | 解法 |
|---|---|
| `global is not defined` 整页白屏 | `index.html` 里加 `<script>window.global = window.globalThis</script>`，**必须在所有 module script 之前**。⚠️ Vite 的 `define` 对此无效（不重写已预打包的 deps） |
| less 报错 | `vite.config.ts` 里 `css.preprocessorOptions.less.javascriptEnabled = true` |
| 改依赖后白屏、控制台无报错 | 重启 dev server 加 `--force`。ES module 加载失败时 `window.onerror` 捕获不到 |

### 方法类（我实际犯过的）

1. **拿 HTTP 200 当"页面能跑"** —— Vite 的预处理器错误是浏览器端 overlay，HTTP 仍是 200
2. **拿"CSS 规则存在"当"规则生效"** —— 存在 ≠ 赢得特异度战争
3. **修 A 状态时顺手给 B 状态套同样的值** —— 我给 `:focus` 配了 hover 的外观，
   导致点击后颜色停在 hover 态不还原。**`:focus` 尤其危险：由点击触发且持续存在**
4. **只抄表面不看机制** —— 照抄了 EP 的 `vertical-align: middle`，
   没注意 EP 内部真正靠的是 `inline-flex`，中文下必然偏移
5. **自己写的检查器也会骗人** —— 我的 `:not()` 解析有 bug 误报了 2 处。
   **最终判据永远是浏览器的 `getComputedStyle`**

---

## 八、工时的诚实说明

不给具体人天，因为**Button 一个组件的经验不足以外推 49 个**——
Table / Select / DatePicker 的 DOM 与行为差异比 Button 大得多。

能说的是**成本结构**：

- 写 CSS 本身不是大头（Button 的 483 行 vs EP 的 479 行，基本 1:1）
- **大头是"挖 antd 的隐藏行为"** —— 而且这类行为**读源码不一定能发现**（我就漏过），
  必须逐个跑起来实测
- 第四批（Form/Table/DatePicker）可能需要封装转换层，性质与前面不同

**建议做法**：做完第一批（9 个）后，用真实数据重新估算剩下的，比现在拍脑袋准。

---

## 九、有问题找谁

- **设计规范 / 取值判据**问题 → 找设计负责人（本仓库的维护者）
- **拿不准某个差异能不能接受** → 记进 DIFF.md 并汇报，由设计负责人决定
- **规则文档看不懂** → `design-spec/CLAUDE.md` 的「任务 → 必读细则」触发表是入口
