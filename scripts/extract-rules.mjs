#!/usr/bin/env node
/**
 * 评判标准条目提取器
 *
 * 用途：把散落在 references/*.md 里的规则，按 `@rule` 标记提取成结构化条目，
 *      供「评判标准」demo 页渲染与（后续）接入方代码评分脚本消费。
 *
 * ⚠️ 核心设计：条目是规范的「投影」，不是副本。
 *   条目的判据永远在 references 正文里，本脚本只做提取。
 *   → 改规范 = 改条目，天然同步，不会出现「规范说 A、清单说 B」的裂缝。
 *   → 新增组件/模式时只要按格式打标记，条目自动进评判标准（audit-spec C8 兜底防漏）。
 *
 * 用法：node scripts/extract-rules.mjs          # 提取并写入 JSON
 *      node scripts/extract-rules.mjs --check  # 只校验不写盘（CI 用）
 *
 * 退出码：0 = 成功；1 = 标记有误（重复 id / 非法字段值等）
 *
 * ── 标记语法 ──────────────────────────────────────────────
 * 写在规则行末尾的 HTML 注释里（md 渲染时不可见，不影响阅读）：
 *
 *   - ❌ 硬编码颜色值 <!-- @rule id=color-no-hardcode level=MUST cat=颜色 detect=regex -->
 *
 * 字段：
 *   id      必填，kebab-case，全局唯一，稳定不变（跨版本追踪同一条目）
 *   level   必填，MUST | SHOULD | MAY —— 决定权重与是否卡红线
 *   cat     必填，条目归类（对齐平台侧评判表类别，见 CATEGORIES）
 *   detect  必填，regex | ast | manual —— 检测方式，manual = 只能人工判定
 *   weight  选填，覆盖 level 默认权重（LEVEL_WEIGHT）
 *   title   选填，覆盖条目标题（默认取规则行正文）
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = join(ROOT, 'design-spec')
const REFS = join(SPEC, 'references')
const OUT = join(SPEC, 'references', 'rules.generated.json')
const CHECK_ONLY = process.argv.includes('--check')

// 分级 → 默认权重。可被标记里的 weight= 覆盖。
const LEVEL_WEIGHT = { MUST: 3, SHOULD: 2, MAY: 1 }

// 条目类别：按**本仓库自身的规范体系**划分（令牌 / 组件 / 模式 / 文案四层 + 单一数据源根基），
// 而非照搬外部评判表的分类。这样每个类别都能直接对应到一份规范文档，找条目时可顺藤摸瓜。
// 顺序即页面展示顺序，也大致是「违反后果由重到轻」。
const CATEGORIES = [
  '单一数据源', // 最高铁律：禁 scoped 私货、三层接入、禁拷贝式 —— 违反即全盘脱钩
  '设计令牌', // 颜色/字号/间距/圆角/阴影/动效一律走令牌，禁裸值
  '组件选用', // 该用哪个：勿用清单、禁手撸等价物、业务组件优先
  '组件用法', // 选对了怎么用：必传 prop、约定 class、禁覆盖
  '布局与栅格', // 栅格档位、1200 硬下限、分隔手法
  '设计模式', // 表单/表格/工具栏/弹窗/搜索的组织方式
  '状态设计', // 加载/空态/错误态/禁用态
  '文案规范', // 时间格式等展示口径
  '视觉呈现', // 主按钮位置、装饰克制、层级对比 —— 人工判定为主
]

const DETECTS = ['regex', 'ast', 'manual']

// 条目视角：决定它在评判页的哪个视角下出现。
//
// ⚠️ 关键认识：**同一条规则，设计师与研发看到的是不同的东西**。
//   「el-button 的 type 仅允许 default/primary/danger」——研发看的是 prop 取值；
//   设计师看到的是「冒出一个橙色按钮」，他判断得了现象、说不出 API。
//   所以这类条目不该二选一地丢给某一边，而应**一条规则两种措辞**：
//   写 `dtitle=` 给出设计措辞，该条目便在两个视角下各以对应说法出现。
//
//   design：只有设计措辞（纯视觉判断，无需懂代码）
//   impl  ：只有技术措辞（页面上看不出来，如 scoped 私货、引入顺序、拷贝式接入）
//   both  ：两边都出现，措辞各异 —— 由「标了 dtitle」自动推导，不必手写
const VIEWS = ['design', 'impl']
const DEFAULT_VIEW = 'design'

const problems = []
const fail = (msg) => problems.push(msg)

const walk = (dir, ext = '.md') => {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p, ext) : e.name.endsWith(ext) ? [p] : []
  })
}
const rel = (p) => p.replace(ROOT + '/', '')

// ── 解析标记 ─────────────────────────────────────────────
// 形如：<!-- @rule id=xxx level=MUST cat=颜色 detect=regex -->
// ⚠️ 不能用 [^>]* —— title/dtitle 里出现 `<el-dropdown-menu>` 这类标签名很自然，
//    排除 > 会让标记被截断、条目静默丢失。改用非贪婪匹配到 -->
const RULE_TAG = /<!--\s*@rule\s+([\s\S]*?)\s*-->/

/**
 * 把 `id=xxx level=MUST` 解析成对象。
 *
 * ⚠️ `title` / `dtitle` 特殊处理：它们的值是整句中文、必然含空格，若按 \S+ 取值会截在
 * 第一个空格（曾把「暗色下卡片描边用 .surface-bordered，不用纯色描边」截成「暗色下卡片描边用」）。
 * 故约定这两个**写在最后**，各自的值一路吃到下一个长值字段或标记结尾。
 */
const LONG_ATTRS = ['dtitle', 'title']

function parseAttrs(raw) {
  const attrs = {}
  let rest = raw

  // 从后往前切：先定位所有长值字段的起点，按出现顺序切段
  const positions = LONG_ATTRS.map((name) => ({
    name,
    at: rest.search(new RegExp(`\\b${name}=`)),
  }))
    .filter((p) => p.at !== -1)
    .sort((a, b) => a.at - b.at)

  for (let i = positions.length - 1; i >= 0; i -= 1) {
    const { name, at } = positions[i]
    const end = i + 1 < positions.length ? positions[i + 1].at : rest.length
    attrs[name] = rest
      .slice(at + name.length + 1, end)
      .trim()
      .replace(/^"(.*)"$/, '$1') // 兼容加了引号的写法
    rest = rest.slice(0, at) + rest.slice(end)
  }

  const re = /(\w+)=(?:"([^"]*)"|(\S+))/g
  let m
  while ((m = re.exec(rest))) attrs[m[1]] = m[2] ?? m[3]
  return attrs
}

/**
 * 清洗规则行正文，作为条目标题：
 * 去掉标记注释、列表符号、❌/✅ 等前缀标记、md 强调符号。
 */
function cleanTitle(line) {
  return line
    .replace(RULE_TAG, '')
    .replace(/^\s*[-*]\s*/, '')
    .replace(/^\s*\|\s*/, '')
    .replace(/^[❌✅⛔⚠️⏸★☆]+\s*/u, '')
    .replace(/\*\*/g, '')
    .trim()
}

const rules = []
const seenIds = new Map()

for (const file of walk(REFS)) {
  // 提取产物自身与评判标准文档不参与扫描（避免自我引用循环）
  if (file.endsWith('rules.generated.json')) continue
  const lines = readFileSync(file, 'utf8').split('\n')

  // 围栏代码块内的标记是「文档在讲语法」，不是真条目 —— 跳过，
  // 否则 judging-criteria.md 里的示例会被当成重复 id 报错。
  let inFence = false

  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      return
    }
    if (inFence) return

    const m = line.match(RULE_TAG)
    if (!m) return

    const attrs = parseAttrs(m[1])
    const where = `${rel(file)}:${i + 1}`

    // —— 字段校验：标记写错必须当场报错，否则条目会静默丢失 ——
    if (!attrs.id) return fail(`${where} @rule 缺少 id`)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(attrs.id))
      return fail(`${where} id "${attrs.id}" 非 kebab-case`)
    if (seenIds.has(attrs.id))
      return fail(`${where} id "${attrs.id}" 与 ${seenIds.get(attrs.id)} 重复`)
    if (!LEVEL_WEIGHT[attrs.level])
      return fail(`${where} level "${attrs.level}" 非法（应为 MUST/SHOULD/MAY）`)
    if (!CATEGORIES.includes(attrs.cat))
      return fail(`${where} cat "${attrs.cat}" 不在类别表中：${CATEGORIES.join('/')}`)
    if (!DETECTS.includes(attrs.detect))
      return fail(`${where} detect "${attrs.detect}" 非法（应为 ${DETECTS.join('/')}）`)
    const view = attrs.view || DEFAULT_VIEW
    if (!VIEWS.includes(view))
      return fail(`${where} view "${attrs.view}" 非法（应为 ${VIEWS.join('/')}）`)

    const weight = attrs.weight ? Number(attrs.weight) : LEVEL_WEIGHT[attrs.level]
    if (!Number.isFinite(weight) || weight <= 0)
      return fail(`${where} weight "${attrs.weight}" 非正数`)

    // 标了设计措辞 → 该条目两个视角都出现（各用各的说法）；
    // 否则只出现在自己的视角里。
    const views = attrs.dtitle ? ['design', 'impl'] : [view]

    seenIds.set(attrs.id, where)
    rules.push({
      id: attrs.id,
      title: attrs.title || cleanTitle(line),
      // 设计视角措辞：讲现象不讲 API。无则沿用 title
      designTitle: attrs.dtitle || attrs.title || cleanTitle(line),
      level: attrs.level,
      cat: attrs.cat,
      detect: attrs.detect,
      views,
      weight,
      // 判据出处：页面据此链回规范原文，保证「条目 → 事实源」可追溯
      source: rel(file),
      line: i + 1,
    })
  })
}

if (problems.length) {
  console.error(`\n✗ 标记有误（${problems.length} 处）：\n`)
  problems.forEach((p) => console.error(`  ${p}`))
  console.error('')
  process.exit(1)
}

// 按类别表顺序排列，同类内 MUST 优先，便于页面直接顺序渲染
const catIndex = (c) => CATEGORIES.indexOf(c)
const levelIndex = (l) => ['MUST', 'SHOULD', 'MAY'].indexOf(l)
rules.sort(
  (a, b) => catIndex(a.cat) - catIndex(b.cat) || levelIndex(a.level) - levelIndex(b.level),
)

const payload = {
  // 提取产物，勿手改 —— 改规范正文里的 @rule 标记，重跑本脚本
  generatedBy: 'scripts/extract-rules.mjs',
  total: rules.length,
  totalWeight: rules.reduce((s, r) => s + r.weight, 0),
  byLevel: {
    MUST: rules.filter((r) => r.level === 'MUST').length,
    SHOULD: rules.filter((r) => r.level === 'SHOULD').length,
    MAY: rules.filter((r) => r.level === 'MAY').length,
  },
  byDetect: {
    regex: rules.filter((r) => r.detect === 'regex').length,
    ast: rules.filter((r) => r.detect === 'ast').length,
    manual: rules.filter((r) => r.detect === 'manual').length,
  },
  byView: {
    design: rules.filter((r) => r.views.includes('design')).length,
    impl: rules.filter((r) => r.views.includes('impl')).length,
  },
  // 类别顺序表：页面按视角过滤条目后，依此顺序分组渲染
  categoryOrder: CATEGORIES,
  // 扁平条目表：视角切换需在页面侧动态过滤重组，故不在此预先按类分好
  items: rules,
}

const json = JSON.stringify(payload, null, 2) + '\n'

if (CHECK_ONLY) {
  const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
  if (prev !== json) {
    console.error('✗ rules.generated.json 与当前标记不一致 —— 请重跑 node scripts/extract-rules.mjs')
    process.exit(1)
  }
  console.log(`✓ 条目提取一致（${payload.total} 条）`)
} else {
  writeFileSync(OUT, json)
  const auto = payload.byDetect.regex + payload.byDetect.ast
  console.log(`✓ 提取 ${payload.total} 条评判条目 → ${rel(OUT)}`)
  console.log(
    `  分级：MUST ${payload.byLevel.MUST} / SHOULD ${payload.byLevel.SHOULD} / MAY ${payload.byLevel.MAY}`,
  )
  console.log(
    `  检测：可自动 ${auto} 条（regex ${payload.byDetect.regex} / ast ${payload.byDetect.ast}）、人工 ${payload.byDetect.manual} 条`,
  )
  console.log(
    `  视角：设计 ${payload.byView.design} 条 / 实现 ${payload.byView.impl} 条`,
  )
  const catCount = CATEGORIES.map((c) => [c, rules.filter((r) => r.cat === c).length])
    .filter(([, n]) => n > 0)
    .map(([c, n]) => `${c}(${n})`)
    .join(' ')
  console.log(`  类别：${catCount}`)
}
