/**
 * 轻量 Vue 模板解析器
 *
 * 为什么不用 @vue/compiler-sfc：它在 pnpm 里没提升到顶层，只能靠
 * `.pnpm/@vue+compiler-sfc@3.5.30/...` 这种带版本号的路径拿到——版本一升级路径就断，
 * 下游项目的 node_modules 结构更是各不相同。评分器要能扫任意接入方代码，
 * 不该对它们的依赖树有要求。
 *
 * 这里只做「标签树 + 属性」这一层，足够支撑现有的结构类判定
 * （数兄弟节点、看嵌套关系、查属性顺序），不涉及表达式求值。
 */

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
])

/**
 * 解析属性串 → { name: value }。
 * 保留原始写法：`:prop` / `v-bind:prop` / `@evt` 都原样作 key，
 * 便于检测器区分「传了字面量」和「绑定了变量」。
 */
function parseAttrs(raw) {
  const attrs = {}
  const re = /([@:#]?[\w.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g
  let m
  while ((m = re.exec(raw))) {
    if (!m[1]) continue
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? true
  }
  return attrs
}

/**
 * 把模板解析成节点树。
 * 每个节点：{ tag, attrs, children, parent, line, raw }
 * 注释与文本不建节点（检测器用不到，略去可让树更清爽）。
 */
export function parseTemplate(template) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null, line: 0 }
  if (!template) return root

  let cur = root
  // 匹配开标签 / 闭标签；注释已在上游 stripComments 处理
  const re = /<\/?([a-zA-Z][\w.-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g
  let m
  while ((m = re.exec(template))) {
    const [full, tag, attrRaw, selfClose] = m
    const isClose = full.startsWith('</')
    const line = (template.slice(0, m.index).match(/\n/g) || []).length + 1

    if (isClose) {
      // 回到最近的同名祖先（容忍标签未闭合的情况）
      let n = cur
      while (n && n.tag !== tag) n = n.parent
      if (n && n.parent) cur = n.parent
      continue
    }

    const node = {
      tag,
      attrs: parseAttrs(attrRaw),
      children: [],
      parent: cur,
      line,
      raw: full.replace(/\s+/g, ' ').slice(0, 100),
    }
    cur.children.push(node)

    if (!selfClose && !VOID_TAGS.has(tag.toLowerCase())) cur = node
  }
  return root
}

/** 深度遍历所有节点 */
export function walkNodes(node, fn) {
  for (const c of node.children) {
    fn(c)
    walkNodes(c, fn)
  }
}

/** 找出树中所有匹配标签的节点 */
export function findAll(root, tagRe) {
  const out = []
  walkNodes(root, (n) => {
    if (tagRe.test(n.tag)) out.push(n)
  })
  return out
}

/** 该节点子树内是否存在匹配的标签 */
export function hasDescendant(node, tagRe) {
  let found = false
  walkNodes(node, (n) => {
    if (tagRe.test(n.tag)) found = true
  })
  return found
}

/** 从节点向上找最近的匹配祖先 */
export function closest(node, tagRe) {
  let n = node.parent
  while (n) {
    if (tagRe.test(n.tag)) return n
    n = n.parent
  }
  return null
}

/** 节点的直接子节点里，匹配某标签的那些 */
export function childrenOf(node, tagRe) {
  return node.children.filter((c) => tagRe.test(c.tag))
}
