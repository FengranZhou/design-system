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
