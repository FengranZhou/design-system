# 选择控件选型模式 (Select / Radio Pattern)

> 设计模式层规则。接到「从固定选项里选一个 / 加单选 / 加下拉选择器 / 筛选下拉 / 类型选择」任务时，**动手前必读本文件**。先按「零、先选控件」定用 Radio 还是 Select，再（若是 Select）按「选型判据」定 `clearable`、按「强制做法」落地、避开「反例」、套用「可照抄骨架」。读之前不要凭直觉一律用下拉、也不要一律给 clearable。
>
> 控件用 Element Plus 原生 `el-radio` / `el-select`（外观分别归 `el-theme/components/radio.scss`、`select.scss` 源头）。

---

## 零、先选控件：Radio 还是 Select（比"怎么配"更靠前的一步）

"从固定选项里选一个"有两种控件。**判据是单向的，不是"≤5 就必须 Radio"**：

| 选项数 | Radio 单选（`el-radio`） | Select 下拉（`el-select`） |
|---|---|---|
| **≤ 5** | **可以用**（推荐场景：需要让用户**并排比较**着选——Radio 所有选项默认可见，一眼看全、直接点） | **也可以用**（版面紧张、或不需要并排比较时，收进下拉更省空间） |
| **> 5** | **不建议用**（选项太多铺开占满版面、比较成本反而上升） | **推荐用**（收进下拉省空间，配 `filterable` 可搜索） |

> 核心是一条**硬约束 + 一条软倾向**：
> - **硬约束**：**选项 > 5 不建议用 Radio**（铺开成本高）→ 用 Select。
> - **软倾向**：选项 ≤ 5 且**需要并排比较**时，Radio 体验更好（全可见、免展开）；但 ≤5 **不等于必须 Radio**——版面紧或无需比较，用 Select 同样合理。
>
> 判断入口：先看"选项是不是 >5？" 是 → 别用 Radio，走 Select；否则再看"需要并排比较吗、版面够吗？" 需要且够 → Radio 更好，否则 Select 也行。（与源头 `radio.scss` 顶部选型注释同一口径。）
>
> 定完控件后：用 Radio 的，外观全走 `radio.scss` 源头、无额外配置判断；用 Select 的，继续往下看「clearable / filterable 怎么定」。

### 用 Radio 时：默认用基础 radio，不默认用 radio-button（切换按钮组）

Radio 有两种形态：**基础 radio（`el-radio`）是默认形态**，绝大多数"从固定选项里选一个"都用它；**切换按钮组（`el-radio-button`）一般不默认使用，仅当下游明确要求用它时才用**。

### 选项自带图标、要并排比较 → 用业务组件 OptionCard（卡片单选）

上面两种形态都**没有承载图标的位置**。当每个选项自带一个图形标识（题型图标、模板缩略、场景图示），且需要并排比较时，用业务组件 **`OptionCard`**——每项是一块独立卡片（白底 + 描边 + 圆角），按网格铺开、可换行。<!-- @rule id=option-card-for-icon-radio level=MUST cat=组件选用 view=impl detect=regex dtitle=带图标的单选选项应做成卡片块，不要把图标塞进单选圆点后面 title=选项自带图标的单选一律用业务组件 OptionCard，禁手拼 div 网格或把图标硬塞进 el-radio 的 label -->

```vue
<el-form-item label="题型" prop="type">
  <OptionCard v-model="form.type" :options="QUESTION_TYPES" />
</el-form-item>

<script setup lang="ts">
import { OptionCard, type OptionCardItem } from '<path>/design-spec/components'
import iconSingle from '…/single.png'
const QUESTION_TYPES: OptionCardItem[] = [
  { value: 'single', label: '单选题', icon: iconSingle },
  // …
]
</script>
```

**三形态一句话分工**：

| 形态 | 用在 |
|---|---|
| `el-radio` 基础单选 | 默认形态。纯文字选项、≤5 项、需并排比较 |
| `el-radio-button` 切换按钮组 | 首尾相连的紧凑分段条。一般不默认使用，下游明确要求才用 |
| **`OptionCard` 卡片单选** | **选项自带图标、每块独立成卡、可换行成网格** |

- **仅限单选**：一次只有一项被选中。要多选仍用 `el-checkbox-group` 标准勾选框形态，**不要拿 OptionCard 冒充多选**。<!-- @rule id=option-card-single-only level=MUST cat=组件选用 view=impl detect=manual dtitle=卡片单选只能单选，多选场景请用标准多选框 title=OptionCard 仅用于单选，多选场景一律用 el-checkbox-group，不得用本组件冒充 -->
- **列数用 `:columns`**（默认 3）：卡片按列**等分填充容器**、不写死宽度，选项多于列数时自动折行。**禁在使用方用 `:deep()` 覆盖 `.option-card-group` / `.option-card` 的宽度、排布或其它外观**。<!-- @rule id=option-card-columns-prop level=MUST cat=组件用法 view=impl detect=regex dtitle=卡片单选的列数请用组件自带的列数配置，不要在页面里另写网格或定死宽度 title=OptionCard 列数一律用 :columns 属性（卡片按列等分填充容器、自动折行），禁在使用方用 :deep 覆盖 .option-card-group / .option-card 的宽度、排布或外观 -->
- **再次点击已选中项即取消选中**，`v-model` 回到空串 `''`——单选场景里"选错了想清空"很常见，没有这条用户只能改选别项、退不回未选状态。该字段若必填，取消后表单校验正常报"未选择"，是预期行为。
- **选中态只换描边为品牌色，底与文字都不变**（选中由描边指示，同 `radio.scss`「选中由圆点指示，文字不变色」的口径）——底填品牌色会造成大面积绿，违反设计原则 3。已固化在源头，使用方不覆盖。

### 选项数量的上限侧：什么时候要分组、什么时候必须换 SelectV2

上面的 `>5 用 Select` 只管下限。**选项继续变多时还有两道坎**：

| 选项数 | 做法 |
|---|---|
| ≤ 10 | 平铺即可，不必分组 |
| 10 ~ 200 | 能按语义归类就用 `el-option-group` 分组（抬头口径见 `component-interaction.md` Dropdown 分组段），配 `filterable` |
| **> 200** | **必须换 `el-select-v2`**（虚拟滚动） <!-- @rule id=select-v2-over-200 level=MUST cat=组件选用 view=impl detect=manual title=选项超过 200 必须换 el-select-v2（虚拟滚动），否则首次展开卡顿 -->——`el-select` 会把全部选项渲染成真实 DOM，200+ 时首次展开明显卡顿 |

> **`el-select-v2` 的外观不用额外做任何事**：它与 `el-select` **复用同一套 class**（`.el-select__wrapper` / `.el-select-dropdown__item` 等），源头 `select.scss` 的覆盖自动生效，观感与普通 Select 一致。
> **差异只在数据接口**：选项不用 `<el-option>` 子标签，改为 `:options="[{ label, value }]"` 数组传入；`filterable` / `multiple` / `collapse-tags` 等 prop 用法不变。

### 有真实父子层级时才用 Cascader

**判据是数据里有没有真实的层级关系**，不是"选项多"：

- ✅ 用 `el-cascader`：地区（省/市/区）、组织架构（学院/系/教研室）、品类目录——**父子关系是数据固有的**。
- ❌ 不用：扁平数据硬拆成两级（如"类型"和"状态"塞成级联）——只会让选择路径无谓变长，用两个并列的 `el-select` 更直接。

> 外观（节点高度、箭头/对勾图标、`filterable` 空态面板宽度）全在源头 `el-theme/components/cascader.scss`，使用方不覆盖。⚠️ **不要给 `.el-cascader-menu` 自设 `min-width`**——源头已用 `:has` 为空态面板撑到 280px，再自设会让多级面板宽度叠加、溢出被裁切。

---

## 一、何时用（触发条件）

命中以下任一，即用本模式：

- 页面里要放一个**下拉选择 / 类型选择 / 状态筛选**入口。
- 列表 / 表格顶部要加**按某个维度筛选**的下拉。
- 表单里一个字段需要**从固定选项里选一个**。

---

## 二、选型判据（最关键的一步：先定「可清除」）

「可清除」的前提是 **「空状态本身是一个合法、有意义的状态」**。据此分两种场景，**不要凭感觉或为了统一一律加/一律不加**：

| 场景 | 特征 | clearable | 为什么 |
|---|---|---|---|
| **有默认语义项** | 下拉自带一个有语义的默认值、初始即选中（如「全部类型」「全部状态」——本身表达"不筛选/全部"） | **不可清除**（`clearable=false`） | 清空后变空，反而丢了「全部」这个语义。没有任何值能表达的空状态是无意义的——总得是某个类型或"全部" |
| **无默认值 + 外部标签** | 选择器初始为空，靠旁边的 label（如「类型：[下拉]」）说明它是什么；空 = "还没选" | **可清除**（`clearable=true`） | 清空 = 回到"未选择"状态，语义完整合法，用户需要能撤销选择 |

> **判断入口**：动手前先问自己一句——"这个下拉清空以后，那个空状态用户能看懂、是合法的吗？" 空是合法的"未选" → 可清除；空会丢语义（本该有个默认值兜底）→ 不可清除。

### 可搜索（filterable）

- 选项**较多**（一屏放不下、需滚动找）→ 开 `filterable`，让用户输入关键词过滤。
- 选项**很少**（3~5 个一眼看全）→ 不必开，避免多余的输入交互。

> ⚠️ **`filterable` 默认只匹配 `label` 文本，搜不到 `value`**。业务常需要按编码搜（工号、部门 ID、订单号），此时必须自定义 `filter-method`：
> ```ts
> const filterByLabelOrValue = (q: string) => {
>   keyword.value = q   // 配合 :filter-method 与 v-for 里的过滤条件使用
> }
> ```
> 或直接把编码拼进 `label`（如「张三（10086）」），两种做法二选一——**不写就会出现"用户输入工号却搜不到人"**。

### 远程搜索（remote）

选项来自后端、数据量大到不适合一次性拉全时用 `remote` + `remote-method`。**两条不写必出问题**：

1. **`remote-method` 必须节流（300~500ms）+ 取消上一次请求**。不做的后果不只是请求多：用户连打三个字会发三次请求，**先发的可能后到**，把最新查询的结果覆盖掉（race condition）——用户看到的是上一次的候选项。
2. **必须绑 `:loading`**。不绑时，"正在请求"和"确实没有匹配项"都表现为空面板，用户分不清该等还是该改词。

```vue
<el-select
  v-model="userId"
  remote
  filterable
  :remote-method="onSearch"
  :loading="loading"
  placeholder="输入姓名搜索"
>
  <el-option v-for="u in options" :key="u.id" :label="u.name" :value="u.id" />
</el-select>
```

---

## 三、强制做法

### 1. 按判据定 clearable，不要一刀切

- 有默认语义项（「全部类型」等）：**不加** `clearable`，且给一个默认选中值。
- 无默认值、靠外部标签：**加** `clearable`，`v-model` 初始为空。

### 2. 可搜索按选项数量定

- 选项多 → `filterable`；选项少 → 省略。

### 3. placeholder 与默认值二选一，不并存

- 有默认语义项时：`v-model` 有初始值，看不到 placeholder（本就该显示「全部类型」）。
- 无默认值时：`v-model` 为空，靠 placeholder（如「请选择」）+ 外部 label 说明。

### 4. 选项 `value` 必须唯一

同一组选项里 `value` 重复 → Vue 同 key 冲突 → 下拉项渲染错乱（重复项闪烁或消失），且**选中态映射出错**（选 A 高亮到 B）。数据来自后端时尤其要确认唯一性，别拿"名称"当 value（重名很常见），用 ID。

---

## 四、反例（禁止）

- ❌ **给带「全部类型」等默认语义项的下拉加 clearable** —— 用户一清空就变成无意义的空，丢了"全部"语义。
- ❌ **给"未选=合法"的下拉不加 clearable** —— 用户选错了无法撤销回未选状态。
- ❌ **凭"统一"给所有下拉一律加或一律不加 clearable** —— clearable 是按空状态语义决定的，不是统一开关。
- ❌ **在使用方 scoped 里覆盖 select 外观**（`:deep(.el-select ...)` 改字号/边框/圆角等）—— 外观归 `el-theme/components/select.scss` 源头，手写即私货、不同步。
- ❌ **`remote-method` 不做节流** —— 连打三个字发三次请求，先发后到会用旧结果覆盖新结果（race condition），用户看到的候选项对不上输入。
- ❌ **远程搜索不绑 `:loading`** —— "正在加载"与"确实没有"都显示空面板，用户不知道该等还是该改词。
- ❌ **选项超过 200 仍用 `el-select`** —— 全量渲染真实 DOM，首次展开卡顿；应换 `el-select-v2`。
- ❌ **扁平数据硬套 Cascader** —— 没有真实父子关系时，级联只是把一步选择拆成多步。
- ❌ **拿「名称」当 `value`** —— 重名时选中态会映射到错误项，用 ID。

---

## 五、可照抄骨架

```vue
<template>
  <!-- 场景 A：有默认语义项「全部类型」→ 不可清除，给默认值 -->
  <el-select v-model="typeFilter" placeholder="全部类型">
    <el-option label="全部类型" value="all" />
    <el-option label="课程" value="course" />
    <el-option label="作业" value="homework" />
  </el-select>

  <!-- 场景 B：无默认值 + 外部标签 → 可清除，初始为空 -->
  <span>类型</span>
  <el-select v-model="type" clearable placeholder="请选择">
    <el-option label="课程" value="course" />
    <el-option label="作业" value="homework" />
  </el-select>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const typeFilter = ref('all')  // 场景 A：默认「全部类型」，不可清除
const type = ref('')            // 场景 B：初始空，可清除
</script>
```

> 照抄要点：**先按「空状态是否合法」定 clearable**——有默认语义项（`all`/`'全部'`）→ 不加 clearable + 给默认值；无默认值 + 外部标签 → 加 clearable + 初始空。可搜索按选项数量决定是否加 `filterable`。外观一概不手写，全由 `el-theme` 源头保证。
