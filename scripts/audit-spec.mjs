#!/usr/bin/env node
/**
 * 设计系统一致性对账脚本
 *
 * 用途：把「改一处 = 扫全部引用」这条纪律里可机械化的部分自动化，
 *      防止规范与实现之间重新长出裂缝。
 *
 * 用法：node scripts/audit-spec.mjs          # 全量检查
 *      node scripts/audit-spec.mjs --quiet  # 只输出问题（CI 用）
 *
 * 退出码：0 = 无问题；1 = 发现问题
 *
 * ⚠️ 这些检查全部来自真实翻车案例，别删：
 *   C1  下游读不到的令牌用途（曾 39/67 个令牌无用途说明）
 *   C2  引用了不存在的令牌（曾有 spacing-12 / display-* 等 5 类）
 *   C3  停用组件仍被 references 推荐（曾 4 处指向已停用的 el-popover）
 *   C4  停用了却没在勿用清单标注（下游会以为能用——.btn-icon-square 的坑）
 *   C5  触发表指向的文件不存在
 *   C6  源头有约定 class 但 references 无对应条目（对账纪律）
 *   C7  组件三态覆盖率（有条目 / 勿用清单 / 无额外规矩，三者都不在＝下游查不到）
 *   C8  强制规则未进评判标准（漏打 @rule 标记＝该规则不进清单、评分时查不到）
 *   C9  新增组件漏补 catalog 骨架（扩展面板拿不到代码骨架，不报错但 prompt 变弱）
 *   C10 新增组件漏补示意图（扩展列表里那个组件比别人难认，不报错）
 *   C9  标了 detect=regex/ast 却没写检测器（承诺自动检测却没实现）
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = join(ROOT, 'design-spec')
const REFS = join(SPEC, 'references')
const QUIET = process.argv.includes('--quiet')

const problems = []
const report = (check, msg, detail = '') =>
  problems.push({ check, msg, detail })

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const walk = (dir, ext = '.md') => {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p, ext) : e.name.endsWith(ext) ? [p] : []
  })
}
const rel = (p) => p.replace(ROOT + '/', '')

// 所有 references 文档合成一份，供多个检查复用
const refFiles = walk(REFS)
const refText = refFiles.map(read).join('\n')
const foundations = read(join(REFS, 'foundations.md'))
const claudeMd = read(join(SPEC, 'CLAUDE.md'))
const compInteraction = read(join(REFS, 'component-interaction.md'))

// ── C1：语义令牌是否都有用途说明 ────────────────────────────────
// 令牌的「值」下游引 scss 自动拿到，但「何时用」只在 foundations 用途表里。
// 不写 = 下游只拿到一个名字、不知道该用它做什么。
{
  const semantic = read(join(SPEC, 'design-token/css/semantic.scss'))
  const tokens = [
    ...new Set(
      (semantic.match(/^\s*--iflyv-[a-z0-9-]+/gm) || []).map((t) => t.trim()),
    ),
  ]
  const missing = tokens.filter((t) => {
    if (foundations.includes(t)) return false
    // 家族通配：foundations 里写了 `--iflyv-brand-*` 即视为覆盖整族
    const family = t.replace(/^(--iflyv-[a-z]+(?:-[a-z]+)?)-.*$/, '$1')
    return !foundations.includes(`${family}-*`)
  })
  if (missing.length) {
    report(
      'C1 令牌用途缺失',
      `${missing.length} 个语义令牌未在 foundations.md 的「→ 用途」表中出现`,
      missing.map((t) => `    ${t}`).join('\n') +
        '\n    → 下游只拿到值、不知何时用。补进 foundations.md 对应用途表',
    )
  }
}

// ── C2：references 引用的令牌是否都真实存在 ──────────────────────
// 写了 var(--iflyv-spacing-12) 但令牌只到 spacing-10 → 下游拿不到值、只能硬编码
{
  const defined = new Set(
    walk(join(SPEC, 'design-token/css'), '.scss')
      .flatMap((f) => read(f).match(/--iflyv-[a-z0-9-]+/g) || []),
  )
  const used = new Set(
    (refText.match(/var\(\s*(--iflyv-[a-z0-9-]+)/g) || []).map((m) =>
      m.replace(/var\(\s*/, ''),
    ),
  )
  // 排除 `var(--iflyv-font-*)` 这类通配写法被正则截断产生的残缺名（以 - 结尾）
  const ghosts = [...used].filter((t) => !defined.has(t) && !t.endsWith('-'))
  if (ghosts.length) {
    report(
      'C2 引用了不存在的令牌',
      `${ghosts.length} 个令牌在 references 被 var() 引用，但 design-token 里查无定义`,
      ghosts.map((t) => `    ${t}`).join('\n'),
    )
  }
}

// ── 解析勿用清单（C3 / C4 共用）────────────────────────────────
// 只取表格第一列的组件名——替代方案列里提到的是「启用」组件，不能算进来
const suspended = new Set()
let suspendSectionText = '' // C3 需据此跳过清单自身
{
  const section = compInteraction.match(
    /## ⏸ 暂停启用的组件与形态[\s\S]*?(?=\n## |\n---\n\n## |$)/,
  )?.[0]
  if (section) {
    suspendSectionText = section
    for (const line of section.split('\n')) {
      if (!line.startsWith('|')) continue
      const firstCol = line.split('|')[1] || ''
      // 「仅某形态停用」的行（第二列写明"仅…形态"）不计入整体停用集合，
      // 否则组件本身可用的正常条目会被 C3 误报
      const secondCol = line.split('|')[2] || ''
      if (/^\s*仅/.test(secondCol)) continue
      for (const m of firstCol.match(/`(el-[a-z-]+)`/g) || []) {
        suspended.add(m.replace(/`/g, ''))
      }
    }
  } else {
    report(
      'C3/C4 无法解析勿用清单',
      'component-interaction.md 里找不到「## ⏸ 暂停启用的组件与形态」段落',
      '    → 该段是 C3/C4 两项检查的依据，缺失则停用类检查全部失效',
    )
  }
}

// ── C3：停用组件是否仍被 references 当作方案推荐 ──────────────────
// 曾有 4 处把下游指向已停用的 el-popover
{
  const SUSPEND_CTX = /暂停启用|整体停用|勿用清单|停用范围|未编译|已停用|不引入/
  for (const f of refFiles) {
    const lines = read(f).split('\n')
    lines.forEach((line, i) => {
      // 跳过勿用清单段落自身（整段跳过，避免清单行被当成"推荐"）
      if (suspendSectionText && suspendSectionText.includes(line) && line.trim()) return
      // 跳过已带停用语境的行
      if (SUSPEND_CTX.test(line)) return
      for (const comp of suspended) {
        if (new RegExp(`\`${comp}[\`\\s]`).test(line + ' ')) {
          report(
            'C3 推荐了停用组件',
            `${rel(f)}:${i + 1} 提到 ${comp}，但它在勿用清单里`,
            `    ${line.trim().slice(0, 110)}\n    → 改指替代方案，或标注「当前暂停启用」`,
          )
        }
      }
    })
  }
}

// ── C4：实际停用了却没进勿用清单 ────────────────────────────────
// 判据分散在两处，任一处漏查都会得出错误结论（这正是人肉核查出错的地方）
{
  const declared = []

  // 判据 a：el-theme/index.scss 里 @use 被注释掉 = 源头样式根本不编译
  const themeIndex = read(join(SPEC, 'el-theme/index.scss'))
  for (const line of themeIndex.split('\n')) {
    const m = line.match(/\/\*\s*@use\s+'\.\/components\/([a-z-]+)\.scss'/)
    if (m) declared.push({ comp: `el-${m[1]}`, where: 'el-theme/index.scss 的 @use 被注释' })
  }

  // 判据 b：demo 里带 ⏸ 标记的组件（下架展示）
  // 只认 el-theme/components/ 下真有同名 scss 的，否则会把注释里的路径
  // （如 "el-theme/index.scss"）误当成组件名
  const realComponents = new Set(
    readdirSync(join(SPEC, 'el-theme/components'))
      .filter((f) => f.endsWith('.scss'))
      .map((f) => `el-${f.replace('.scss', '')}`),
  )
  for (const f of walk(join(ROOT, 'demo/src'), '.vue')) {
    const txt = read(f)
    if (!txt.includes('⏸')) continue
    for (const line of txt.split('\n')) {
      if (!line.includes('⏸')) continue

      // 形态 a：⏸ 行里直接出现 el-xxx
      for (const m of line.match(/\b(el-[a-z-]+)\b/g) || []) {
        if (realComponents.has(m)) declared.push({ comp: m, where: rel(f) })
      }

      // 形态 b：⏸ 行里出现的是 demo 组件名（XxxDemo）或中文名——
      // 实际写法多为「⏸ 暂停启用：基础「Upload 上传」」「// import UploadDemo」，
      // 不含 el-xxx 字符串。用 PascalCase 词反查同名组件。
      // ⚠️ 这是脚本首版漏报 el-upload 的原因，别删这段。
      for (const m of line.match(/\b([A-Z][a-zA-Z]+)(?:Demo)?\b/g) || []) {
        const guess = `el-${m.replace(/Demo$/, '').toLowerCase()}`
        if (realComponents.has(guess)) declared.push({ comp: guess, where: rel(f) })
      }
    }
  }

  const unlisted = new Map()
  for (const { comp, where } of declared) {
    if (!suspended.has(comp)) unlisted.set(comp, where)
  }
  if (unlisted.size) {
    report(
      'C4 停用了但未标注',
      `${unlisted.size} 个组件在源头/demo 已停用，但不在 references 勿用清单里`,
      [...unlisted]
        .map(([c, w]) => `    ${c}（依据：${w}）`)
        .join('\n') +
        '\n    → 下游会以为能用、写出来也不报错，但拿到 EP 原生观感',
    )
  }
}

// ── C5：触发表指向的文件是否存在 ────────────────────────────────
{
  const paths = new Set(
    (claudeMd.match(/`(references\/[a-zA-Z0-9/_-]+\.md)`/g) || []).map((m) =>
      m.replace(/`/g, ''),
    ),
  )
  const broken = [...paths].filter((p) => !existsSync(join(SPEC, p)))
  if (broken.length) {
    report(
      'C5 触发表路径失效',
      `${broken.length} 条触发行指向不存在的文件`,
      broken.map((p) => `    ${p}`).join('\n'),
    )
  }
}

// ── C6：源头约定 class 是否都有 references 条目 ─────────────────
// 对账纪律：源头为某形态写了专门覆盖 = 一等公民 = references 必须有用法条目
{
  const CONVENTION = /^\.([a-z][a-z0-9-]*(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?)\s*\{/gm
  const EP_PREFIX = /^(el-|is-|v-)/
  const found = new Map()

  for (const f of walk(join(SPEC, 'el-theme'), '.scss')) {
    const txt = read(f)
    // 内部类跳过：文件头注释声明了「接入方无需引用」的，是组件内部实现
    // （如 PageFrame 的 popper-class），不是对外约定类
    if (/接入方无需引用|非对外约定类|内部渲染/.test(txt)) continue
    // 去掉块注释，避免把注释里的示例 class 当成定义
    const code = txt.replace(/\/\*[\s\S]*?\*\//g, '')
    for (const m of code.matchAll(CONVENTION)) {
      const cls = m[1]
      if (EP_PREFIX.test(cls)) continue
      if (!found.has(cls)) found.set(cls, rel(f))
    }
  }

  const undocumented = [...found].filter(([cls]) => !refText.includes(cls))
  if (undocumented.length) {
    report(
      'C6 约定 class 无文档',
      `${undocumented.length} 个源头约定 class 在 references 里查无用法条目`,
      undocumented
        .map(([cls, f]) => `    .${cls}（定义于 ${f}）`)
        .join('\n') +
        '\n    → 接入方不知道有这个 class、更不知道怎么用',
    )
  }
}

// ── C7：组件覆盖率 —— 每个启用组件都能被下游找到吗 ────────────────
// 这是本仓库的核心命题：「合规接入的下游 CC 能否精准找到该用什么、怎么用」。
// 判据：一个启用中的组件，必须落在三种状态之一，否则下游遇到它时无路可走——
//   ① 有 references 实质条目（CI 小节 或 pattern 文档正文规定）
//   ② 在「⏸ 勿用清单」里（明确不让用 + 替代方案）
//   ③ 在「✅ 无额外规矩」清单里（直接按 EP 官方用）
{
  const suspendList = compInteraction.match(
    /## ⏸ 暂停启用的组件与形态[\s\S]*?(?=\n## |$)/,
  )?.[0] || ''
  const plainList = compInteraction.match(
    /## ✅ 无额外规矩的组件[\s\S]*?(?=\n## |$)/,
  )?.[0] || ''
  const patternText = walk(join(REFS, 'patterns')).map(read).join('\n')

  const uncovered = []
  let covered = 0
  for (const f of readdirSync(join(SPEC, 'el-theme/components'))) {
    if (!f.endsWith('.scss')) continue
    const name = f.replace('.scss', '')
    const comp = `el-${name}`
    const lines = read(join(SPEC, 'el-theme/components', f)).split('\n').length

    // 状态 ②③：在两份清单里（只看清单段落，避免正文提及误判）
    if (suspendList.includes(comp) || plainList.includes(comp)) { covered++; continue }

    // 状态 ①：有 CI 小节标题，或 pattern 文档正文规定了它
    // ⚠️ 小节标题用的是 PascalCase 无连字符形态（`### ColorPicker 颜色选择器`
    //    对应 el-color-picker），另有纯中文标题（`### 分页器默认用法`）——
    //    三种形态都要认，否则会把写好的条目误报成缺口（首版就栽在这）。
    const pascal = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')
    const ZH_ALIAS = {
      pagination: '分页器', datepicker: '日期', 'message-box': 'MessageBox',
      scrollbar: '滚动条', popconfirm: '气泡确认', empty: '空状态',
    }
    const alias = ZH_ALIAS[name]
    const titleRe = new RegExp(
      `^### .*(${name}|${comp}|${pascal}${alias ? `|${alias}` : ''})`,
      'im',
    )
    const hasSection = titleRe.test(compInteraction)
    const inPattern = patternText.includes(comp)
    if (hasSection || inPattern) { covered++; continue }

    uncovered.push({ comp, lines })
  }

  const total = covered + uncovered.length
  const pct = ((covered / total) * 100).toFixed(0)
  if (uncovered.length) {
    report(
      'C7 已适配组件覆盖率未达 100%',
      `${covered}/${total}（${pct}%）—— ${uncovered.length} 个组件下游无路可走`,
      uncovered
        .map((u) => `    ${u.comp}（${u.lines} 行 SCSS）`)
        .join('\n') +
        '\n    → 每个组件必须落在三者之一：references 有条目 / 在「⏸ 勿用清单」/ 在「✅ 无额外规矩」清单' +
        '\n      三者都不在 = 下游遇到它时既查不到用法、也不知道能不能用',
    )
  } else if (!QUIET) {
    console.log(`\n已适配组件覆盖率：${covered}/${total}（100%）`)
  }

  // ⚠️ 上面的分母只含「源头已适配」的组件。EP 还有一批组件源头从未适配、
  //    也不在任何清单里——下游用到时同样无路可走，但旧版 C7 永远发现不了它们
  //    （分母里就没有）。这是一次真实翻车：C7 报 51/51 100%，而下游做课表要用的
  //    el-calendar 三份清单全无。故单列 C7b 检查「EP 有、我们零表态」的组件。
  {
    const EP_DIR = join(ROOT, 'demo/node_modules/element-plus/es/components')
    // 子组件随父组件走，不单独表态
    const SUB = /^(.*-item|.*-group|.*-panel|.*-link|col|row|option|step|sub-menu|tab-pane|table-column|aside|header|footer|main|container|collection|base|slot|teleport|focus-trap|overlay|virtual-list|collapse-transition|roving-focus-group|config-provider|index\.d\.ts)$/
    if (existsSync(EP_DIR)) {
      const epComps = readdirSync(EP_DIR).filter(
        (n) => !n.includes('.') && !SUB.test(n),
      )
      const ours = new Set(
        readdirSync(join(SPEC, 'el-theme/components'))
          .filter((f) => f.endsWith('.scss'))
          .map((f) => f.replace('.scss', '')),
      )
      const silent = epComps.filter((n) => {
        if (ours.has(n)) return false
        // 在任一清单/正文里被提到过即算已表态
        return !refText.includes(`el-${n}`)
      })
      if (silent.length && !QUIET) {
        console.log(
          `\n⚠️ EP 组件零表态：${silent.length} 个（源头未适配、references 也未提及）\n` +
            `   ${silent.map((n) => `el-${n}`).join(' ')}\n` +
            `   → 下游用到这些时，规范既没说怎么用、也没说不让用。\n` +
            `     高频的应主动表态（补条目 / 列入勿用清单 / 列入无额外规矩清单）。`,
        )
      }
    }
  }
}

// ── C8：强制规则是否已进评判标准（@rule 标记覆盖度）────────────
// 「新增组件/模式时，其强制规则要能自动落进评判标准」——靠 @rule 标记实现。
// 本检查扫出「有强制措辞、却没打标记」的行，防止新增规则时漏打。
//
// ⚠️ 当前为**提示态**（不计入 problems、不影响退出码）：
//    存量约 300 条强制规则只标记了高价值子集，全量强制会大面积误报。
//    随着标记逐步铺开，可改为硬检查（把 report 那行放开）。
{
  // 只认「行首列表项 + 强制措辞」这种规则行形态，降低误报
  const IMPERATIVE = /(一律|必须|必传|禁用|禁止|严禁|不得|禁在|禁写|勿传|勿用)/
  const RULE_TAGGED = /<!--\s*@rule\s/
  // 显式豁免标记：这一行有强制措辞，但**不该**成为独立评判条目。
  // 两种正当理由（写在标记里备查）：
  //   dup  —— 同一规则在别处已有条目，此处只是另一处表述
  //   n/a  —— 措辞像规则但不可判定（能力描述表、子风格说明等）
  const RULE_SKIP = /<!--\s*@rule-skip[\s:]/
  const untagged = []

  for (const file of refFiles) {
    if (file.endsWith('judging-criteria.md')) continue
    let inFence = false
    read(file)
      .split('\n')
      .forEach((line, i) => {
        if (/^\s*```/.test(line)) return void (inFence = !inFence)
        if (inFence) return
        if (!/^\s*[-*]\s+\*\*/.test(line)) return // 只看「- **强调** …」形态的规则行
        if (!IMPERATIVE.test(line)) return
        if (RULE_TAGGED.test(line)) return
        if (RULE_SKIP.test(line)) return // 显式豁免：同一规则的另一处表述 / 非可判定规则
        untagged.push(`${rel(file)}:${i + 1}  ${line.trim().slice(0, 72)}`)
      })
  }

  if (untagged.length) {
    report(
      'C8 评判标准覆盖',
      `${untagged.length} 条强制规则尚未打 @rule 标记`,
      untagged.map((u) => `    ${u}`).join('\n') +
        '\n    → 这些规则不会进「评判标准」清单，接入方评分时查不到。\n' +
        '      补 @rule 标记（语法见 references/judging-criteria.md）；\n' +
        '      若确实不该成条目，加 <!-- @rule-skip dup|n/a 理由 --> 显式豁免。',
    )
  }

}

// ── C9：标了可自动检测，却没写检测器 ──────────────────────────
// detect=regex/ast 是对下游的承诺「这条评分器会自动查」。
// 没写检测器 = 条目静默落进「需人工确认」清单，承诺落空且无人察觉。
{
  const rulesFile = join(REFS, 'rules.generated.json')
  const detectorsFile = join(ROOT, 'scripts/detectors.mjs')
  if (existsSync(rulesFile) && existsSync(detectorsFile)) {
    const items = JSON.parse(read(rulesFile)).items || []
    const src = read(detectorsFile)
    // 检测器以 'id': { ... } 形式挂在 DETECTORS 上
    const implemented = new Set(
      (src.match(/^\s*'([a-z0-9-]+)':\s*[{A-Za-z]/gm) || []).map((m) =>
        m.replace(/^\s*'/, '').replace(/':.*$/, ''),
      ),
    )
    const missing = items
      .filter((r) => r.detect !== 'manual' && !implemented.has(r.id))
      .map((r) => r.id)
    if (missing.length) {
      report(
        'C9 检测器缺失',
        `${missing.length} 条标了 detect=regex/ast 但 detectors.mjs 里没有对应实现`,
        missing.map((id) => `    ${id}`).join('\n') +
          '\n    → 这些条目会静默落进「需人工确认」，自动检测的承诺落空。\n' +
          '      要么补检测器，要么把该条改回 detect=manual 并说明原因',
      )
    }
  }
}

// ── C9：新增组件是否补了 catalog 条目 ───────────────────────────
//    demo 导航加一行组件即视为启用，但扩展面板需要的 snippet（代码骨架）
//    和 mustRules（硬约束）是**语义**，脚本提不出来、只能手写。
//    漏补的后果不报错也不崩：组件照样出现在面板里，只是复制出的 prompt
//    少一段可照抄的代码——下游 CC 得自己去读 references 才知道怎么写。
//    正因为「不报错」，才必须有这条检查兜底。
{
  const catalogPath = join(ROOT, 'scripts/catalog.json')
  if (existsSync(catalogPath)) {
    try {
      const cat = JSON.parse(readFileSync(catalogPath, 'utf8'))
      const missing = (cat.components || [])
        .filter((c) => !c.snippetSrc)
        .map((c) => c.name)
      if (missing.length) {
        problems.push({
          check: 'C9 组件目录骨架缺失',
          msg: `${missing.length} 个已启用组件还没有代码骨架（snippet）`,
          detail:
            '   ' + missing.join('、') + '\n' +
            '   → 在 scripts/component-catalog.mjs 补条目（snippet + mustRules + anchor）\n' +
            '     mustRules 直接抄 design-spec/CLAUDE.md 触发表该组件那行的说明列，别重写',
        })
      }

      // C10：新增组件漏补示意图。
      // 扩展的组件列表靠图认脸，缺图的会退化成灰色示意图形 —— 不报错、
      // 不影响功能，但那个组件在列表里就比别人难认。同样属于「不报错所以
      // 必须有检查兜底」的一类。
      const noShot = (cat.components || [])
        .filter((c) => !c.shot)
        .map((c) => c.name)
      if (noShot.length) {
        problems.push({
          check: 'C10 组件示意图缺失',
          msg: `${noShot.length} 个已启用组件还没有示意图`,
          detail:
            '   ' + noShot.join('、') + '\n' +
            '   → cd demo && pnpm build\n' +
            '     node scripts/shoot-components.mjs --missing\n' +
            '     node scripts/build-catalog.mjs',
        })
      }
    } catch (e) {
      problems.push({
        check: 'C9 组件目录解析失败',
        msg: 'scripts/catalog.json 不是合法 JSON',
        detail: '   → 跑一次 node scripts/build-catalog.mjs 重新生成',
      })
    }
  }
}

// ── 输出 ────────────────────────────────────────────────────────
if (!QUIET) {
  console.log('\n设计系统一致性对账\n' + '─'.repeat(60))
}

if (problems.length === 0) {
  console.log('✓ 全部检查通过')
  process.exit(0)
}

for (const { check, msg, detail } of problems) {
  console.log(`\n✗ ${check}`)
  console.log(`  ${msg}`)
  if (detail) console.log(detail)
}
console.log(
  `\n${'─'.repeat(60)}\n共 ${problems.length} 类问题。修完重跑本脚本确认。\n`,
)
process.exit(1)
