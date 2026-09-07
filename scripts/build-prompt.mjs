/**
 * Prompt 拼装器 —— 把「组件 + 配置 + 落点」拼成粘贴进下游 CC 的一段指令
 * ============================================================================
 *
 * ## 这段 prompt 在替下游 CC 省掉什么
 *
 * 下游项目已通过根 `CLAUDE.md` 的 `@` 引入本设计系统规范，所以下游 CC **手上
 * 本来就有**整套令牌纪律、组件用法、模式规则。它缺的只有三件事：
 *
 *   1. **用哪个组件** —— 从 40+ 个里选，选错了后面全错
 *   2. **放在哪里** —— 浏览器里的 DOM 位置，它看不见
 *   3. **怎么配** —— label 叫什么、宽度取哪档，这些是业务决策不是规范能推出来的
 *
 * 这三件事正好是用户在扩展面板里完成的动作。所以 prompt 的职责是**把用户的
 * 操作翻译成 CC 能执行的指令**，而不是把规范再抄一遍。
 *
 * ## 落点为什么只给截图、不给 DOM 方位
 *
 * 试过按元素四边缘/中心推断 before/after/left/right/append，但用户要表达的落点
 * 往往不等于某个 DOM 元素的边——"放在这个标题右边"在 DOM 上可能是插进另一个容器。
 * 方位判定越细越容易与意图错位。改为**只给带打点标记的截图**，让 CC 看图判断：
 * 它有完整代码库，看图定位大概位置再回代码验证，比在浏览器侧硬推 DOM 语义可靠。
 *
 * ## 为什么还要带 mustRules
 *
 * 规范虽然在下游 CC 的上下文里，但它是**触发式**的——CLAUDE.md 的「任务→必读」
 * 表要求命中场景后先 Read 对应细则。把该组件最易踩的几条硬约束直接内联进
 * prompt，等于把"触发"这一步做实，避免 CC 因为没命中触发行而跳过细则。
 *
 * `readRefs` 仍然给出，让 CC 需要展开时知道去哪读——内联的是"不读也别踩"的底线，
 * 不是细则全文的替代品。
 */

/**
 * @param {object} opts
 * @param {object} opts.component  catalog 里的组件条目
 * @param {object} opts.values     用户在配置面板里填的值
 * @param {object} opts.anchor     落点信息
 * @param {number} [opts.anchor.x]           打点的页面绝对坐标
 * @param {number} [opts.anchor.y]
 * @param {string} [opts.anchor.nearText]    打点处附近的可见文本（辅助线索）
 * @param {string} [opts.anchor.url]         页面 URL
 * @param {string} [opts.shotPath]           打点截图的落盘路径
 */
export function buildPrompt({ component, values, anchor = {}, shotPath = '' }) {
  const lines = []

  lines.push(`在页面上插入一个「${component.name}」，来自 xiaoya 设计系统。`)
  lines.push('')

  // ── 落点 ──────────────────────────────────────────────────────────────────
  lines.push('## 插入位置')
  lines.push('')
  lines.push('见随附截图 —— **蓝色圆点 ①** 标出了组件要插入的位置。')
  lines.push('')
  if (shotPath) lines.push(`- **截图**：\`${shotPath}\``)
  else lines.push('- ⚠️ 截图未能自动保存，请手动把打点截图一并发给我')
  if (anchor.nearText) lines.push(`- **打点处附近的内容**：「${anchor.nearText}」`)
  if (anchor.url) lines.push(`- **页面地址**：${anchor.url}`)
  lines.push('')
  lines.push('> 请按图上圆点的位置，在对应源文件中找到合适的插入点。')
  lines.push('')

  // ── 配置 ──────────────────────────────────────────────────────────────────
  const filled = component.fields
    .map((f) => {
      const v = values[f.key]
      if (v === undefined || v === '' || v === null) return null
      let display = v
      if (f.type === 'switch') display = v ? '是' : '否'
      if (f.type === 'select') {
        const opt = (f.options || []).find((o) => String(o.value) === String(v))
        if (opt) display = opt.label
      }
      if (f.type === 'number' && Number(v) === 0) display = '撑满（100%）'
      return `- ${f.label}：${display}`
    })
    .filter(Boolean)

  if (filled.length) {
    lines.push('## 配置')
    lines.push('')
    lines.push(...filled)
    lines.push('')
  }

  // ── 代码骨架 ──────────────────────────────────────────────────────────────
  lines.push('## 可照抄骨架')
  lines.push('')
  lines.push('```vue')
  lines.push(component.snippet(values))
  lines.push('```')
  lines.push('')

  // ── 硬约束 ────────────────────────────────────────────────────────────────
  if (component.mustRules?.length) {
    lines.push('## 硬约束（不读细则也必须遵守）')
    lines.push('')
    component.mustRules.forEach((r) => lines.push(`- ${r}`))
    lines.push('')
  }

  // ── 必读 ──────────────────────────────────────────────────────────────────
  if (component.readRefs?.length) {
    lines.push('## 需要展开时读这些')
    lines.push('')
    lines.push('> 路径相对你项目根 `CLAUDE.md` 里 `@` 指向的 design-spec 目录')
    lines.push('')
    component.readRefs.forEach((r) => lines.push(`- \`${r}\``))
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(
    '骨架里的 `form.field` / `handleClick` 等占位命名请按实际业务改；' +
      '样式值一律走设计令牌，不要写裸值。'
  )

  return lines.join('\n')
}

/**
 * 组件标识块 —— demo 页「复制组件标识」按钮的产物
 * ============================================================================
 *
 * ## 与 buildPrompt 的分工
 *
 * `buildPrompt` 是**扩展面板**的产物：用户在下游页面上打了点、填了配置，所以它
 * 带落点截图、带用户填的值，是一条"在这个位置插入这个东西"的完整指令。
 *
 * 本函数是 **demo 页**的产物：用户站在规范展示页上，手里没有落点也没有配置——
 * 落点由用户自己在 CC 窗口里用一句话给出（"在标题右侧加一个 + 粘贴的内容"）。
 * 所以这里只回答一个问题：**这一段指的是设计系统里的哪个组件、怎么用**。
 *
 * 两者共用同一套小节形态（骨架 / 硬约束 / 需要展开时读），改一处要一起改——
 * 下游 CC 见到的应当是同一种结构，而不是两种排版。
 *
 * ## 配置项：拨到什么样，复制出去就是什么样
 *
 * demo 卡片右侧的开关是**活的**——用户拨开 SearchMini 的「默认收起」，页面上
 * 那个搜索框就真的变成收起态。他此刻按下「复制到 CC 去调用」，期待的显然是收起态，
 * 而不是组件的出厂默认形态。所以 `values` 传的是**该组件那张配置卡的实时值**，
 * 既进骨架、也单列一节写清楚。
 *
 * 不传 `values` 时退化成默认形态（`snippetDefaults` + 各字段 default）。
 *
 * @param {object} opts
 * @param {object} opts.component  catalog 里的组件条目（snippet 已 revive 成函数）
 * @param {object} [opts.values]   该组件配置卡的实时值；不传则用默认形态
 */
export function buildComponentRef({ component, values = {} }) {
  const lines = []

  lines.push(
    `使用 xiaoya 设计系统的「${component.name}」组件` +
      (component.desc ? `（${component.desc}）` : '') +
      '。'
  )
  lines.push('')

  // 三层叠加，后者覆盖前者：
  //   ① snippetDefaults —— snippet 读得到、但不进配置卡的 key（如 Button 的 type，
  //      不铺这层会渲染出 type="undefined"）
  //   ② 各字段的 default —— 配置卡的出厂值
  //   ③ values —— 用户此刻真正拨到的位置
  const resolved = { ...(component.snippetDefaults || {}) }
  ;(component.fields || []).forEach((f) => {
    if (resolved[f.key] === undefined) resolved[f.key] = f.default ?? ''
  })
  for (const [k, v] of Object.entries(values)) {
    if (v !== undefined) resolved[k] = v
  }

  // ── 配置 ──────────────────────────────────────────────────────────────────
  // 只写用户**改动过**的项：全默认时这一节整个不出现，避免把出厂值当成"用户的
  // 决定"喂给下游 CC —— 那会让它以为每一项都是特意指定的，不敢按场景调整。
  const changed = (component.fields || [])
    .map((f) => {
      const v = resolved[f.key]
      if (v === undefined || v === '' || v === null) return null
      if (v === (f.default ?? '')) return null
      let display = v
      if (f.type === 'switch') display = v ? '是' : '否'
      if (f.type === 'select') {
        const opt = (f.options || []).find((o) => String(o.value) === String(v))
        if (opt) display = opt.label
      }
      return `- ${f.label}：${display}`
    })
    .filter(Boolean)

  if (changed.length) {
    lines.push('## 配置（我在规范页上调过的，请照此实现）')
    lines.push('')
    lines.push(...changed)
    lines.push('')
  }

  // ── 代码骨架 ──────────────────────────────────────────────────────────────
  if (component.snippet) {
    let code = ''
    try {
      code = component.snippet(resolved)
    } catch {
      code = ''
    }
    if (code) {
      lines.push('## 可照抄骨架')
      lines.push('')
      lines.push('```vue')
      lines.push(code)
      lines.push('```')
      lines.push('')
    }
  }

  // ── 硬约束 ────────────────────────────────────────────────────────────────
  if (component.mustRules?.length) {
    lines.push('## 硬约束（不读细则也必须遵守）')
    lines.push('')
    component.mustRules.forEach((r) => lines.push(`- ${r}`))
    lines.push('')
  }

  // ── 必读 ──────────────────────────────────────────────────────────────────
  if (component.readRefs?.length) {
    lines.push('## 需要展开时读这些')
    lines.push('')
    lines.push('> 路径相对你项目根 `CLAUDE.md` 里 `@` 指向的 design-spec 目录')
    lines.push('')
    component.readRefs.forEach((r) => lines.push(`- \`${r}\``))
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(
    '骨架里的占位命名（`form.field` / `handleClick` 等）请按实际业务改；' +
      '样式值一律走设计令牌，不要写裸值。'
  )

  return lines.join('\n')
}
