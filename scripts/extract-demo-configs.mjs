/**
 * 从 demo 提取配置项 —— 让扩展面板的配置表单与 demo 保持同一数据源
 * ============================================================================
 *
 * ## 为什么需要它
 *
 * 「复制到 CC 使用」的配置表单原本是手写的，和 demo 里的「配置项」卡片各说各话
 * ——同一个 Button，demo 演示的是「图标 / 下拉」两个正交开关（按 CLAUDE.md
 * 「配置式组件设计范式」定的），扩展面板却问「文案 / 类型 / loading」。两边
 * 没有任何关联，改一边另一边不动，正是「改一处 = 扫全部引用」纪律要防的裂缝。
 *
 * demo 是配置项的**源头**：`ButtonDemo.vue` 演示的就是该组件在设计系统里的标准
 * 能力。所以这里把 demo 的配置项**提取成投影**，而不是维护第二份手写清单。
 *
 * ## 能提取什么、不能提取什么
 *
 * **能**：有哪些配置项、每项的标签 / 控件类型 / 选项 / 默认值。
 * 这些在 demo 里有稳定结构（CLAUDE.md 规定：配置开关放右侧、`bg-card` 卡片包裹、
 * 加「配置项」标题、用 `el-switch`），机器可靠可读。
 *
 * **不能**：选了之后代码怎么写（snippet）、该组件的硬约束（mustRules）、
 * 必读规范路径（readRefs）。这些是语义，仍在 `component-catalog.mjs` 手写。
 *
 * 所以最终 catalog 是**两部分合成**：fields 来自本脚本（自动同步 demo），
 * 其余手写。
 *
 * ## 用法
 *
 *   node scripts/extract-demo-configs.mjs          # 打印提取结果
 *   node scripts/extract-demo-configs.mjs --write  # 写入 demo-configs.generated.json
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DEMO_DIR = join(ROOT, 'demo/src/components')

/** 收集所有 demo 文件（含 biz/ pattern/ token/ 子目录） */
function demoFiles() {
  const out = []
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, name.name)
      if (name.isDirectory()) walk(p)
      else if (name.name.endsWith('.vue')) out.push(p)
    }
  }
  walk(DEMO_DIR)
  return out.sort()
}

/**
 * 抓出所有 `<aside class="config-card"> … </aside>` 区块。
 * 用括号配对而非贪婪正则——一个 demo 里可能有多个 config-card（Select 有 3 个），
 * 贪婪匹配会把它们连成一坨。
 */
function configCards(src) {
  const cards = []
  const open = /<aside[^>]*class="[^"]*config-card[^"]*"[^>]*>/g
  let m
  while ((m = open.exec(src))) {
    let depth = 1
    let i = m.index + m[0].length
    const start = i
    while (depth > 0 && i < src.length) {
      const nextOpen = src.indexOf('<aside', i)
      const nextClose = src.indexOf('</aside>', i)
      if (nextClose < 0) break
      if (nextOpen >= 0 && nextOpen < nextClose) { depth++; i = nextOpen + 6 }
      else { depth--; i = nextClose + 8 }
    }
    cards.push(src.slice(start, i - 8))
  }
  return cards
}

/**
 * 从 script 段里找 `const X = [ … ]` 的字面量选项（radio/select 的选项源）。
 *
 * 值字段名两种写法都要认：`value:`（多数 demo）和 `key:`（EmptyDemo 的 types）。
 * **不做"抓所有字符串"的兜底**——那会把 `{key,label,action}` 这种三字段对象
 * 打平成一堆无意义选项（Empty 曾被拆出 9 个选项），宁可返回 null 让调用方跳过。
 */
function findOptionArray(src, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\n\\s*\\]`, 'm')
  const m = src.match(re) || src.match(new RegExp(`const\\s+${name}\\s*=\\s*\\[([^\\]]*)\\]`, 'm'))
  if (!m) return null
  const body = m[1]
  const items = []
  // 逐个对象字面量地解析，避免跨对象错配字段
  const objRe = /\{([^{}]*)\}/g
  let om
  while ((om = objRe.exec(body))) {
    const seg = om[1]
    const val = seg.match(/\b(?:value|key)\s*:\s*['"]([^'"]*)['"]/)
    const lab = seg.match(/\blabel\s*:\s*['"]([^'"]*)['"]/)
    if (val && lab) items.push({ value: val[1], label: lab[1] })
  }
  if (items.length) return items
  // 纯字符串数组 ['甲','乙']——仅当整段没有对象字面量时才这样解释
  if (!/[{}]/.test(body)) {
    const strRe = /['"]([^'"]+)['"]/g
    let sm
    while ((sm = strRe.exec(body))) items.push({ value: sm[1], label: sm[1] })
  }
  return items.length ? items : null
}

/** 找 ref 的初始值作为默认值 */
function findRefDefault(src, name) {
  const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*ref[^(]*\\(([^)]*)\\)`))
  if (!m) return undefined
  const raw = m[1].trim()
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^['"]/.test(raw)) return raw.slice(1, -1)
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return undefined
}

/** 含模板插值的选项一律丢弃：取到的是源码不是渲染结果，喂给 CC 是噪音 */
function sanitizeOptions(options) {
  if (!options) return null
  const clean = options.filter(
    (o) => !/\{\{|\$\{/.test(o.label) && !/\{\{|\$\{/.test(String(o.value))
  )
  return clean.length ? clean : null
}

/** 解析单个 config-card 里的字段 */
function parseFields(card, src) {
  const fields = []
  // 逐个 el-form-item：label 属性 + 内部控件
  const itemRe = /<el-form-item[^>]*label="([^"]*)"[^>]*>([\s\S]*?)<\/el-form-item>/g
  let m
  while ((m = itemRe.exec(card))) {
    const label = m[1].trim()
    const body = m[2]

    // hint：配置项下方的释义文字，作为字段说明带过去
    let hint = ''
    const hintM = body.match(/class="config-card__hint"[^>]*>\{\{\s*(\w+)\s*\}\}</) ||
      body.match(/class="config-card__hint"[^>]*>([^<]+)</)
    if (hintM) {
      const raw = hintM[1].trim()
      // {{ xxxHint }} 形式指向一个 computed，取不到字面量就留空（不猜）
      hint = (/^[a-zA-Z_$][\w$]*$/.test(raw) || /\{\{|\$\{/.test(raw)) ? '' : raw
    }

    const sw = body.match(/<el-switch[^>]*v-model="([\w.$]+)"/)
    if (sw) {
      const key = sw[1].split('.').pop()
      fields.push({
        key, label, type: 'switch',
        default: findRefDefault(src, sw[1]) ?? false,
        ...(hint ? { hint } : {}),
      })
      continue
    }

    const rg = body.match(/<el-radio-group[^>]*v-model="([\w.$]+)"/)
    if (rg) {
      const key = rg[1].split('.').pop()
      let options = null
      // ① v-for 遍历某数组
      const vfor = body.match(/v-for="\w+\s+in\s+(\w+)"/)
      if (vfor) options = findOptionArray(src, vfor[1])
      // ② 直接写死的 el-radio
      if (!options) {
        const opts = []
        const rr = /<el-radio[^>]*value="([^"]*)"[^>]*>([^<]*)</g
        let rm
        while ((rm = rr.exec(body))) opts.push({ value: rm[1], label: rm[2].trim() })
        if (opts.length) options = opts
      }
      options = sanitizeOptions(options)
      if (options) {
        fields.push({
          key, label, type: 'select', options,
          default: findRefDefault(src, rg[1]) ?? options[0].value,
          ...(hint ? { hint } : {}),
        })
      }
      continue
    }

    const sel = body.match(/<el-select[^>]*v-model="([\w.$]+)"/)
    if (sel) {
      const key = sel[1].split('.').pop()
      let options = null
      const vfor = body.match(/v-for="\w+\s+in\s+(\w+)"/)
      if (vfor) options = findOptionArray(src, vfor[1])
      if (!options) {
        const opts = []
        // 只认静态 label="…" / value="…"；`:label` 是绑定表达式（如 `第 ${i} 级`），
        // 取到的是源码字符串不是渲染结果，提取出来是噪音
        const or = /<el-option[^>]*\slabel="([^"]*)"[^>]*\svalue="([^"]*)"/g
        let om
        while ((om = or.exec(body))) opts.push({ value: om[2], label: om[1] })
        if (opts.length) options = opts
      }
      options = sanitizeOptions(options)
      if (options) {
        fields.push({
          key, label, type: 'select', options,
          default: findRefDefault(src, sel[1]) ?? options[0].value,
          ...(hint ? { hint } : {}),
        })
      }
      continue
    }

    const num = body.match(/<el-input-number[^>]*v-model="([\w.$]+)"/)
    if (num) {
      const key = num[1].split('.').pop()
      fields.push({
        key, label, type: 'number',
        default: findRefDefault(src, num[1]) ?? 0,
        ...(hint ? { hint } : {}),
      })
    }
  }
  return fields
}

/** demo 文件名 → 组件 id（与 component-catalog 的 id 对齐） */
function demoIdOf(file) {
  return basename(file, '.vue').replace(/Demo$/, '')
}

export function extractAll() {
  const result = {}
  for (const file of demoFiles()) {
    const src = readFileSync(file, 'utf8')
    const cards = configCards(src)
    if (!cards.length) continue
    // 一个 demo 可能有多个 config-card（Select 的单选/多选、Input 的单行/文本域…）。
    // 两种重复要分开处理：
    //   ① 同 key —— 真·同一配置项在多张卡里重复演示，保留首个
    //   ② 同 label 不同 key —— 不同形态各有一份同名开关（DatePicker 的「时间」
    //      对应 withDateTime / withTime），**不能合并**，否则用户以为只有一个。
    //      给后出现的加序号后缀区分。
    const seenKey = new Set()
    const labelCount = new Map()
    const fields = []
    for (const card of cards) {
      for (const f of parseFields(card, src)) {
        if (seenKey.has(f.key)) continue
        seenKey.add(f.key)
        const n = (labelCount.get(f.label) || 0) + 1
        labelCount.set(f.label, n)
        if (n > 1) f.label = `${f.label} ${n}`
        fields.push(f)
      }
    }
    if (fields.length) result[demoIdOf(file)] = { demo: file.replace(ROOT + '/', ''), fields }
  }
  return result
}

// ── CLI ────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && process.argv[1].endsWith('extract-demo-configs.mjs')
if (isMain) {
  const all = extractAll()
  const names = Object.keys(all)
  if (process.argv.includes('--write')) {
    const out = join(ROOT, 'scripts/demo-configs.generated.json')
    writeFileSync(out, JSON.stringify(all, null, 2) + '\n')
    console.log(`✓ 已写入 ${out.replace(ROOT + '/', '')}（${names.length} 个组件）`)
  } else {
    for (const name of names) {
      console.log(`\n═══ ${name} ═══  (${all[name].demo})`)
      for (const f of all[name].fields) {
        const opts = f.options ? ` [${f.options.map((o) => o.label).join(' / ')}]` : ''
        const def = f.default !== undefined ? ` = ${JSON.stringify(f.default)}` : ''
        console.log(`  ${f.label.padEnd(10)} ${f.type}${opts}${def}${f.hint ? '  // ' + f.hint : ''}`)
      }
    }
    console.log(`\n共 ${names.length} 个组件有配置项`)
  }
}
