# 复制到 CC 使用：从浏览器挑组件 → 粘进下游项目

在真实页面上选好位置、从组件库里挑一个组件填好配置，复制出一段 prompt，
粘贴进下游项目的 CC 窗口，组件就落在那个位置上。

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
}
```

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
3. 跑一次冒烟测试确认 `snippet` 不抛错、引号没嵌套错：

```bash
node -e "
import('./scripts/component-catalog.mjs').then(m => {
  for (const c of m.COMPONENTS) {
    const v = {}; c.fields.forEach(f => v[f.key] = f.default ?? '')
    try { c.snippet(v) } catch (e) { console.log('✗', c.id, e.message) }
  }
  console.log('✓', m.COMPONENTS.length, '个组件')
})"
```

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
