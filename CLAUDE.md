# xiaoya3.0 设计规范 —— 项目根说明

本仓库是一套**可被多项目引用的 Element Plus 设计系统 / 组件库**：

- `design-spec/` —— 设计系统源头（令牌 + 组件覆盖层 + 规范文档）。**组件样式的唯一数据源在此。**
- `demo/` —— 演示页（Vite + Vue），本身是组件库的一个"引用方"，展示各组件的标准效果。

> **第一次接触本仓库 / 要把它接进自己的项目 → 看 [`接入指南.md`](./接入指南.md)**（分享给同事时指这一份即可：拿代码、跑 demo、样式三层 + `@` 规则接入、环境自查）。

> **完整设计规范见 `design-spec/CLAUDE.md`**（设计哲学 / 强制工作流 / 令牌 / 组件交互规范等）。本文件只前置声明贯穿全项目的**最高铁律**，细节以 `design-spec/CLAUDE.md` 为准，两处如有出入以 `design-spec/CLAUDE.md` 的完整版为准。
>
> 下面这行 `@` 会把完整规范（含全部「任务→必读」触发指针）**自动加载进本项目 CC 的上下文**——本仓库自身也是一个"引用方"，此行既让本仓库工作时自动享受规范加载，也是**下游项目可照抄的接入范本**（下游在其自己项目根 `CLAUDE.md` 加同样一行、路径改为指向本仓库的 `design-spec/CLAUDE.md` 即可）。

@design-spec/CLAUDE.md

---

## ⛔ 最高铁律：一切变动必须使用已定义的设计令牌与组件

> **本节优先级高于本文件其余所有内容。** 后续在本项目中的**任何**代码 / 样式 / 页面变动，都必须遵守：

1. **所有样式值必须走已定义的设计令牌（design token）** —— 颜色、间距、圆角、字体、阴影、动效等，一律引用 `design-spec/design-token/` 里定义的 CSS 变量（如 `var(--iflyv-brand-primary)`、`var(--iflyv-radius-sm)`、`font: var(--iflyv-font-...)` 等）。**禁止**写裸值（硬编码 hex 色、`px` 魔法间距、字面字号 / 行高 / 字重等）。找不到对应令牌时，先停下来向用户确认应新增哪个令牌，而不是就地硬编码。

   > ⚠️ **"每个值都引了令牌" ≠ 合规**——拆开基础令牌自拼出语义层没有的规格（如 `font-size-40` + `line-height-48` + `weight-bold` 凑一档字阶），属于"自造档位"，与写裸值同罪。多档位体系有语义层时必须**整档取用**。
   >
   > ⛔ **规范与需求冲突时，必须先问，不得自行取舍**——既不擅自脱离规范满足需求，也不擅自砍掉需求迁就规范。凡是"我打算不完全按用户说的做"，都要先讲出来由用户决定。
   >
   > 两条的完整说明与翻车实例见 `design-spec/CLAUDE.md` 同条。

2. **凡涉及组件，必须使用已定义的设计组件** —— 优先复用 Element Plus + `design-spec/el-theme/` 主题覆盖层里已定义的组件与样式规范，不得另起炉灶手写一套等价组件或覆盖其既有样式。需要的组件不存在时，先向用户确认，而不是临时拼装。

   > 落地含义：用户说"在某处加个头像 / 加个 tab"等，默认**自动从组件库（EP 组件 + `design-spec/el-theme/`）里找标准组件用**，只有在组件库确实没有时才向用户汇报，不擅自手撸。

3. **组件样式的唯一数据源在 `design-spec/el-theme/components/`（Single Source of Truth）** —— 这是本设计系统作为"可被多项目引用的组件库"能成立的根基，**绝对不可破坏**：

   - **唯一定义处**：每个组件的视觉样式（外观 / 尺寸 / 字体字重 / 颜色 / 选中禁用等状态 / 装饰 / 交互态）**只允许**定义在 `design-spec/el-theme/components/<组件>.scss` 全局层。这里是"源头"，一个组件只有一份定义。
   - **使用方只"引用"不"复制"**：任何使用方（本仓库的 `demo/`、以及将来 `import` 本组件库的其它项目）一律通过约定 class（如 `.tabs-page` / `.tabs-sub` / 裸 `el-tabs` 等）或直接用 EP 组件来**引用**全局标准，**严禁**在使用方的 `<style scoped>`（含 `:deep()`）或任何局部样式里**重新定义 / 覆盖组件外观**。局部 scoped 只能放"纯本页排版留白"（如某个 demo 块的 `margin` 间距），**不得触碰组件本身的外观规则**。
   - **为什么**：源头改一次 → 所有引用方随之同步变化（改品牌色、调圆角、换字重，一处生效、处处生效），这正是设计系统"单点维护、统一控制"的价值。一旦有人在使用方 scoped 里私自复制并改写组件样式（"局部私货"），该处就**脱离源头、不再同步**：你改全局它不动，将来统一升级时要挨个项目翻 scoped 排查 —— **这就是最典型的翻车**。
   - **判定"局部私货"（命中任一即违规，须归位到全局层）**：在使用方文件里出现 `:deep(.el-xxx...)` 覆盖了组件的字号 / 字重 / 颜色 / 边框 / 圆角 / 选中态 / 装饰 / 溢出行为等**外观类**属性；或用裸值 / 私有 class 复刻了某个已有标准组件的样子。
   - **唯一例外：规范展示页的「讲解脚手架」**（**边界极窄，三条须同时满足，缺一即回归违规**）：① 仅限本仓库 `demo/` 的规范展示页，**业务项目一律不适用**；② 目的是**为讲解组件的某个局部而制造一种真实业务中不存在的展示形态**（如为讲「表头单元格」而只渲染表头，`el-table` 无 `show-body` 开关，只能喂空数据 + 压掉残留占位）；③ **不改变该组件在真实用法下的任何外观**，且必须写注释说明"为何是脚手架、为何不进源头"。详见 `design-spec/CLAUDE.md` 同条。
   - **正确做法**：需要调整组件外观 → 改 `design-spec/el-theme/components/<组件>.scss` 源头；某个组合场景（如 Badge+Tabs）需要固定行为 → 也提炼进全局层并给出约定 class，而不是写死在单个 demo 里。拿不准该不该进全局时，先向用户确认，不要就地 scoped 覆盖。

4. **引用方接入方式（决定"同步"是否成立的前提）** —— "改源头 → 引用方同步"只在引用方**正确引用了全局层**时才成立。任何使用方（本仓库 `demo/`、以及将来接入的其它项目）必须按以下方式接入，否则会脱钩、不再同步：

   - **必须引入三层，且顺序固定**（见 `design-spec/el-theme/index.scss` 头部注释）：① `element-plus/dist/index.css`（EP 基础）→ ② `design-spec/design-token/index.scss`（令牌统一入口）→ ③ `design-spec/el-theme/index.scss`（组件覆盖层统一入口）。顺序错了覆盖会失效。范本见 `demo/src/main.ts`。
   - **只引 index 入口，不逐个引子文件**：引用方引 `design-token/index.scss` 和 `el-theme/index.scss` 这两个统一入口即可，内部 48 个组件文件由 index 汇总，引用方无需也不应逐个引用。
   - **严禁"拷贝式"接入**：绝对不要把 `design-token/` 或 `el-theme/` 的 scss **拷贝一份**进引用方自己的仓库——拷贝 = 脱离源头，源头更新它不动。只能通过引用（相对路径 / npm 包 / submodule / monorepo 共享）指向同一份源头。
   - **引用方内部不得写组件外观私货**：接入后，引用方自己项目里同样受本铁律约束——不在自己的 scoped / 局部样式里覆盖组件外观（见本条上文"局部私货"判定）。
   - **由此得出**：对"正确接入（引全三层 + 不拷贝 + 不写私货）"的项目，**`demo/` 的显示效果就是它们引用后的标准真实效果，分毫不差**；对拷贝式 / 漏引 / 魔改式接入的项目，不保证同步——那是接入方式错误，不是机制问题。

5. **落地前自检** —— 每次改动完成前，逐条核对上述各点；命中「找不到令牌 / 找不到组件 / 想在使用方 scoped 覆盖组件外观 / 引用方接入方式不合规」时必须暂停并向用户说明，由用户决定新增全局定义还是调整方案。**页面 / 模块布局类改动还须输出「样式值对账清单」**（每处新写间距 / 圆角 / 字阶 / 颜色 / 组件档位 → 场景锚点，标不出的升级提问，完整要求见 `design-spec/CLAUDE.md` 同条）。

---

## 🚀 推送流程（用户说「push 一下，打好 tag 和备注」时照此执行）

本仓库同时维护在**两个远程**，两边**内容一致但 commit hash 不同**。
**不要试图让两边 hash 一致**（那需要强推个人仓，已排除）。

| remote | 地址 | 分支 | 角色 |
|---|---|---|---|
| `iflytek` | `code.iflytek.com:30004/.../xy-design-system` | `master` | **公司内网仓 —— 唯一主线，多人协作，以此为准** |
| `origin` | GitHub `FengranZhou/design-system` | `main` | 个人仓，备份 / 归档，定期从内网单向同步 |

**本地 `iflytek-sync-done` 分支** = 内网主线的本地副本，**日常开发就在这条分支上**，别删。

> **2026-09-14 起方向已反转**：此前是「个人仓开发 → cherry-pick → 脱敏 → 推内网」。
> 内网开始多人协作（同事直接往 master 推 antd3 适配层、MessageBox 解禁等）后，
> 个人仓不再能充当主线——**两边都有对方没有的内容 = 真分叉**，每次同步都要解冲突。
> 现改为内网为唯一主线，个人仓退为备份。

### 日常：推内网（绝大多数情况只做这个）

```bash
git checkout iflytek-sync-done
git pull --rebase iflytek master        # 多人协作，推前先拉
git add -A && git commit -m "..."       # ⛔ 提交说明不得出现 GitHub / 个人仓 / 双仓 / Claude-Session
git push iflytek iflytek-sync-done:master

# 打 tag（版本号规则见下）
git tag -a vX.Y.Z-iflytek <commit> -F - <<'EOF'
vX.Y.Z —— 一句话主题
（分组列出：新增能力 / 组件改进 / 修复 / 仓库变更）
EOF
git push iflytek refs/tags/vX.Y.Z-iflytek:refs/tags/vX.Y.Z
```

### 定期：反向同步到个人仓（非每次推送都做）

个人仓是备份，滞后无妨。同步时**不要用 `git merge`**——两条平行历史找不到有效共同祖先，
会把 `demo-antd3/`、`pnpm-lock.yaml` 等整目录当成「双方各自新增」，产生十几个伪冲突
（2026-09-14 实测 15 个）。正确做法是取内网文件树覆盖，再恢复个人仓独有的两处：

```bash
# ① 备份个人仓独有内容（内网侧按设计不存在，直接覆盖会丢）
git show main:scripts/sanitize-for-iflytek.mjs > /tmp/sanitize-backup.mjs
git show main:CLAUDE.md > /tmp/CLAUDE-main-backup.md

# ② 取内网文件树覆盖工作区（HEAD 仍在 main，历史线不变）
git checkout main
git read-tree -m -u iflytek-sync-done

# ③ 恢复个人仓独有的两处
cp /tmp/sanitize-backup.mjs scripts/sanitize-for-iflytek.mjs
cp /tmp/CLAUDE-main-backup.md CLAUDE.md

# ④ 核对后提交推送
node scripts/audit-spec.mjs                 # 退出码 0
git add -A && git commit -m "chore(sync): 同步内网主线内容（…）"
git push origin main
```

⚠️ **③ 之后要核对根 `CLAUDE.md` 有没有漏掉内网侧的实质更新**——备份的是同步前的旧版本。
本节以外的内容若在内网改过，要手工并回来（同事通常改 `design-spec/CLAUDE.md`，那份随文件树自动过来，不用管）。

### 版本号规则（语义化，我自行判断后先告知再执行）

- **次版本号**（`v1.19.0` → `v1.20.0`）：新增组件 / 新增能力 / 新增一整条机制
- **修订号**（`v1.19.0` → `v1.19.1`）：修 bug、补文档、改口径、微调外观

⚠️ **查最新 tag 必须用**：

```bash
git tag -l | grep -v -- '-iflytek$' | sort -V | tail -1
```

两个坑都要避开：
- 直接 `git tag -l | tail` 是**字符串排序**，会把 `v1.9.0` 排在 `v1.18.0` 后面（真实踩过）
- 不排除 `-iflytek` 后缀的话，内网 tag 会排到最前面污染结果（真实踩过）

### ⛔ 公司仓脱敏（最高优先级）

**公司仓那份绝不能看出「同一套代码也提交在 GitHub 个人仓」**——这不是技术问题，是合规要求。

方向反转后，脱敏从「推之前清洗」变成「**内网侧从来就不写**」——这是更强的保证，
因为不存在「忘了跑脚本」这种漏法。三处都要干净，缺一即泄露：

| 位置 | 怎么保证 |
|---|---|
| **文件内容** | 双仓机制只写在**本节**与 `scripts/sanitize-for-iflytek.mjs`，两者都**只存在于 `main`**。在 `iflytek-sync-done` 上开发时根本碰不到它们 |
| **提交说明** | **写 commit message 时就不要出现** GitHub / 个人仓 / 双仓 / `Claude-Session:` 字样。写了要么 `--amend` 改，要么事后重写历史，代价极大 |
| **tag 说明** | 内网 tag 单独写，删掉任何双仓表述 |

⚠️ **`Claude-Session:` 链接不得进内网**（`Co-Authored-By` 保留，那是业界惯例）。
**2026-09-14 就差点把 6 个带链接的提交推进内网**，是临推前查提交说明才发现的。

已在 `~/.claude/settings.json` 里配了 `"attribution": { "sessionUrl": false }` 关掉自动生成
（配在**全局**而非项目 `.claude/settings.json`——后者会随仓库进内网）。
但**配置只对新会话生效，且没有任何报错提示它是否真的在起作用**，所以
**推送前仍要手工查一次**，别把这条保险完全交给配置：

```bash
git log --format='%B' iflytek/master..HEAD | grep -i 'Claude-Session' || echo "✓ 干净"
```

⚠️ **万一已经提交但还没推**，只重写未推送部分：

```bash
git branch backup-before-strip                                    # 先备份
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --msg-filter 'grep -v "^Claude-Session:"' -- HEAD --not iflytek/master
git merge-base --is-ancestor iflytek/master HEAD && echo "✓ 内网历史未被触碰"
```

`-- HEAD --not iflytek/master` 这段**不能省**——只写 `A..B` 的 range 不限定改写范围，
`--msg-filter` 仍会作用于整条分支（2026-09-14 真实踩过，94 个提交全被重写，
靠 `refs/original/` 才恢复）。

> **2026-09 已做过一次彻底清理**：重写公司仓全部 83 个提交、强推覆盖、三个 tag 重打。
> 代价是同事要重新 clone。**别再让痕迹进去第二次。**

### 四条硬纪律

1. **绝不强推 `origin`** —— 个人仓历史已发布，强推会破坏它。
2. **绝不强推 `iflytek`** —— 内网是多人协作主线，强推会毁掉同事的工作。
   推被拒时先 `git pull --rebase iflytek master`，不要用 `--force` 绕过。
3. **`filter-branch` 必须限定范围** —— 绝不加 `-- --all`（会把 main 和所有 tag 一起改写），
   且改写未推送部分时要写 `-- HEAD --not iflytek/master`（见上，range 语法不够）。
4. **推内网前先测连通** —— `git ls-remote iflytek` 失败时先看是权限还是网络，
   不要反复重试推送。内网仓拒绝非公司邮箱的提交，报错是 `未通过Commit邮箱校验`。

### pre-push hook 会拦什么（两个仓都会）

推送时 hook 自动校验 `catalog.json` 与当前设计系统一致，不一致就阻止并重新生成。
被拦下时按提示 `git add scripts/catalog.json scripts/component-shots.json` 提交后重推。

**若提示缺组件示意图**，需要先有 `demo/dist`：

```bash
cd demo && pnpm build                          # 构建失败就先修，别绕过
node scripts/shoot-components.mjs --missing
node scripts/build-catalog.mjs
```

⚠️ **`pnpm build` 失败时不要用 `--no-verify` 绕过**——那会把构建不通过的状态推进内网主线。
