---
author: myjin2
updated: 2026-06-26
---

# Design Token 变更日志

---

## v1.3.1 — 2026-06-26

### 修复 / 调整

#### placeholder 文字色映射 text-3 → text-4

`var-mapping.scss` 的 `--el-text-color-placeholder` 从 `text-3` 改为 `text-4`，所有输入类组件 placeholder 文字浅一档。

**迁移**：使用方无需改代码，placeholder 自动变浅。

#### 单选 select 有值回显钉 text-1

EP 新版回显文字节点同时挂 `.el-select__placeholder` class，有值态会被 EP 的 placeholder 色（regular/text-2）染浅；且旧兜底变量 `--el-select-input-color` 新版已不再被读取。`input.scss` 显式将非禁用、有值（无 `is-transparent`）的回显钉为 `text-1`。多选带关闭按钮的 tag 仍维持 `text-2`（由 `tag.scss` 统一管控），不受影响。

#### radio 禁用态注释明确化

`radio.scss` 仅更新注释（显式钉 `text-4`，不随 placeholder 映射漂移），值不变。

---

## v1.3.0 — 2026-05-10

### 破坏性变更（Breaking Changes）

#### 删除 .el-button--success / --warning / --info 样式

仅保留 `default` / `primary` / `danger` 三种 type（与 `foundations.md` 禁用规则一致）。

**迁移**：全局搜索 `type="success"` / `type="warning"` / `type="info"`，全部改为 `default` / `primary` / `danger`（语义反馈用 `Message` / `Notification` 自身的 type）。项目内已确认零使用。

#### Dialog 圆角从 16px 改为 12px

`dialog.scss` 从 `radius-lg` 改回 `radius-md`，与 `foundations.md` 圆角速查表 + `drawer.scss` 一致。

**迁移**：使用方所有 `el-dialog` 圆角自动变小 4px，无需改代码。

#### form inline 实现从 margin 切换到 flex+column-gap

`.el-form--inline` 从 `inline-block` + `form-item { margin-inline-end: 32px }` 改为 `display: flex; column-gap: 32px; row-gap: spacing-3` + `form-item { margin: 0 }`。

**修复**：解决「混排有 label 与无 label form-item 时按钮高于输入框」的对齐问题。

**迁移**：使用方若给 inline form-item 写过额外的 `margin` 覆盖，需要清除。

---

### 新增功能

#### Dialog 4 语义化标题变体

新增 `.is-warning` / `.is-danger` / `.is-success` / `.is-info` 类——标题前自动渲染圆形彩色底板 + 白色 Lucide icon（`!` / `X` / `✓` / `i`）。

设计目标：替代命令式 `ElMessageBox`（团队规范统一使用 Dialog），通过 class 提供语义图标，不引入命令式 API。

**用法**：
```vue
<el-dialog class="is-danger" title="删除用户「张三」" width="400px">...</el-dialog>
```

详见 `references/component-interaction.md`「Dialog 语义化标题」章节。

#### design-spec/examples/ 目录

新增 5 组件参考代码（`button` / `form` / `table` / `dialog` / `select`），每文件包含：

- 顶部使用说明 + 反模式总表（带 `[BLOCKING] / [STRONG] / [SOFT]` 优先级标签）
- 多个 ✅ 推荐 + ❌ 反模式对照示例
- 配套规则的 `@depends-on / @when-changed / @see` 标签注释

**使用方法**：按需复制对应 section 到自己项目（不作为组件 import）。配合 `references/` 文档阅读。

---

### 文档更新

- `references/component-interaction.md` 顶部新增「反模式优先级判定」节（统一判定标准 + 使用方判读建议）
- `references/component-interaction.md` 末尾新增「Dialog 语义化标题（4 种变体）」章节
- `references/component-interaction.md`「按钮间距」段补充例外清单（`.el-button-group` / `.table-operation`）+ checkbox/radio 间距对照说明
- `references/foundations.md` 表单项间距速查从 `spacing-2`（8px）修正为 `spacing-4`（16px），与代码现状一致
- `el-theme/` 5 个组件 scss 新增 28 处「配套规则」显式依赖注释，统一 schema：
  - `@depends-on:` 依赖什么前提
  - `@when-changed:` 前提变了需要做什么
  - `@see:` 跨文件交叉引用（用语义锚点替代行号）

---

## 2026-04-16

### 组件样式调整

#### Button 相邻间距移除

**变更**：移除 `.el-button + .el-button` 的默认 `margin-inline-start: 12px`，改为 `0`。

**影响**：多个 button 连续排列时，不再有自动间距。

**迁移**：外层容器必须使用 `display: flex; gap: var(--iflyv-spacing-3)` 控制间距。

---

## v1.2.0 — 2026-04-11

### 破坏性变更（Breaking Changes）

#### Border Token 重命名

| 旧名称 | 新名称 |
|--------|--------|
| `--iflyv-border-light` | `--iflyv-border-subtle` |
| `--iflyv-border-primary` | `--iflyv-border-default` |
| `--iflyv-border-dark` | `--iflyv-border-strong` |
| `--iflyv-border-darkbg` | `--iflyv-border-on-dark` |

**迁移**：全局搜索替换，注意 `border-primary` 不要误替换 `brand-primary`。

#### darkbg 后缀统一改为 on-dark

| 旧名称 | 新名称 |
|--------|--------|
| `--iflyv-text-darkbg` | `--iflyv-text-on-dark` |
| `--iflyv-icon-darkbg` | `--iflyv-icon-on-dark` |
| `--iflyv-mask-darkbg` | `--iflyv-mask-on-dark` |

**迁移**：全局搜索替换。

#### 圆角值重排

| Token | 旧值 | 新值 |
|-------|------|------|
| `radius-xs` | 4px | 4px（不变） |
| `radius-sm` | 8px | 8px（不变） |
| `radius-md` | 10px | **12px** |
| `radius-lg` | 12px | **16px** |
| `radius-xl` | 16px | **24px** |
| `radius-2xl` | 24px | **已删除，合并到 xl** |
| `radius-full` | 999px | 999px（不变） |

**迁移**：
- 如果使用了 `radius-2xl`，改为 `radius-xl`
- `radius-md`/`radius-lg`/`radius-xl` 的值都变了，检查视觉效果是否需要调整引用的档位

#### 品牌色 school-red 移除

school-red 的具体色值已从 brands.scss 中移除，替换为 `register-brand` mixin 机制。

**迁移**：如果项目中使用了 `data-brand="school-red"`，需要在项目自己的样式中调用 mixin 注册：
```scss
@use 'design-token/css/brands' as *;

@include register-brand(
  "school-red",
  (#fff4f0, #ffdfd4, #ffbeab, #fa987f, #ed6d53, #e0432a, #ba2a1a, #94160d, #6e0804, #470202),
  (#2c1918, #421e1a, #55261f, #732c21, #9b3524, #c23d28, #d8654d, #ef927a, #f8b9a7, #fadbd0)
);
```

---

### 新增功能

#### 间距新增 2px 和 6px 档位

```scss
--iflyv-spacing-0_5: 2px;   /* 微间距：Badge 内边距、紧凑图标间距 */
--iflyv-spacing-1_5: 6px;   /* 小间距：图标与文字、小按钮内边距 */
```

**迁移**：将项目中硬编码的 `2px` 和 `6px` 间距替换为对应 token。

#### 语义比例行高 Token

新增 6 个 leading-* 变量：

```scss
--iflyv-leading-none:    1;      /* 紧贴 */
--iflyv-leading-tight:   1.15;   /* Display 大字 */
--iflyv-leading-snug:    1.3;    /* 标题 */
--iflyv-leading-normal:  1.5;    /* 正文 */
--iflyv-leading-relaxed: 1.75;   /* 长文阅读 */
--iflyv-leading-loose:   2;      /* 特殊场景 */
```

#### 白底页面背景

```scss
--iflyv-bg-page-white: var(--iflyv-gray-0);  /* 亮色白底 / 暗色同 bg-page */
```

---

### 架构重构

#### 文件拆分

原 `root.scss`（~500 行）拆分为：

| 新文件 | 职责 |
|--------|------|
| `palette.scss` | 基础色板（Sass 变量 + CSS 变量 + accent 别名） |
| `semantic.scss` | 亮色语义层 |
| `spacing.scss` | 间距 + 圆角 |

原 `root-dark.scss` 拆分为：

| 新文件 | 职责 |
|--------|------|
| `palette-dark.scss` | 暗色色板 |
| `semantic-dark.scss` | 暗色语义覆盖 + surface 描边工具类 |

**迁移**：
- 如果项目中 `@use` 了 `root.scss` 或 `root-dark.scss`，改为 `@use` 入口文件 `index.scss`
- 如果直接引用了 Sass 变量（如 `$gray-1`），现在从 `palette` 模块导入

#### 选择器特异性修复

- 亮色：`:root, html[data-theme="light"]`（保持 :root 兼容）
- 暗色：`html[data-theme="dark"]`（特异性高于 :root，不依赖源码顺序）

**迁移**：无需改动，自动兼容。

#### 品牌色 Mixin

新增 `register-brand` mixin，新增品牌色只需一行调用：

```scss
@include register-brand("品牌名", (亮色色板 1~10), (暗色色板 1~10));
```

---

### 字体系统调整

- 独立原子 token（font-size/line-height/font-weight）升为主力
- 语义组合变量（font-body-primary 等）降级为"推荐搭配"，不再强制

**迁移**：旧写法继续生效，新增代码推荐使用独立 token。

---

### 文档更新

- `CLAUDE.md`：文件结构表更新，样式修改规则更新
- `foundations.md`：字体规则重写，圆角/间距表更新，背景色速查表，border 命名更新
- `efficiency-guide.md`：border token 名称更新
- `impl-patterns.md`：surface 层级表更新，暗色选择器写法更新

---

## v1.1.0 — 2026-04-11

### 字体系统重构

**变更类型**：结构性调整

**影响文件**：`design-token/css/font.scss`、`references/foundations.md`

#### 1. 独立原子 token 升为主力

语义组合变量（`--iflyv-font-body-primary` 等）从"必须使用"降级为"推荐搭配"。现在推荐使用独立 token 自由组合：

```scss
/* 旧写法（仍可用，但不再强制） */
.text { font: var(--iflyv-font-body-primary); }

/* 新推荐写法 */
.text {
  font-size: var(--iflyv-font-size-16);
  line-height: var(--iflyv-line-height-24);   /* 或 var(--iflyv-leading-normal) */
  font-weight: var(--iflyv-font-weight-regular);
}
```

**迁移**：旧写法继续生效，无需立即修改。新增代码推荐使用独立 token。

#### 2. 新增 6 个语义比例行高 token

```scss
--iflyv-leading-none:    1;      /* 紧贴 — 装饰性大字、单行 Display */
--iflyv-leading-tight:   1.15;   /* Display 大字 32px+ */
--iflyv-leading-snug:    1.3;    /* 标题 18-28px */
--iflyv-leading-normal:  1.5;    /* 正文 14-16px */
--iflyv-leading-relaxed: 1.75;   /* 多行正文、长文阅读 */
--iflyv-leading-loose:   2;      /* 超松 — 特殊排版场景 */
```

与现有固定 rem 行高 token（`--iflyv-line-height-18` ~ `--iflyv-line-height-80`）互补：
- 快速开发 → 语义比例
- 精确像素对齐 → 固定 rem

**迁移**：纯新增，无破坏性变更。

---

### 背景色扩展

**变更类型**：新增变量

**影响文件**：`design-token/css/root.scss`、`design-token/css/root-dark.scss`、`references/foundations.md`

#### 新增 `--iflyv-bg-page-white`

```scss
/* 亮色 */
--iflyv-bg-page-white: var(--iflyv-gray-0);  /* 白底 */

/* 暗色 */
--iflyv-bg-page-white: var(--iflyv-gray-0);  /* 同 bg-page，最深底色 */
```

**使用场景**：文档编辑器、沉浸式阅读、白底页面。替代之前直接写 `background: var(--iflyv-gray-0)` 或 `background: #fff` 的做法。

**完整背景色变量表**：

| 变量 | 亮色 | 暗色 | 用途 |
|------|------|------|------|
| `--iflyv-bg-page` | gray-1 (灰) | gray-0 | 默认页面背景 |
| `--iflyv-bg-page-white` | gray-0 (白) | gray-0 | 白底页面 |
| `--iflyv-bg-panel` | gray-0 (白) | gray-1 | 卡片/面板 |
| `--iflyv-bg-inset` | gray-1 (灰) | gray-2 | 嵌套区域 |

**迁移**：
- 如果现有代码中有 `background: #fff` 或 `background: var(--iflyv-gray-0)` 用于页面背景，替换为 `var(--iflyv-bg-page-white)`
- 如果用 `var(--iflyv-bg-page)` 且页面背景确实是灰色，无需修改

---

### 文档更新

- `references/foundations.md`：字体使用规则重写，新增行高选择指南、字号-行高配对表、背景色速查表
- 禁止事项调整：硬编码字号的规则从"必须使用语义化字体变量"改为"必须使用 `--iflyv-font-size-*` 或语义组合变量"
