# 表单布局模式 (Form Layout Pattern)

> 设计模式层规则。接到「做表单 / 录入界面 / 一组"标签+控件"的信息组织」任务时，**动手前必读本文件**，按「强制做法」执行、避开「反例」、直接套用「可照抄骨架」。读之前不要凭直觉自拟布局。
>
> 当前只提供**标签在左（label-left / label-width）**这一种布局。顶部标签（label-position="top"）暂不启用。

---

## 一、何时用（触发条件）

命中以下任一，即用本模式：

- 做**表单 / 录入界面 / 编辑弹窗里的字段区**。
- 出现**一组「字段名 + 输入控件」**需要纵向排列（如：用户名+输入框、部门+下拉、日期+选择器…）。
- 需要**校验**（必填、格式）的字段集合。

> 反过来：**只要是"标签配控件"的信息录入，就走 `el-form`，不要自己用 div/flex 拼。** 这是判断入口。

---

## 二、强制做法

### 1. 骨架：一律用 `el-form` + `el-form-item`，不手撸

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

- **单列表单整体宽度**：用 `max-width` 约束（如 `max-width: 500px`），避免输入框拉太宽。**优先用令牌或语义宽度**；若必须写具体值，集中在表单容器一处，不要散落每个控件。
- **输入类控件默认撑满输入区**（`el-input` / `el-select` / `el-date-picker` / `el-textarea` 设 `width: 100%`）——让各控件右缘对齐、观感整齐。
- **明确的短字段例外**：数字、验证码、金额、年龄等语义上就短的字段，按合理内容宽度即可，不必撑满。

### 6. 校验

- 规则集中写在一个 `rules` 对象里，字段 key 与 `prop` 对应。
- 每条规则含 `required` / 格式类型 + `message` + `trigger`（`blur` 用于输入类，`change` 用于选择类）。
- 提交按钮回调走 `formRef.value.validate()`；重置走 `formRef.value.resetFields()`。

### 7. 操作区（按钮组）—— 是否存在取决于承载容器【重要】

**操作区不是表单固定必有的**，按表单所在容器决定：

| 表单承载容器 | 操作按钮怎么放 |
|---|---|
| **页面里**（页面级表单） | 表单**底部有**操作区：放在最后一个 `<el-form-item label=" ">`（空 label 占位）内——`label-width="auto"` 下空占位使按钮组左缘对齐到输入区，而非顶到 label 列。 |
| **弹窗中**（`el-dialog` / `el-drawer`） | 表单**不放**底部按钮！由**弹窗自带的 footer** 承载提交/取消——否则会与弹窗按钮重复。 |

- **判断入口**：动手前先确认"这个表单在页面里还是弹窗里"。弹窗里 → 表单本体只有标签区+输入区，按钮交给 `<template #footer>`。
- 页面级操作区规则：**主按钮（提交）在左**，次按钮（取消/重置）在右；提交 `type="primary"`，次按钮用默认；间距由源头自带（12px）。
- 提交回调走 `formRef.value.validate()`；重置走 `formRef.value.resetFields()`（无论按钮在表单里还是弹窗 footer 里，校验都调表单的 `formRef`）。

---

## 三、反例（禁止）

- ❌ **用 `div + flex` 手拼「标签左 / 控件右」** —— 脱离 el-form，失去统一对齐、校验、间距，且各处各写、不同步。
- ❌ **在使用方 scoped 里写表单项 `margin` / label 间距 / 星号样式** —— 这些源头 `form.scss` 已统一，手写即"局部私货"，改源头它不动。
- ❌ **手写固定 `label-width` 数值**（如 `100px`）—— 易造成富余空白或不够宽，且换表单要重调。用 `label-width="auto"` 让其自动贴合本表单最长 label。
- ❌ **label 宽度在同一表单里不统一**（这项 80px、那项 120px）—— 必须全表单同一宽度（`auto` 已保证统一）。
- ❌ **散落的魔法宽度值**（每个控件写 `style="width:340px"` 等具体像素）—— 输入类用 `width:100%` 撑满（比例，允许），短字段用语义宽度；整体宽度约束集中在表单容器一处（`max-width`）。
- ❌ **手写红色星号 / 手写 label**（如 `<span style="color:red">*</span>用户名`）—— 用 `rules.required` 自动带。

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
