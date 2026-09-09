#!/usr/bin/env node
/**
 * 公司仓脱敏 —— 抹掉 GitHub / 个人仓的一切痕迹
 * ============================================================================
 *
 * ## 为什么需要
 *
 * 本设计系统同时维护在 GitHub 个人仓与公司内网仓。**公司仓那份不能看出
 * 「同一套代码也提交在 GitHub 个人仓」**——这不是技术问题，是合规要求。
 *
 * 但脱敏不能靠每次 push 时手动记得改：漏一次就泄露，且泄露后写进历史无法撤回。
 * 故做成脚本，由「双仓推送流程」在同步到公司仓前**强制跑一次**（见根 CLAUDE.md）。
 *
 * ## 处理什么
 *
 * ① 文件内容里的 GitHub URL / 仓库名 / 双仓流程段落
 * ② 提交说明里的 GitHub 字样（由流程负责改写，本脚本只负责校验并报出）
 *
 * ## 用法
 *
 *   node scripts/sanitize-for-iflytek.mjs          # 执行脱敏（改工作区文件）
 *   node scripts/sanitize-for-iflytek.mjs --check  # 只检查、不改（退出码 1 = 有残留）
 *
 * ⚠️ 只在 iflytek-sync-done 分支上跑。在 main 上跑会把 GitHub 配置也抹掉。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const CHECK = process.argv.includes('--check')

/* 替换规则：[正则, 替换为, 说明] */
const RULES = [
  // 具体仓库地址 → 公司私服
  [/https:\/\/raw\.githubusercontent\.com\/FengranZhou\/design-system\/main\//g,
   'https://code.iflytek.com/EBG_iflyhed/FrontEnd/template/xy-design-system/raw/master/',
   'raw 分发地址'],
  [/FengranZhou\/design-system/g, 'xy-design-system', '仓库名'],
  [/git@github-personal:[^\s`'")]+/g, '<内网仓地址>', 'SSH 地址'],
  [/https:\/\/github\.com\/FengranZhou[^\s`'")]*/g, '<内网仓地址>', 'GitHub 主页'],
  // 泛化措辞：GitHub → 中性说法
  [/经 GitHub 拉取/g, '经远程仓库拉取', '措辞'],
  [/经 GitHub 分发/g, '经远程仓库分发', '措辞'],
  [/推到 GitHub 后/g, '推到远程仓库后', '措辞'],
  [/从 GitHub raw URL/g, '从远程仓库 raw URL', '措辞'],
  [/从 GitHub 拉最新/g, '从远程仓库拉最新', '措辞'],
  // 流程图 / 表格里孤立的 GitHub 字样
  [/→ GitHub$/gm, '→ 远程仓库', '流程图'],
  [/ GitHub 分发/g, ' 远程仓库分发', '措辞'],
]

/* 白名单：与个人仓无关的第三方 github 域名，不算泄露 */
const ALLOW = [/jqlang\.github\.io/, /github\.com\/(?!FengranZhou)/]

/* 整段删除：根 CLAUDE.md 的双仓推送流程（公司仓不该有这段） */
function stripDualRepoSection(text) {
  const start = text.indexOf('## 🚀 双仓推送流程')
  if (start === -1) return { text, removed: false }
  // 删到下一个同级标题或文件末尾；连同其前面的分隔线一起去掉
  const rest = text.slice(start + 10)
  const nextIdx = rest.indexOf('\n## ')
  const end = nextIdx === -1 ? text.length : start + 10 + nextIdx + 1
  let head = text.slice(0, start)
  head = head.replace(/\n---\s*\n\s*$/, '\n')
  return { text: head + text.slice(end), removed: true }
}

/* 待扫描文件：git 跟踪的文本文件 */
const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(f => !/\.(png|jpe?g|gif|ttf|otf|woff2?|ico|pdf|zip)$/i.test(f))
  .filter(f => existsSync(f))

let changed = 0
const findings = []

for (const f of files) {
  let text
  try { text = readFileSync(f, 'utf8') } catch { continue }
  const before = text

  if (f === 'CLAUDE.md') {
    const r = stripDualRepoSection(text)
    if (r.removed) { text = r.text; findings.push(`${f}: 双仓推送流程段` ) }
  }
  for (const [re, to, label] of RULES) {
    if (ALLOW.some(a => a.test(text)) && !/FengranZhou/.test(text) && label === '措辞' && !re.test(text)) { re.lastIndex = 0; continue }
    if (re.test(text)) {
      findings.push(`${f}: ${label}`)
      text = text.replace(re, to)
    }
    re.lastIndex = 0
  }

  if (text !== before) {
    changed++
    if (!CHECK) writeFileSync(f, text)
  }
}

/* 提交说明检查（本脚本不改历史，只报出——由流程在 cherry-pick 时改写） */
let msgHits = []
try {
  const log = execSync('git log --format=%H%x00%s%x00%b HEAD', { encoding: 'utf8' })
  for (const entry of log.split('\n\n')) {
    const [h, s = '', b = ''] = entry.split('\0')
    if (!h) continue
    if (/github|个人仓|FengranZhou/i.test(s + b)) msgHits.push(`${h.slice(0, 7)} ${s.slice(0, 60)}`)
  }
} catch {}

console.log('')
console.log(CHECK ? '公司仓脱敏检查' : '公司仓脱敏')
console.log('─'.repeat(60))
if (findings.length) {
  console.log(`${CHECK ? '发现' : '已处理'} ${findings.length} 处文件内容：`)
  findings.forEach(x => console.log('  ·', x))
} else {
  console.log('✓ 文件内容干净')
}
if (msgHits.length) {
  console.log('')
  console.log(`⚠ ${msgHits.length} 个提交的说明里含 GitHub 字样（需在 cherry-pick 时用 --edit 改写）：`)
  msgHits.slice(0, 10).forEach(x => console.log('  ·', x))
  if (msgHits.length > 10) console.log(`  … 另有 ${msgHits.length - 10} 个`)
}
console.log('')

if (CHECK && (findings.length || msgHits.length)) process.exit(1)
process.exit(0)
