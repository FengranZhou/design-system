/**
 * 生成 catalog.json —— 扩展面板的组件数据，经 GitHub 分发
 * ============================================================================
 *
 * ## 这份产物解决什么
 *
 * 扩展跑在浏览器沙箱里，读不到任何本地仓库——**同事的机器上根本没有这个仓库**。
 * 所以组件数据必须变成一个可分发的产物：本脚本把三处来源合成 `catalog.json`，
 * 推到 GitHub 后，任何人的扩展都能 fetch 到最新版：
 *
 *   https://raw.githubusercontent.com/FengranZhou/design-system/main/scripts/catalog.json
 *
 * ## 三处来源，各管一段
 *
 * | 来源 | 提供什么 | 谁维护 |
 * |---|---|---|
 * | `demo/src/App.vue` 左侧导航 | 组件清单 + 分组（**启用**的才在导航里） | 人（加组件必然会加导航） |
 * | `demo/src/components/*Demo.vue` | 配置项开关（图标/下拉/可清除…） | 人（写 demo 时自然产生） |
 * | `component-catalog.mjs` | snippet 代码骨架 + mustRules 硬约束 | 人（机器提不出的语义） |
 *
 * 前两者自动提取，第三者手写——**因为从 demo 看不出「Empty 不传 :image 就落回
 * EP 纸盒图」这种规则**，那是语义不是结构。
 *
 * ## 新增组件时会发生什么
 *
 * 导航加一行 → 本脚本自动把它收进 catalog（带 demo 的配置项）。但它**没有
 * snippet**，面板里会标为「待补骨架」。`audit-spec.mjs` 会报出来提醒补。
 * 这是有意的：宁可先出现在列表里（可搜到、可打点），也不要因为没写骨架就整个
 * 消失——下游 CC 拿到组件名 + 配置 + 截图仍然能干活，只是少一段可照抄的代码。
 *
 * ## 用法
 *
 *   node scripts/build-catalog.mjs           # 生成并写入 scripts/catalog.json
 *   node scripts/build-catalog.mjs --check   # 只校验是否与当前源一致（CI / pre-push 用）
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { extractAll } from './extract-demo-configs.mjs'
import { COMPONENTS, GROUPS } from './component-catalog.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'scripts/catalog.json')

/** 导航里存在、但不是可插入组件的条目 */
const SKIP_ANCHORS = new Set(['other', 'data-display'])

/** demo 左侧导航的分组 key → catalog 分组 key */
const NAV_GROUP_MAP = {
  通用: 'general',
  导航: 'nav',
  数据录入: 'input',
  数据展示: 'display',
  反馈: 'feedback',
  其他: 'display',
}

/**
 * 从 demo 左侧导航提取启用的组件清单。
 *
 * 为什么以导航为准而不是扫 `el-theme/components/*.scss`：源头有 52 个 scss，
 * 其中一部分是**停用的**（见 references 的「⏸ 勿用清单」）。导航是人工维护的
 * 启用清单——注释掉的行就是停用，天然过滤。
 */
function navComponents() {
  const src = readFileSync(join(ROOT, 'demo/src/App.vue'), 'utf8')
  const out = []

  // 只取「基础组件」「业务组件」两个顶部 tab 的区块
  for (const tab of ['component', 'business']) {
    const re = new RegExp(`currentTopTab === '${tab}'"[\\s\\S]*?</template>`, 'm')
    const block = src.match(re)
    if (!block) continue

    let group = tab === 'business' ? 'business' : 'general'
    // 逐行扫：分组标题切换 group，li 行收组件（注释掉的行天然跳过）
    for (const line of block[0].split('\n')) {
      const g = line.match(/class="app-sidebar__group-label">([^<]+)</)
      if (g) {
        group = NAV_GROUP_MAP[g[1].trim()] || group
        continue
      }
      if (/^\s*<!--/.test(line)) continue // 注释掉的导航项 = 停用
      const m = line.match(/href="#([\w-]+)"[^>]*>([^<]+)</)
      // 「其他」是 demo 的杂项承载页，不是一个可插入的组件
      if (m && !SKIP_ANCHORS.has(m[1])) out.push({ anchor: m[1], name: m[2].trim(), group })
    }
  }
  return out
}

/** 导航锚点 → demo 文件名前缀（提取配置项时用） */
const ANCHOR_TO_DEMO = {
  'date-picker': 'DatePicker',
  'data-display': 'DataDisplay',
  table: 'Table',
  'step-bar': 'StepBar',
}
function demoKeyOf(anchor) {
  if (ANCHOR_TO_DEMO[anchor]) return ANCHOR_TO_DEMO[anchor]
  return anchor.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())
}

/**
 * 手写条目按 id 建索引。id 与导航锚点不总是一一对应——表单类组件在 catalog 里
 * 是 `form-item-input`（因为插入的是带 label 的完整表单项，不是裸 input），
 * 这里用 `anchor` 字段显式声明对应关系。
 */
function handwrittenIndex() {
  const idx = new Map()
  for (const c of COMPONENTS) {
    const anchor = c.anchor || c.id
    idx.set(anchor, c)
  }
  return idx
}

export function buildCatalog() {
  const demoConfigs = extractAll()
  const handwritten = handwrittenIndex()
  const nav = navComponents()

  const components = []
  const missingSnippet = []

  for (const item of nav) {
    const hw = handwritten.get(item.anchor)
    const dc = demoConfigs[demoKeyOf(item.anchor)]

    // 配置项 = demo 提取的形态开关 + 手写的实例参数（文案/标签/宽度…）
    // 两者性质不同：前者是"组件有哪些样子"（demo 演示的），后者是"这次插入
    // 的实例怎么配"（demo 不需要问，因为它写死了）。合并而非替换。
    const demoFields = dc ? dc.fields : []
    const instanceFields = hw ? (hw.instanceFields || []) : []
    const seen = new Set(demoFields.map((f) => f.key))
    const fields = [
      ...instanceFields.filter((f) => !seen.has(f.key)),
      ...demoFields,
    ]

    const entry = {
      id: hw ? hw.id : item.anchor,
      anchor: item.anchor,
      name: item.name,
      group: item.group,
      desc: hw ? hw.desc : '',
      keywords: hw ? hw.keywords : [item.name],
      fields,
      readRefs: hw ? hw.readRefs : [],
      mustRules: hw ? hw.mustRules : [],
      // snippet 是函数，JSON 里存不了 —— 存源码字符串，扩展侧用 new Function 还原
      snippetSrc: hw && hw.snippet ? hw.snippet.toString() : null,
    }
    if (!entry.snippetSrc) missingSnippet.push(item.name)
    components.push(entry)
  }

  return {
    version: 1,
    generatedFrom: 'FengranZhou/design-system',
    groups: GROUPS,
    components,
    _stats: { total: components.length, missingSnippet },
  }
}

// ── CLI ────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && process.argv[1].endsWith('build-catalog.mjs')
if (isMain) {
  const cat = buildCatalog()
  const stats = cat._stats
  delete cat._stats
  const json = JSON.stringify(cat, null, 2) + '\n'

  if (process.argv.includes('--check')) {
    const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
    if (prev !== json) {
      console.error('✗ catalog.json 与当前设计系统不一致')
      console.error('  跑一次：node scripts/build-catalog.mjs   然后提交生成物')
      process.exit(1)
    }
    console.log(`✓ catalog.json 是最新的（${stats.total} 个组件）`)
  } else {
    writeFileSync(OUT, json)
    console.log(`✓ 已生成 scripts/catalog.json —— ${stats.total} 个组件`)
    if (stats.missingSnippet.length) {
      console.log(`\n⚠ ${stats.missingSnippet.length} 个组件还没有代码骨架（snippet）：`)
      console.log('  ' + stats.missingSnippet.join('、'))
      console.log('  它们仍会出现在面板里（可搜索、可打点、带配置项），')
      console.log('  只是复制出的 prompt 少一段可照抄的代码。')
      console.log('  补法：在 scripts/component-catalog.mjs 加条目（见该文件顶部说明）')
    }
  }
}
