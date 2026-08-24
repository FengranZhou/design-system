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

/**
 * 组件示意图（base64 webp），由 scripts/shoot-components.mjs 拍 demo 生成。
 * 缺失不报错——图是锦上添花，没有也不该挡住 catalog 生成。
 */
const SHOTS_FILE = join(dirname(fileURLToPath(import.meta.url)), 'component-shots.json')
const SHOTS = existsSync(SHOTS_FILE)
  ? (JSON.parse(readFileSync(SHOTS_FILE, 'utf8')).shots || {})
  : {}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'scripts/catalog.json')

/** 导航里存在、但不是可插入组件的条目 */
const SKIP_ANCHORS = new Set(['other', 'data-display'])

/**
 * demo 有、但**插入场景用不上**的配置项。
 *
 * demo 的开关回答「这个组件有哪些样子可以看」，插入面板问的是「你这次要插的
 * 这个实例怎么配」。有些开关只属于前者：
 *   searchCollapsed —— SearchMini 的展开/收起形态，插普通输入框时无意义
 * 排除比"硬接进 snippet"诚实：与其生成一段用户没要的代码，不如不问。
 */
const EXCLUDE_FIELDS = new Set(['searchCollapsed'])

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
 * snippet 的兜底取值 —— instanceFields 的 default 集合
 *
 * `fields`（面板要问用户的）已按上文注释收敛为「只取 demo 的形态开关」，于是
 * `component-catalog.mjs` 里手写的 instanceFields（文案 / 类型 / 宽度…）不再进
 * 面板。但 **snippet 仍然读这些 key** —— 它是按"全部配置都拿得到"写的。
 *
 * 结果曾是：Button 的 `type` 没人传，snippet 渲染出 `type="undefined"`，
 * Tag、Alert 同样。这段代码**不报错、粘到下游还能编译**（Vue 只当它是字符串
 * "undefined"），只有对着生成的代码逐字看才能发现 —— 与上文「配置项必须真的
 * 影响产物」防的是同一类问题：产物说了谎。
 *
 * 所以把 instanceFields 的默认值单独发出来，消费方（扩展面板 / demo 页按钮）
 * 调 snippet 前先铺一层：`{ ...snippetDefaults, ...用户填的值 }`。
 * 它**不是配置项**（不进面板、不问用户），只是让骨架有个像样的默认形态。
 */
function snippetDefaultsOf(hw) {
  const out = {}
  for (const f of hw?.instanceFields || []) {
    if (f.default !== undefined && f.default !== '') out[f.key] = f.default
  }
  return out
}

/**
 * 骨架自检 —— 用「兜底默认 + 配置项默认」渲染一次，看有没有渲染成 undefined
 *
 * `type="undefined"` 这类产物**不报错、粘到下游照样编译**（Vue 当它是普通字符串），
 * 只有逐字看生成的代码才能发现。和上文「不影响产物的配置项」是同一类问题：
 * 产物在说谎，而且没有任何信号。所以在生成阶段就渲染一遍验掉。
 */
function renderProbe(entry, comp) {
  if (!entry.snippetSrc || !comp?.snippet) return null
  const values = { ...entry.snippetDefaults }
  for (const f of entry.fields || []) {
    if (values[f.key] === undefined) values[f.key] = f.default ?? ''
  }
  let code
  try {
    code = comp.snippet(values)
  } catch (e) {
    return `骨架抛错：${e.message}`
  }
  const hit = code.match(/"undefined"|=undefined|>undefined<|NaN/)
  return hit ? `骨架渲染出 ${hit[0]}` : null
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

/**
 * 变体索引：父 anchor → 该父下的变体条目数组。
 *
 * ## 为什么需要「变体」这个概念
 *
 * demo 一个页面里常演示同一物料的多个**独立形态**：InputDemo 里的搜索框 /
 * 数字输入框 / 文本域，SelectDemo 里的分组 / 树形 / 级联。它们各自是插入时
 * 要单独挑的东西（用户打「/文本域」应该能搜到），但在 demo 导航里只有一个
 * 「Input 输入框」条目 —— 导航的粒度是「一页 demo」，不是「一个可插入物料」。
 *
 * 早先这些变体在 component-catalog.mjs 里复用父 anchor（`anchor: 'input'`），
 * 结果被 handwrittenIndex 的 Map 覆盖成只剩最后一个，且 name 被导航名盖掉。
 * 现在改为：变体有自己的 anchor，并用 `variantOf` 显式声明父 anchor。
 *
 * ## 为什么不直接放行所有手写条目
 *
 * 「导航是启用清单」这条纪律要留着 —— 停用一个组件只需注释掉导航行，变体
 * 应该跟着一起消失。挂在父 anchor 下天然满足：父不在导航里，变体也不会出现。
 */
function variantIndex() {
  const idx = new Map()
  for (const c of COMPONENTS) {
    if (!c.variantOf) continue
    if (!idx.has(c.variantOf)) idx.set(c.variantOf, [])
    idx.get(c.variantOf).push(c)
  }
  return idx
}

export function buildCatalog() {
  const demoConfigs = extractAll()
  const handwritten = handwrittenIndex()
  const variants = variantIndex()
  const nav = navComponents()

  const components = []
  const missingSnippet = []
  const missingShot = []
  const deadFields = []
  const brokenSnippet = []

  for (const item of nav) {
    const hw = handwritten.get(item.anchor)
    const dc = demoConfigs[demoKeyOf(item.anchor)]

    // 配置项 **只取 demo 的形态开关** —— 设计系统里「配置项」有严格定义：
    // 按 CLAUDE.md「配置式组件设计范式」，互斥选一的是**类型**（次/主/危险），
    // 可自由叠加的才是**配置项**（带图标、带下拉箭头…）。demo 右侧那张
    // 「配置项」卡片列的就是后者，那就是这个组件配置项的全集。
    //
    // 曾经额外并入过 component-catalog.mjs 里手写的 instanceFields
    // （文案/类型/loading 之类"这次插入的实例怎么配"），结果面板里的配置项
    // 比 demo 多出好几项，与设计系统对不上。现在一律以 demo 为准，
    // 文案、类型这些让用户在需求描述里自己说（"右上角加个【Button】，
    // 主按钮，写'导出'"）—— 描述比表单更自然，也不会跟规范打架。
    //
    // demo 的重复形态组不进面板：Select 有 5 张 config-card（单选/多选/分组/
    // 树形/级联各一套「可清除·可搜索」），插入一个实例只需要一套。
    // 带数字后缀的 label（「可清除 2」）就是 extract 加的去重标记，一律丢弃。
    const fields = (dc ? dc.fields : [])
      .filter((f) => !/ \d+$/.test(f.label))
      .filter((f) => !EXCLUDE_FIELDS.has(f.key))

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
      // snippet 的兜底取值（见 snippetDefaultsOf）：不进面板，只保证骨架有默认形态
      snippetDefaults: snippetDefaultsOf(hw),
      // 示意图：随 catalog 一起分发，扩展不用额外请求
      shot: SHOTS[item.anchor] || null,
    }
    if (!entry.snippetSrc) missingSnippet.push(item.name)
    if (!entry.shot) missingShot.push(item.name)

    // 配置项必须真的影响产物。开关开了、代码里却没有 —— 用户会以为生效了，
    // 这比"没有这个开关"更糟：配置界面说了谎，而且只有对着生成的代码逐字
    // 核对才能发现。所以在生成阶段就报出来。
    if (entry.snippetSrc) {
      const dead = fields
        .filter((f) => entry.snippetSrc.indexOf(f.key) < 0)
        .map((f) => `${f.key}(${f.label})`)
      if (dead.length) deadFields.push({ name: item.name, dead })
    }
    const probe = renderProbe(entry, hw)
    if (probe) brokenSnippet.push(`${item.name}：${probe}`)

    components.push(entry)

    // 紧跟父组件之后插入它的变体（搜索框 / 文本域 / 树形选择器…）。
    // 排在父后面而不是集中在末尾：面板列表按数组顺序渲染，同族物料挨着
    // 出现，用户扫列表时「Input 系」是连续一段，不用来回跳。
    for (const v of (variants.get(item.anchor) || [])) {
      // 变体的配置项走手写 instanceFields，不取 demo。demo 那张 config-card
      // 是挂在父块上的（「可清除 2」这类去重后缀就是同页多块的痕迹），
      // 按 anchor 分不出哪几项属于哪个变体 —— 硬分只会分错。
      const vFields = (v.instanceFields || []).filter((f) => !EXCLUDE_FIELDS.has(f.key))
      const vEntry = {
        id: v.id,
        anchor: v.anchor,
        name: v.name,
        group: v.group || item.group,
        desc: v.desc || '',
        keywords: v.keywords || [v.name],
        fields: vFields,
        readRefs: v.readRefs || [],
        mustRules: v.mustRules || [],
        snippetSrc: v.snippet ? v.snippet.toString() : null,
        snippetDefaults: snippetDefaultsOf(v),
        shot: SHOTS[v.anchor] || null,
        // 声明父子关系，供扩展侧分组展示 / 溯源用
        variantOf: v.variantOf,
      }
      if (!vEntry.snippetSrc) missingSnippet.push(v.name)
      if (!vEntry.shot) missingShot.push(v.name)
      if (vEntry.snippetSrc) {
        const dead = vFields
          .filter((f) => vEntry.snippetSrc.indexOf(f.key) < 0)
          .map((f) => `${f.key}(${f.label})`)
        if (dead.length) deadFields.push({ name: v.name, dead })
      }
      const vProbe = renderProbe(vEntry, v)
      if (vProbe) brokenSnippet.push(`${v.name}：${vProbe}`)
      components.push(vEntry)
    }
  }

  // 变体的父 anchor 必须真的在导航里，否则它静默消失 —— 这类「写了但没生效」
  // 最难发现（面板里就是少一项，没人会注意）。在生成阶段直接报出来。
  const navAnchors = new Set(nav.map((n) => n.anchor))
  const orphanVariants = []
  for (const [parent, list] of variants) {
    if (navAnchors.has(parent)) continue
    for (const v of list) orphanVariants.push(`${v.name}（variantOf: ${parent}）`)
  }

  return {
    version: 1,
    generatedFrom: 'FengranZhou/design-system',
    groups: GROUPS,
    components,
    _stats: {
      total: components.length,
      missingSnippet,
      missingShot,
      deadFields,
      brokenSnippet,
      orphanVariants,
    },
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
    if (stats.deadFields.length) {
      console.log(`\n⚠ ${stats.deadFields.length} 个组件有「不影响产物」的配置项：`)
      for (const d of stats.deadFields) {
        console.log(`  ${d.name}：${d.dead.join('、')}`)
      }
      console.log('  用户开了这些开关，生成的代码却不变 —— 配置界面在说谎。')
      console.log('  修法：让 component-catalog.mjs 的 snippet 读这些 key，')
      console.log('       或确认该开关不该出现在插入场景（demo 演示用，非实例参数）。')
    }
    if (stats.brokenSnippet.length) {
      console.log(`\n✗ ${stats.brokenSnippet.length} 个组件的骨架渲染出了 undefined / NaN：`)
      for (const b of stats.brokenSnippet) console.log(`  ${b}`)
      console.log('  这段代码不报错、粘到下游照样编译，只有逐字看才发现 —— 必须修。')
      console.log('  常见原因：snippet 读了某个 key，但它既不在 demo 配置项里、')
      console.log('           instanceFields 里也没给 default。补上 default 即可。')
    }
    if (stats.orphanVariants.length) {
      console.log(`\n✗ ${stats.orphanVariants.length} 个变体的父组件不在 demo 导航里，已被丢弃：`)
      console.log('  ' + stats.orphanVariants.join('、'))
      console.log('  variantOf 必须指向 demo/src/App.vue 导航里真实存在的 anchor。')
    }
    if (stats.missingShot.length) {
      console.log(`\n⚠ ${stats.missingShot.length} 个组件还没有示意图：`)
      console.log('  ' + stats.missingShot.join('、'))
      console.log('  补法：cd demo && pnpm build，然后 node scripts/shoot-components.mjs --missing')
    }
    if (stats.missingSnippet.length) {
      console.log(`\n⚠ ${stats.missingSnippet.length} 个组件还没有代码骨架（snippet）：`)
      console.log('  ' + stats.missingSnippet.join('、'))
      console.log('  它们仍会出现在面板里（可搜索、可打点、带配置项），')
      console.log('  只是复制出的 prompt 少一段可照抄的代码。')
      console.log('  补法：在 scripts/component-catalog.mjs 加条目（见该文件顶部说明）')
    }
  }
}
