# 技术栈映射表 —— Element Plus ↔ antd 3

> **本文解决一个问题**：设计系统的规则正文以 Element Plus 写就（`<el-dialog>`、`:show-after="300"`…），
> 但接入方可能是 **React 16 + antd 3** 项目。下游 CC 若照抄 EP 组件名，会写出该项目根本没有的组件。
>
> **用法（下游 CC 必读）**：
> 1. 先确认本项目技术栈（见项目根 `CLAUDE.md` 的技术栈声明）
> 2. **Element Plus 项目** → 忽略本文件，直接按规范正文写
> 3. **antd 3 项目** → 规范正文里的**判据照用**，但**组件名与 prop 必须查本表换算**
>
> ---
>
> ## ⛔ 三条铁律（换栈不改变的部分）
>
> 1. **判据不变**——「≤5 且需并排比较用单选而非下拉」「弹窗宽度只有三档」「各 tab 数据必须无交集」
>    这类规则与技术栈无关，110 条规则里 73 条属于此类，**原样适用**。
> 2. **令牌不变**——两栈共用同一份 `design-token/`，颜色/间距/圆角/字阶完全一致。
> 3. **单一数据源不变**——组件外观只允许定义在适配层源头（`antd3-theme/components/*.less`），
>    **严禁在业务代码里写 scoped 私货覆盖组件外观**。
>
> ## ⚠️ 本表的可信度声明
>
> 标 ✅ 的条目**已在 antd 3.26.20 的类型定义/源码中核实**。
> 标 ❓ 的条目**尚未实测**，动手前请自行验证并回来更新本表。
> 未列出的组件 = **尚未适配**，直接使用会拿到 antd 原生观感（不报错、页面照跑、但完全脱离设计系统）。

---

## 一、组件名映射（总表）

| 语义 | Element Plus | antd 3 | 状态 |
|---|---|---|---|
| 按钮 | `<el-button>` | `<Button>` | ✅ 已适配 |
| 弹窗 | `<el-dialog>` | `<Modal>` | ❓ 未适配 |
| 抽屉 | `<el-drawer>` | `<Drawer>` | ❓ 未适配 |
| 文字提示 | `<el-tooltip>` | `<Tooltip>` | ❓ 未适配 |
| 下拉菜单 | `<el-dropdown>` | `<Dropdown>` | ❓ 未适配 |
| 选择器 | `<el-select>` | `<Select>` | ❓ 未适配 |
| 单选 | `<el-radio>` | `<Radio>` | ❓ 未适配 |
| 多选 | `<el-checkbox-group>` | `<Checkbox.Group>` | ❓ 未适配 |
| 开关 | `<el-switch>` | `<Switch>` | ❓ 未适配 |
| 滑块 | `<el-slider>` | `<Slider>` | ❓ 未适配 |
| 评分 | `<el-rate>` | `<Rate>` | ❓ 未适配 |
| 数字输入 | `<el-input-number>` | `<InputNumber>` | ❓ 未适配 |
| 输入框 | `<el-input>` | `<Input>` | ❓ 未适配 |
| 日期选择 | `<el-date-picker>` | `<DatePicker>` | ⛔ **API 级断裂**，见 §3 |
| 表单 | `<el-form>` + `<el-form-item>` | `<Form>` + `<Form.Item>` | ⛔ **API 级断裂**，见 §3 |
| 表格 | `<el-table>` + `<el-table-column>` | `<Table columns={[]}>` | ⛔ **API 级断裂**，见 §3 |
| 标签 | `<el-tag>` | `<Tag>` | ❓ 未适配 |
| 徽标 | `<el-badge>` | `<Badge>` | ❓ 未适配 |
| 空状态 | `<el-empty>` | `<Empty>` | ❓ 未适配 |
| 骨架屏 | `<el-skeleton>` | `<Skeleton>` | ❓ 未适配 |
| 结果页 | `<el-result>` | `<Result>` | ❓ 未适配 |
| 提示条 | `<el-alert>` | `<Alert>` | ❓ 未适配 |
| 轻提示 | `ElMessage` | `message` | ❓ 未适配 |
| 通知 | `ElNotification` | `notification` | ❓ 未适配 |
| 气泡确认 | `<el-popconfirm>` | `<Popconfirm>` | ❓ 未适配 |
| 描述列表 | `<el-descriptions>` | `<Descriptions>` | ❓ 未适配 |
| 分页 | `<el-pagination>` | `<Pagination>` | ❓ 未适配 |
| 标签页 | `<el-tabs>` | `<Tabs>` | ❓ 未适配 |
| 步骤条 | `<el-steps>` | `<Steps>` | ❓ 未适配 |
| 锚点 | `<el-anchor>` | `<Anchor>` | ❓ 未适配 |
| 面包屑 | `<el-breadcrumb>` | `<Breadcrumb>` | ❓ 未适配 |
| 级联选择 | `<el-cascader>` | `<Cascader>` | ❓ 未适配 |
| 加载 | `v-loading` 指令 | `<Spin>` 包裹 | ⚠️ **机制不同**，见 §2 |
| **滚动区** | `<el-scrollbar>` | **无对应组件** | ⛔ 见 §4 |

---

## 二、关键 prop 差异（**照抄会写错的地方**）

> 只覆盖设计系统 110 条规则中**已绑定 EP prop** 的那批。
> 全量 API 请查 antd 3 官方文档（https://3x.ant.design）。

### 2.1 单位/类型变了（最危险 —— 写了不报错，行为却错）

| 规则 | EP 写法 | antd 3 写法 | ⚠️ 陷阱 |
|---|---|---|---|
| tooltip 统一延迟 | `:show-after="300"` | `mouseEnterDelay={0.3}` | ✅ **单位是秒不是毫秒**！写 300 = 等 5 分钟 |
| 日期值格式 | `value-format="YYYY-MM-DD"` | **无此 prop** | ✅ v-model 拿到的是 **moment 对象**，须自行 `.format()` |

### 2.2 prop 改名

| 规则 | EP 写法 | antd 3 写法 | 核实 |
|---|---|---|---|
| Alert 主文案必须传 title | `title="文案"` | `message="文案"` | ✅ |
| Alert 副文案 | 默认插槽 | `description="文案"` | ✅ |
| Skeleton 必须开动画 | `animated` | `active` | ✅ |
| Rate 档位固定 5 星 | `:max="5"`（默认，勿改） | `count={5}`（默认，勿改） | ✅ |
| 弹窗显隐 | `v-model="visible"` | `visible={x}` + `onCancel` | ✅ |
| Empty 插画 | `:image="图片"` | `image={图片}` | ✅ |
| Empty 说明文字 | 默认插槽 | `description={...}` | ✅ |

### 2.3 prop 同名同义（可直接照抄）

| 规则 | 两栈写法 | 核实 |
|---|---|---|
| 分页不足一页不渲染 | `hide-on-single-page` / `hideOnSinglePage` | ✅ |
| 数字输入必传范围 | `:min` `:max` / `min` `max` | ✅ |
| 数字输入小数精度 | `:precision` / `precision` | ✅ |
| 描述列表加边框 | `border` / `bordered` | ✅ |
| 描述列表列数 | `:column` / `column` | ✅ |
| 评分半星 | `allow-half` / `allowHalf` | ✅ |
| 滑块区间 | `range` / `range` | ✅ |
| 滑块步长 | `:step` / `step` | ✅ |

### 2.4 能力缺失（antd 3 没有，需替代方案）

| 规则 | EP 能力 | antd 3 | 替代 |
|---|---|---|---|
| 滑块带数值输入 | `<el-slider show-input>` | **无** | 旁边拼 `<InputNumber>` 并自行联动 |
| Result 图标 | `icon="success"/"error"` | `status="success"/"error"` | ✅ 用 `status` |
| 选项 >200 虚拟滚动 | `el-select-v2` | **无独立组件** | Select 无虚拟滚动，需评估性能或换方案 |
| Message 关闭按钮 | `showClose: true` | **无此配置** | antd 3 的 message 无关闭按钮，靠 `duration` 自动消失 |

### 2.5 插槽 → prop / className

antd 3 极少用具名插槽，EP 的插槽多需换成 prop 或**约定 class**：

| EP 插槽 | antd 3 | 说明 |
|---|---|---|
| `<template #icon>` | `className="btn-icon"` | ✅ 适配层约定，见 `antd3-theme/components/button.less` 速查注释 |
| `#footer`（弹窗底部） | `footer={<>...</>}` | ✅ prop 传 ReactNode |
| `#dropdown`（下拉面板） | `overlay={<Menu>...</Menu>}` | ❓ 待适配时核实 |

### 2.6 适配层专属约定 class

antd 3 没有等价形态时，适配层新建了约定 class。**必须挂，漏挂不报错但样式全失效**：

| 形态 | EP 写法 | antd 3 写法 |
|---|---|---|
| 文本按钮 | `<el-button text>` | `<Button className="btn-text">` |
| 危险按钮 | `<el-button type="danger">` | `<Button className="btn-danger">` |
| 按钮图标 | `<template #icon>` | `<Icon className="btn-icon" />` |
| 下拉箭头 | `class="btn-caret"` | `className="btn-caret"`（同名） |
| 入口引导箭头 | `class="btn-entry"` | `className="btn-entry"`（同名） |

> **完整清单以各组件覆盖层顶部的「接入方速查」注释为准**——那里是唯一数据源。

---

## 三、⛔ API 级断裂（不是换个名字就行，需单独评估）

这三个组件的差异**超出样式范畴**，动手前必须单独评估并向设计负责人汇报：

| 组件 | 断裂点 |
|---|---|
| **DatePicker** | ✅ 值是 **moment 对象**，非字符串。EP 的 `value-format` 无对应物，所有取值处都要 `.format()`。整个项目依赖 moment.js。 |
| **Form** | ✅ antd 3 是 **`Form.create()` HOC + `getFieldDecorator`** 的老式写法，与 EP 的 `v-model` 双向绑定完全不同。表单校验、错误提示的组织方式都要重写。 |
| **Table** | ✅ 列定义是 **`columns` 配置数组**（EP 是 `<el-table-column>` 子组件）。排序用列配置里的 `sorter`（EP 是 `sortable`）。 |

**处置建议**：这三个很可能需要在调用方**封装一层转换组件**，而不是只写样式覆盖。
不要在没评估的情况下直接开工。

---

## 四、⛔ 无对应物：滚动区

设计系统有一条 MUST：**「内部滚动区一律用 `el-scrollbar`，禁在 div 上直接写 `overflow:auto`」**
（理由：原生滚动条 track 白底去不掉，且设 `::-webkit-scrollbar` 会让 Chrome 切成占位滚动条挤宽内容）。

**antd 3 没有 Scrollbar 组件。** 三个选项，需设计负责人决策：

1. 在适配层自建一个等价的滚动容器组件
2. 该规则在 antd3 栈上豁免，接受原生滚动条
3. 引入第三方滚动条库

**在决策前，遇到滚动区需求先停下来问，不要自行选择。**

---

## 五、维护纪律

- **本表是单一数据源**：新适配一个组件 → 立刻把该行从 ❓ 改成 ✅，并补上 prop 差异
- **实测才能标 ✅**：Button 的经验是「读源码会漏掉 JS 行为」，未在浏览器跑过的不要标 ✅
- **判据永远不进本表**：本表只管「叫什么、怎么传参」；「什么时候用哪个」永远在
  `design-spec/CLAUDE.md` 与 `references/`，两栈共用一份，**不得分叉**
