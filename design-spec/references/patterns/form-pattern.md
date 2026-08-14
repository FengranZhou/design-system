# 表单布局模式 (Form Layout Pattern)

> 设计模式层规则。接到「做表单 / 录入界面 / 一组"标签+控件"的信息组织」任务时，**动手前必读本文件**，按「强制做法」执行、避开「反例」、直接套用「可照抄骨架」。读之前不要凭直觉自拟布局。
>
> 当前只提供**标签在左（label-left / label-width）**这一种布局。顶部标签（`label-position="top"`）暂不启用。
>
> ⚠️ **传了 `top` 不是「回落 EP 原生」，而是拿到一个错位的坏形态**：源头 `form.scss` 的 `padding-inline-end: 12px` 挂在**裸 `.el-form-item__label`** 上（不分 label 位置，一律生效），而本该在 top 下把它清零的那行**已随该形态一起注释停用**——于是顶部标签右侧会残留 12px 无意义留白。恢复该形态时，`form.scss` 里所有 `--label-top` 注释必须**一并放开**，只放开一半就是这个错位状态。

---

## 一、何时用（触发条件）

命中以下任一，即用本模式：

- 做**表单 / 录入界面 / 编辑弹窗里的字段区**。
- 出现**一组「字段名 + 输入控件」**需要纵向排列（如：用户名+输入框、部门+下拉、日期+选择器…）。
- 需要**校验**（必填、格式）的字段集合。

> 反过来：**只要是"标签配控件"的信息录入，就走 `el-form`，不要自己用 div/flex 拼。** 这是判断入口。

---

## 二、强制做法

### 1. 骨架：一律用 `el-form` + `el-form-item`，不手撸 <!-- @rule id=form-use-el-form level=MUST cat=设计模式 detect=regex dtitle=表单标签列应对齐成一条线，必填星号位置统一 title=表单骨架一律用 el-form + el-form-item，禁 div/flex 手拼 -->

- 表单容器：`<el-form>`，必须带 `:model`（数据）、`label-width="auto"`（见下文 2）、`ref`（用于校验）。
- 每个字段：`<el-form-item label="字段名" prop="字段key">`，内放 Element Plus 控件（`el-input` / `el-select` / `el-date-picker` / `el-checkbox-group` / `el-switch` …）。一项通常一个控件，但同一字段的多控件（如时间范围的起止日期）也放同一个 `el-form-item` 内。
- **绝不**用 `div + flex` 手拼"标签左、控件右"——那会脱离 el-form 的对齐/校验/间距体系（见反例）。

### 2. 标签（label）

- **位置**：标签在左。**用 `label-width="auto"`**——它自动取本表单中**最长 label 的实际宽度**（含必填星号 + 间距）作为**统一列宽**，应用到该表单所有 label：同一表单内标签宽度统一、短 label 右对齐后输入框左缘对齐成一条线，且**零富余**（不会像手写固定 px 那样留多余空白）。除非有特殊对齐需求，不要手写固定 `label-width` 数值。
- **对齐**：默认右对齐（label 靠近控件，视线顺）。需要左对齐时给 `<el-form>` 加 `label-position="left"`。
- 标签高度、与控件的 12px 间距、字号（14）**已由源头 `form.scss` 统一处理**，不要在使用方覆盖。

### 3. 必填星号

- 必填项由 `rules` 里 `required: true` 自动带红色星号。
- 星号**默认在标签左侧**（本设计系统约定 `.asterisk-left`，间距 4px，已在源头处理）。不要手写星号。

### 4. 间距（全部走源头，不手写 margin）

- 表单项之间：`--iflyv-spacing-6`（24px）——**源头 `form.scss` 已设**，不要在使用方写 `margin-bottom`。
- 标签与控件间距、按钮组内间距（12px）：**源头已设**，同样不手写。

### 5. 控件宽度

- **单列表单整体宽度**：用 `max-width` 约束（如 `max-width: 500px`） <!-- @rule id=form-max-width level=SHOULD cat=设计模式 detect=regex dtitle=表单不应拉满整个页面宽度，输入区应有合理上限 title=单列表单整体宽度用 max-width 约束在容器一处，不散落每个控件 -->，避免输入框拉太宽。**优先用令牌或语义宽度**；若必须写具体值，集中在表单容器一处，不要散落每个控件。
- **输入类控件默认撑满输入区**（`el-input` / `el-select` / `el-date-picker` / `el-textarea` 设 `width: 100%`）——让各控件右缘对齐、观感整齐。
- **明确的短字段例外**：语义上就短的字段不必撑满——**宽度本身是"该填多长"的暗示**，把 4 位验证码框拉成半屏宽会让用户以为要填很长的内容。按下表选档：

  > ℹ️ **宽度值不走令牌，直接写 px 即可**。间距令牌管的是"元素之间的留白节奏"（需要全站统一），而输入框宽度是"内容长度的暗示"，按字段语义取值、允许宽松——下表的 120/200/320 是参考档位不是硬约束，接近即可。

  | 字段语义 | 建议宽度 | 例 |
  |---|---|---|
  | **极短**（2~6 字符） | 约 120px | 验证码、年龄、数量、排序序号 |
  | **短**（固定格式，8~15 字符） | 约 200px | 手机号、日期、学号、金额 |
  | **中**（短文本） | 约 320px | 姓名、班级、科目 |
  | **撑满**（长度不可预期） | `width: 100%` | 标题、地址、备注、说明、URL |

  > **判据**：该字段的内容长度**可预期且固定**→ 按上表选档；**不可预期**（用户想写多长写多长）→ 撑满。
  >
  > **别为了"整齐划一"把所有框拉成同宽**——那会丢掉宽度的暗示作用；但也**别档位过多**（同一表单内建议不超过 3 种宽度），否则右缘参差会显得凌乱。拿不准就撑满，这是安全默认值。

### 6. 校验

- 规则集中写在一个 `rules` 对象里，字段 key 与 `prop` 对应。
- 每条规则含 `required` / 格式类型 + `message` + `trigger`（`blur` 用于输入类，`change` 用于选择类）。
- 提交按钮回调走 `formRef.value.validate()`；重置走 `formRef.value.resetFields()`。

**校验时机：按"校验在本地还是要请求服务端"选，不是凭手感**

| 校验类型 | 时机 | 写法 |
|---|---|---|
| **本地可判**（必填、格式、长度、正则） | **失焦即时校验** | `trigger: 'blur'`（选择类 `'change'`），即 rules 默认行为 |
| **需请求服务端**（唯一性校验如"学号已存在"、跨字段关联校验） | **提交时统一校验** | 该字段 rules 里不设 blur 触发，改在 `validate()` 回调或提交接口里处理 |

- **长表单（超过一屏）禁止只在提交时报错** <!-- @rule id=form-validate-on-blur level=MUST cat=设计模式 detect=manual dtitle=长表单填错应在离开输入框时立刻提示，不是提交后才一起报 title=长表单禁止只在提交时报错，本地可判的规则一律失焦即报 -->——用户提交后要回头逐个找哪里错了，查找和修改成本极高。本地可判的规则一律失焦即报。
- **错误文案必须两段式**：说清「**错在哪**」+「**怎么改**」。 <!-- @rule id=form-error-two-parts level=MUST cat=文案规范 detect=manual dtitle=报错文案要说清错在哪、怎么改，只说「格式不正确」不合格 title=表单错误文案必须两段式（错在哪 + 怎么改） -->只写"格式不正确"不合格，应写"手机号需为 11 位数字"。
- 错误提示位置：**输入域下方** <!-- @rule id=form-error-below-field level=MUST cat=设计模式 detect=ast dtitle=错误提示应在对应输入框下方，不应汇总到表单顶部 title=错误提示放输入域下方，禁汇总到表单顶部 -->（本设计系统标签左对齐，`el-form-item` 默认即在下方，不要改）。**禁止把错误汇总到表单顶部**——强迫用户在顶部提示与出错字段之间来回对照，认知负荷最高。

**分步表单（§8② 拆开）的校验：每步一校，不要留到最后**

分步的前提是"后一步基于前一步"，**所以点「下一步」时必须先校验当前步，不通过就不许前进** <!-- @rule id=form-step-validate-each level=MUST cat=设计模式 detect=manual dtitle=分步表单应在点下一步时校验当前步，不应等到最后一步才统一报错 title=分步表单必须每步校验，禁止留到末步统一报错 -->。留到末步统一报错，用户要回退好几步去找错误，比长表单顶部汇总还糟。

- **一步一个 `el-form` + 一个 `formRef`**，点「下一步」时 `await stepFormRef.value.validate()`，通过才 `current++`。
- **回退（上一步）不校验**——用户往回看不该被拦。
- **数据用同一个 `form` 对象**跨步共享（各步只是它的不同字段），**不要每步一个 model**，否则末步提交还要手动合并。
- 末步「提交」再 `validate()` 一次当前步即可；前面各步已在前进时校验过。

```vue
<script setup>
const stepFormRef = ref()
const next = async () => {
  try {
    await stepFormRef.value.validate()   // 当前步不通过会 reject，停在原地
    current.value++
  } catch { /* 校验失败：错误已由 el-form-item 显示在对应字段下方 */ }
}
</script>
```

### 7. 操作区（按钮组）—— 是否存在取决于承载容器【重要】

**操作区不是表单固定必有的**，按表单所在容器决定：

| 表单承载容器 | 操作按钮怎么放 |
|---|---|
| **页面里**（页面级表单） | 表单**底部有**操作区：放在最后一个 `<el-form-item label=" ">`（空 label 占位）内——`label-width="auto"` 下空占位使按钮组左缘对齐到输入区，而非顶到 label 列。 |
| **弹窗中**（`el-dialog` / `el-drawer`） | 表单**不放**底部按钮！由**弹窗自带的 footer** 承载提交/取消——否则会与弹窗按钮重复。 |

- **判断入口**：动手前先确认"这个表单在页面里还是弹窗里"。弹窗里 → 表单本体只有标签区+输入区，按钮交给 `<template #footer>`。
- 页面级操作区规则：**主按钮（提交）在左**，次按钮（取消/重置）在右；提交 `type="primary"`，次按钮用默认；间距由源头自带（12px）。
- 提交回调走 `formRef.value.validate()`；重置走 `formRef.value.resetFields()`（无论按钮在表单里还是弹窗 footer 里，校验都调表单的 `formRef`）。

**⚠️ 表单分组后（§8）操作区放哪：看"提交的作用范围"**

一旦表单按 §8 分了组，"放进最后一个 `el-form-item`"就**不一定对**了——判据是**这组按钮管的是哪一部分**：提交针对的是**整个表单**，所以它**不能落进任何一个视觉上自成一体的组里**。

| 组形式（§8③） | 操作区位置 | 为什么 |
|---|---|---|
| **小标题分段** | 仍放在**末组表单**的最后一个 `<el-form-item label=" ">` 里 | 各组同处一个连续版面、没有独立容器，按钮跟在末尾即可，且与字段共用 label 列、左缘自然对齐 |
| **每组套卡片** | **提到所有卡片之外**，作独立一行 <!-- @rule id=form-actions-outside-cards level=MUST cat=设计模式 detect=manual dtitle=分组套卡片时提交/取消应放在所有卡片之外，不能塞进最后一张卡片里 title=卡片分组的表单，操作区必须在所有卡片之外 --> | 卡片是**有边界的独立容器**，把"针对整个表单"的提交塞进最后一张卡片，视觉上会读成"只提交这张卡片" |
| **拆开（分步）** | 放在该步内容之外的独立一行；按钮是**上一步 / 下一步 / 提交** | 见下方「方向性按钮」——分步的按钮由**方向语义**定位，不适用主按钮贴边原则 |

- **分步的按钮是「方向性按钮」，是主按钮贴边原则的唯一例外**（见 `foundations.md`）：`上一步` 在左、`下一步` / `提交` 恒在右，由方向语义决定，**不要按"主按钮贴左"去摆**。末步把「下一步」换成「提交」。

- **卡片形态下的对齐**：操作区与**卡片的外左缘**对齐（不是卡片内边距那一层），即不额外加缩进。
- ⚠️ **别把操作区做成吸底工具条**：若各组放在滚动区（`el-scrollbar`）内，操作区应**一并放进滚动区**、跟着内容滚；放到滚动区外会变成常驻底部的吸底条——那是另一种形态（长表单/复杂编辑器才用），不要顺手做出来。

### 8. 表单整体怎么组织（字段一多就必须先做这一步）

前面 1~7 管的是**一个表单内部**怎么排；字段变多时，**先决定整体组织形式，再落具体字段**。

**① 要不要分组：按字段数**

| 字段数 | 做法 |
|---|---|
| **≤7 项** | **不分组**，直接一列平铺到底（分组反而增加纵向占用）。到此为止，②、③ 都不用问 |
| **>7 项**（且字段间有关联可归类） | **分组** —— 按下面的依据切成若干组，再走 ② 决定这些组怎么分布 |

- **禁止为了分组而分组**：组内字段必须**有强关联** <!-- @rule id=form-no-fake-group level=SHOULD cat=设计模式 detect=manual dtitle=分组要有内在关联，不能因为字段多就随便切几段 title=禁止为了分组而分组，组内字段必须有强关联 -->，不能因为字段多就随便切几段。
- **分组依据两选一**：按「必填/非必填」切（必填组前置，让用户先看到最低工作量）；或按「内容相关性」切。
- **一律单列**。多列表单的 Z 字动线易出错易遗漏 <!-- @rule id=form-single-column level=MUST cat=设计模式 detect=ast dtitle=表单应单列排布，不应铺成两列造成 Z 字动线 title=表单一律单列，禁多列 Z 字动线 -->；横向空间富余时也优先靠分组解决，不靠加列。

**② 这些组怎么分布：同屏 or 拆开（二选一）**

分完组之后，问一个问题：**用户要不要在各组之间来回对照？**

| 判据 | 分布方式 | 用什么 |
|---|---|---|
| **要对照**（各组关联强，填 B 时要回看 A） | **同屏** —— 各组同处一页、一次提交 | **锚点定位** → `el-anchor`。**必须传 `direction="horizontal"`**（竖向源头未适配，且它是 EP 默认值，漏传即中）+ `:offset`；滚动容器非 window 时还要传 `container`（**且必须等容器就绪后再初始化**）——见 Anchor 段 |
| **不用对照**（各组有先后顺序，后一步基于前一步） | **拆开** —— 分步推进，每步只呈现该步的内容 | **分步** → 业务组件 `StepBar`。**表单场景建议不超过 3 步**（步数多则回溯成本高。这是表单建议上限，非组件能力上限） |

> ⛔ **不要用 `el-tabs` 做表单分节**。表单的各段是**同一条记录的不同部分**（一条课程记录被拆成基本信息/教学安排/学生管理），而 Tabs 的前置硬规则是**各 tab 数据必须无交集**（见 `component-interaction.md` Tabs 段）——用 tab 装同一条记录的各部分，直接违反该规则；而且"各段分别提交"意味着同一条记录要提交多次，业务上也别扭。

**③ 组边界怎么标（单个可见区域内并列多组时才需要）**

判据是**"用户当前这一屏里能同时看到几个组"**，与 ② 选了什么无关：

- **同屏（锚点）** → 各组必然并列在一屏内，**一定需要**标边界。
- **拆开（分步）** → **每一步要把 ①②③ 重走一遍**：先看这一步自己的字段数——**≤7 就直接平铺、不拆子组**（此时步内只有一块内容，无边界可标）；**>7 才拆子组**（如「教学安排」这步 8 项，拆成「时间安排」「地点与形式」），拆了才谈得上组形式。

> ⚠️ **两个常见误判**：
> - 别把"分步"等同于"每次只见一组"——**一个步骤内完全可以并列多组**。
> - 也别反过来给**只有三五个字段的单步**硬套卡片——**那一步根本没到需要分组的量**，套卡片是凭空加了一层没有信息量的容器。**每步都要重新判一次 ①**。

**判据：两条命中任一 → 套卡片；都不命中 → 小标题分段**（默认是小标题——线能不用就不用，见 `efficiency-guide.md` 分隔优先级「间距 > 色差 > 细线」）

| 判据 | 怎么判（可数 / 可判，不靠手感） |
|---|---|
| **① 单组内容长** | 该组 **>5 项**，或含 textarea / 上传 / 可编辑表格等**高度不定**的控件 |
| **② 组间差异大** | 各组**不是同一类东西**——判据是「能否为这些组起一个共同的上位词」：起得出（「基本信息 / 教学安排 / 学生管理」都是"课程的属性"）→ 差异小；起不出（「课程属性」和「阅卷规则」「权限设置」并列）→ 差异大 |

| 结论 | 做法 |
|---|---|
| **都不命中** | **小标题分段** —— 轻量分隔，给用户几个"休息点"（默认档） |
| **命中任一** | **每组套卡片** —— 边界更明确，层级更强 |

> **为什么给 >5 这个数**：①的阈值是 7（要不要分组），③ 比它更早触发——一组还没到"该再分"的量，但已经长到"小标题压不住、视线扫过去找不到边界"。**不要把 ③ 的阈值也写成 7**，那等于永远不会命中。

> **卡片底色**：卡片要浮在所在容器之上才有纵深——容器是白底（`bg-panel`）时卡片用 `bg-card`，容器已是 `bg-card` 浅灰时卡片改用 `bg-panel` 白底。**两者同色会让卡片边界完全消失**（见 `foundations.md` 背景色纵深关系）。

**⚠️ 组标题谁来给：别重复**

- **拆开（分步）且一步一组**：组标题已由**步骤条**给出，**容器内不要再渲染一遍**——否则「基本信息」会在步骤条和表单里各出现一次。
- **拆开（分步）但一步内含多组**：步骤条给的是"这一步叫什么"，步内各组仍需各自的组标题（两者不重复，因为层级不同）。
- **同屏（锚点）**：各组并列，**必须**各自带组标题（否则分不清边界）。 <!-- @rule id=form-anchor-group-title level=SHOULD cat=设计模式 detect=manual dtitle=锚点分组的各组都要有组标题，否则分不清边界 title=锚点分节的各组必须各自带组标题 -->

**④ 字段组可动态增删时，按"每组字段数"选形态**

| 形态 | 适用 | 数量约束 |
|---|---|---|
| **动态表单**（一行一组 + 增减按钮） | 每组就一两个输入框，无需组标题 | 动态组数 **≤3** |
| **可编辑表格**（行=条目，列=字段） | 每条目字段少、要横向对齐比较 | 组数 **3~6**，且每条目 **2~5** 个字段（保证一行完整展示） |
| **折叠面板**（收起只读、展开可编辑） | 表单里嵌套"子任务" | 每条目 **6~8** 个字段 |
| **语句式表单**（在预设句子里填空） | 规则/条件编辑（如"当 [提交时间] 晚于 [截止时间] 时 [标记迟交]"） | — |

**⑤ 承载容器：按字段数与关联度选**（详见 `dialog-pattern.md` 四维判据）

- 字段 **>8 项** → 弹窗换**抽屉**（`el-drawer`）。
- ⏸ 气泡卡片（`el-popover`）**当前暂停启用**（见 `component-interaction.md` 文末「勿用清单」）——过去用它承载 ≤5 项的轻量设置，现阶段这类场景直接用 `el-dialog`。
- **同一操作的容器必须一致**：同一个"新增课程" <!-- @rule id=form-same-carrier level=MUST cat=设计模式 detect=manual dtitle=同一个操作从哪个入口进都应弹出同样的容器形态 title=同一操作的载体形态必须一致（不能这里弹窗那里跳页） -->，无论从列表页还是工作台进入，弹出的容器形态必须相同。

### 9. 横排表单（inline）—— 筛选条 / 查询条件的标准形态

一行内横向排布多个「标签+控件」（列表页顶部的筛选条、查询区）时，给 `<el-form>` 加 `inline`：

```vue
<el-form :model="query" inline>
  <el-form-item label="课程名称">
    <el-input v-model="query.name" placeholder="请输入" />
  </el-form-item>
  <el-form-item label="状态">
    <el-select v-model="query.status" placeholder="全部状态">…</el-select>
  </el-form-item>
  <!-- 查询/重置这类无 label 的 form-item，直接并排放，源头已保证与上面的输入框中线对齐 -->
  <el-form-item>
    <el-button type="primary">查询</el-button>
    <el-button>重置</el-button>
  </el-form-item>
</el-form>
```

- **间距全在源头**：`form.scss` 把 `.el-form--inline` 实现为 `flex` + `column-gap: 32px` + `row-gap: spacing-3`，并把每个 form-item 自身的 `margin` **全部清零**。使用方**不写任何间距**。
- ⚠️ **绝对不要覆盖 `.el-form--inline` 的 `display`**（改回 `inline-block` 等）—— `column-gap` 只对 flex/grid 生效，一旦改掉 display，**所有横向间距会瞬间归零**（因为 form-item 的 margin 已被源头清零，没有兜底）。这是本形态最容易踩的隐式依赖。
- **为什么源头用 flex 而不是 EP 原生的 inline-block**：原生实现下，「有 label」和「无 label」的 form-item 基线对不齐——筛选条里输入框和「查询」按钮会一高一低。flex + `align-items: center` 强制中线对齐才解决。
- 换行由 `flex-wrap` 自动处理，行间距走 `row-gap`；**筛选条超过两行时**应把低频条件收进「更多筛选」（见 `toolbar-pattern.md`）。

---

## 三、反例（禁止）

- ❌ **用 `div + flex` 手拼「标签左 / 控件右」** —— 脱离 el-form，失去统一对齐、校验、间距，且各处各写、不同步。
- ❌ **在使用方 scoped 里写表单项 `margin` / label 间距 / 星号样式** —— 这些源头 `form.scss` 已统一，手写即"局部私货"，改源头它不动。
- ❌ **手写固定 `label-width` 数值**（如 `100px`）—— 易造成富余空白或不够宽，且换表单要重调。用 `label-width="auto"` 让其自动贴合本表单最长 label。
- ❌ **label 宽度在同一表单里不统一** <!-- @rule id=form-label-width-unified level=MUST cat=设计模式 detect=regex dtitle=同一表单内标签列宽应统一，输入框左缘对齐成一条线 title=禁手写固定 label-width，用 label-width="auto" 保证全表单统一 -->（这项 80px、那项 120px）—— 必须全表单同一宽度（`auto` 已保证统一）。
- ❌ **散落的魔法宽度值**（每个控件写 `style="width:340px"` 等具体像素）—— 输入类用 `width:100%` 撑满（比例，允许），短字段用语义宽度；整体宽度约束集中在表单容器一处（`max-width`）。
- ❌ **手写红色星号 / 手写 label**（如 `<span style="color:red">*</span>用户名`）—— 用 `rules.required` 自动带。
- ❌ **为"整齐划一"把所有输入框拉成同宽** —— 丢掉宽度对内容长度的暗示（4 位验证码框拉半屏）。按 §5 的语义宽度表选档；反之档位超过 3 种也不行（右缘参差显乱）。
- ❌ **长表单只在提交时统一报错** —— 用户要回头逐个找错。本地可判的规则（必填/格式/长度）一律失焦即报。
- ❌ **错误提示汇总到表单顶部** —— 强迫用户在顶部与出错字段间来回对照。一律放在**对应输入域下方**。
- ❌ **错误文案只说"格式不正确"** —— 必须两段式：错在哪 + 怎么改（"手机号需为 11 位数字"）。
- ❌ **字段一多就直接铺成两列** —— 多列 Z 字动线易遗漏。先按 §8 分组 / 分节，一律单列。
- ❌ **为了分组而分组**（每 2 个字段切一个卡片、把无关联字段硬凑一组）—— 组内必须强关联。
- ❌ **超过 8 个字段还硬塞进弹窗** —— 换抽屉；气泡卡片超过 5 项同理升级。

---

## 四、可照抄骨架

```vue
<template>
  <el-form ref="formRef" :model="form" :rules="rules"
           label-width="auto" style="max-width: 500px;">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="部门" prop="department">
      <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%;">
        <el-option label="设计部" value="design" />
        <el-option label="研发部" value="dev" />
      </el-select>
    </el-form-item>
    <el-form-item label="入职日期" prop="date">
      <el-date-picker v-model="form.date" type="date"
                      placeholder="选择日期" style="width: 100%;" />
    </el-form-item>
    <el-form-item label="启用状态">
      <el-switch v-model="form.enabled" />
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
    </el-form-item>
    <!-- 按钮组：主按钮在左，放最后一个 form-item；label=" " 空占位使其对齐到输入区 -->
    <el-form-item label=" ">
      <el-button type="primary" @click="onSubmit">提交</el-button>
      <el-button @click="onReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const form = reactive({ username: '', department: '', date: '', enabled: true, remark: '' })

const rules: FormRules = {
  username:   [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门',   trigger: 'change' }],
}

const onSubmit = () => formRef.value?.validate(valid => { if (valid) {/* 提交 */} })
const onReset  = () => formRef.value?.resetFields()
</script>
```

> 照抄要点：字段增删只改 `el-form-item` + `reactive` + `rules` 三处；**布局、间距、标签、星号、按钮排布一概不用手写**——全由 `el-form` + 源头 `form.scss` 保证。

### 分组形态骨架（§8 判完 ①②③ 之后用）

**同屏（锚点）+ 卡片分组** —— 组织形式里最易踩坑的一种，坑全在注释里：

```vue
<template>
  <!-- Anchor 六条必传项见 component-interaction.md Anchor 段，缺一即出 bug -->
  <el-anchor
    :container="scrollWrap"
    direction="horizontal"
    :offset="0"
    select-scroll-top
    @click="(e) => e.preventDefault()"
  >
    <el-anchor-link v-for="g in groups" :key="g.key" :href="`#sec-${g.key}`" :title="g.title" />
  </el-anchor>

  <el-scrollbar ref="scrollRef" height="360px">
    <!-- 各组并列在一屏内 → 必须各自带组标题（§8③）。
         组标题是「模块级」字阶，不是组件级——组件级(14px)会与字段 label 同字号、压不住 -->
    <div v-for="g in groups" :id="`sec-${g.key}`" :key="g.key" class="form-sec">
      <p class="form-sec__title">{{ g.title }}</p>
      <el-form :model="form" label-width="auto">
        <el-form-item v-for="f in g.fields" :key="f.prop" :label="f.label">
          <component :is="f.comp" v-model="form[f.prop]" />
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作区在所有卡片之外（提交针对整个表单，不属于任何一张卡片），
         但仍在滚动区之内——放到 el-scrollbar 外面会变成吸底工具条 -->
    <div class="form-actions">
      <el-button type="primary">提交</el-button>
      <el-button>取消</el-button>
    </div>
  </el-scrollbar>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
const scrollRef = ref()
const scrollWrap = ref()
onMounted(async () => {
  // 页面别处若有 hash 导航，须在 el-anchor 挂载前清掉——否则它读到残留 hash 会跳走
  if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  await nextTick()
  scrollWrap.value = scrollRef.value?.wrapRef   // EP 内部会 watch 这个 prop，不必 :key 重建
})
</script>

<style scoped>
/* 卡片浮在容器之上才有纵深：容器白底(bg-panel)时卡片用 bg-card，
   容器已是 bg-card 浅灰时卡片改用 bg-panel——同色会让边界完全消失 */
.form-sec {
  padding: var(--iflyv-spacing-5);
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-md);
}
.form-sec + .form-sec { margin-top: var(--iflyv-spacing-4); }
.form-sec__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-module);
}
/* 不加缩进 —— 与卡片的外左缘对齐 */
.form-actions {
  display: flex;
  gap: var(--iflyv-spacing-3);
  margin-top: var(--iflyv-spacing-4);
}
</style>
```

**拆开（分步）** —— 关键是**每一步都要把 ①②③ 重走一遍**：

```vue
<template>
  <StepBar :steps="groups.map(g => g.title)" :current="current" />

  <!-- 该步 ≤7 项 → 直接平铺，不拆子组、不套卡片（别给三五个字段的单步硬套卡片）；
       >7 项才拆子组，子组各自带标题（与步骤名层级不同，不算重复） -->
  <div v-for="sub in groups[current - 1].subs" :key="sub.key" class="form-sec">
    <p class="form-sec__title">{{ sub.title }}</p>
    <el-form :model="form" label-width="auto">
      <el-form-item v-for="f in sub.fields" :key="f.prop" :label="f.label">
        <component :is="f.comp" v-model="form[f.prop]" />
      </el-form-item>
    </el-form>
  </div>

  <!-- 方向性按钮不适用「主按钮贴边原则」，「下一步」恒在右 -->
  <div class="form-actions">
    <el-button v-if="current > 1" @click="current--">上一步</el-button>
    <el-button v-if="current < groups.length" type="primary" @click="current++">下一步</el-button>
    <el-button v-else type="primary">提交</el-button>
  </div>
</template>
```

> 两份骨架的**完整可交互版本**见 demo 的「设计模式 → Form 表单组织」页，三个配置项可实时切换组合。
