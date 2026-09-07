# 操作载体选型模式 (Dialog Pattern)

> 设计模式层规则。接到「做一个操作/填写入口，要不要用弹窗」「弹窗 vs 页面 vs 抽屉怎么选」任务时，**动手前必读本文件**，先按「选型判据」定用哪种载体、再按「强制做法」落地、避开「反例」、直接套用「可照抄骨架」。读之前不要凭直觉一律弹窗或一律跳页。
>
> 弹窗用 Element Plus 原生 `el-dialog`（外观归 `el-theme/components/dialog.scss` 源头）。**这一层解决的不是"弹窗长什么样"，而是"这个操作到底该不该装进弹窗"**——同一个"填写/操作"需求，装错载体（该跳页的塞进弹窗、该弹窗的却整页跳转）是最常见的组织错误。

---

## 一、何时用（触发条件）

命中以下任一，即用本模式先做载体选型：

- 要做一个**表单填写 / 操作确认 / 信息编辑**入口，纠结"是弹窗，还是跳到新页面，还是拉个抽屉"。
- 一条列表/表格记录的**编辑、新建、详情**要在哪里承载。
- 一个**危险操作**（删除、离开未保存）需要用户二次确认。

> 反过来：**只要是"要不要开一个浮层来装这次操作"的判断，就先走本模式的判据，不要凭手感直接 `el-dialog`。**

---

## 二、选型判据（最关键的一步：先定「用哪种载体」）

**操作弹窗是"在弹窗内进行表单填写等操作行为的载体"。** 它的适用边界由下面四个维度共同决定——**四条越都成立，越该用弹窗；越都不成立，越该跳页面**：

| 维度 | 偏向弹窗（✔ 用 Dialog） | 偏向页面 / 抽屉（✘ 不用 Dialog） |
|---|---|---|
| **信息量** | 更少（1~3 个字段 / 一段确认文案 / 单列中等表单） | 更多（多分区、长表单、内嵌大表格、需要滚动的富内容） |
| **信息关联度** | 更高（这次操作的字段自成闭环，和背景页无需并看） | 更低（要一边看列表/详情一边填，字段散在多个区块） |
| **任务连贯性** | 更弱（一次性、即开即走，做完就关，不承接上下步） | 更强（是一条多步流程里的一环，前后要串联、可返回） |
| **页面遮挡** | 更多可接受（操作本身就该聚焦，遮住背景无妨、甚至需要用遮罩把注意力收拢） | 遮挡代价高（用户需要持续参照背景内容，一遮就断了上下文） |

> **判断入口**：动手前先把这次操作往这四条上套一遍——
> - 四条大多命中"偏向弹窗" → **用 `el-dialog`**。典型：确认删除、单字段重命名、一个中等新建/编辑表单。
> - 信息量大 / 要和背景并看 / 是流程中的一环 → **别用弹窗**：整页表单跳**独立页面**；需要保留背景上下文、边看边填的长表单用**抽屉 `el-drawer`**（侧滑、不完全遮挡）。

### 载体三选一速查

| 载体 | 什么时候 | EP 组件 |
|---|---|---|
| **弹窗 Dialog** | 信息少、关联度高、一次性、可接受遮挡的聚焦操作 | `el-dialog` |
| **抽屉 Drawer** | 信息中等偏多、需保留背景上下文边看边填、侧滑不打断 | `el-drawer` |
| **独立页面** | 信息量大、多分区/长流程、任务连贯性强、遮挡代价高 | 路由页 |

---

## 三、强制做法

### 1. 先按四维判据定载体，再动手

- 命中弹窗 → `el-dialog`；否则跳页面或用 `el-drawer`。**不要因为"弹窗最快"就把大表单/长流程硬塞进弹窗**（见反例）。

### 2. 弹窗宽度按「场景」选，不写魔法值

宽度从三档场景里选（与 `references/component-interaction.md` Dialog 宽度规范一致），下游也从这三档选：

| 场景 | 宽度 | 内容特征 |
|---|---|---|
| 确认 / 单字段 | 400px | 单列、1~3 项或纯文本 |
| 常规表单 | 640px | 单列多字段、中等信息量 |
| 复杂 / 富内容 | 800px | 内嵌表格 / 列表 / 穿梭选择、图文并排等**非表单富内容**。⚠️ **不含"双列表单"**——`form-pattern.md` §8① 规定表单**一律单列**（多列 Z 字动线易遗漏），字段多应先分组/分步，仍装不下就改抽屉 |

> 若一次操作连 800px 复杂档都装不下（多分区滚动） → 说明它已越过弹窗边界，回到判据、改跳页面。

### 3. 弹窗内表单不自带底部按钮，交给弹窗 footer

- 弹窗里的表单**本体只有标签区 + 输入区**，提交/取消由 `<template #footer>` 承载——见 `form-pattern.md` §7（表单承载容器＝弹窗时，不放表单底部按钮）。**主按钮在右**，`type="primary"`。
  > 这不是"弹窗特有的惯例"，而是**主按钮贴边原则**（见 `foundations.md`）的结果：footer 按钮组右对齐 → 主按钮贴右缘。页面级表单主按钮在左，是同一条规则在左对齐下的结果——**两者不矛盾，无需分别记忆**。

### 4. 危险 / 语义化确认用变体类，不引命令式 API

- 本设计系统**统一用 `el-dialog`**，不引 `ElMessageBox`。警示/危险/成功/信息四类确认加变体 class（`is-warning` / `is-danger` / `is-success` / `is-info`），详见 `component-interaction.md`「Dialog 语义化标题」。

---

## 四、反例（禁止）

- ❌ **把大表单 / 多分区 / 长流程硬塞进弹窗** —— 信息量、任务连贯性都偏"页面"，塞进弹窗后要内部滚动、遮住背景又断上下文。该跳独立页面。
- ❌ **需要边看背景边填的操作用全遮罩弹窗** —— 遮挡代价高的场景应改 `el-drawer`（侧滑保留背景），而非 Dialog。
- ❌ **凭"弹窗开发最快"一律 `el-dialog`** —— 载体是按四维判据选的，不是默认弹窗。
- ❌ **弹窗内表单又放一套底部提交按钮** <!-- @rule id=dialog-single-footer level=MUST cat=设计模式 detect=ast dtitle=弹窗里不应出现两排提交按钮 title=弹窗内表单不自带底部按钮，一律交给 #footer --> —— 与弹窗 footer 的按钮重复；提交/取消一律交给 `#footer`。
- ❌ **弹窗宽度手写任意 px**（如 `width="520px"`） <!-- @rule id=dialog-width-three-tiers level=MUST cat=设计模式 detect=regex dtitle=弹窗宽度只有窄/中/宽三档，不应出现非标准宽度 title=弹窗宽度只能取 400/640/800 三档，禁非档位宽度 -->—— 从 400 / 640 / 800 三档场景里选。
- ❌ **在使用方 scoped 里覆盖 dialog 外观**（`:deep(.el-dialog ...)` 改圆角/头部/间距等）—— 外观归 `el-theme/components/dialog.scss` 源头，手写即私货、不同步。

---

## 五、可照抄骨架

```vue
<template>
  <!-- 命中弹窗判据：确认/单字段/中等表单，一次性聚焦操作 -->
  <!-- 宽度按场景选：确认=400 / 常规表单=640 / 复杂双列=800 -->
  <!-- 含表单的弹窗必须 :close-on-click-modal="false"——误点遮罩会丢掉已填内容 -->
  <el-dialog
    v-model="visible"
    title="编辑用户"
    width="640px"
    :close-on-click-modal="false"
  >
    <!-- 弹窗内表单：只有标签区+输入区，label-width="auto"，按钮交给 footer -->
    <el-form :model="form" label-width="auto">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="部门" prop="dept">
        <el-select v-model="form.dept" placeholder="请选择部门" style="width: 100%;">
          <el-option label="设计部" value="design" />
        </el-select>
      </el-form-item>
    </el-form>
    <!-- footer 承载提交/取消：主按钮在右（按钮组右对齐 → 主按钮贴右缘，见 foundations 主按钮贴边原则） -->
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>

  <!-- 危险确认：加 is-danger 变体类，标题前自动出彩色图标 -->
  <el-dialog v-model="delVisible" class="is-danger" title="删除用户「张三」" width="400px">
    <p>此操作不可撤销，张三的所有数据将被永久删除。</p>
    <template #footer>
      <el-button @click="delVisible = false">取消</el-button>
      <el-button type="danger" @click="delVisible = false">确认删除</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const visible = ref(false)
const delVisible = ref(false)
const form = reactive({ name: '', dept: '' })
const onSubmit = () => { /* 校验后提交，走表单 formRef.validate() */ visible.value = false }
</script>
```

> 照抄要点：**先用四维判据（信息量 / 关联度 / 任务连贯性 / 页面遮挡）确认"该用弹窗"**——大表单/长流程跳页面、边看边填用 `el-drawer`。弹窗宽度从三档场景选；弹窗内表单不放底部按钮、交给 `#footer`（主按钮在右）；危险/语义确认加变体类。外观一概不手写，全由 `el-theme` 源头保证。
