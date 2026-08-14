---
author: myjin2
updated: 2026-05-10
---

# design-spec/examples/

> # ⚠️ 本目录已停止维护，不再是规范来源
>
> **写代码时一律以 `references/` 为准**，不要参照本目录的示例代码。
>
> 本目录是设计系统早期的产物，其中相当一部分写法已被后来的规则取代（如 `.btn-icon-square`、`<el-button link>`、`size` 三档、`label-position="top"`、固定 `label-width`、表格「更多」的文字形态等**均已停用或改判**）。照抄这里的代码会写出**违反当前规范**的实现。
>
> 其中仍然成立的规则、判据与坑位说明，**已于 2026-08 全部回流至 `references/`**：
>
> | 原内容 | 现在去哪读 |
> |---|---|
> | 按钮类型 / 图标 / 间距 / 纯图标形态 | `references/component-interaction.md`（按钮各段） |
> | 表单布局 / 校验 / 操作区 / inline 横排表单 | `references/patterns/form-pattern.md` |
> | 表格四区拼装 / 操作列 / 冻结 / 列宽决策 | `references/patterns/list-item-pattern.md` |
> | 弹窗载体判据 / 宽度三档 / 异步锁关闭路径 | `references/patterns/dialog-pattern.md` + `component-interaction.md`（Dialog 段） |
> | 选择控件选型 / clearable / 远程搜索 / Cascader | `references/patterns/select-pattern.md` |
>
> **反模式优先级定义（BLOCKING / STRONG / SOFT）的正本在 `references/component-interaction.md` 开头**，本目录只是曾经的引用方。
>
> 保留本目录仅为历史追溯。**新增规则不要写到这里**——写进 `references/` 对应文件，并按 `design-spec/CLAUDE.md` 的「任务→必读」表补触发行。

## 历史内容索引（仅供追溯，勿照抄）

| 文件 | 曾涵盖内容 |
|------|---------|
| `button.examples.vue` | 类型 / 图标 / 纯图标方形 / 文字链接 / 加载禁用 / 间距 / 尺寸 |
| `form.examples.vue` | label-position / 必填校验 / 表单按钮 / inline 表单 / 尺寸 |
| `table.examples.vue` | 基础表格 / 排序 / 操作列 / 多选 / 固定列 / 加载态 / 列宽决策 |
| `dialog.examples.vue` | 宽度三档 / 确认对话框 / 危险操作 / 异步 + loading / 4 语义化变体 / 嵌套表单 |
| `select.examples.vue` | 单选 / 多选三件套 / 远程搜索 / 选项分组 / Cascader / 尺寸 |

## 变体类速查（写代码前先确认自己用对了）

> 速查表只列结论；为什么这么用、踩坑案例见对应 `*.examples.vue`。

**el-dialog 语义化变体类**（容器加 `class="is-*"`）：

| 变体类 | 适用场景 | 主按钮 type |
|---|---|---|
| `is-warning` | 警示但可逆（离开未保存、配额接近上限、操作可回滚） | `primary` |
| `is-danger` | 危险且不可逆（删除、清除、永久禁用） | `danger` |
| `is-success` | 复杂流程完结反馈（批量操作完成汇总） | `primary` |
| `is-info` | 中性信息（版本更新、功能说明、引导） | `primary` |

- 危险/警示场景 → 用 `el-dialog + is-*` 变体类，**禁止**：手撸 `<div>` + lucide 图标、用 `<el-alert>` 替代、用 `ElMessageBox.confirm`
- 详见 `dialog.examples.vue` 第 5 节「语义化标题」

**el-button type**（仅这 3 种）：

| type | 用途 |
|---|---|
| `primary` | 主操作（提交、确认、保存） |
| `danger` | 危险操作（删除、清除） |
| `default` | 次要操作（取消、关闭、辅助） |

- **禁止** `success` / `warning` / `info`——颜色语义由变体类/外层组件承担，不污染按钮
- 详见 `button.examples.vue`

**el-tag**：详见 `references/component-interaction.md` 的 tag 章节（type + effect 组合）。

## 怎么用

1. **写代码前先翻对应 example**——examples 是 EP 组件的**范式权威**，照搬里面的变体类 / 按钮 type / 插槽用法
2. **先读文件顶部的反模式总表**——避免最常见的踩坑
3. **example 没覆盖的边缘场景再回查 `design-spec/references/component-interaction.md`**——references 是规则细节兜底，不是首查入口
4. **复制对应 section 到自己的项目**——不要整体 `import` 当组件库

## 反模式优先级

每个 ❌ 反模式都带 `[BLOCKING] / [STRONG] / [SOFT]` 优先级标签：

- **BLOCKING**：lint / CR 应严格阻断（名单越界、功能断裂、a11y 直接破坏）
- **STRONG**：发现后应立即修复（视觉 bug、隐式依赖被破坏）
- **SOFT**：纳入下一轮代码改进，不阻塞发布

完整判定标准见 `references/component-interaction.md` 顶部「反模式优先级判定」节。

## 与 demo/ 的关系

| 目录 | 职责 | 受众 |
|------|------|------|
| `design-system/demo/src/components/*Demo.vue` | **视觉展示**（演示组件能力的全谱） | 设计师 / 产品 |
| `design-spec/examples/*.examples.vue`（本目录） | **用法指南**（教授规范化用法 + 反模式警示） | 使用方工程师 / AI |

两者职责互补，不是替代关系。

## 标签 schema 速查

文件中的注释统一使用以下标签：

| 标签 | 用途 |
|------|------|
| `@depends-on:` | 依赖什么前提（DOM / 兄弟元素 / 使用方式） |
| `@when-changed:` | 前提变了需要做什么 |
| `@anti-pattern:` | 反模式描述（仅在 examples 中使用） |
| `@priority:` | 反模式优先级 `BLOCKING` / `STRONG` / `SOFT` |
| `@see:` | 跨文件交叉引用（用语义锚点不用行号） |
