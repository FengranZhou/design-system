---
updated: 2026-04-16
---

# 实现审查检查清单

<!-- 本文件配合 impl-review 三层审查使用 -->
<!-- Token 层和组件层已自动检测硬编码值和原生标签，无需在此重复 -->
<!--                                                              -->
<!-- 规则前缀说明：                                                -->
<!--   无前缀  = 额外检查（自动层未覆盖的规则）                    -->
<!--   [允许]  = 压制自动层的某条结果（项目级例外）                 -->
<!--                                                              -->
<!-- 取消注释需要的规则，或直接添加项目特有规则                     -->

## 样式规范

<!-- - 禁止使用纯黑 #000 / #000000 -->
<!-- - 卡片组件不加 box-shadow -->
<!-- - 渐变色必须使用 token 定义的渐变变量 -->
<!-- - [允许] 硬编码 #ffffff（品牌白） -->
- [允许] 硬编码 0 / 0px（零值无需 token 化）
- [允许] 第三方图表库配置中硬编码颜色（ECharts、D3 等需从 CSS 变量读取后传入）
- [允许] 富文本编辑器内容区域硬编码颜色（内容需跨平台导出）
- [允许] Canvas 绘图中硬编码颜色（需从 CSS 变量读取后传入）
- [允许] SVG 内联样式硬编码颜色（需导出或独立使用）
- [允许] Markdown 渲染内容中硬编码颜色（用户输入内容）
- 半透明背景必须配合 `backdrop-filter: blur()` 使用
- 可交互元素（非 disabled）必须设置 `cursor: pointer`
- disabled 状态必须设置 `cursor: not-allowed`
- 可交互元素 `:hover` 状态必须有显性样式变化（背景色/文字色/边框/阴影等）
- 所有 `var()` 引用的 CSS 变量必须有对应定义（禁止引用不存在的变量）
- [允许] 项目中存在设计规范之外的自定义 token（兼容老项目代码）

## 组件规范

<!-- - 所有表单必须设置 label-width -->
<!-- - 弹窗标题必须使用 slot="title" -->
<!-- - [允许] 使用原生 <img>（markdown 渲染区域） -->
<!-- - [允许] 使用原生 <table>（纯静态展示场景） -->
- 【单一数据源】禁止在使用方（demo / 页面 / 业务组件）的 `<style scoped>` 或 `:deep()` 中覆盖 `el-*` 组件的外观类属性（字号/字重/颜色/边框/圆角/选中态/装饰/溢出等）——组件外观只允许定义在 `el-theme/components/<组件>.scss` 全局层。使用方一律通过约定 class 或裸 EP 组件引用全局标准。
- [允许] 使用方 scoped `:deep()` 仅调整"本页排版留白"（如某演示块的 `margin` 间距），不触碰组件外观规则
- 禁止使用 el-message-box / ElMessageBox.confirm / ElMessageBox.alert，改用 el-dialog
- 禁止用 `<el-alert>` 实现确认 / 警示 / 删除确认等场景——el-alert 仅用于页面内常驻提示条，凡需要用户决策的弹层一律用 el-dialog
- el-dialog 的警示装饰（图标、强调标题样式）必须通过添加 `class="is-warning"` / `"is-danger"` / `"is-success"` / `"is-info"` 实现，**禁止**在 dialog 内部用原生 `<div>` + lucide 图标手撸警示头
- el-dialog 变体类必须与主按钮 type 语义匹配：`is-danger` → `type="danger"`；`is-warning` / `is-success` / `is-info` → `type="primary"`
- [允许] 使用原生 `<div>` + 样式（替代 el-card）
- [允许] 使用原生 `<img>`（替代 el-image）
- [允许] 使用原生轮播实现或第三方库（替代 el-carousel）
- [允许] 使用原生日历实现（替代 el-calendar）
- [允许] 使用 CSS `position: sticky`（替代 el-affix）
- [允许] 使用原生水印实现（替代 el-watermark）
- [允许] 使用原生时间线布局（替代 el-timeline）
- [允许] 使用原生描述列表 `<dl>`（替代 el-descriptions）
- [允许] 使用原生结果页布局（替代 el-result）
- [允许] 使用原生页头布局（替代 el-page-header）
- [允许] 使用原生引导实现（替代 el-tour）
- `el-button` 的 icon 必须使用插槽方式插入
- `el-empty` 必须同时传两样：设计系统插画（`:image` 属性，import `el-theme/assets/empty/` 下 8 张场景图之一）+ 档位 class（整页 `empty-page` / 区块 `empty-block`）；缺任一即落回 EP 默认纸盒图
- `text-overflow: ellipsis` 的文字必须配套 tooltip 组件
- 禁止使用 `el-button` 的 `type="success"` / `"warning"` / `"info"`，仅允许 `default` / `primary` / `danger`
- 禁止使用 `el-button` 的 `circle` 属性；纯图标入口用 `<el-button text>` + `#icon` 插槽（`.btn-icon-square` 已暂停启用，写了不生效）
- 禁止使用 `el-input` / `el-select` 的 `:prefix-icon` / `:suffix-icon` 属性，改用 `#prefix` / `#suffix` 插槽
- 禁止使用 `el-table` 的 `stripe` 属性

## 布局规范

<!-- - button 组不能同时使用 gap 和 margin -->
<!-- - flex 布局必须设置 gap 而非 margin -->
<!-- - 栅格系统必须使用 el-row 和 el-col -->
- flex 布局子项使用 margin 间距时，最后一项对应方向的 margin 必须为 0
- 多个 button 连续排列时，外层容器必须使用 `gap: var(--iflyv-spacing-3)` 分隔

## 自定义规则

<!-- 在这里添加项目特有规则 -->
<!-- - 示例：所有图标必须使用 iconfont -->
<!-- - 示例：按钮文字不超过 4 个字 -->
<!-- - 示例：[允许] SVG 内硬编码字号 -->
- 禁止使用 emoji，统一使用 lucide icon 替代
- [允许] 使用 iconfont、svg icon、切图 icon
