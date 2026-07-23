---
author: myjin2
updated: 2026-05-10
---

# design-spec/examples/

> **本目录是 EP 组件用法的范式入口。**
> 涉及 EP 组件的代码编写或改造，**动手前必须先翻对应 `*.examples.vue`**——里面已写明变体类、按钮 type 匹配、anti-pattern 优先级。直接照搬范式，不要按通用 EP 经验发明。
>
> 副条款：本目录是参考代码片段，不是可 import 的组件库——请复制需要的 section 到自己项目，不要整体 `import`。

## 这里是什么

`design-spec/examples/` 提供 5 个高频组件的「**范式权威**」——每个文件展示推荐写法 + 反模式对照，是使用方（人 + AI）写代码时的第一查阅入口。

| 文件 | 涵盖内容 |
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
