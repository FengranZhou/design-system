/**
 * build-prompt.mjs 的类型声明
 *
 * 脚本层是纯 ESM JS（Node 直接跑，不经构建），但 demo 是 TS 工程、会 import
 * 其中的 `buildComponentRef`。手写一份声明让两边都成立：脚本仍是 .mjs，
 * demo 侧拿到类型。**改 build-prompt.mjs 的签名时同步改这里。**
 */

/** catalog 里的组件条目（snippetSrc 已 revive 成 snippet 函数） */
export interface PromptComponent {
  name: string
  desc?: string
  fields?: { key: string; label: string; type: string; default?: unknown; options?: unknown[] }[]
  readRefs?: string[]
  mustRules?: string[]
  /** snippet 的兜底取值：不进面板、只保证骨架有默认形态 */
  snippetDefaults?: Record<string, unknown>
  snippet?: ((values: Record<string, unknown>) => string) | null
}

/** 扩展面板的产物：组件 + 用户填的配置 + 落点截图 */
export function buildPrompt(opts: {
  component: PromptComponent
  values: Record<string, unknown>
  anchor?: { x?: number; y?: number; nearText?: string; url?: string }
  shotPath?: string
}): string

/**
 * demo 页「复制到 CC 去调用」的产物：这是设计系统的哪个组件、此刻配成什么样、怎么用。
 * `values` 是该组件配置卡的实时值；不传则给组件的默认形态。
 */
export function buildComponentRef(opts: {
  component: PromptComponent
  values?: Record<string, unknown>
}): string
