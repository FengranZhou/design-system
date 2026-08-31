---
author: myjin2
updated: 2026-05-10
---

# 基础规范

> 任何页面类型必读。包含设计令牌、硬规则、配色、字体、间距、动效等通用基础。

---

## 禁止事项汇总

- ❌ 硬编码颜色值（如 `color: #23B283`），必须使用CSS 变量 <!-- @rule id=color-no-hardcode level=MUST cat=设计令牌 detect=regex dtitle=颜色应取自色板，不应出现色板外的杂色 title=颜色值一律走令牌，禁硬编码 hex/rgb -->
- ❌ 硬编码字号（如 `font-size: 16px`），必须使用字体令牌 <!-- @rule id=font-no-hardcode-size level=MUST cat=设计令牌 view=impl detect=regex title=字号一律走字体令牌，禁硬编码 px -->
- ❌ 设置文字时只写 `font-size` 不设行高/字重（行高会塌回浏览器默认 `normal`，出现 16.5 这种魔法值）。设置文字要**整套用语义复合令牌 `font: var(--iflyv-font-*)`**；含空格字体名不能用简写时，**拆分属性但字号/行高/字重一个不漏**（详见「设置文字的铁律」） <!-- @rule id=font-set-as-whole level=MUST cat=设计令牌 view=impl detect=regex title=设文字须整套设齐字号+行高+字重，禁只写 font-size -->
- ❌ 使用非规范间距（如 `margin: 10px`），必须使用间距令牌 <!-- @rule id=spacing-no-magic level=MUST cat=设计令牌 detect=regex dtitle=间距应落在标准档位上，同类元素留白一致 title=间距一律走 spacing 令牌，禁魔法 px 值 -->
- ❌ 使用 `success`、`warning`、`info` 类型按钮（指 el-button 的 type 属性），仅允许 `default`、`primary`、`danger` <!-- @rule id=button-type-whitelist level=MUST cat=设计令牌 detect=regex dtitle=常规按钮只有默认/主要/危险三种，不应出现其他颜色（AI 功能入口另用业务组件 AiButton，不在此列） title=el-button 的 type 仅允许 default/primary/danger（AI 入口用 AiButton，其 primary/outline/text 是另一套） -->
- ❌ 使用 `circle` 属性做纯图标按钮（纯图标入口现阶段用 `<el-button text>` + `#icon` 插槽，见 `component-interaction.md`「纯图标按钮」段；`.btn-icon-square` 已暂停启用，勿写） <!-- @rule id=button-no-circle level=MUST cat=设计令牌 detect=regex dtitle=不应出现圆形的纯图标按钮 title=禁用 circle 属性做纯图标按钮 -->
- ❌ 使用粗线、双线、装饰性线条 <!-- @rule id=line-no-decorative level=MUST cat=视觉呈现 detect=regex title=禁用粗线、双线、装饰性线条 -->
- ❌ 卡片默认加投影（阴影仅用于浮层） <!-- @rule id=shadow-popup-only level=MUST cat=视觉呈现 detect=regex title=静态卡片不加投影，阴影仅用于浮层 -->
- ❌ 模块宽度小于 6 列（栅格最小粒度） <!-- @rule id=grid-min-6col level=MUST cat=布局与栅格 detect=regex dtitle=一行最多四等分，模块不应比这更窄 title=模块宽度不得小于 6 列 -->
- ❌ 暗色模式下卡片使用纯色描边（改用 `.surface-bordered` 双光源渐变描边工具类） <!-- @rule id=dark-surface-bordered level=SHOULD cat=视觉呈现 detect=regex dtitle=暗色下卡片描边应柔和，不是生硬的实线 title=暗色下卡片描边用 .surface-bordered，不用纯色描边 -->

> 上面每条末尾的 `@rule` 标记是**评判标准条目的提取源**（见 `judging-criteria.md`）。新增强制规则时一并打标记，条目会自动进入评判清单；漏打由 `audit-spec.mjs` 的 C8 检查兜底。

> 特殊场景确需破例时，须在设计评审中论证必要性，经确认后作为例外记录，不得静默绕过。

---

## 图标库

- 统一使用 `lucide-vue-next`，按需导入，**禁止全量引入** <!-- @rule id=icon-lucide-only level=MUST cat=设计令牌 view=impl detect=regex title=图标统一用 lucide-vue-next 按需导入，禁全量引入/禁混用其他图标库 -->
  ```ts
  import { Search, Plus, Trash2 } from 'lucide-vue-next'
  ```
- 模板中直接作为组件使用：`<Search :size="16" :stroke-width="2" />`
- 默认尺寸：正文/操作按钮 `16px`，提示信息 `14px`
- **`stroke-width` 统一使用 `2`**，不允许使用其他值 <!-- @rule id=icon-stroke-width-2 level=MUST cat=设计令牌 detect=regex dtitle=图标粗细应统一，不应有的粗有的细 title=图标 stroke-width 统一为 2，不允许其他值 -->

---

## 主题系统

所有主题维度通过 HTML 根元素属性独立控制，互不干扰：

```html
<html data-theme="light" data-brand="default" data-font-size="m" dir="ltr" lang="zh-CN">
```

### 字号档位（data-font-size）

| 档位 | html font-size | 属性值 | 适用场景 |
|------|---------------|--------|---------|
| S 紧凑 | 14.5px | `s` | 信息密集、小屏 |
| **M 默认** | 16px | `m` | 标准工作状态 |
| L 较大 | 19px | `l` | 视力辅助、演示 |
| XL 最大 | 22px | `xl` | 无障碍、投屏教学 |

- **跟随缩放**：所有字号、行高（rem 单位）
- **保持不变**：间距、圆角、组件尺寸（px 单位）
- 定义见 `design-token/css/font.scss`

---

## 视觉基调

| 维度 | 取向 | 说明 |
|------|------|------|
| 整体氛围 | 清晰通透、温和专业 | 大面积留白 + 浅灰底色营造通透感；避免深色大块面、强对比撞色 |
| 装饰倾向 | 克制、功能性优先 | **装饰不是禁区，但每一处都应有其存在的理由**——图标、色彩、插图优先服务于信息传达，避免无意义的视觉堆砌（效率型从严、展示型见 `display-guide.md` 装饰手法表） |
| 人文温度 | 文艺舒适、有活人感 | 文案语气避免机械生硬，空状态/引导页可使用轻量插画；整体感受"有人在用"而非"机器在运转" |
| 视觉重量 | 轻盈 | 细描边（1px）、轻阴影；渐变仅限头部模块和展示型区块（见"配色原则"）；UI 元素"浮"在背景上而非"压"在上面 |

---

## ⭐ 语义信息沉淀通则（新增/扩展语义令牌用途时必守）

> **语义令牌的"用途/语义"信息，不能只活在 demo 里——demo 展示对下游 CC 不可见。** 令牌的"值"在 `design-token/`（下游引 `var(--iflyv-*)` 自动拿到），但"这个令牌该用在什么场景"（如 `icon-4`=禁用、`body-sub`=次要正文、`bg-inset`=内嵌区域、`border-strong`=加重边框）——这层**用途语义必须写进本文件的对应「→ 用途」表**，下游 `@design-spec/CLAUDE.md` 接入后 CC 才能读到、才知道"该用哪个令牌"。

**因此，后续任何时候新增 / 扩展语义令牌（新色阶、新字阶、新背景/描边档、新用途）时，必须两步都做**：

1. **值** → 加进 `design-token/css/semantic.scss`（或对应 token 文件）；同步 demo 的可视化列表（`SemanticColorDemo.vue` / `FontSemanticDemo.vue`）便于设计师肉眼查。
2. **用途** → **同步更新本文件对应的「→ 用途」表**（色阶用途 / 语义字阶用途 / 背景色用途 / 描边色用途…）。**这一步不能省**——省了，下游 CC 就只拿到一个值、不知道何时用它，语义沉淀失败。

> 判据："我加的这个令牌，下游 CC 看到它的名字能立刻知道该用在哪吗？" 名字自解释（如 `title-page`）也仍要进表（补规格/边界）；名字不够自解释（如 `bg-inset` 的"内嵌"、`border-strong` 的"何时才加重"）更必须进表。**demo 加一行 ≠ 规则沉淀，进本文件的用途表才算。**

> **⚠ 间距是例外（已收敛为单一数据源）**：间距的场景语义**只改 `design-token/spacing-usage.ts`**——demo `SpacingDemo` 与本文件间距速查表同引这一份，改一处两边一致，**不要再手工同步两处**。其它令牌（色阶 / 字阶 / 背景 / 描边）仍按上面两步走。

（本通则与设计模式/文案规范的「触发指针 + 单一数据源」同源——见 `design-spec/CLAUDE.md` 各「任务→必读」指针。）

---

## 配色原则

### 色彩比例

所有页面遵循 **1 主色 : 0.5~1 辅助色 : 8 中性色** 的面积比例：

- **主色**：品牌色（`accent-*`），承载核心操作和品牌识别
- **辅助色**：与主色形成邻近或对比的色相，用于次要维度的区分和视觉丰富度
- **中性色**：灰阶 + 背景色，承载绝大部分界面面积

> 辅助色不是必选项——信息维度单一时纯主色 + 灰也足够。辅助色的作用是"丰富而非花哨"，当页面只有主色 + 灰显得单调时引入。

### 色阶浓度与用途

同一色相内，按信息层级使用不同浓度：

| 用途 | 色阶范围 | 说明 |
|------|---------|------|
| 区块底色、标签背景 | step-1~2 | 大面积浅底，不抢视线 |
| 辅助图形、装饰色块 | step-2~3 | 中等面积点缀 |
| 文字、图标、按钮 | step-6~7 | 小面积高饱和，视觉锚点 |

### 功能色语义

green / red / orange / blue 在语义场景中含义固定，不因页面类型改变。当功能色被选作辅助色时，其装饰性用法应与语义用法有明确视觉区分（如装饰仅用 step-1~2 浅底色，不触及 step-6 语义强调色）。

### 功能色 → 用途（品牌色与四语义色，选色时照此对号入座）

五个色族（品牌 + 四语义），**每族固定五个后缀，语义一一对应**——不要凭手感在色板里挑 `accent-6` 这类原始色阶，一律用下面的语义令牌：

| 后缀 | 用途 | 取值 |
|---|---|---|
| `-primary` | **主色**：实心按钮底、选中态、进度条、图标强调等**面积较小的高饱和锚点** | step-6 |
| `-text` | **文字专用**（仅 brand 有）：见下方说明 | 亮 = primary / 暗 = step-7 |
| `-hover` | 悬停态（比 primary 浅一档） | step-5 |
| `-pressed` | 按下态（比 primary 深一档） | step-7 |
| `-disabled` | 禁用态（同色相但明显变淡，仍可辨认是哪一族） | step-4 |
| `-bg` | **浅底**：标签底、提示条底、选中行底等**大面积浅色块** | step-1 |

| 色族 | 何时用 |
|---|---|
| `--iflyv-brand-*` | 品牌主色（绿）：主操作按钮、关键强调、选中态。**面积克制**——主色用于关键操作和锚点，不做大面积铺底（见「设计原则 · 绿主蓝辅」） |
| `--iflyv-danger-*` | 危险 / 错误：删除等不可逆操作、错误提示、校验失败 |
| `--iflyv-warning-*` | 警示：可逆但需提醒（未保存、配额将满） |
| `--iflyv-success-*` | 成功：操作完成反馈。⚠️ **本系统品牌色也是绿**——普通标签别用 success，会被误读为"成功态"（见 `component-interaction.md` Tag 段） |
| `--iflyv-info-*` | 信息 / 中性提示（蓝）：辅助色，用于信息类与 AI 相关场景 |

> ⭐ **`brand-text` vs `brand-primary`：文字用前者，块面用后者。**
> 亮色下两者同值，**暗色下 `brand-text` 会自动提亮一级**（`accent-7`）——因为品牌绿在深色底上对比度不足，直接用 `brand-primary` 当文字色会看不清。
> **判据**：这个颜色是用在**文字/图标**上，还是用作**填充块**（按钮底、进度条）？文字 → `brand-text`；块面 → `brand-primary`。四个语义色族没有 `-text` 变体，文字直接用 `-primary`。

> **其余令牌**：`--iflyv-mask-primary` / `--iflyv-mask-on-dark`（遮罩层黑）、`--iflyv-scroller-*`（滚动条滑块，源头已统一、下游不碰）、`--iflyv-message-border-*`（Message 各语义描边）、`--iflyv-tag-gray-bg`（灰 Tag 底色）、`--iflyv-input-focus-ring` / `--iflyv-input-hover-border`（输入框聚焦环 / hover 边框）、`--iflyv-loading-path` / `--iflyv-avatar-default-bg`——**都是组件源头内部使用的桥接变量，下游不直接引用**。

### 文本 / 图标色阶 → 用途（层级语义，选色阶时照此对号入座）

文本色 `--iflyv-text-N`、图标色 `--iflyv-icon-N` 按**信息层级**分四级 + 深底反白，**用途一一对应**——设文字/图标颜色时按用途选对应色阶，不要凭手感挑：

| 层级 | 文本令牌 | 图标令牌 | 用途 | 色值 |
|---|---|---|---|---|
| 一级 | `--iflyv-text-1` | `--iflyv-icon-1` | 标题、主文字 / 主图标 | gray-10 `#12151A` |
| 二级 | `--iflyv-text-2` | `--iflyv-icon-2` | 正文、常规内容 | gray-7 `#4B535C` |
| 三级 | `--iflyv-text-3` | `--iflyv-icon-3` | 辅助说明、次要信息 | gray-5 `#7B838C` |
| **四级** | `--iflyv-text-4` | `--iflyv-icon-4` | **禁用态 / placeholder 占位符**（仅此，见下方对比度豁免） | gray-3 `#A9B0B8` |
| 反白 | `--iflyv-text-on-dark` | `--iflyv-icon-on-dark` | 深色底上的文字 / 图标（**会随主题翻转**：暗色下变亮色） | gray-0 `#FFFFFF` |
| 恒定深 | `--iflyv-text-on-light` | — | **恒定浅底**上的文字——底色本身不随主题变的块（AI 渐变实心按钮等）。**两个主题下都是深色、不翻转** | gray-10 `#12151A` |

> **`text-1` / `text-on-dark` / `text-on-light` 别混用**——判据是"这块的**底色**会不会随主题变"：底随主题变（普通页面/卡片）→ `text-1`；底是深色且随主题翻转 → `text-on-dark`；**底是恒定浅色、暗色下也不变**（AI 渐变实心块）→ `text-on-light`。在恒定浅底上误用 `text-1`，暗色下文字会翻成浅色、浅字压浅底读不出来（AiButton 曾踩此坑）。

> **四级（text-4 / icon-4）是"禁用/占位"专用色**：它在亮色白底上对比度不足 3:1，**只允许**用于 placeholder 和禁用态（WCAG 豁免非活跃元素，见下方「对比度底线」）。**需长期展示、要读清的辅助文字用三级（text-3）**，不要拿四级当浅色正文用。文本与图标同级同值、同用途——禁用态图标就用 `icon-4`。

### 背景色 → 用途（选背景令牌照此对号入座）

| 令牌 | 用途 | 值 |
|---|---|---|
| `--iflyv-bg-page` | 页面最外层灰底（内容区大背景） | gray-1 `#F2F5F7` |
| `--iflyv-bg-page-white` | 需要纯白页底的场景 | gray-0 `#FFFFFF` |
| `--iflyv-bg-panel` | 面板 / 卡片 / 浮层的白底（浮在 page 灰底之上） | gray-0 `#FFFFFF` |
| `--iflyv-bg-inset` | 内嵌区域底（输入框内、代码块、嵌套在面板里的凹陷区，比 panel 深一档） | gray-1 `#F2F5F7` |
| `--iflyv-bg-segment-active` | 分段控件（segmented / radio-button）选中项的底 | gray-0 `#FFFFFF` |
| `--iflyv-bg-card` | 块卡底（demo 演示块、配置卡等**叠在 panel 之上**的一层容器）。**它比 `bg-panel` 高一层**，不是同层的另一种白 | 亮：gray-1→浅渐变；暗：gray-2 `#262626` |
| `--iflyv-bg-back` | **返回 / 次级操作块**的填充底（如侧栏「返回平台」整行块）——冷调蓝灰，与上面几档的纯中性灰刻意区分，用于把"离开当前上下文"的入口从内容里择出来。暗色下冷调**保留但克制**（S≈9%）：饱和度过高时，该块收成小方块后会被周围纯中性灰衬得发脏 | `#DFE8F0`（暗色 `#32373C`） |

> 关系：`bg-page`（页面灰底）↑ `bg-panel`（白面板浮其上）↑ `bg-card` / `bg-inset`（面板内再叠一层的块卡与内嵌凹陷）——**明度层级 = 视觉纵深**，别混用（如把内嵌区用 panel 白，会和面板糊成一片、失去凹陷感）。
>
> ⚠️ **亮暗两套必须都保住这个层级差**：亮色靠"白面板 + 浅灰卡"拉开，暗色靠 surface 逐级提亮（panel `gray-1` → card/inset `gray-2`）。曾翻车：暗色下 `bg-card` 与 `bg-panel` 同取 `gray-1`，卡片叠在面板上与底同色、边界整个消失（亮色下完全正常，只在切暗色时暴露）。**改任一背景令牌时，对着这条纵深关系把亮暗两套都核一遍。**

### 描边色 → 用途（三档按"分隔强度"选）

| 令牌 | 用途 | 值（gray-10 透明度） |
|---|---|---|
| `--iflyv-border-subtle` | 最轻分隔：列表行线、卡片内细分隔，几乎不打扰 | 6% |
| `--iflyv-border-default` | 常规边框：输入框、卡片、面板的默认描边 | 10% |
| `--iflyv-border-strong` | 加重边框：需要强调的分区、选中/聚焦态边框 | 20% |
| `--iflyv-border-on-dark` | **深色底上的描边**（深色块内部的分隔线、深色浮层描边）——上面三档是"深色描边压浅底"，这档反过来是**浅色描边压深底**，两个主题下都取当前主题的亮端灰阶 10% | 亮端灰阶 10% |

> 选强度：**能用越轻的越好**（本设计系统"线条为辅、层级为主"）。默认边框用 `default`；只在需要"更明显的分隔"时才升到 `strong`；行内细线用 `subtle`。不要用裸 `1px solid #ccc`——一律走这三档令牌。

### 扩展色板

yellow / cyan / purple / magenta 为扩展色板，**不绑定功能语义**，用于数据可视化、标签分类、渐变组合等需要更丰富色相的场景。与功能色板共享相同的 10 步色阶结构和暗色生成算法。

### 渐变使用

渐变按使用区域分级管控：

| 区域 | 允许程度 | 说明 |
|------|---------|------|
| 页面头部模块 | 所有页面允许 | 效率型克制使用（文字扫光、微弱底色渐变/光斑），展示型可大面积 Hero 背景 |
| 内容区 Section 背景 | 仅展示型 | 用于章节头部或区块分隔 |
| 卡片悬浮光效 | 所有页面允许 | hover 时渐显，`opacity: 0 → 0.2`，详见 `display-guide.md > 渐变光斑技法` |
| 组件/卡片内部 | **效率型禁止** | 表单、表格、弹窗、抽屉等效率型组件内部不允许 | <!-- @rule id=gradient-not-in-components level=MUST cat=视觉呈现 detect=regex dtitle=表单/表格/弹窗等组件内部不应出现渐变装饰 title=渐变禁用于效率型组件内部（表单/表格/弹窗/抽屉） -->
| **展示型的自定义排版组件** | 仅展示型，按装饰手法表 | 文字渐变填充、毛玻璃卡片、旋转渐变描边（CTA/搜索框聚焦态）等——**限自定义排版组件，仍不得覆盖 EP 组件外观**；各手法的用量上限见 `display-guide.md > 装饰手法` |

渐变配色规则：

- **AI 相关元素一律用现成的 AI 渐变令牌，不自拼** <!-- @rule id=ai-gradient-token level=MUST cat=设计令牌 detect=regex dtitle=AI 相关元素的渐变应全站一致，不是各处自调的渐变 title=AI 元素一律用现成 AI 渐变令牌，禁自拼渐变 -->：`--iflyv-ai-gradient`（实色蓝→绿渐变，用于文字背景裁剪 / 描边 / 图标）、`--iflyv-ai-gradient-bg`（10% 透明度渐变，用于 AI 元素浅底）、`--iflyv-ai-fill-gradient`（薄荷青→绿实心底，用于 AI 实心按钮等强调块）、`--iflyv-ai-border-gradient`（彩色锥形渐变描边，与 fill 配套走 border-box 层，或单独作 hover 描边）。这是设计原则「AI 用柔和蓝色渐变做视觉区分」的唯一落地口径（AI 标签已有 `el-tag--ai`、AI 按钮已有业务组件 `AiButton`）。下面的配色规则只约束**这些令牌覆盖不了的自定义渐变**。
- **必须跨色相**：两端取自不同色相家族，同色相渐变视觉过平，禁止使用 <!-- @rule id=gradient-cross-hue level=SHOULD cat=设计令牌 detect=manual dtitle=渐变两端应取不同色相，同色相渐变显得平淡 title=自定义渐变必须跨色相（例外：数据可视化色阶梯度） -->
  > **例外：数据可视化中用色阶编码数值的场景不受此限**（热力图、程度分级等**有序数据**用同一色相的浓度梯度表达大小）——那是用色阶承载信息、不是装饰性渐变。图表常规序列配色见 `display-guide.md > 数据可视化 > 配色`。
- **色阶按主题选取**：暗色模式的低阶色值与面板背景明度差极小，需向上偏移才能保持等效视觉存在感

  | 主题 | 渐变色阶范围 | 原因 |
  |------|------------|------|
  | 亮色 | step-3~5 | 与白色面板明度差 ~15-30%，视觉柔和 |
  | 暗色 | step-5~7 | 暗色色板低阶近乎黑色，需提亮至 step-5~7 才可辨识 |

- **两端明度接近**：渐变两端的亮度差不宜过大，避免"一头亮一头暗"的失衡
- **低饱和、高灰度**：整体偏柔和（粉尘感），不用纯色高饱和值
- **角度方向**：推荐对角方向（45° / 135°），同一页面内保持统一

---

## 颜色使用规则

- **始终使用 CSS 变量**，不允许在代码中硬编码十六进制色值
- 语义化变量优先，基础色板变量仅在语义变量无法满足时使用
- 完整变量清单见 `design-token/css/palette.scss`（色板）和 `semantic.scss`（语义层）

### 对比度底线

所有文字/背景组合必须满足 WCAG 2.1 AA 标准：

- **正文及以下**（≤ 18px 常规 / ≤ 14px 粗体）：对比度 ≥ **4.5:1**
- **大字**（> 18px 常规 / > 14px 粗体）：对比度 ≥ **3:1**
- **非文本元素**（图标、边框、表单控件轮廓）：对比度 ≥ **3:1**

#### 注意事项

- 低层级辅助文字色在亮色白底上对比度可能不足 3:1，仅允许用于 placeholder 和禁用态文字（WCAG 豁免非活跃元素）。需长期展示的辅助说明文字应使用对比度达标的更深色阶
- 新增功能色或自定义色时，上线前须通过对比度检查工具验证（推荐 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)）

---


### 语义字阶 → 用途（选复合字体令牌照此对号入座）

设文字时**先按用途选语义复合令牌 `--iflyv-font-*`**（一条搞定字号/行高/字重/字体族），不要自己拼字号。各字阶用途：

| 令牌 | 用途 | 规格（字号/行高 · 字重/字体） |
|---|---|---|
| `--iflyv-font-title-page` | 页面标题（一个页面最顶层的大标题） | 26/48 · 阿里普惠 800 |
| `--iflyv-font-title-module` | 模块标题（页面内一个大区块的标题） | 18/36 · semibold |
| `--iflyv-font-title-regular` | 常规标题（内容卡片/信息组的标题，介于模块标题与组件标题之间） | 16/24 · semibold |
| `--iflyv-font-title-component` | 组件标题（配置卡/组件内部的小标题） | 14/20 · semibold |
| `--iflyv-font-body-primary` | 常规正文（主要阅读内容） | 16/24 |
| `--iflyv-font-body-sub` | 次要正文（次要说明、tooltip、表格单元格等） | 14/20 |
| `--iflyv-font-body-min` | 辅助信息（最小级说明、附注） | 12/18 |
| `--iflyv-font-tab-active` | 页面级选中 Tab 项 | 26/36 · 阿里普惠 800 |
| `--iflyv-font-tab-active-sub` | 模块级选中 Tab 项 | 18/28 · semibold |
| `--iflyv-font-tab-default` | 默认（未选中）Tab 项 | 18/36 · regular |
| `--iflyv-font-label-primary` | 常规标签（表单 label、字段名等） | 12/18 |
| `--iflyv-font-number-display` | **主指标数字**：一屏里最该被看到的那个数（看板首屏核心指标、结果页的总数） | 26/40 · 抖音美好体 |
| `--iflyv-font-number-display-sm` | **次级指标数字**：与主指标并列或从属的数（一排指标卡里的各项、卡片内的统计值） | 22/34 · 抖音美好体 |

> 判断入口：先问"这段文字是什么角色？"——页面主标题→`title-page`、区块标题→`title-module`、卡片/信息组标题→`title-regular`、组件内小标题→`title-component`、正文→`body-primary`、次要说明→`body-sub`、最小附注→`body-min`、表单 label→`label-primary`、强调数字→`number-display`（**一屏最核心的那个数**用它，并列的次级指标用 `-sm`）。选定后按下方「设置文字的铁律」落地（含空格字体名的拆分规则）。

> **⭐ 数字展示字阶自带的排版约定：与下方说明文字的垂直间距取 `spacing-0_5`（2px）。** <!-- @rule id=number-display-gap-2 level=MUST cat=设计令牌 detect=manual dtitle=大数字与其下方说明文字应紧贴成一组，不能像普通段落那样拉开距离 title=number-display / -sm 与下方说明的垂直间距取 spacing-0_5，不用常规的列表项子元素档 -->
> `number-display` 系两档的行高本就宽裕（26/40、22/34），下方说明文字（指标名、单位说明）**紧贴成一组才读得出主副关系**；用常规的「列表项内子元素」档（`spacing-2` 8px）会让数字与说明散开、像两条独立信息，所以这里降到微调档 `spacing-0_5`。
> 落地范围：指标条 `.metric-item`（源头 `patterns/metric-strip.scss`）、图表环心数字（`Chart` 源头）等所有「大数字 + 下方说明」的组合。

#### `-multiline` 变体：预期 ≥3 行时换宽松行高

上表 4 个字阶另有 `-multiline` 变体，**字号相同、行高放宽至字号的 2 倍**：

| 令牌 | 常规档 | `-multiline` 档 |
|---|---|---|
| `--iflyv-font-title-page-multiline` | 26/48 | 26/52 |
| `--iflyv-font-body-primary-multiline` | 16/24 | 16/32 |
| `--iflyv-font-body-sub-multiline` | 14/20 | 14/28 |
| `--iflyv-font-body-min-multiline` | 12/18 | 12/24 |

> **判据：这段文字预期会占 ≥3 行时，用 `-multiline`；1~2 行一律用常规档。**
> 行数少时常规档的紧凑行高更聚拢、成块；行数一多，紧凑行高会让整段发闷、难以逐行扫读，此时才需要拉开行距。
>
> ⚠️ **不要因为"可能会换行"就默认选 `-multiline`**——它的行高是字号的 2 倍（如 12/24），用在一两行的短句上会让行距明显过松、文字块散掉。真实翻车：卡片里三两句短说明用了 `body-min-multiline`，行距 24px 撑得整块文字发散。
>
> **只有正文类字阶有 `-multiline`**：`title-module` / `title-component` / `tab-*` / `label-primary` 等**角色上就不成段落**（标题、tab 项、表单 label 都是短标签），故不提供多行变体，也不要自己拼一个。

> ⚠️ **本表会持续扩展**：后续新增/新用途的语义字阶（如新的标题级、数字级、状态文字级等），**必须同步更新本表**，不能只在 demo 的 `FontSemanticDemo.vue` 里加一行——demo 展示对下游 CC 不可见，只有写进本文件，下游 `@` 接入后 CC 才能"知道该用哪个字阶"。（同「语义信息沉淀通则」，见下。）

### 设置文字的铁律：优先用语义复合令牌，禁止只散设 font-size

> 「设置一段文字」= 一次性定义 **字号 + 行高 + 字重 +（必要时）字体族** 这一整套，不是只改字号。**只写 `font-size` 是最典型的翻车**：行高会塌回浏览器默认 `line-height: normal`（≈字号×1.2，出现 16.5 这种非令牌魔法值），字重也可能不对。

按优先级选用：

1. **首选：语义复合令牌**（一条搞定整套）——`font: var(--iflyv-font-body-sub)` / `var(--iflyv-font-title-component)` 等。这层已把字号/行高/字重/字体族打包好，改一处处处同步，是设置文字的默认方式。
   > ⚠️ **例外（含空格字体名不能用 `font:` 简写）**：当复合令牌的字体族含带空格的引号字体名（如 `'Segoe UI'`、阿里普惠），CSS 的 `font:` 简写会解析出错。此时**改为拆分属性**，逐条引用**单值令牌**：`font-size` + `line-height` + `font-weight`（+ `font-family`），见下方独立 token 用法。**拆分时行高、字重一个都不能漏**——漏了就是塌回默认。

2. **次选：拆分单值令牌**（复合令牌不适用、或只需覆盖其中一两项时）——必须**成套设齐**：`font-size: var(--iflyv-font-size-14); line-height: var(--iflyv-line-height-20); font-weight: var(--iflyv-font-weight-regular);`。字号档位对应的行高**照下方配对表选**，绝不留空让它走 `normal`。

3. **禁止**：`font-size: 16px`（硬编码，第 14 行）、`font-size: var(--iflyv-font-size-14)` 后不设行高（行高塌陷）、用 `font:` 简写套含空格字体名的令牌（解析出错）。

### 字号-行高推荐配对表

用独立 token（上文第 2 类）时，参照此表选择默认行高搭配——**每个字号都有对应行高，设字号必设行高**：

| 字号 token | 默认配对行高 | 推荐语义比例 |
|-----------|------------|------------|
| `font-size-12` | `line-height-18` | `leading-normal` |
| `font-size-14` | `line-height-20` | `leading-normal` |
| `font-size-16` | `line-height-24` | `leading-normal` |
| `font-size-18` | `line-height-28` | `leading-snug` |
| `font-size-20` | `line-height-28` | `leading-snug` |
| `font-size-22` | `line-height-32` | `leading-snug` |
| `font-size-24` | `line-height-32` | `leading-snug` |
| `font-size-28` | `line-height-36` | `leading-snug` |
| `font-size-32` | `line-height-40` | `leading-tight` |
| `font-size-40` | `line-height-48` | `leading-tight` |
| `font-size-48` | `line-height-56` | `leading-tight` |
| `font-size-60` | `line-height-68` | `leading-tight` |
| `font-size-72` | `line-height-80` | `leading-tight` |

### 层级对比策略

- **效率型页面**（管理后台、列表、表单）：标题与正文**相邻层级**配对即可，保持 ≥1.25× 字号比，节奏平稳不跳跃
- **展示型页面**（首页概览、数据报告、对外汇报）：刻意**跨级拉大**标题与正文的字号比至 2×~3×，标题用 `title-page`、强调数字用 `number-display` / `number-display-sm` 制造视觉张力。辅助信息压到 `body-sub` 或 `label-primary`，反衬主信息的分量感

---

## 按钮位置通则：主按钮贴边原则

> **跨场景公理**（弹窗 / 抽屉 / 表单 / 工具栏 / 卡片底部…通用）。有了它，遇到规范里还没写到的新场景也能自行推出主按钮该放哪，不必逐场景死记。

**规则**：一处出现按钮组时，**主按钮贴近该组所在容器的对齐侧边缘**。 <!-- @rule id=button-primary-edge level=MUST cat=视觉呈现 detect=manual title=主按钮贴近按钮组所在容器的对齐侧边缘（右对齐贴右/左对齐贴左） -->

| 按钮组的对齐方式 | 主按钮位置 | 典型场景 |
|---|---|---|
| **右对齐** | 贴**右**缘（主按钮在最右） | 弹窗 / 抽屉 `#footer`、工具栏右组 |
| **左对齐** | 贴**左**缘（主按钮在最左） | 页面级表单底部操作区 |

**唯一例外：方向性按钮**（上一步 / 下一步、返回 / 继续）——它们的位置由**方向语义**决定（"下一步"恒在右、"上一步"恒在左），不适用贴边原则。

> **为什么要有这条**：弹窗"主按钮在右"、页面表单"主按钮在左"，看起来互相矛盾、只能当两个惯例分别记忆；实际上二者是**同一条规则**在不同对齐方式下的结果——弹窗 footer 右对齐所以贴右，页面表单操作区左对齐所以贴左。收敛成一条后，新场景可推理，不必每遇到一个就回来问。

**这条只管"主按钮在按钮组里的哪一端"**，不管按钮组本身如何对齐（那取决于容器：弹窗 footer 右对齐、页面表单跟随输入区左对齐，各自见 `patterns/dialog-pattern.md` / `patterns/form-pattern.md`）。

---

## 间距系统与圆角系统

### 圆角速查

| 令牌 | 值 | 典型用途 |
|------|-----|------|
| `radius-xs` | 4px | Tag、Checkbox、Select item、Dropdown item（下拉项） |
| `radius-sm` | 8px | Button、Input、小卡片、Table、大多数组件默认 |
| `radius-md` | 10px | 大卡片 |
| `radius-lg` | 12px | 页面级容器、Dialog（弹窗）、Drawer（抽屉） |
| `radius-full` | 999px | 胶囊按钮、全圆角 Tag（对高度为 h 的元素圆角自动收敛为 h/2） |

> 只有这 5 档（与源头 `design-token/css/spacing.scss`、demo `RadiusDemo` 一致）；档位从小到大对应"元素越大圆角越大"：小控件 xs/sm、卡片 md、页面级容器/弹窗/抽屉 lg、需要胶囊/圆形用 full；**卡片内嵌套的面板/子容器随嵌套收一档取 sm**（外层大卡片 md、内层面板 sm，靠差值形成层级）。**不要用裸 `border-radius: 6px` 这种非档位值**，一律走这 5 档令牌。

### 间距速查

> ⛔ **场景语义的单一数据源在 `design-token/spacing-usage.ts`**（demo `SpacingDemo` 与本表同引一份）。**新增 / 修改场景只改那个文件**，本表随之更新；不要只改一处（曾因两份手工副本不同步而选错档位）。

**令牌 → 场景**（照此对号入座，先按场景找令牌）：

| 令牌 | 值 | 应用场景 |
|---|---|---|
| `spacing-0_5` ~ `spacing-2` | 2 / 4 / 6 / 8px | 微间距。逐档：**2** 紧贴元素的视觉对齐补偿、**数字展示字阶（`number-display` / `-sm`）与其下方说明文字之间**（行高已宽裕，用 8 会散开）；**4** 控件内图标与其紧邻文字（按钮内 icon+文字）、卡内通栏出血面板距卡缘的细缝；**6** Tag / Badge 等小控件的左右内边距；**8** 列表项内子元素（标题与描述、主信息与副信息；含横向的图标/标签与其同行文字）、**常规标题与其下方内容之间**（与「标题与其描述」同档；下方是通栏/出血块时放宽一档取 `spacing-3`）。⚠️ **图标与图标之间不在这几档**——一排图标（无论是否可点）走 `spacing-4`（16px） |
| **`spacing-3`** | 12px | **模块级标题与其下方内容之间**（比页面级收一档）；**按钮之间**（水平，**有底色/描边的按钮**）；**小卡片内边距·上下**（含横幅/条状容器；左右配 `spacing-4`）；**常规标题与其下方通栏/出血块之间**（比常规内容放宽一档） |
| **`spacing-4`** | 16px | **页面级标题与其下方内容之间**；**页面级标题与页面顶部之间**（两条均含 `.tabs-page` 充当页面标题层时）；**卡片之间**（同级卡片常规间距）；**小卡片内边距·左右**（含横幅/条状容器；上下配 `spacing-3`）；**大卡片内边距·上下**（左右配 `spacing-5`）；**按钮之间**（水平，**全组都是无底色的文本 / 纯图标按钮**）；**图标之间**（一排图标彼此，无论是否可点） |
| **`spacing-5`** | 20px | **大卡片内边距·左右**（上下配 `spacing-4`）；**面板内边距·上下**（左右配 `spacing-6`） |
| **`spacing-6`** | 24px | **表单项之间**（label + input 为一组，组与组的间距）；**页面内容距页面左右及底部内边距**（内容区容器；顶部另按「页面级标题与页面顶部之间」取 `spacing-4`）；**面板内边距·左右**（上下配 `spacing-5`） |
| **`spacing-8`** | 32px | **模块之间**（垂直间距，区块与区块） |
| `spacing-10` | 40px | —（暂无专属场景） |

**几个易混场景的唯一答案**（这几处最容易在邻近档之间取错，逐个钉死）：

| 场景 | 取值 | 为什么不是邻近档 |
|---|---|---|
| **工具栏内元素之间**（搜索框、筛选项、按钮…） | **不写**，由源头 `.toolbar__left/__right` 的 `gap: spacing-3`（12）提供 | 曾有"12~16 自选"的表述，已作废——工具栏布局全在源头 `el-theme/patterns/toolbar.scss`，使用方写任何值（哪怕写对 12）都是私货 |
| **内容与容器四周的内边距**（卡片 / 面板 / 底板） | **按容器体量选三档，且左右松、上下紧（横竖各差一档），写成 `padding: <上下> <左右>` 两值简写**：**面板 / 底板 → 左右 `spacing-6`（24）、上下 `spacing-5`（20）**；**大卡片 → 左右 `spacing-5`（20）、上下 `spacing-4`（16）**；**小卡片 → 左右 `spacing-4`（16）、上下 `spacing-3`（12）**；**横幅 / 条状容器一律按小卡片档对待（内边距与圆角同，圆角即 `radius-sm`）** | 判据是容器体量，不是"松一点紧一点"的手感，**也不是背景色令牌**——⚠️「面板」档指**页面级底板容器**，不等于「用了 `bg-panel` 底色」（档位名与令牌名撞名，别按名字匹配）：嵌在卡片里的白底子面板是**内层子容器**，按嵌套收一档取值（外层大卡片 16/20 → 内层 12/16），曾因此把卡内子面板错取成 20/24、子比父还大。**上下、左右必须成对取**（成对关系已写进各档场景名），只取单边或四周统一都不合档。嵌套一律逐层收一档，靠差值形成层级 |
| **按钮之间**（水平） | **按「有没有可见边界」选两档**：**含任一有底色/描边的按钮 → `spacing-3`（12）**；**全组都是无底色的 `text` 文本按钮 / 纯图标按钮 → `spacing-4`（16）** | 底色/描边本身就是可见边界，12 已够分隔色块；无底色时边界只能靠文字轮廓判断，12 会被读成"文字间的普通空格"、两个按钮糊成一句话，加宽是**补偿缺失的视觉边界**。判据是有无底色，**不是**"文本按钮更重要"，也不是按钮类型的名字——一组里只要**混有**实心按钮就走 12。完整表述见 `component-interaction.md`「按钮间距」 |
| **模块之间**（页面内区块与区块） | **`spacing-8`（32）** | 见下方「模块 vs Section」判据 |

> **卡内「通栏出血面板」写法**（卡片内承载通栏长文本的白底内衬，如课程简介）<!-- @rule id=card-bleed-panel-inset level=SHOULD cat=视觉呈现 detect=manual dtitle=卡内通栏内衬与卡缘应是均匀的 4px 细缝，标题与内衬留白略宽 -->：
> 内衬 = `bg-panel` 白底 + `border-subtle` 细边 + `radius-sm`，自身内边距按嵌套收一档（大卡片内 → 12/16）；**向两侧出血至距卡缘 `spacing-1`（4）**——`margin-inline: calc(var(--iflyv-spacing-1) - <卡片左右内边距>)`，随卡片内边距联动；**含出血面板的卡片底部内边距同收到 `spacing-1`**（两侧与底部细缝一致）；**标题→出血面板取 `spacing-3`（12）**（出血块比标题更宽、视觉重量大，比常规内容放宽一档）。可照抄骨架见 demo 典型页面「公开信息设置」简介卡。
| **展示型页面的大留白** | `spacing-10`（40） | 仅展示型；效率型页面用 32 已足够，40 会让信息密度过低 |

> ### ⚠️ 「模块」与「Section」不是两个东西——别再纠结
>
> 二者**同义**，都指"页面内的一个区块"，**统一用 `spacing-8`（32）**。此前区间表里"页面级 Section 之间 24~40"的写法已作废（同一件事给两个答案，必然取错）。
>
> **唯一的例外是展示型页面**（首页概览 / 数据报告 / 对外汇报）：为了排版张力可放大到 `spacing-10`（40）。判据是"这是效率型还是展示型页面"，不是"叫模块还是叫 Section"。

> **选档总方法**：先在「令牌 → 场景」表里找**精确匹配的场景**（有专属档位的不可自行发挥）；找不到再看上表。**判断"模块级 vs 页面级"**：看该标题在当前页面里的层级——页面主标题=页面级（`title-page` 字阶），页面内某个区块的标题=模块级（`title-module` 字阶）；字阶与间距档位一一对应，选错字阶间距也会跟着错。

### 页面最小宽度

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--iflyv-layout-min-width` | 1200px | 整页框架的宽度下限。承载容器窄于此值时**出横向滚动条，而非继续压缩布局** |
| `--iflyv-grid-columns` | 24 | 内容区栅格列数。**不直接引用**——用源头约定类 `.grid` / `.grid__col-*`（见下） |
| `--iflyv-grid-gutter` | 16px（= `spacing-4`） | 栅格列间水槽。与「卡片之间」同档，保证栅格并排的卡片与非栅格场景间距一致 |

> **栅格怎么用**：写 `<div class="grid"><div class="grid__col-16">…</div><div class="grid__col-8">…</div></div>`，样式在源头 `el-theme/patterns/grid.scss`。**只提供 `col-6/8/10/12/14/16/18/20/24` 九档**——「模块宽度不得小于 6 列」由源头保证，写不出违规值。**不用 `el-row`/`el-col`**（EP 走 flex + 负 margin，`:gutter` 拿不到 CSS 变量）。完整规则见 `efficiency-guide.md`「栅格系统」。

本系统面向桌面端后台，不做响应式收窄：窄屏下侧边栏 + 内容区一旦被压缩就不可用，因此统一以横向滚动兜底。

**业务组件 `PageFrame` 已内置此机制**（自带横向滚动壳），接入方直接用即可，**不必也不应**在外层另写 `min-width` / `overflow-x`——会与内置机制打架。只有在**不用 PageFrame、自行搭整页骨架**时才需引用本令牌，且滚动条按规范走 `el-scrollbar`（见 `component-interaction.md` 滚动条段）。

### 阴影速查（三档层级 = 元素"浮起"高度）

阴影**只用于浮层**（卡片默认不加投影，见「禁止事项」），三档按元素"浮起"高度递进——层级越高、阴影越扩散：

| 令牌 | 用途 | 值 |
|---|---|---|
| `--iflyv-shadow-hover` | **悬浮反馈**：卡片/可点元素 hover 时的轻微浮起 | `0 6px 8px` 轻 |
| `--iflyv-shadow-related` | **关联浮层**：由某元素触发、依附于它的浮层（下拉菜单、气泡 Popover、Tooltip） | `0 6px 32px 4px` 中 |
| `--iflyv-shadow-independent` | **独立浮层**：脱离触发点、独立存在的重浮层（Dialog 弹窗、Drawer 抽屉） | `0 12px 48px 8px` 重 |

> 选档：跟随鼠标的轻反馈 → `hover`；挂在某个按钮/输入框上的下拉气泡 → `related`；盖住页面的弹窗抽屉 → `independent`。**不要给静态卡片加阴影**（本设计系统"UI 浮在背景上而非压在上面"，静态层次靠描边/底色，不靠投影）。

---

## 动效使用指引

> 变量定义见 `design-token/css/animation.scss`。

**核心原则：动效为功能服务，不为装饰存在。** 过渡让用户感知"发生了什么"（元素从哪来、到哪去），而非"好看"。

### 动效技术分层

| 层级 | 技术 | 适用范围 |
|------|------|---------|
| 基础层 | CSS transition / @keyframes + `--iflyv-*` 变量 | 所有页面 |
| 增强层 | GSAP（ScrollTrigger / Timeline 等），按需动态加载 | 仅展示型页面 |

- 效率型页面只使用基础层，禁止引入 GSAP <!-- @rule id=gsap-display-only level=MUST cat=视觉呈现 view=impl detect=regex title=GSAP 仅展示型页面可用，效率型页面禁止引入 -->
- 两层互补不替代：增强层的时序编排能力补充基础层做不到的滚动驱动、多元素协同入场等场景
- 增强层详见 `display-guide.md > 滚动驱动动效`

### 时长 × 缓动组合速查

| 场景 | 时长变量 | 缓动变量 | 典型元素 |
|------|---------|---------|---------|
| 微交互反馈 | `--iflyv-duration-fast` (0.15s) | `--iflyv-ease-default` | 按钮 hover/active、输入框聚焦描边、图标变色、开关切换、链接 hover |
| 元素展开/出现 | `--iflyv-duration-normal` (0.3s) | `--iflyv-ease-decelerate` | 弹窗弹出、抽屉滑入、下拉展开、折叠面板展开、Tooltip 浮现 |
| 元素收起/消失 | `--iflyv-duration-normal` (0.3s) | `--iflyv-ease-accelerate` | 弹窗关闭、抽屉滑出、下拉收起、折叠面板收起、Message 消失 |
| 侧边栏伸缩 | `--iflyv-duration-normal` (0.3s) | `--iflyv-ease-default` | 侧边导航展开/折叠 |
| 页面级过渡 | `--iflyv-duration-slow` (0.5s) | `--iflyv-ease-decelerate` | 路由切换淡入、骨架屏渐显、大区域内容替换 |

### 使用示例

```scss
// 按钮 hover
.my-button {
  transition: background var(--iflyv-duration-fast) var(--iflyv-ease-default),
              color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}

// 弹窗出现（Vue Transition）
.dialog-enter-active {
  transition: opacity var(--iflyv-duration-normal) var(--iflyv-ease-decelerate),
              transform var(--iflyv-duration-normal) var(--iflyv-ease-decelerate);
}
.dialog-leave-active {
  transition: opacity var(--iflyv-duration-normal) var(--iflyv-ease-accelerate),
              transform var(--iflyv-duration-normal) var(--iflyv-ease-accelerate);
}
```

### 不加动效的场景

- 纯数据刷新（表格数据更新、数字变化）—— 即时生效，不做过渡
- 滚动行为 —— 由浏览器原生处理
- 拖拽过程中 —— 跟手即可，不加 transition（拖拽释放归位可加 fast）

---

## 层级系统（z-index）

层叠先后是一份**全局契约**，统一由 z-index 令牌管理（源头 `design-token/css/z-index.scss`）。任何要设 z-index 的地方一律引用这些令牌，**禁止散写魔法数字**（999 / 2000 / 9999…），否则组件库浮层与下游固定框架会相互打架。

### z-index 令牌 → 用途（选层级照此对号入座）

| 令牌 | 值 | 用途 |
|---|---|---|
| `--iflyv-z-base` | 1 | 普通抬升——同层内需盖住兄弟的元素（卡片 hover 浮起等） |
| `--iflyv-z-sticky` | 100 | **固定框架**——吸顶栏 / 固定侧边栏 / 吸顶工具条（下游自己的固定框架也用它） |
| `--iflyv-z-popper` | 2000 | **触发浮层**——下拉 / tooltip / popover / popconfirm / select 面板等 |
| `--iflyv-z-drawer` | 3000 | 抽屉 |
| `--iflyv-z-dialog` | 4000 | 对话框 + 其遮罩 |
| `--iflyv-z-message` | 5000 | **全局即时反馈**——message / notification（优先级最高，永远浮于最上） |

> **核心原则：固定框架（sticky=100）远低于浮层（popper 及以上）。** 浮层（下拉、气泡、通知）是用户当前操作的即时焦点，必须压过固定导航等常驻框架；框架不该遮住临时浮层。
>
> **下游接入**：写自己的固定顶栏 / 侧边栏用 `z-index: var(--iflyv-z-sticky)`，即自然低于组件库的所有浮层，不会互相盖住。需要新浮层时按其性质选对应档（触发类→popper、抽屉→drawer、弹窗→dialog、全局提示→message）。
>
> 档间留了足够间隔（100→2000→3000…）便于必要时插档；EP 内置的 `--el-index-popper`(2000) 等仍可用，但本设计系统的浮层（如 popconfirm/notification/message）已在源头接上上表令牌，确保跨接入方层级一致。
