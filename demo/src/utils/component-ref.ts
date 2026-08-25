/**
 * demo 页「复制组件标识」的数据源 —— 直接吃 scripts/catalog.json
 * ============================================================================
 *
 * ## 为什么不另建一份
 *
 * catalog.json 已经是「组件清单 + 骨架 + 硬约束 + 必读」的唯一产物（由
 * `build-catalog.mjs` 从 demo 导航 + demo 配置项 + component-catalog.mjs 合成，
 * pre-push hook 校验）。扩展面板吃它，demo 页的按钮也吃它——**同一份数据两个
 * 消费方**，改一处两边同步。
 *
 * 另建一份"给 demo 用的组件说明"必然长出裂缝：catalog 更新了它不动，于是
 * 面板复制出的和页面复制出的对不上，而且没人会发现。
 *
 * ## 一个 demo 区块 = 一到多个 catalog 组件
 *
 * catalog 里有「变体」（`variantOf`）：Input 区块下挂着搜索框 / 数字输入框 /
 * 文本域，Select 区块下挂着分组 / 树形 / 级联。它们在 demo 导航里没有自己的行，
 * 而是共用父组件那一块。所以按 `variantOf || anchor` 聚合——一个 section 的按钮
 * 点开后列出该族全部成员，让用户挑，避免"复制到的不是我想要的那个"。
 */
import catalog from '../../../scripts/catalog.json'
import { buildComponentRef } from '../../../scripts/build-prompt.mjs'

export interface CatalogField {
  key: string
  label: string
  type: string
  default?: unknown
  options?: { value: unknown; label: string }[]
}

export interface CatalogComponent {
  id: string
  anchor: string
  name: string
  group: string
  desc: string
  fields: CatalogField[]
  readRefs: string[]
  mustRules: string[]
  snippetSrc: string | null
  /** snippet 的兜底取值（不是配置项，见 build-catalog.mjs 的 snippetDefaultsOf） */
  snippetDefaults?: Record<string, unknown>
  variantOf?: string | null
}

/**
 * 把 snippet 源码还原成函数。
 *
 * 用 `Function` 构造而非 `eval`：作用域干净，拿不到本模块的闭包变量。
 * 还原失败不阻断——该组件仍可复制，只是标识块少一段代码骨架。
 */
function reviveSnippet(src: string | null) {
  if (!src) return null
  try {
    return new Function('return (' + src + ')')() as (v: Record<string, unknown>) => string
  } catch {
    return null
  }
}

const ALL = (catalog.components as unknown as CatalogComponent[]).map((c) => ({
  ...c,
  snippet: reviveSnippet(c.snippetSrc),
}))

/** demo section 的 id（= 导航锚点）→ 该区块下的组件（父在前、变体在后） */
const BY_ANCHOR = new Map<string, typeof ALL>()
for (const c of ALL) {
  const key = c.variantOf || c.anchor
  if (!BY_ANCHOR.has(key)) BY_ANCHOR.set(key, [])
  BY_ANCHOR.get(key)!.push(c)
}

/** 该 demo section 下有哪些可复制的组件；没有则返回空数组（按钮不渲染） */
export function componentsOf(anchor: string) {
  return BY_ANCHOR.get(anchor) || []
}

/** 拼出粘贴进下游 CC 的标识块；values 是该组件配置卡的实时值 */
export function refTextOf(
  component: (typeof ALL)[number],
  values: Record<string, unknown> = {}
) {
  return buildComponentRef({ component, values })
}
