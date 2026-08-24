# 复制到 CC 使用：从浏览器挑组件 → 粘进下游项目

在真实页面上选好位置、从组件库里挑一个组件填好配置，复制出一段 prompt，
粘贴进下游项目的 CC 窗口，组件就落在那个位置上。

---

## 两个入口，同一份数据

| 入口 | 在哪 | 用户手里有什么 | 产物 |
|---|---|---|---|
| **扩展面板** | 下游项目页面 `Alt+Shift+D` | 落点（打点截图）+ 填好的配置 | `buildPrompt` —— "在这个位置插入这个东西"的完整指令 |
| **demo 页按钮** | 规范展示页每个组件区块右上角「复制到 CC 去调用」 | 只有"我要用哪个组件" | `buildComponentRef` —— 组件标识块 |

两者都吃 `catalog.json`、都在 `build-prompt.mjs` 里拼装，**小节形态一致**
（可照抄骨架 / 硬约束 / 需要展开时读）—— 下游 CC 见到的是同一种结构。
改其中一个小节的写法，另一个要一起改。

### demo 页按钮怎么用

1. 在 demo 里找到要用的组件，点标题行右上角「复制到 CC 去调用」
   - 一个区块下挂着多个组件时（Input 系 / Select 系…）会先弹出来让你挑
2. 到下游项目的 CC 窗口，**先用自己的话说落点**，再粘贴：

   > 在标题的右侧增加一个 + `⌘V`

**配置项跟着走**：右侧配置卡拨到什么样，复制出去就是什么样。拨开 SearchMini 的
「默认收起」再复制，骨架里就带 `collapsed`，并多出一节写清楚你调了哪些。
**只有你真正改动过的项才写进去**——全默认时那一节整个不出现，免得下游 CC 把
出厂值也当成"特意指定的决定"、不敢按自己的场景调整。

**落点不带**，由你那句话给出（"在标题的右侧增加一个"）。

**代码在**：`demo/src/components/CopyToCC.vue`（按钮）+
`demo/src/utils/component-ref.ts`（吃 catalog）。

### 加新组件时要做什么

按钮本身**不用管**——它按 section 的 `id` 去 catalog 取，catalog 里有就自动出现。

**但如果这个组件有配置卡，要把配置卡的值传给它**：

```vue
<h2 class="demo-section__title">Xxx 组件
  <CopyToCC anchor="xxx" :values="configForm" />
</h2>
```

一个区块挂多个组件时（Input 系 / Select 系…）传 `{ 组件 id: 该组件的配置卡值 }`，
范本见 `InputDemo.vue` / `SelectDemo.vue` 末尾的 `copyValues`。

⚠️ **catalog 字段名与 demo 的 ref 名不一定同名**：demo 的 ref 按演示块加前缀避免
同页撞名（`groupMultiple` / `treeMultiple`），catalog 用的是每个组件各自的视角
（`multiple`）。两套命名各有各的道理，**在 `copyValues` 里对齐，别去改任何一边**。
传错名字不报错——那一项就是悄悄不生效。**`audit-spec.mjs` 的 C12 检查会把这两种
漏法都报出来**（没传 `:values` / key 对不上），不必靠人记得验。

---

## 怎么用

1. 在下游项目页面按 `Alt+Shift+D` 启动扩展面板
2. 切到 **「组件」** tab
3. 点 **「在页面上打点」** → 在页面任意位置点一下 → 出现蓝色圆点 ①
   - 打哪儿就标哪儿，不限于元素边界
   - `Esc` 取消
4. 从组件列表挑一个（可搜索）
5. 填配置——只问"必须当场决定"的几项（标签叫什么、宽度取哪档…）
6. **要在多处加东西就点「+ 继续打点」重复 3~5**
   - 点位列表里可以点条目回去改、点 × 删除，编号自动重排
   - 每个点在页面上显示编号 + 组件名，一眼看出哪里要加什么
7. 点 **「复制全部 N 处到 CC」** —— 逐点各截一张图（会自动滚到该点）
8. 回到该项目的 CC 窗口粘贴，一趟做完所有改动

> 也可以走**「清单」tab 的「复制到 CC 并清空」**——组件段会追加在
> Page Feedback（样式变更、评论）之后，一次交付本页全部改动。

---

## 前提：下游必须已接入本设计系统

粘贴出去的 prompt **不是完整规范**，是一段"定位 + 配置 + 骨架"的指令。
它能成立的前提是下游 CC 手上已经有整套规范——也就是下游项目根 `CLAUDE.md`
里那行 `@`：

```
@../xiaoya3.0设计规范/design-spec/CLAUDE.md
```

没加这行，下游 CC 拿到 prompt 也只会照抄骨架，不会遵守令牌纪律和模式规则。
详见 `design-spec/CLAUDE.md` 第 4 条「规则接入」。

---

## 数据怎么流到扩展

```
demo 导航（有哪些组件）  ─┐
demo 配置项卡片（形态开关）├─→ build-catalog.mjs → catalog.json → GitHub
component-catalog.mjs   ─┘                                          │
（snippet + mustRules）                                              ↓
                                            扩展打开面板时 fetch raw URL
```

| 数据 | 在哪 | 谁维护 |
|---|---|---|
| 组件清单 + 分组 | `demo/src/App.vue` 左侧导航 | 人（加组件必然会加导航） |
| 配置项开关 | `demo/src/components/*Demo.vue` | 人（写 demo 时自然产生） |
| snippet + mustRules | `scripts/component-catalog.mjs` | 人（机器提不出的语义） |
| **合成产物** | `scripts/catalog.json` | **脚本生成，勿手改** |

**扩展不再内联副本**——它每次打开面板都从 GitHub 拉最新的 `catalog.json`：

```
https://raw.githubusercontent.com/FengranZhou/design-system/main/scripts/catalog.json
```

这样**同事装了扩展就能用，不需要本地有这个仓库**（他们也不可能有）。
拉取走 background（扩展 host 权限，不受页面 CSP 约束），结果存 storage；
拉不到就用上次缓存，首次且无网络才提示失败。

> **catalog.json 由 pre-push hook 自动校验**——不一致会阻止推送并重新生成。
> 推了旧的，所有同事的面板就是旧的，而且没人会收到警告，所以不能靠人记得跑。

---

## catalog 每个条目在回答三个问题

```js
{
  id, name, group, desc, keywords,   // ① 是什么——面板怎么展示、怎么搜
  fields: [...],                      // ② 怎么配——配置表单有哪些字段
  readRefs: [...],                    // ③ 怎么落地——要读哪份规范
  mustRules: [...],                   //    不读也必须遵守的硬约束
  snippet: (values) => '...',         //    可照抄骨架
  snippetDefaults: {...},             //    snippet 的兜底取值（不是配置项，见下）
}
```

### snippetDefaults：不进面板，但骨架需要

`fields`（面板要问用户的）只取 demo 的形态开关，所以 `component-catalog.mjs`
里手写的 `instanceFields`（文案 / 类型 / 宽度…）**不进面板**——那是有意的，
这些让用户在需求描述里自己说更自然。

但 **snippet 仍然读这些 key**，它是按"全部配置都拿得到"写的。曾经的结果是
Button 渲染出 `type="undefined"`，Tag、Alert 同样：**不报错、粘到下游照样编译**
（Vue 只当它是字符串 `"undefined"`），只有逐字看生成的代码才能发现。

所以把 `instanceFields` 的默认值单独发出来。消费方调 snippet 前先铺一层：

```js
snippet({ ...snippetDefaults, ...用户填的值 })
```

`build-catalog.mjs` 生成时会**渲染一遍每个 snippet**，产物里出现
`undefined` / `NaN` 直接报错——与「配置项必须真的影响产物」防的是同一类
问题：**产物在说谎，而且没有任何信号**。

### 配置项必须真的影响产物

`build-catalog.mjs` 会检查**每个配置项的 key 是否出现在 snippet 里**，不出现就
报「不影响产物的配置项」。

**为什么这条比"缺配置项"更要紧**：开关开了、生成的代码却不变——用户会以为生效
了，而且只有对着代码逐字核对才能发现。配置界面说谎比少个开关糟得多。

修法两种：让 snippet 读这个 key，**或**确认该开关不属于插入场景（demo 演示用的
形态，如 SearchMini 的"默认收起"），加进 `EXCLUDE_FIELDS` 排除。
排除比硬接进 snippet 诚实——与其生成一段用户没要的代码，不如不问。

---

**`fields` 不是 EP 全量 props**，是"这个组件在真实业务里必须当场决定的那几项"。
多了是噪音（用户填不动），少了 CC 得猜。判据：**这个值 CC 能不能从规范推出来？**
能推出来的（如 `label-width="auto"`）不进 fields、写进 `mustRules`；
推不出来的（如 label 叫"专业"）才进 fields。

**`mustRules` 必须能在 `references/` 里找到出处**，且口径一致。它是规范的投影，
不是第二个源头。

### mustRules 为什么不会随源头漂移（以及唯一会漂的那部分）

mustRules 写的是**用法纪律和选型判据**，**刻意不复述源头的值**：

> 星色/尺寸**全在源头** rate.scss，禁在使用方改 `--el-rate-*` 变量

它没说星色是什么。所以你把星色从橙改成别的，这条规则**依然正确**——
这是有意的，规则层不抄具体值才不会过期。全部 135 条里提到圆角/颜色/字重/阴影
这类外观规格的**只有 1 条**，且是描述性的。

**唯一会漂的是它点名的约定 class**（`.dropdown-caret` / `.notify-actions` /
`.tab-badge`…）：源头改了类名或删了约定，规则里那个名字就指向不存在的东西，
下游照抄 → class 不生效 → **样式静默丢失，不报错、页面照跑**。
这类由 `audit-spec.mjs` 的 **C13 检查**兜底。

**数值档位不做自动比对**（drawer 400/600、dialog 400/640/800）——源头可能写成
裸值、变量或 prop 默认值，匹配不到时分不清是规则过期还是脚本没找着。
**一个经常误报的检查比没有更糟**：人会习惯性忽略它，连带真问题一起漏掉。
改这类档位时靠人同步。

---

## 多点：一次改造往往要动好几处

一次页面改造通常是「这儿加个筛选、那儿加个按钮、底下加个分页」，逐个复制粘贴
太碎。所以打点是**累加**的：每个点记住自己配的组件，最后一起复制。

- 打点标记同时挂 `data-liaison-modified="true"` —— 这是宿主 `buildOverviewItems()`
  扫描的属性，挂上它每个点就自动作为一条记录出现在「清单」tab，与样式变更、
  评论并列。**复用宿主整套渲染/清空/定位逻辑，不另造一套。**
- 因此清单「清空」会连带清掉页面标记。面板每次 render 前跑 `reconcilePins()`
  与页面对账，丢掉已失效的点——否则会留下"面板里还列着、页面上没有"的幽灵点。
- 多点复制时**每点各截一张图**（自动滚到该点、藏扩展 UI、截图、还原滚动位置）。
  不截全景：`captureVisibleTab` 只能拍可视区，滚动拼接容易在固定头部/懒加载处出错。

单点时 prompt 退化成原来的格式，不加"共 N 处"的噪音。

---

## 落点为什么只给截图

**曾经试过按 DOM 推断方位**（元素四边缘判 before/after/left/right、中心判
append），结论是**不好用**：用户要表达的落点往往不等于某个 DOM 元素的边——
"放在这个标题右边、和它同一行"在 DOM 上可能是插进另一个容器。方位判定越细，
越容易和意图错位，用户还得反过来揣摩工具的判定规则。

现在改为**只记坐标 + 截图**：

1. 页面上打一个蓝色圆点 ①（留在 DOM 里，截图时一并拍进去）
2. 复制时自动截当前可视区，存到下载目录
3. prompt 里写截图路径 + 打点处附近的文本作辅助线索

**为什么这样反而更准**：下游 CC 有完整代码库，看图知道大概位置后会回代码里
搜索验证——这正是用户在 CC 窗口"截图画个框说在这里加个东西"的既有习惯，
实践中准确率很高。比在浏览器侧硬推 DOM 语义可靠。

> 截图前会临时隐藏扩展面板（`liaison-app` 的 `visibility`），避免把工具 UI
> 拍进去挡住页面，截完立即恢复。

---

## 加一个新组件

1. demo 左侧导航加一行（这一步你本来就会做）
2. 在 `component-catalog.mjs` 加条目：`anchor`（=导航锚点）+ `snippet` + `mustRules`
   - **组件名、分组、配置项开关不用写**，脚本从导航和 demo 自动提
   - `mustRules` 直接抄 `design-spec/CLAUDE.md` 触发表该组件那行的说明列，别重写
3. 跑一次 `node scripts/build-catalog.mjs` —— 它会渲染每个 snippet，
   抛错、渲染出 `undefined` / `NaN`、配置项不影响产物，都会当场报出来

> **引号是最容易踩的坑**：模板属性用双引号包裹时，数组内字符串必须用单引号，
> 否则引号嵌套会让 Vue 编译崩（StepBar 的 `:steps` 踩过）。

漏补第 2 步不会报错——组件照样出现在面板里，只是 prompt 少一段代码骨架。
正因为**不报错**，`audit-spec.mjs` 的 **C9 检查**会把它报出来。

---

## 首次克隆后装 hook

```bash
./.githooks/install.sh
```

把 `.githooks/` 下的钩子软链进 `.git/hooks/`。**不用 `core.hooksPath`**——那会让
git 只认一处，绕过 `.git/hooks/pre-commit`（公司文件服务钩子）。软链只加不覆盖。

---

## 扩展侧怎么改

扩展没有构建流程，`bundle.min.js` 是手写的压缩风格代码。所以**新功能一律写成
独立文件**（本功能是 `design-system-ui.js`），只在 bundle 里加挂载点——
沿用 `asset-library-ui.js` 立的规矩。

bundle 里的改动点共 5 处（都做过"恰好命中 1 次"断言）：

| 改动 | 位置 |
|---|---|
| `_ord` 加 `design:3.5` | 切换动效的顺序表 |
| 面板体分发返回 `#liaison-ds-root` 空容器 | `renderPanel` 的 tab 分支 |
| tab 组显示条件加 `design` + 加「组件」按钮 | header 的 `.tabs` |
| diverge 分支补「组件」按钮 | 同上 |
| `_setActiveTabRaw` 里双 rAF 后 `mount` / 切走 `unmount` | 挂载时机 |
| `renderPanel()` 尾部补 `mount` | **必须**——renderPanel 每次重写整个 shadow，容器会被换成空 div |

> ⚠️ shadow 是 `mode:"closed"`，**外部拿不到 `shadowRoot`**——挂载只能由 bundle
> 内部推（那里有 `this.$shadow`），不能从模块侧轮询查找容器。

改 bundle 前**先备份**（`cp bundle.min.js bundle.min.js.bak_<主题>_<时间戳>`），
改完 `node --check` 验语法。
