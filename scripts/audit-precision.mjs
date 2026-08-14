#!/usr/bin/env node
/**
 * 取值精度审计 —— 回答「下游能不能取到正确的那一档，而不是取成邻近档」
 *
 * 与 audit-spec.mjs 的分工：
 *   audit-spec.mjs  查「有没有」（覆盖率、引用失效、停用未标注）
 *   audit-precision.mjs 查「准不准」（多档位体系里，每档是否有唯一可判的场景锚点）
 *
 * 为什么需要它：令牌选错**不报错、编译通过、页面能跑**，只是视觉全乱。
 * 真实翻车：spacing 的 2/4/6/8 四档曾共用一个场景词「微间距」，
 * 下游在 Tag 内边距 / 图标间距之间只能靠猜。
 *
 * 用法：node scripts/audit-precision.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = join(ROOT, 'design-spec')
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const foundations = read(join(SPEC, 'references/foundations.md'))

const problems = []

/**
 * 通用检查：从 md 表格里抽出「令牌 → 用途」，检查
 *   ① 有没有档位的用途是空的
 *   ② 有没有多个档位共用同一句用途描述（= 无法区分）
 */
function checkScale(name, rows) {
  // 只判「空」，不判「短」——「大卡片」「抽屉」这类两三个字的用途是精确的，
  // 短不等于含糊（首版按长度阈值判，把它们误报成缺失）
  const empty = rows.filter((r) => !r.usage || !r.usage.replace(/[—\-\s]/g, ''))
  if (empty.length) {
    problems.push({
      scale: name,
      kind: '档位无用途',
      detail: empty.map((r) => `    ${r.token}`).join('\n'),
      why: '下游拿到一个值但不知道何时用它',
    })
  }

  // 用途去掉标点、取前 12 字做指纹，找共用同一描述的档
  const byUsage = new Map()
  for (const r of rows) {
    if (!r.usage) continue
    const fp = r.usage.replace(/[（(].*?[)）]|[*`—\-·、，。：:]/g, '').trim().slice(0, 12)
    if (!fp) continue
    if (!byUsage.has(fp)) byUsage.set(fp, [])
    byUsage.get(fp).push(r.token)
  }
  const dup = [...byUsage].filter(([, ts]) => ts.length > 1)
  if (dup.length) {
    problems.push({
      scale: name,
      kind: '多档共用同一用途',
      detail: dup
        .map(([fp, ts]) => `    「${fp}…」← ${ts.join(' / ')}`)
        .join('\n'),
      why: '下游在这几档之间无判据可依，只能凭手感取',
    })
  }
}

/** 从 foundations 的某个小节里抽表格行 */
function tableRows(sectionRe, tokenRe, usageCol) {
  const sec = foundations.match(sectionRe)?.[0] || ''
  return sec
    .split('\n')
    .filter((l) => l.startsWith('|') && tokenRe.test(l))
    .map((l) => {
      const cols = l.split('|').map((c) => c.trim())
      const token = (cols.find((c) => tokenRe.test(c)) || '').replace(/`|\*/g, '')
      return { token, usage: cols[usageCol] || '' }
    })
    .filter((r) => r.token)
}

// ── 间距：单一数据源在 spacing-usage.ts，不在 md ──────────────────
{
  const src = read(join(SPEC, 'design-token/spacing-usage.ts'))
  const rows = [...src.matchAll(/name:\s*'(--iflyv-spacing[^']+)'[\s\S]*?scenes:\s*\[([^\]]*)\]/g)]
    .map((m) => ({ token: m[1], usage: m[2].replace(/['\s]/g, '') }))
  checkScale('间距 spacing', rows)
}

// ── 圆角 ────────────────────────────────────────────────────────
checkScale('圆角 radius', tableRows(/### 圆角速查[\s\S]*?(?=\n### )/, /radius-/, 3))

// ── 阴影 ────────────────────────────────────────────────────────
checkScale('阴影 shadow', tableRows(/### 阴影速查[\s\S]*?(?=\n### |\n---)/, /shadow-/, 2))

// ── 语义字阶 ─────────────────────────────────────────────────────
checkScale('语义字阶 font', tableRows(/### 语义字阶 → 用途[\s\S]*?(?=\n### |\n>)/, /--iflyv-font-/, 2))

// ── 文本 / 图标色阶 ──────────────────────────────────────────────
checkScale('文本色 text', tableRows(/### 文本 \/ 图标色阶 → 用途[\s\S]*?(?=\n### |\n>)/, /--iflyv-text-/, 4))

// ── 背景色 ──────────────────────────────────────────────────────
checkScale('背景色 bg', tableRows(/### 背景色 → 用途[\s\S]*?(?=\n### |\n>)/, /--iflyv-bg-/, 2))

// ── 描边色 ──────────────────────────────────────────────────────
checkScale('描边色 border', tableRows(/### 描边色 → 用途[\s\S]*?(?=\n### |\n>)/, /--iflyv-border-/, 2))

// ── z-index ─────────────────────────────────────────────────────
checkScale('层级 z-index', tableRows(/### z-index 令牌 → 用途[\s\S]*?(?=\n>|\n---)/, /--iflyv-z-/, 3))

// ── 跨文档：同一件事有没有两处给不同答案 ──────────────────────────
// 这类是最危险的（不是"没写"而是"两处都写了但说反了"），脚本只能查已知模式
{
  const KNOWN_CONFLICTS = [
    {
      topic: '弹窗 800 档是否用于双列表单',
      a: { file: 'references/patterns/dialog-pattern.md', re: /800px \| 双列表单/ },
      b: { file: 'references/patterns/form-pattern.md', re: /一律单列/ },
      hint: 'dialog 若把 800 档写成「双列表单」，与 form「一律单列」冲突',
    },
    {
      topic: '工具栏元素间距',
      a: { file: 'references/foundations.md', re: /工具栏内元素之间.*spacing-3.*~.*spacing-4/ },
      b: { file: 'references/patterns/toolbar-pattern.md', re: /相邻元素水平间距/ },
      hint: 'foundations 若给「12~16 自选」区间，与 toolbar 源头锁死 12 冲突',
    },
  ]
  for (const c of KNOWN_CONFLICTS) {
    const aHit = c.a.re.test(read(join(SPEC, c.a.file)))
    const bHit = c.b.re.test(read(join(SPEC, c.b.file)))
    if (aHit && bHit) {
      problems.push({
        scale: '跨文档口径',
        kind: `冲突复发：${c.topic}`,
        detail: `    ${c.a.file} 与 ${c.b.file} 同时命中`,
        why: c.hint,
      })
    }
  }
}

// ── 输出 ────────────────────────────────────────────────────────
console.log('\n取值精度审计（每档是否有唯一可判的场景锚点）')
console.log('─'.repeat(62))

if (!problems.length) {
  console.log('✓ 所有档位体系均有唯一场景锚点，无邻近档歧义\n')
  process.exit(0)
}

for (const p of problems) {
  console.log(`\n✗ [${p.scale}] ${p.kind}`)
  console.log(p.detail)
  console.log(`    → ${p.why}`)
}
console.log(`\n${'─'.repeat(62)}\n共 ${problems.length} 处取值歧义。\n`)
process.exit(1)
