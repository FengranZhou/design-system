# 本仓库自带的 Claude Code 防护 hook

本目录的脚本由 `.claude/settings.json` 注册为 **PreToolUse hook**，随仓库一起分发。

**接入方无需任何设置**：克隆 / 引用本仓库后用 Claude Code 打开，hook 自动生效，无需安装、无需授权弹窗。
（项目级 hook 与各人 `~/.claude/settings.json` 里的个人 hook 是**合并**关系，不会互相覆盖。）

---

## guard-reinvent-components.sh —— 防「手撸组件库已有的东西」

### 它解决什么

本设计系统的规范写得很全（`design-spec/references/component-interaction.md` 八百多行 +
`design-spec/CLAUDE.md` 的「任务→必读」触发表）。但真实的翻车原因**不是规则缺失，而是没去读**——
看到一个形态（比如「hover 弹出的面板」）就直接挑一个能做出该形态的底层组件自己拼，
而组件库里明明有现成的（那个例子里是 `Dropdown`，规范反例第一条写的就是
「手撸一个绝对定位的浮层当下拉」）。

**纯文字规则挡不住这件事**，所以用 hook 在落盘前硬拦一次。

### 什么时候会弹

写 `.vue` / `.jsx` / `.tsx` / `.html` 且**本次新增内容**命中以下高置信度特征时：

| 特征 | 说明 |
|---|---|
| `floating_panel` | 自写浮层面板（`position:absolute\|fixed` + `z-index` + 浮层语义 class） |
| `custom_menu` | 自写下拉/菜单条目（`*-menu-item` / `*-flyout-item` / `role="menu"`…） |
| `custom_overlay` | 自写遮罩层（`mask` / `overlay` / `backdrop` + 定位） |
| `custom_widget` | 自定义 class 里出现已有组件的语义词（tooltip / modal / drawer / breadcrumb…） |
| `teleport_panel` | 用 `<Teleport to="body">` 自建浮层 |

弹窗里会直接问三个问题：**这形态在组件库里叫什么 / 读过对应段没有 / 确实没有现成的吗**。

### 什么时候不弹（豁免）

- **`el-theme/` 源头层** —— 组件库本体就是定义这些东西的地方
- `node_modules/` / `dist/`
- 正规使用组件库（`el-dropdown` / `el-tooltip` / `el-breadcrumb`… 等前缀）
- 普通布局用的 `position: absolute`（不带 z-index + 浮层语义时不算）
- 非 UI 文件（`.ts` / `.scss` 等不承载 DOM 结构的）

> **业务组件层（`design-spec/components/`）不豁免**——业务组件同样必须复用基础组件，
> 不得自己拼等价物（见 `design-spec/components/CLAUDE.md` 铁律 1）。

### 被拦下之后该做什么

**不要顺手放行。** 先做这两件事：

1. 想清楚这个形态在组件库里叫什么（浮出选项面板=Dropdown、就地气泡确认=Popconfirm、
   侧边浮层=Drawer、悬浮说明=Tooltip、分步流程=StepBar、路径导航=Breadcrumb…）
2. 读 `references/component-interaction.md` 对应段，**尤其是「反例」段**——
   反例常常直接写着你正要犯的错

组件库有对应物 → 放弃自写，改用该组件。
确属组件库空白 → 放行，但应先与用户确认是否该把它新增进组件库。

### 误报了怎么办

尺度是刻意调成「只拦高置信度、宁可漏网不打扰」的，但边界情况一定存在。
误报时正常放行即可；若某类误报反复出现，改本脚本的正则并说明原因。

---

## guard-control-selection.sh —— 防「组件选对了类，但选错了个 / 配错了法」

### 它解决什么

上一个 hook 拦的是「**手撸**组件库已有之物」——写法本身就违规。
但还有一类错误它**永远拦不住**：**用的是标准组件、写法完全合规，错在几个合法组件之间选错了那一个。**

真实翻车：给一个「文字位置：左 / 右」的二选一配置项，直接抓了 `el-select` 写完。
而 `patterns/select-pattern.md` 明写「**≤5 且需并排比较时 Radio 更好**」——两个选项正是 Radio 的典型场景，
下拉要点开才知道有什么，凭空多一次交互。

事后复盘：**不是没读懂规则，是根本没触发去读**——心理过程直接从「要个二选一」跳到「`el-select`」，
中间没有停顿，`select-pattern` 那条触发行压根没被激活。
`guard-reinvent-components.sh` 对此毫无办法：`el-select` 是标准组件，没有任何自造轮子特征。

**这类「选型/用法」错误此前没有任何机器防线**，本 hook 补上这一环。

### 什么时候会弹

| 特征 | 规则出处 | 一句话规则 |
|---|---|---|
| `select_count` | `patterns/select-pattern.md` | `el-select` 但静态选项只有 2~5 个 → **≤5 且需并排比较应优先 Radio** |
| `switch_textpos` | `component-interaction.md` Switch 段 | 给 Switch 配文字 → **默认 `active-text` 落右**；仅当「开关左侧无内容、右侧有其他内容」才用 `inactive-text` 置左 |
| `icon_only_btn` | `component-interaction.md` Tooltip 段 | 纯图标按钮 → **必须配 tooltip 给全称**，且**每个 tooltip 必传 `:show-after="300"`**（JS prop，源头 scss 兜不住） |
| `dialog_width` | `component-interaction.md` Dialog 段 | `el-dialog` 宽度**只有 400 / 640 / 800 三档**，其它数值越界 |

### 什么时候不弹（刻意的漏网）

- **`el-option` 用 `v-for` 渲染** —— 选项数运行时才知道，数不出来就不拦
- **选项 >5 个** —— 规则本就允许 Select
- **按钮带文案** —— 只有「`</template>` 后直接跟 `</el-button>`」的真·纯图标按钮才算
- `el-theme/` 源头层、`node_modules/`、`dist/`、非 UI 文件

> **为什么把漏网写得这么明确**：误报会训练出「无脑点放行」的习惯，那比不拦更糟。
> 尺度一律偏向「宁可漏，不误打断」。

### 被拦下之后该做什么

这**不是**「写法违规」，你用的是标准组件——问题在**选了哪一个 / 怎么配**。

1. 读 `design-spec/CLAUDE.md` 的「任务 → 必读细则」触发表，找到对应那行，读它指向的文档
2. 确认你的选择符合规则；**规则确实没覆盖你的场景时，先与用户确认，不要就地拍板**

判断确实有误（选项会动态增长、宽度确有特殊约定…）→ 放行即可。

### 加新规则的判据

只加「**规则真的限定了选择**」的场景——即文档里写着「应该用 A 不用 B」或「只有这几档合法」的。
纯风格偏好、规则未表态的，不要加：每多一条误报，整套 hook 的可信度就掉一分。

---

## 本地临时关闭

在自己的 `.claude/settings.local.json`（**已被 git 忽略，不会提交**）里覆盖即可。
不要直接改 `.claude/settings.json`——那是团队共享的。
