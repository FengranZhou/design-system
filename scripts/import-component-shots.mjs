/**
 * 把手工准备的组件示意图导入 component-shots.json
 * ============================================================================
 *
 * ## 为什么有这个脚本
 *
 * `shoot-components.mjs` 是自动拍 demo，好处是跟着源头变，坏处是取景由算法
 * 决定 —— 遇到「超宽超矮」（单元格 2334×132）或「一屏装不下」（页面框架）
 * 的组件，自动取景很难拍出人看得懂的一张。手工挑好角度截的图更准。
 *
 * 所以两条路并存：**手工图优先，自动拍只补新组件**。
 *
 * ## 手工图怎么被保护住不被覆盖
 *
 * 导入时把该组件的指纹写成 `MANUAL_MARK`（见下）。`shoot-components.mjs`
 * 认这个标记 —— 见到它就跳过，**无论 demo 或主题怎么改都不重拍**。
 * 于是「后续只给新组件拍图」这件事不需要额外开关，靠数据本身表达。
 *
 * 想让某张图回到自动拍：删掉 shots/marks 里它那一项，或
 * `node scripts/shoot-components.mjs <anchor>` 显式指定（显式指定优先于标记）。
 *
 * ## 命名怎么对上
 *
 * 图的文件名就是组件的中文名（`按钮.jpg` / `轻量步骤条.jpg`），跟 demo 左侧
 * 导航里 `Button 按钮` 的中文段落精确匹配。**不做模糊匹配**：`标签`/`标签页`、
 * `步骤条`/`轻量步骤条` 互为前缀，模糊匹配必然配错。对不上的直接报出来，
 * 让人去改文件名，而不是猜。
 *
 * ## 尺寸处理
 *
 * 目标 260×140（扩展列表里按 130×70 显示，2x）。用 sips 两步：
 *   ① `-Z` 等比缩放，让长边贴住画布 —— 绝不裁切，宁可留白
 *   ② `-p` 补齐到精确画布，`--padColor FFFFFF` 白底
 * 顺序不能反：先补边再缩放会把白边也一起缩掉，得不到精确尺寸。
 *
 * 依赖都是 macOS 自带 / brew 常见：`sips`（系统自带）、`cwebp`（brew webp）。
 * 缺 cwebp 时退回 jpg base64 —— 体积大些但不阻断。
 *
 * ## 用法
 *
 *   node scripts/import-component-shots.mjs                  # 默认读 ~/Desktop/截图
 *   node scripts/import-component-shots.mjs <目录>            # 指定目录
 *   node scripts/import-component-shots.mjs --dry             # 只看匹配结果，不写文件
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir, homedir } from 'os'
import { execFileSync } from 'child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'scripts/component-shots.json')

/**
 * 手工图的指纹标记。
 *
 * 自动拍图的指纹是 `demoHash.themeHash` 这种十六进制串，这里用一个明显不是
 * 哈希的字符串，两者永不相等 —— shoot-components.mjs 靠它识别「这张是人挑的，
 * 别动」。改这个字符串要同步 shoot-components.mjs 里的同名常量。
 */
const MANUAL_MARK = 'manual'

/** 出图尺寸，必须与 shoot-components.mjs 的 OUT_W/OUT_H 一致 */
const OUT_W = 260
const OUT_H = 140

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const srcDir = args.find((a) => !a.startsWith('--')) || join(homedir(), 'Desktop/截图')

// ── 组件清单：与 shoot-components / build-catalog 同一数据源 ────────────
// demo 左侧导航就是「哪些组件正式启用」的唯一声明处。
function navItems() {
  const src = readFileSync(join(ROOT, 'demo/src/App.vue'), 'utf8')
  const out = []
  for (const tab of ['component', 'business']) {
    const re = new RegExp(`currentTopTab === '${tab}'"[\\s\\S]*?</template>`, 'm')
    const block = src.match(re)
    if (!block) continue
    for (const line of block[0].split('\n')) {
      if (/^\s*<!--/.test(line)) continue
      const m = line.match(/href="#([\w-]+)"[^>]*>([^<]+)</)
      if (m && m[1] !== 'other' && m[1] !== 'data-display') {
        out.push({ anchor: m[1], name: m[2].trim(), tab })
      }
    }
  }
  return out
}

/**
 * 从导航名里取出用来配图的那一段：`Picker 时间/日期选择器` → `时间/日期选择器`。
 * 导航名格式是「英文 中文」（见 design-spec/CLAUDE.md 的双语约定）。
 *
 * ⚠️ 只切掉第一个空格前的英文名，剩下整段都算中文名 —— **不能取纯中文尾段**：
 * `AiButton Ai按钮` 会被剥成 `按钮`，与 `Button 按钮` 撞成同一个 key，
 * 后写的把前面那个覆盖掉，于是 `按钮.jpg` 配到了 AI 按钮上，
 * 而真正的按钮反倒报「没有手工图」。
 */
function cnName(navName) {
  const s = String(navName).trim()
  const i = s.indexOf(' ')
  return i > 0 ? s.slice(i + 1).trim() : s
}

/**
 * 文件名归一化后再比对。
 *
 * 两处必须抹平：
 *   - `/` 在 macOS Finder 里存成 `:`（`时间:日期选择器.jpg` ← `时间/日期选择器`）
 *   - 大小写（`Ai按钮` ← `AiButton Ai按钮`）
 * 除此之外**不做任何模糊化**：`标签`/`标签页` 互为前缀，一旦允许包含匹配就会错配。
 */
function normalize(s) {
  return s.replace(/[:：\/]/g, '/').trim().toLowerCase()
}

if (!existsSync(srcDir)) {
  console.error('✗ 目录不存在：' + srcDir)
  process.exit(1)
}

const files = readdirSync(srcDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
if (!files.length) {
  console.error('✗ ' + srcDir + ' 里没有图片')
  process.exit(1)
}

// ── 建立 图片 ↔ 组件 的映射 ────────────────────────────────────────────
const items = navItems()
const byName = new Map()
for (const it of items) byName.set(normalize(cnName(it.name)), it)

const matched = []       // { item, file }
const unmatchedFiles = []
for (const f of files) {
  const key = normalize(basename(f, extname(f)))
  const it = byName.get(key)
  if (it) matched.push({ item: it, file: join(srcDir, f) })
  else unmatchedFiles.push(f)
}
const matchedAnchors = new Set(matched.map((m) => m.item.anchor))
const unmatchedComps = items.filter((it) => !matchedAnchors.has(it.anchor))

console.log(`图片 ${files.length} 张，启用组件 ${items.length} 个，匹配上 ${matched.length} 对`)
if (unmatchedFiles.length) {
  console.log('\n⚠ 这些图没对上任何组件（文件名需与导航里的中文名一致）：')
  for (const f of unmatchedFiles) console.log('   ' + f)
}
if (unmatchedComps.length) {
  console.log('\n⚠ 这些组件没有手工图（会继续由 shoot-components.mjs 自动拍）：')
  for (const it of unmatchedComps) console.log('   ' + it.anchor + '  ' + it.name)
}
if (dry) { console.log('\n(--dry 只看匹配，未写文件)'); process.exit(0) }
if (!matched.length) process.exit(1)

// ── 处理图片：等比缩放 → 白底补齐 → webp ───────────────────────────────
function has(cmd) {
  try { execFileSync('which', [cmd], { stdio: 'ignore' }); return true } catch (_) { return false }
}
const hasWebp = has('cwebp')
if (!hasWebp) console.log('\n⚠ 未找到 cwebp（brew install webp），退回 jpg —— 体积会大一些')

const tmp = mkdtempSync(join(tmpdir(), 'shot-import-'))
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const shots = prev.shots || {}
const marks = prev.marks || {}

let ok = 0
const failed = []
console.log('')
for (const { item, file } of matched) {
  const a = item.anchor
  try {
    // ① 等比缩放：长边贴住画布。-Z 只缩不裁，短边留待第 ② 步补白。
    const step1 = join(tmp, a + '-1.png')
    execFileSync('sips', ['-Z', String(Math.max(OUT_W, OUT_H)), file, '--out', step1], { stdio: 'ignore' })
    // ② 补齐到精确画布 + 白底。顺序不能与 ① 反 —— 先补再缩会把白边一起缩掉。
    const step2 = join(tmp, a + '-2.png')
    execFileSync('sips', ['-p', String(OUT_H), String(OUT_W), '--padColor', 'FFFFFF',
      step1, '--out', step2], { stdio: 'ignore' })

    let buf, mime
    if (hasWebp) {
      const w = join(tmp, a + '.webp')
      execFileSync('cwebp', ['-q', '82', '-quiet', step2, '-o', w], { stdio: 'ignore' })
      buf = readFileSync(w); mime = 'image/webp'
    } else {
      const j = join(tmp, a + '.jpg')
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '80',
        step2, '--out', j], { stdio: 'ignore' })
      buf = readFileSync(j); mime = 'image/jpeg'
    }

    shots[a] = 'data:' + mime + ';base64,' + buf.toString('base64')
    marks[a] = MANUAL_MARK      // ← 打上手工标记，自动拍图从此跳过它
    ok++
    console.log(`  ✓ ${a.padEnd(14)} ${basename(file)}  ${Math.round(buf.length / 1024)}KB`)
  } catch (e) {
    failed.push(a + ': ' + e.message)
  }
}
rmSync(tmp, { recursive: true, force: true })

writeFileSync(OUT, JSON.stringify({
  note: '由 scripts/shoot-components.mjs 生成，勿手改；改了 demo 或 el-theme 后重跑。' +
    'marks 为 "' + MANUAL_MARK + '" 的是手工导入图（scripts/import-component-shots.mjs），自动拍图会跳过',
  size: { w: OUT_W, h: OUT_H },
  marks,
  shots,
}, null, 2) + '\n')

const total = JSON.stringify(shots).length
console.log(`\n✓ ${ok} 张已导入（合计 ${Math.round(total / 1024)}KB）`)
if (failed.length) {
  console.log('\n✗ 失败：')
  for (const f of failed) console.log('   ' + f)
}
console.log('提醒：接着跑 node scripts/build-catalog.mjs 让 catalog.json 带上新图')
