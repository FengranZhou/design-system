# 通用数字文案规范 (Number Copywriting)

> 文案规范层规则。接到「展示数量 / 统计数 / 金额 / 大数字」等任务时，**动手前必读本文件**：按「格式规则」定展示形态、用源头 `formatNumber` 落地、避开「反例」、直接套用「可照抄骨架」。
>
> 数字格式化有**唯一可执行实现** `design-spec/utils/format-number.ts`，任何展示通用数字的地方都 import 它，不各自重写、不硬编码带逗号的字符串——规范改一处、处处同步。

---

## 一、何时用（触发条件）

命中以下任一，即用本规范：

- KPI 指标条、数字大屏里的**统计数值**（访问热度、人次、总量…）。
- 列表 / 表格 / 详情页里的**数量、金额字段**。
- 任何"把一个数字展示给用户看"的场景（图表浮层 / 环形图图例已由 `Chart` 源头接好，调用方免处理）。

> 反过来：**只要是展示给用户看的数字，就走 `formatNumber`，不要打印裸值 `5082`，也不要手写 `5,082` 硬编码字符串。**

---

## 二、格式规则

| 规则 | 说明 | 例 |
|---|---|---|
| **千分位** | 整数部分**从右往左每 3 位打一个英文逗号** | `5082` → `5,082`；`1234567` → `1,234,567` |
| **小数** | 小数部分原样保留、不分组 | `12345.67` → `12,345.67` |
| **负号** | 保留在最前 | `-5082` → `-5,082` |
| **单位** | 单位不属于数字本体，由展示处拼接（数字与单位的字阶/颜色分层见 foundations 数字字阶） | `5,082 次` |

---

## 三、强制做法

### 一律 import 源头 `formatNumber`，不重写、不硬编码 <!-- @rule id=number-thousands-separator level=MUST cat=文案规范 view=impl detect=regex dtitle=数字千分位全站统一（从右往左每 3 位一个逗号） title=数字展示一律 import 源头 formatNumber 打千分位，禁各自写格式化/硬编码带逗号字符串 -->

```ts
import { formatNumber } from '<path>/design-spec/utils/format-number'

formatNumber(5082)        // → '5,082'
formatNumber(1234567.89)  // → '1,234,567.89'
formatNumber(-5082)       // → '-5,082'
formatNumber(325)         // → '325'（不足 4 位无逗号，直接传即可，无需自判）
```

- 分组 / 小数保留 / 负号 / 幂等（重复调用结果不变）全在 `formatNumber` 内处理好，**渲染处**只管传入原始数值。
- **图表内的数字免处理**：`Chart` 浮层数值与环形图图例数值已在源头调用 `formatNumber`，调用方传原始数据即可，**不要在数据层预先格式化**（字符串进坐标计算会出 NaN）。

---

## 四、反例（禁止）

- ❌ **打印裸值大数**（`{{ 5082 }}` 直接上屏）——四位以上没有分组，读数要逐位数。
- ❌ **硬编码带逗号字符串**（`value: '5,082'`）——脱离数据源，数值变了逗号不跟。
- ❌ **各自写一份 `toLocaleString()` / 正则**——分组规则散落，改规则漏一处；且 `toLocaleString` 受运行环境 locale 影响，不保证是逗号。
- ❌ **把格式化结果存回数据层**——带逗号的字符串参与计算/排序会静默出错。

---

## 五、可照抄骨架

```vue
<template>
  <!-- KPI 指标：数字走 formatNumber，单位单独拼（字阶分层见 foundations） -->
  <span class="kpi-num">{{ formatNumber(kpi.value) }}<em class="kpi-unit">{{ kpi.unit }}</em></span>

  <!-- 表格数量列：formatter 包一层，不直接打印原始值 -->
  <el-table :data="rows">
    <el-table-column prop="visits" label="访问量" :formatter="(_r, _c, v) => formatNumber(v)" />
  </el-table>
</template>

<script setup lang="ts">
import { formatNumber } from '<path>/design-spec/utils/format-number'
</script>
```
