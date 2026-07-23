---
author: myjin2
updated: 2026-05-10
---

# 基础规范

> 任何页面类型必读。包含设计令牌、硬规则、配色、字体、间距、动效等通用基础。

---

## 禁止事项汇总

- ❌ 硬编码颜色值（如 `color: #23B283`），必须使用CSS 变量
- ❌ 硬编码字号（如 `font-size: 16px`），必须使用字体令牌
- ❌ 使用非规范间距（如 `margin: 10px`），必须使用间距令牌
- ❌ 使用 `success`、`warning`、`info` 类型按钮（指 el-button 的 type 属性），仅允许 `default`、`primary`、`danger`
- ❌ 使用 `circle` 属性做纯图标按钮，改用 `class="btn-icon-square"`
- ❌ 使用粗线、双线、装饰性线条
- ❌ 卡片默认加投影（阴影仅用于浮层）
- ❌ 模块宽度小于 6 列（栅格最小粒度）
- ❌ 暗色模式下卡片使用纯色描边（改用 `.surface-bordered` 双光源渐变描边工具类）

> 特殊场景确需破例时，须在设计评审中论证必要性，经确认后作为例外记录，不得静默绕过。

---

## 图标库

- 统一使用 `lucide-vue-next`，按需导入，**禁止全量引入**
  ```ts
  import { Search, Plus, Trash2 } from 'lucide-vue-next'
  ```
- 模板中直接作为组件使用：`<Search :size="16" :stroke-width="2" />`
- 默认尺寸：正文/操作按钮 `16px`，提示信息 `14px`
- **`stroke-width` 统一使用 `2`**，不允许使用其他值

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
| 装饰倾向 | 克制、功能性优先 | 不使用纯装饰性元素；图标、色彩、插图仅在有信息传达意义时出现 |
| 人文温度 | 文艺舒适、有活人感 | 文案语气避免机械生硬，空状态/引导页可使用轻量插画；整体感受"有人在用"而非"机器在运转" |
| 视觉重量 | 轻盈 | 细描边（1px）、轻阴影；渐变仅限头部模块和展示型区块（见"配色原则"）；UI 元素"浮"在背景上而非"压"在上面 |

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

### 扩展色板

yellow / cyan / purple / magenta 为扩展色板，**不绑定功能语义**，用于数据可视化、标签分类、渐变组合等需要更丰富色相的场景。与功能色板共享相同的 10 步色阶结构和暗色生成算法。

### 渐变使用

渐变按使用区域分级管控：

| 区域 | 允许程度 | 说明 |
|------|---------|------|
| 页面头部模块 | 所有页面允许 | 效率型克制使用（文字扫光、微弱底色渐变/光斑），展示型可大面积 Hero 背景 |
| 内容区 Section 背景 | 仅展示型 | 用于章节头部或区块分隔 |
| 卡片悬浮光效 | 所有页面允许 | hover 时渐显，`opacity: 0 → 0.2`，详见 `display-guide.md > 渐变光斑技法` |
| 组件/卡片内部 | 禁止 | 表单、表格、弹窗、抽屉等效率型组件内部不允许 |

渐变配色规则：

- **必须跨色相**：两端取自不同色相家族，同色相渐变视觉过平，禁止使用
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


### 字号-行高推荐配对表

使用独立 token 时，参照此表选择默认行高搭配：

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
- **展示型页面**（首页概览、数据报告、对外汇报）：刻意**跨级拉大**标题与正文的字号比至 2×~3×，用 Display / Number-Display 变量制造视觉张力。辅助信息压到 `body-sub` 或 `label-primary`，反衬主信息的分量感

---

## 间距系统与圆角系统

### 圆角速查

| 令牌 | 值 | 效率型 | 展示型 | 典型用途 |
|------|-----|:---:|:---:|------|
| `radius-xs` | 4px | ✓ | ✓ | Tag、Checkbox、Select item |
| `radius-sm` | 8px | ✓ | ✓ | Button、Input、Card、Table |
| `radius-md` | 12px | ✓ | ✓ | Drawer、Dialog、页面级容器 |
| `radius-lg` | 16px | — | ✓ | 展示型内容卡片、图表容器、引述块 |
| `radius-xl` | 24px | — | ✓ | Hero 区块、特征卡片（慎用） |
| `radius-full` | 999px | ✓ | ✓ | 胶囊按钮、全圆角 Tag |

### 间距速查

| 场景 | 推荐变量 | 值 |
|------|---------|-----|
| 紧凑元素内间距（Tag、Badge） | `spacing-1` ~ `spacing-2` | 4~8px |
| 列表项内部子元素之间（如标题与描述、图标与文字） | `spacing-1` ~ `spacing-2` | 4~8px |
| 表单项之间（label + input 为一组，组与组的间距） | `spacing-4` | 16px |
| 工具栏内元素之间（按钮组、筛选项、搜索框） | `spacing-3` ~ `spacing-4` | 12~16px |
| 卡片/面板内边距 | `spacing-3` ~ `spacing-5` | 12~20px |
| 同级模块之间（卡片与卡片、区块与区块） | `spacing-5` ~ `spacing-6` | 20~24px |
| 页面级 Section 之间 | `spacing-6` ~ `spacing-12` | 24~48px |
| 展示型页面 Section 之间 | `spacing-12`+ | 48px+ |

---

## 动效使用指引

> 变量定义见 `design-token/css/animation.scss`。

**核心原则：动效为功能服务，不为装饰存在。** 过渡让用户感知"发生了什么"（元素从哪来、到哪去），而非"好看"。

### 动效技术分层

| 层级 | 技术 | 适用范围 |
|------|------|---------|
| 基础层 | CSS transition / @keyframes + `--iflyv-*` 变量 | 所有页面 |
| 增强层 | GSAP（ScrollTrigger / Timeline 等），按需动态加载 | 仅展示型页面 |

- 效率型页面只使用基础层，禁止引入 GSAP
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

- **浮层层级由 EP `PopupManager` 自动管理**（从 2000 起递增），包括 Dialog、Drawer、Popover、Select 下拉、Message 等，**不要手动设置 z-index**
- 页面内层级（sticky 表头、固定导航等）保持在 **100 以内**，避免与 EP 浮层冲突
- EP 内置变量：`--el-index-normal`（1）、`--el-index-top`（1000）、`--el-index-popper`（2000），如需自定义浮层可引用这些变量
