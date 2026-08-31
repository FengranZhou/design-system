import { parseTemplate, findAll, hasDescendant, closest, childrenOf } from './template-ast.mjs'

/**
 * 评判条目的检测规则
 *
 * 与 `references/rules.generated.json` 按 `id` 挂钩：条目定义「是什么规则」，
 * 这里定义「怎么在代码里查出违规」。两者分离是因为——
 * 正则含大量特殊字符，写进 md 注释难读难转义；AST 判定更是放不进去。
 *
 * ⚠️ 新增条目时若 detect=regex/ast，记得来这里补一个同 id 的检测器；
 *    没补的条目会被 audit-page.mjs 归入「未实现检测」，计入报告但不计分。
 *
 * 检测器结构：
 *   {
 *     files:  /\.vue$/          // 只在哪类文件查（可选，默认全查）
 *     scope:  'template'|'style'|'all'   // 只查 SFC 的哪一段（可选，默认 all）
 *     find:   RegExp            // 命中即违规
 *     skip?:  RegExp            // 该行命中则豁免（用于排除误报）
 *     hint:   string            // 报告里给出的修改指引
 *   }
 * 或自定义函数：(ctx) => [{ line, text }]，ctx = { text, template, style, script, file }
 */

// ── 令牌类：裸值检测 ─────────────────────────────────────────────
// 共同点：只查 <style> 段；注释行与令牌定义行需排除

/**
 * 十六进制色值。排除：注释、令牌定义自身、data-uri（svg mask 里合法）。
 *
 * ⚠️ 必须同时查 <style> 段与 template 的**行内 style 属性** ——
 *    曾只查 style 段，于是 `<div style="color:#fff">` 这种行内硬编码拿到满分，
 *    分数虚高比不查更危险（用户会以为已经合规）。
 */
const HEX_RE = /(?:color|background|background-color|border-color|fill|stroke)\s*:\s*[^;]*#[0-9a-fA-F]{3,8}\b/
const HEX_SKIP = /^\s*(\/\/|\/\*|\*)|url\(|data:image/

const HEX_COLOR = {
  custom: (ctx) => {
    const hits = []
    const scan = (body, offset, tag) => {
      if (!body) return
      body.split('\n').forEach((line, i) => {
        if (HEX_SKIP.test(line)) return
        if (HEX_RE.test(line)) hits.push({ line: i + 1 + offset, text: `${tag}${line.trim().slice(0, 80)}` })
      })
    }
    scan(ctx.style, ctx.styleOffset, '')
    // 行内 style 属性：只看 style="..." 内部，避免把模板里的普通文本误判
    if (ctx.template) {
      ctx.template.split('\n').forEach((line, i) => {
        if (HEX_SKIP.test(line)) return
        for (const m of line.matchAll(/\bstyle\s*=\s*["']([^"']*)["']/g)) {
          if (HEX_RE.test(m[1])) hits.push({ line: i + 1 + ctx.templateOffset, text: `行内 style：${m[1].slice(0, 80)}` })
        }
      })
    }
    return hits
  },
  hint: '改用颜色令牌 var(--iflyv-brand-primary) / var(--iflyv-text-1) 等，见 foundations.md 色板用途表',
}

/** 字号裸值。排除令牌引用行 */
const FONT_SIZE_PX = {
  scope: 'style',
  find: /font-size\s*:\s*\d+(\.\d+)?(px|rem)\b/,
  skip: /var\(--iflyv-|^\s*(\/\/|\/\*|\*)/,
  hint: '改用语义字阶 font: var(--iflyv-font-body-sub) 等整档取用，见 foundations.md 语义字阶表',
}

/**
 * 拆开基础令牌却没设齐字号+行高+字重（自造档位）。
 *
 * ⚠️ 规范允许一种拆分：含空格字体名（如 "Alibaba PuHuiTi"）不能用 font: 简写时，
 *    拆分属性但**字号/行高/字重一个不漏**。故不能见到 font-size-* 就报违规——
 *    要看同一规则块里三者是否齐全。
 */
const FONT_PARTIAL = {
  scope: 'style',
  custom: (ctx) => {
    const body = ctx.style || ''
    if (!body) return []
    const hits = []
    // 按规则块切分（粗略但够用：以 } 为界）
    let block = ''
    let blockStart = 0
    body.split('\n').forEach((line, i) => {
      if (!block) blockStart = i
      block += line + '\n'
      if (!line.includes('}')) return
      if (/font-size\s*:\s*var\(--iflyv-font-size-/.test(block)) {
        const hasLH = /line-height\s*:/.test(block)
        const hasFW = /font-weight\s*:/.test(block)
        if (!hasLH || !hasFW) {
          const missing = [!hasLH && '行高', !hasFW && '字重'].filter(Boolean).join('、')
          hits.push({
            line: blockStart + 1 + ctx.styleOffset,
            text: `拆用 font-size-* 但缺${missing}`,
          })
        }
      }
      block = ''
    })
    return hits
  },
  hint: '优先整档取用 font: var(--iflyv-font-*)；含空格字体名须拆分时，字号/行高/字重一个不漏',
}

/** 间距魔法值。只查 margin/padding/gap 的直接数值 */
const SPACING_PX = {
  scope: 'style',
  find: /(?:margin|padding|gap|row-gap|column-gap)(?:-(?:top|bottom|left|right|inline|block)(?:-(?:start|end))?)?\s*:\s*[^;]*\b\d+px/,
  // 排除：令牌引用、注释、0/1px（不成档但无实际间距语义）、calc() 里的变量 fallback
  skip: /var\(--iflyv-|^\s*(\/\/|\/\*|\*)|\b(0|1)px\b|calc\(/,
  hint: '改用间距令牌 var(--iflyv-spacing-3) 等，见 foundations.md 间距场景表',
}

// ── 组件选用类 ──────────────────────────────────────────────────

/** 勿用清单里的停用组件 */
const SUSPENDED_COMPONENTS = {
  scope: 'template',
  find: /<(el-popover|el-menu|el-menu-item|el-submenu|el-sub-menu|el-link|el-collapse|el-collapse-item|el-progress|el-timeline|el-timeline-item|el-upload|el-transfer|el-tree(?!-select)|el-backtop|el-input-tag|el-card|el-autocomplete|el-carousel|el-image|el-affix|el-space|el-text|el-segmented|el-check-tag|el-watermark|el-countdown|el-mention|el-splitter)\b/,
  hint: '该组件在「⏸ 勿用清单」内已停用，写出来会拿到 EP 原生观感。见 component-interaction.md 文末清单选替代方案',
}

/** ElMessageBox 命令式弹窗 */
const MESSAGE_BOX = {
  find: /ElMessageBox\s*\.\s*(confirm|alert|prompt)\b|\$msgbox\s*\(/,
  hint: '弹窗统一用 <el-dialog>，命令式 API 拿不到语义变体/宽度三档/footer 规范',
}

/** el-row / el-col 栅格 */
const EL_ROW_COL = {
  scope: 'template',
  find: /<el-(row|col)\b/,
  hint: '分栏用源头栅格约定类 .grid / .grid__col-*（24 列、水槽走令牌），见 efficiency-guide.md',
}

// ── 组件用法类：必传 prop ───────────────────────────────────────

/**
 * 通用「组件必须带某属性」检测器工厂。
 * 跨行匹配整个开标签，避免属性换行时漏判。
 */
function requireProp(tag, propRe, hint, extraSkip) {
  return {
    scope: 'template',
    custom: (ctx) => {
      const hits = []
      // 匹配 <tag ...> 完整开标签（含跨行）
      const re = new RegExp(`<${tag}(\\s[^>]*?)?/?>`, 'gs')
      let m
      while ((m = re.exec(ctx.template || ''))) {
        const attrs = m[1] || ''
        if (propRe.test(attrs)) continue
        if (extraSkip && extraSkip.test(attrs)) continue
        const line = (ctx.template.slice(0, m.index).match(/\n/g) || []).length + 1
        hits.push({ line: line + ctx.templateOffset, text: m[0].replace(/\s+/g, ' ').slice(0, 90) })
      }
      return hits
    },
    hint,
  }
}

export const DETECTORS = {
  // —— 设计令牌 ——
  'color-no-hardcode': HEX_COLOR,
  'font-no-hardcode-size': FONT_SIZE_PX,
  'font-set-as-whole': FONT_PARTIAL,
  'spacing-no-magic': SPACING_PX,

  'icon-stroke-width-2': {
    scope: 'template',
    find: /:?stroke-width=["']?(?!2["'\s>])\d/,
    hint: '图标 stroke-width 统一为 2',
  },

  'ai-gradient-token': {
    scope: 'style',
    find: /(linear|radial|conic)-gradient\([^)]*(#[0-9a-fA-F]{3,8}|rgb)/,
    // ⚠️ 排除：AI 令牌本身、注释、以及**中性灰**渐变——
    //    棋盘格底纹（演示透明色）这类纯灰渐变不是"AI 元素配色"，曾误报 2 处
    skip: /var\(--iflyv-ai-|^\s*(\/\/|\/\*|\*)|rgba?\(\s*(\d+)\s*,\s*\1\s*,\s*\1\s*[,)]|transparent/,
    hint: 'AI 元素一律用现成 AI 渐变令牌 var(--iflyv-ai-gradient) 等，禁自拼渐变',
  },

  // —— 按钮 ——
  'button-type-whitelist': {
    scope: 'template',
    find: /<el-button[^>]*\btype=["'](success|warning|info)["']/s,
    hint: 'el-button 的 type 仅允许 default / primary / danger',
  },

  'button-no-circle': {
    scope: 'template',
    find: /<el-button[^>]*\bcircle\b/s,
    hint: '纯图标入口用 <el-button text> + #icon 插槽，禁 circle',
  },

  /** 入口引导箭头必须挂约定 class .btn-entry */
  'btn-entry-class': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const btn of findAll(root, /^el-button$/)) {
        for (const ic of findAll(btn, /^(ChevronRight|ArrowRight)$/)) {
          // #icon 插槽里的是头部图标（带图标/纯图标形态），不是尾部入口箭头
          if (closest(ic, /^template$/)?.attrs?.['#icon'] !== undefined) continue
          const cls = `${ic.attrs.class || ''} ${ic.attrs[':class'] || ''}`
          if (/btn-entry/.test(cls)) continue
          hits.push({ line: ic.line + ctx.templateOffset, text: `<${ic.tag}> 未挂 .btn-entry` })
        }
      }
      return hits
    },
    hint: '入口引导箭头用约定 class .btn-entry（间距/hover 前移/禁用不动全在源头 button.scss）',
  },

  /** 入口引导仅限 text 文本按钮（挂在裸元素上也不行） */
  'btn-entry-text-only': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const n of findAll(root, /./)) {
        const cls = `${n.attrs?.class || ''} ${n.attrs?.[':class'] || ''}`
        if (!/\bbtn-entry\b/.test(cls)) continue
        const btn = closest(n, /^el-button$/)
        if (!btn) {
          hits.push({ line: n.line + ctx.templateOffset, text: `.btn-entry 挂在 <${n.tag}> 上，不在 el-button 内` })
          continue
        }
        // :text 动态绑定静态判不了真值，视为满足（demo 网格即此写法）
        const isText = btn.attrs.text !== undefined || btn.attrs[':text'] !== undefined
        if (!isText) {
          hits.push({ line: n.line + ctx.templateOffset, text: '.btn-entry 挂在非 text 按钮上（源头无样式兜底）' })
        }
      }
      return hits
    },
    hint: '入口引导箭头仅限 <el-button text>；有底按钮不挂、裸 span 不自拼「文字+›」',
  },

  /** 尾部箭头互斥：同一按钮不得同时挂入口引导与下拉箭头 */
  'btn-entry-exclusive-caret': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const btn of findAll(root, /^el-button$/)) {
        // 带 v-if/v-else-if/v-show 的箭头是条件渲染（如 demo 配置开关联动），
        // 运行时可能并不共存——静态判不了真值，豁免；只抓两枚都无条件常驻的
        const all = findAll(btn, /./).filter(
          (n) => n.attrs?.['v-if'] === undefined && n.attrs?.['v-else-if'] === undefined && n.attrs?.['v-show'] === undefined,
        )
        const has = (re) => all.some((n) => re.test(`${n.attrs?.class || ''} ${n.attrs?.[':class'] || ''}`))
        if (has(/\bbtn-entry\b/) && has(/\b(btn-caret|dropdown-caret)\b/)) {
          hits.push({ line: btn.line + ctx.templateOffset, text: '同一按钮同时挂了入口引导与下拉箭头' })
        }
      }
      return hits
    },
    hint: '尾部箭头二选一：会弹出面板→下拉箭头（ChevronDown），会跳转/切换视图→入口引导（.btn-entry）',
  },

  // —— 布局与栅格 ——
  'grid-no-el-row': EL_ROW_COL,

  /** 指标条：自拼私有类而非用源头约定 class（.metric-strip / .metric-item） */
  'metric-strip-class': {
    scope: 'template',
    // 常见自拼命名：kpi-strip / stat-bar / data-list / kpi-item / stat-card…
    find: /class="[^"]*\b(kpi|stat|data)-(strip|bar|row|list|item|card|cell)\b/,
    hint: '一排指标卡用源头约定 class .metric-strip / .metric-item（等分+居中在源头 patterns/metric-strip.scss），禁自拼私有类',
  },

  'grid-min-6col': {
    scope: 'all',
    find: /\bgrid__col-([0-5])\b/,
    hint: '栅格只有 col-6/8/10/12/14/16/18/20/24 九档，模块不得窄于 6 列',
  },

  'layout-no-sub1200-mq': {
    scope: 'style',
    // max-width 断点小于 1200 的 media query（写了永不触发）
    find: /@media[^{]*max-width\s*:\s*(\d{1,3}|1[01]\d{2})px/,
    hint: '1200px 是硬下限，窄于此走横向滚动；<1200 的 media query 永不触发',
  },

  // —— 组件选用 ——
  'component-no-suspended': SUSPENDED_COMPONENTS,
  'dialog-no-messagebox': MESSAGE_BOX,

  /** 画图一律用业务组件 Chart：页面直接 import echarts = 绕过源头手拼（取色/重绘/图形风格全要自己做，且不随源头同步） */
  'chart-use-component': {
    custom: (ctx) => {
      // 源头 Chart 组件自身是唯一合法的 echarts 引用处
      if (/design-spec\/components\/Chart\//.test(ctx.file ?? '')) return []
      const hits = []
      ;(ctx.text ?? '').split('\n').forEach((line, i) => {
        if (/^\s*(\/\/|\/\*|\*)/.test(line)) return
        if (/from\s+['"]echarts|require\(\s*['"]echarts/.test(line)) hits.push({ line: i + 1, text: line.trim().slice(0, 90) })
      })
      return hits
    },
    hint: '画图一律用业务组件 Chart（design-spec/components/Chart），禁止页面直接 import echarts 手拼；自由度不够先用 Chart 的 option 逃生口',
  },

  'select-v2-over-200': {
    scope: 'all',
    find: null, // 选项数量需运行时才知道，静态扫不出——留给人工
    hint: '选项 >200 必须换 el-select-v2（虚拟滚动）',
  },

  // —— 组件用法：必传 prop ——
  'tooltip-show-after': requireProp(
    'el-tooltip',
    /:show-after\s*=|:?show-after=/,
    '每个 el-tooltip 必传 :show-after="300"（源头 scss 兜不住，漏传即漏）',
  ),

  'datepicker-value-format': requireProp(
    'el-date-picker',
    /value-format\s*=/,
    'el-date-picker 必须传 value-format，否则 v-model 拿到 Date 对象',
  ),

  'timepicker-value-format': requireProp(
    'el-time-picker',
    /value-format\s*=/,
    'el-time-picker 必传 value-format',
  ),

  'pagination-hide-single-page': requireProp(
    'el-pagination',
    /\bhide-on-single-page\b/,
    'el-pagination 必传 hide-on-single-page（不足一页整个分页器不渲染，禁自己 v-if 手算页数）',
  ),

  'inputnumber-min-max': requireProp(
    'el-input-number',
    /:min\s*=/,
    'el-input-number 必须传 :min / :max，否则可填负数或超大值',
  ),

  'skeleton-animated': requireProp(
    'el-skeleton',
    /\banimated\b/,
    'el-skeleton 必须传 animated',
  ),

  'empty-image-and-class': requireProp(
    'el-empty',
    /:image\s*=/,
    'el-empty 必须同时传设计系统插画 :image 与档位 class（empty-page / empty-block）',
  ),

  'alert-title-prop': requireProp(
    'el-alert',
    /\btitle\s*=|:title\s*=/,
    'el-alert 主文案必须传 title（默认插槽是 description 区，会触发大图标）',
  ),

  // —— 组件用法：禁用写法 ——
  'tooltip-no-native-title': {
    scope: 'template',
    // 原生 HTML 标签上的静态 title 属性。
    // ⚠️ 必须排除 :title / v-bind:title —— 那是 Vue 绑定（多为组件 prop），
    //    也要排除 el-* 组件（title 是它们的合法 prop）。曾因未排除绑定语法误报 6 处。
    find: /<(?!el-|template\b|component\b)[a-z][a-z0-9-]*\s[^>]*(?<![:\w-])title=["'][^"']+["']/s,
    hint: '文字提示一律用 el-tooltip，禁原生 title 属性（延迟约 1s、样式失控、移动端不触发）',
  },

  'message-show-close': {
    // ⚠️ showClose 常写在下一行，行级匹配会误报（MessageDemo 曾被误判）——
    //    故取整个调用括号内的文本判断
    custom: (ctx) => {
      const hits = []
      const re = /ElMessage(?:\.(success|warning|error|info))?\s*\(/g
      let m
      while ((m = re.exec(ctx.text))) {
        // 截取调用起点后的一段，找配对右括号
        let depth = 0, end = m.index + m[0].length - 1
        for (let i = end; i < ctx.text.length && i < end + 600; i += 1) {
          if (ctx.text[i] === '(') depth += 1
          else if (ctx.text[i] === ')') { depth -= 1; if (!depth) { end = i; break } }
        }
        const call = ctx.text.slice(m.index, end + 1)
        if (/showClose\s*:\s*true/.test(call)) continue
        const line = (ctx.text.slice(0, m.index).match(/\n/g) || []).length + 1
        hits.push({ line, text: call.replace(/\s+/g, ' ').slice(0, 80) })
      }
      return hits
    },
    hint: 'ElMessage 一律传 showClose: true（源头已定制关闭按钮，不传就看不到），禁 .success() 简写',
  },

  'scrollbar-no-raw-overflow': {
    scope: 'style',
    find: /overflow(-[xy])?\s*:\s*(auto|scroll)\b/,
    // ⚠️ 规范针对的是「区域内容超出要滚动」的容器。
    //    代码块/表格这类**内容自身不换行**导致的横向溢出是另一回事，
    //    包 el-scrollbar 反而破坏 <pre> 的语义与选中复制。
    skip: /^\s*(\/\/|\/\*|\*)/,
    scopeHint: 'code-block',
    hint: '内部滚动区一律用 <el-scrollbar>，原生滚动条样式不可控',
  },

  'result-icon-two-values': {
    scope: 'template',
    find: /<el-result[^>]*\bicon=["'](warning|info)["']/s,
    hint: 'el-result 的 icon 仅允许 success / error（源头只适配这两类）',
  },

  'rate-max-5': {
    scope: 'template',
    find: /<el-rate[^>]*:max=["'](?!5["'])/s,
    hint: 'el-rate 档位固定 5 星，不改 :max',
  },

  'badge-default-red': {
    scope: 'template',
    find: /<el-badge[^>]*\btype=["'](success|warning|info|primary)["']/s,
    hint: 'Badge 一律默认红色，勿传 type',
  },

  'descriptions-not-disabled-form': {
    scope: 'template',
    find: /<el-form[^>]*\bdisabled\b/s,
    hint: '只读详情用 el-descriptions，禁 el-form + disabled 冒充',
  },

  'checkbox-label-prop': {
    scope: 'template',
    find: /<el-checkbox[^>]*>\s*<span/s,
    hint: '多选框文案传 label 属性，禁外套 <span> 手拼',
  },

  'switch-text-prop': {
    scope: 'template',
    find: /<el-switch[^>]*>\s*<span|<span[^>]*>[^<]*<\/span>\s*<el-switch/s,
    hint: '开关文字标签用 active-text / inactive-text，禁外套 <span>',
  },

  // —— 单一数据源 ——
  'ssot-no-scoped-override': {
    scope: 'style',
    // :deep(.el-xxx) 覆盖组件外观类属性
    custom: (ctx) => {
      const hits = []
      const lines = (ctx.style || '').split('\n')
      let inDeep = false
      let deepLine = 0
      lines.forEach((line, i) => {
        if (/:deep\(\s*\.el-/.test(line)) {
          inDeep = true
          deepLine = i + 1 + ctx.styleOffset
        }
        if (!inDeep) return
        // 外观类属性（排除纯排版留白 margin）
        if (
          /\b(font|font-size|font-weight|color|background|background-color|border|border-color|border-radius|box-shadow|padding)\s*:/.test(
            line,
          )
        ) {
          hits.push({ line: deepLine, text: line.trim().slice(0, 90) })
          inDeep = false
        }
        if (line.includes('}')) inDeep = false
      })
      return hits
    },
    hint: '组件外观只能定义在源头 el-theme/components/，使用方 scoped 覆盖＝局部私货，脱离源头不再同步',
  },

  // —— 视觉呈现 ——
  'shadow-popup-only': {
    scope: 'style',
    // 取 box-shadow 到分号为止的完整值（可能跨行），再判断是不是描边环
    custom: (ctx) => {
      const body = ctx.style || ''
      const hits = []
      const re = /box-shadow\s*:\s*([^;]*);/g
      let m
      while ((m = re.exec(body))) {
        const val = m[1].replace(/\s+/g, ' ').trim()
        if (/^none$/.test(val)) continue
        if (/var\(--iflyv-shadow-/.test(val)) continue
        // `0 0 0 Npx` 零模糊＝用 box-shadow 画描边环，不占布局、不是投影
        if (/(^|,\s*)(inset\s+)?0 0 0 /.test(val)) continue
        const line = (body.slice(0, m.index).match(/\n/g) || []).length + 1
        hits.push({ line: line + ctx.styleOffset, text: `box-shadow: ${val.slice(0, 70)}` })
      }
      return hits
    },
    _unusedFind: /box-shadow\s*:\s*(?!none)/,
    // ⚠️ 排除三类合法用法：① shadow 令牌；② 注释；
    //   ③ `0 0 0 Npx` 零模糊——那是用 box-shadow 画描边环（不占布局尺寸），
    //      不是投影效果，与「静态卡片不加投影」是两回事
    skip: /var\(--iflyv-shadow-|^\s*(\/\/|\/\*|\*)|box-shadow\s*:\s*(inset\s+)?0\s+0\s+0\s/,
    hint: '阴影仅用于浮层，且一律走 shadow 三档令牌；静态卡片不加投影',
  },

  'line-no-decorative': {
    scope: 'style',
    // ⚠️ 只查边框宽度，须排除 border-radius（曾把 `border-radius: 6px` 误判成粗线）
    find: /border(?!-radius)(-(?:top|bottom|left|right|inline|block|width))?\s*:\s*(?:[2-9]|\d{2,})px|border-style\s*:\s*(double|dashed|dotted)/,
    hint: '禁用粗线、双线、装饰性线条；分隔优先用间距与色差，必要时 1px border-default',
  },

  // —— 文案规范 ——
  'time-use-formattime': {
    find: /(?:new\s+)?(?:Date|dayjs|moment)\s*\([^)]*\)\s*\.\s*(?:format|toLocaleDateString|toLocaleString)\s*\(/,
    hint: '时间展示一律 import 源头 formatTime（design-spec/utils/format-time），禁各自写格式化',
  },
  'number-thousands-separator': {
    // 两种翻车形态：① 各自用 toLocaleString 打千分位（受运行环境 locale 影响）；
    // ② 硬编码带逗号的数字字符串（'5,082'——脱离数据源，数值变了逗号不跟）
    find: /\.\s*toLocaleString\s*\(|['"]\d{1,3}(?:,\d{3})+(?:\.\d+)?['"]/,
    hint: '数字千分位一律 import 源头 formatNumber（design-spec/utils/format-number），禁 toLocaleString / 硬编码带逗号字符串',
  },

  // —— 设计模式 ——
  'dialog-width-three-tiers': {
    scope: 'template',
    custom: (ctx) => {
      const hits = []
      const re = /<el-(dialog|drawer)(\s[^>]*?)?>/gs
      let m
      while ((m = re.exec(ctx.template || ''))) {
        const attrs = m[2] || ''
        const w = attrs.match(/\bwidth=["'](\d+)(?:px)?["']/)
        if (!w) continue
        const val = Number(w[1])
        const allowed = m[1] === 'dialog' ? [400, 640, 800] : [400, 600]
        if (allowed.includes(val)) continue
        const line = (ctx.template.slice(0, m.index).match(/\n/g) || []).length + 1
        hits.push({
          line: line + ctx.templateOffset,
          text: `width="${w[1]}" —— ${m[1]} 只允许 ${allowed.join(' / ')}`,
        })
      }
      return hits
    },
    hint: '弹窗宽度只能取 400 / 640 / 800 三档；抽屉 400 / 600',
  },

  'search-use-searchmini': {
    scope: 'template',
    // el-input + 放大镜图标手拼搜索框
    find: /<el-input[^>]*(placeholder=["'][^"']*(搜索|查找)[^"']*["'])/s,
    hint: '搜索框一律用业务组件 SearchMini，禁 el-input + 放大镜手拼',
  },

  'list-status-use-tag': {
    scope: 'all',
    find: null, // 需理解「这一列是不是状态列」，静态难判
    hint: '列表/表格的状态列一律用 el-tag，禁裸文字',
  },

  'table-use-sortable': {
    scope: 'template',
    find: /<el-table-column[^>]*>\s*<template[^>]*#header[^>]*>[\s\S]{0,200}?(ArrowUp|ArrowDown|Caret|triangle)/s,
    hint: '表格排序一律用 el-table-column 的 sortable，禁自造排序箭头',
  },

  'form-use-el-form': {
    scope: 'template',
    find: null, // 「这段 div 是不是在当表单用」需语义判断
    hint: '表单骨架一律 el-form + el-form-item，禁 div/flex 手拼',
  },

  'form-label-width-unified': {
    scope: 'template',
    find: /<el-form[^>]*\blabel-width=["'](?!auto)/s,
    hint: '用 label-width="auto" 让标签列自动贴合最长 label，禁手写固定数值',
  },

  'toolbar-convention-class': {
    scope: 'all',
    find: null, // 需判断「这块是不是工具栏」
    hint: '工具栏一律用源头约定 class .toolbar / __left / __right / __title',
  },

  // ── 第三批 ──────────────────────────────────────────────────

  /** 下拉面板必须放 #dropdown 插槽的 el-dropdown-menu，禁手撸浮层 */
  'dropdown-use-slots': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const dd of findAll(root, /^el-dropdown$/)) {
        // #dropdown 插槽里必须是 el-dropdown-menu
        for (const child of dd.children) {
          const isDropdownSlot =
            child.tag === 'template' &&
            Object.keys(child.attrs).some((k) => /^#dropdown$|^v-slot:dropdown$/.test(k))
          if (!isDropdownSlot) continue
          if (!childrenOf(child, /^el-dropdown-menu$/).length) {
            hits.push({
              line: child.line + ctx.templateOffset,
              text: '#dropdown 插槽内不是 <el-dropdown-menu>',
            })
          }
        }
      }
      return hits
    },
    hint: '下拉面板放 #dropdown 插槽的 <el-dropdown-menu>，分组抬头用 .dropdown-group-title + 裸 <li>',
  },

  /** el-anchor：第一节紧贴顶部时须传 select-scroll-top */
  'anchor-select-scroll-top': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const a of findAll(root, /^el-anchor$/)) {
        const has = a.attrs['select-scroll-top'] !== undefined || a.attrs[':select-scroll-top'] !== undefined
        if (has) continue
        // ⚠️ 规则的前提是「第一节紧贴容器顶部」——静态判不出版式。
        //    折中：只在传了 container（自建滚动容器，多为表单分组/长页分节这类
        //    首节紧贴顶部的版式）时才要求；指向页面别处区块的用法不报。
        const hasContainer = a.attrs.container !== undefined || a.attrs[':container'] !== undefined
        if (!hasContainer) continue
        hits.push({
          line: a.line + ctx.templateOffset,
          text: '自建滚动容器却未传 select-scroll-top（滚回顶部时锚点全部熄灭）',
        })
      }
      return hits
    },
    hint: 'EP 在 scrollTop===0 时若未开 selectScrollTop 会返回空串，导致所有锚点一起熄灭',
  },

  /** el-slider 需显式宽度容器 */
  'slider-width-container': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const sl of findAll(root, /^el-slider$/)) {
        // 自身或父级带宽度即可
        const selfW = /width\s*:/.test(String(sl.attrs.style || ''))
        // 父级带任意 class 即认为有承载容器——宽度多半写在 scoped 样式里，
        // 模板上看不到。只报「直接裸放在无 class 容器里」这种明确情况，
        // 否则 .slider-host 这类语义命名会被误判（曾误报）
        const parentW =
          sl.parent &&
          (/width\s*:/.test(String(sl.parent.attrs.style || '')) ||
            String(sl.parent.attrs.class || '').trim().length > 0)
        if (selfW || parentW) continue
        hits.push({ line: sl.line + ctx.templateOffset, text: '无显式宽度容器，会撑满整行' })
      }
      return hits
    },
    hint: 'el-slider 默认撑满父级，须放在定宽区块或给父容器设宽度',
  },

  /** el-scrollbar：排布写在 view-class 指定的 view 上 */
  'scrollbar-view-class': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const sb of findAll(root, /^el-scrollbar$/)) {
        // 外壳上直接写了排布 class 或 style，却没用 view-class
        const hasViewClass = sb.attrs['view-class'] !== undefined || sb.attrs[':view-class'] !== undefined
        if (hasViewClass) continue
        const style = String(sb.attrs.style || '')
        if (/display\s*:\s*flex|gap\s*:|padding\s*:/.test(style)) {
          hits.push({
            line: sb.line + ctx.templateOffset,
            text: '排布写在 el-scrollbar 外壳上，应交给 view-class',
          })
        }
      }
      return hits
    },
    hint: '滚动内容的 flex/gap/内边距写在 view-class 指定的 view 上，外壳只负责 flex:1; min-height:0',
  },

  /** 骨架屏须铺在 bg-panel 白底上 */
  'skeleton-on-panel': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const sks = findAll(root, /^el-skeleton$/)
      if (!sks.length) return []
      const hits = []
      for (const sk of sks) {
        // 向上找承载容器，看有没有 bg-card（浅灰，对比过弱）
        let n = sk.parent
        while (n) {
          const cls = String(n.attrs.class || '')
          const sty = String(n.attrs.style || '')
          if (/bg-card/.test(cls) || /--iflyv-bg-card/.test(sty)) {
            hits.push({
              line: sk.line + ctx.templateOffset,
              text: '骨架屏铺在 bg-card 浅灰上，灰条对比过弱',
            })
            break
          }
          if (/bg-panel/.test(cls) || /--iflyv-bg-panel/.test(sty)) break
          n = n.parent
        }
      }
      return hits
    },
    hint: '骨架灰条在 bg-card 浅灰上几乎看不见，承载容器要用 var(--iflyv-bg-panel) 白底',
  },

  /** 渐变禁用于效率型组件内部 */
  'gradient-not-in-components': {
    scope: 'style',
    custom: (ctx) => {
      const body = ctx.style || ''
      const hits = []
      body.split('\n').forEach((line, i) => {
        if (!/(linear|radial|conic)-gradient/.test(line)) return
        if (/var\(--iflyv-(ai-|bg-card)/.test(line)) return // AI 令牌与卡片底色渐变合法
        // 选择器里出现效率型组件 → 渐变用进了组件内部
        const near = body.split('\n').slice(Math.max(0, i - 6), i + 1).join('\n')
        if (/\.el-(form|table|dialog|drawer|input|select)\b/.test(near)) {
          hits.push({ line: i + 1 + ctx.styleOffset, text: line.trim().slice(0, 80) })
        }
      })
      return hits
    },
    hint: '表单/表格/弹窗/抽屉等效率型组件内部不允许渐变装饰',
  },

  /** 下游根 CLAUDE.md 须 @ 引入设计系统规范 */
  'integration-claude-at-import': {
    files: /CLAUDE\.md$/,
    custom: (ctx) => {
      // 只在项目根 CLAUDE.md 上判断
      if (!/(^|\/)CLAUDE\.md$/.test(ctx.file)) return []
      if (/@[^\s]*design-spec\/CLAUDE\.md/.test(ctx.text)) return []
      return [{ line: 1, text: '未用 @ 引入 design-spec/CLAUDE.md，下游 CC 读不到设计规则' }]
    },
    hint: '在项目根 CLAUDE.md 加一行 `@<路径>/design-spec/CLAUDE.md`，下游 CC 才能拿到规则与触发指针',
  },

  /** 展示型页面同样不得覆盖 EP 组件外观 */
  'display-no-ep-override': {
    scope: 'style',
    custom: (ctx) => {
      const hits = []
      ;(ctx.style || '').split('\n').forEach((line, i) => {
        // 非 :deep 形式直接写 .el-xxx 选择器改外观（scoped 里写了也可能穿透到子组件）
        if (!/^\s*\.el-[a-z-]+/.test(line)) return
        hits.push({ line: i + 1 + ctx.styleOffset, text: line.trim().slice(0, 80) })
      })
      return hits
    },
    hint: 'EP 组件外观一律不覆盖（含展示型页面）——需要不同观感就改源头，或另做自定义排版组件承担视觉主体',
  },

  /** AI 按钮：禁在 el-button 上自贴渐变复刻 */
  'aibutton-use-component': {
    custom: (ctx) => {
      const hits = []
      // ① 模板里给 el-button 挂含 ai/gradient 的 class 或行内渐变
      const re = /<el-button[^>]*(class=["'][^"']*\b(ai|gradient)[\w-]*["']|style=["'][^"']*gradient)/gs
      let m
      while ((m = re.exec(ctx.template || ''))) {
        const line = (ctx.template.slice(0, m.index).match(/\n/g) || []).length + 1
        hits.push({ line: line + ctx.templateOffset, text: 'el-button 自贴渐变/AI 样式' })
      }
      // ② 样式里给 el-button 选择器写渐变
      ;(ctx.style || '').split('\n').forEach((line, i) => {
        if (/\.el-button[^{]*\{/.test(line)) return
        if (/(linear|conic|radial)-gradient/.test(line) && /el-button|btn-ai|ai-btn/.test(line)) {
          hits.push({ line: i + 1 + ctx.styleOffset, text: line.trim().slice(0, 80) })
        }
      })
      return hits
    },
    hint: 'AI 功能入口一律用业务组件 AiButton（四角星+渐变全固化在源头），禁在 el-button 上自贴渐变复刻',
  },

  // ── 第二批：判据明确、误报风险低的 ────────────────────────────

  /** 图标库：禁全量引入、禁混用其它图标库 */
  'icon-lucide-only': {
    find: /import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-vue-next['"]|from\s+['"]@element-plus\/icons-vue['"]|from\s+['"](@iconify|font-awesome|@ant-design\/icons)/,
    hint: '图标统一用 lucide-vue-next 按需导入（import { Search } from ...），禁全量引入、禁混用其它图标库',
  },

  /** 面包屑一律用业务组件 */
  'breadcrumb-use-component': {
    scope: 'template',
    find: /<el-breadcrumb\b/,
    hint: '面包屑一律用业务组件 Breadcrumb（传 items + 接 @back），禁手拼 el-breadcrumb',
  },

  /** tooltip 外观一律不覆盖 */
  'tooltip-no-override': {
    custom: (ctx) => {
      const hits = []
      // 模板里给 tooltip 传 popper-class
      const tplRe = /<el-tooltip[^>]*\bpopper-class\s*=/gs
      let m
      while ((m = tplRe.exec(ctx.template || ''))) {
        const line = (ctx.template.slice(0, m.index).match(/\n/g) || []).length + 1
        hits.push({ line: line + ctx.templateOffset, text: 'el-tooltip 传了 popper-class' })
      }
      // 样式里 :deep 改 tooltip 外观
      ;(ctx.style || '').split('\n').forEach((line, i) => {
        if (/:deep\([^)]*\.el-(tooltip|popper)/.test(line)) {
          hits.push({ line: i + 1 + ctx.styleOffset, text: line.trim().slice(0, 80) })
        }
      })
      return hits
    },
    hint: 'tooltip 白底/无箭头/圆角/字阶/限宽全在源头 tooltip.scss，使用方不覆盖',
  },

  /** 下拉触发器箭头必须用约定 class */
  'dropdown-caret-class': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const dd of findAll(root, /^el-dropdown$/)) {
        // 触发器里若有箭头类图标，必须挂 .dropdown-caret
        const icons = findAll(dd, /^(ArrowDown|ChevronDown|CaretBottom)$/)
        for (const ic of icons) {
          const cls = String(ic.attrs.class || '')
          if (/dropdown-caret/.test(cls)) continue
          // 在 #dropdown 面板内的不算触发器箭头
          if (closest(ic, /^template$/)?.attrs?.['#dropdown'] !== undefined) continue
          hits.push({ line: ic.line + ctx.templateOffset, text: `<${ic.tag}> 未挂 .dropdown-caret` })
        }
      }
      return hits
    },
    hint: '下拉触发器箭头用约定 class .dropdown-caret + @visible-change 绑 .is-expanded，展开翻转在源头',
  },

  /** 分页小型档：small 与精简 layout 必须同时做 */
  'pagination-small-layout': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const p of findAll(root, /^el-pagination$/)) {
        const isSmall = p.attrs.small !== undefined || p.attrs[':small'] !== undefined
        if (!isSmall) continue
        const layout = String(p.attrs.layout || '')
        // 小型档 layout 必须精简为 prev,pager,next
        if (/sizes|jumper|total/.test(layout)) {
          hits.push({
            line: p.line + ctx.templateOffset,
            text: `small 档 layout 未精简：${layout.slice(0, 50)}`,
          })
        }
      }
      return hits
    },
    hint: '小型档必须同时加 small 且把 layout 精简为 prev, pager, next（只加 small 会挤出换行）',
  },

  /** Badge 未读数加 :max */
  'badge-max-99': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const b of findAll(root, /^el-badge$/)) {
        const raw = b.attrs[':value'] ?? b.attrs.value
        if (raw === undefined) continue
        const hasMax = b.attrs[':max'] !== undefined || b.attrs.max !== undefined
        if (hasMax) continue
        // ⚠️ 只有**数字型**未读数才需要 :max——文本徽标（value="new"）、
        //    绑定变量（无法静态知道类型）都不该报
        if (!/^\d+$/.test(String(raw).trim())) continue
        hits.push({ line: b.line + ctx.templateOffset, text: `:value="${raw}" 未加 :max` })
      }
      return hits
    },
    hint: '未读数场景一律加 :max="99"，超过显示 99+，避免三位数撑破角标',
  },

  /** v-loading 禁自拼 spinner */
  'loading-no-custom-spinner': {
    scope: 'style',
    find: /@keyframes\s+\w*(spin|rotate|loading)|animation\s*:[^;]*\b(spin|rotate|loading)\b/i,
    skip: /^\s*(\/\/|\/\*|\*)/,
    hint: '区域加载一律 v-loading 指令（源头已是四圆点动画），禁自拼转圈图标/遮罩',
  },

  /** 通知里的按钮必须走约定类 */
  'notification-h-actions': {
    custom: (ctx) => {
      const hits = []
      const re = /ElNotification\s*\(/g
      let m
      while ((m = re.exec(ctx.text))) {
        let depth = 0, end = m.index + m[0].length - 1
        for (let i = end; i < ctx.text.length && i < end + 900; i += 1) {
          if (ctx.text[i] === '(') depth += 1
          else if (ctx.text[i] === ')') { depth -= 1; if (!depth) { end = i; break } }
        }
        const call = ctx.text.slice(m.index, end + 1)
        // 用 h() 渲染了按钮，但没套 .notify-actions
        if (/h\(/.test(call) && /ElButton|el-button/.test(call) && !/notify-actions/.test(call)) {
          const line = (ctx.text.slice(0, m.index).match(/\n/g) || []).length + 1
          hits.push({ line, text: '通知内按钮行未套 .notify-actions' })
        }
      }
      return hits
    },
    hint: '通知里的操作按钮用 h() 渲染 + 按钮行套约定类 .notify-actions（右对齐/间距在源头）',
  },

  /** 表单标签位置：label-position="top" 未启用 */
  'form-label-left': {
    scope: 'template',
    find: /<el-form[^>]*\blabel-position=["']top["']/s,
    hint: '表单标签一律在左（label-width="auto"），label-position="top" 当前未启用',
  },

  /** 表单整体宽度用 max-width 约束在容器一处 */
  'form-max-width': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const form of findAll(root, /^el-form$/)) {
        if (form.attrs.inline || form.attrs[':inline']) continue
        // 每个控件都写了行内宽度 = 宽度散落
        const widthed = findAll(form, /^el-(input|select|date-picker|input-number|cascader)$/).filter(
          (n) => /width\s*:/.test(String(n.attrs.style || '')),
        )
        if (widthed.length >= 3) {
          hits.push({
            line: widthed[0].line + ctx.templateOffset,
            text: `${widthed.length} 个控件各自写行内宽度，应在容器一处用 max-width 约束`,
          })
        }
      }
      return hits
    },
    hint: '单列表单整体宽度用 max-width 集中在容器一处（如 500px），不散落每个控件',
  },

  /** 表格超宽须冻结首尾列 */
  'table-freeze-columns': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const t of findAll(root, /^el-table$/)) {
        const cols = findAll(t, /^el-table-column$/)
        const hasFixed = cols.some((c) => c.attrs.fixed !== undefined || c.attrs[':fixed'] !== undefined)
        if (hasFixed) continue
        // ⚠️ 判据是「总宽会不会超出容器」，不是列数——
        //    6 列各 160px 总共 960px 根本不横滚，按列数判必然误报。
        //    列宽全部写死且合计 > 1200（内容区硬下限）才判定会横滚。
        const widths = cols.map((c) => Number(String(c.attrs.width || '').replace(/px$/, '')))
        if (widths.some((w) => !w)) continue // 有弹性列 → 不横滚
        const total = widths.reduce((a, b2) => a + b2, 0)
        if (total <= 1200) continue
        hits.push({
          line: t.line + ctx.templateOffset,
          text: `${cols.length} 列合计 ${total}px 超出容器且无 fixed`,
        })
      }
      return hits
    },
    hint: '内容总宽超容器触发横滚时，主题列 fixed="left" + 操作列 fixed="right"；用 DataTable 则自动',
  },

  /** GSAP 仅展示型可用 */
  'gsap-display-only': {
    find: /from\s+['"]gsap['"]|require\(['"]gsap['"]\)/,
    hint: 'GSAP 仅展示型页面可用且须按需动态 import，效率型页面禁止引入',
  },

  /** 暗色下卡片用 .surface-bordered，不用纯色描边 */
  'dark-surface-bordered': {
    scope: 'style',
    custom: (ctx) => {
      const body = ctx.style || ''
      const hits = []
      // 暗色作用域内写了纯色 border
      const re = /(\[data-theme=["']dark["']\]|html\.dark)([\s\S]{0,400}?)\}/g
      let m
      while ((m = re.exec(body))) {
        if (/border\s*:\s*1px\s+solid/.test(m[2])) {
          const line = (body.slice(0, m.index).match(/\n/g) || []).length + 1
          hits.push({ line: line + ctx.styleOffset, text: '暗色作用域内使用纯色描边' })
        }
      }
      return hits
    },
    hint: '暗色下卡片描边用 .surface-bordered 双光源渐变描边工具类，不用纯色描边',
  },

  // ── AST 类：需要看模板结构（数兄弟节点 / 查嵌套 / 看顺序）────────

  /** 同一视觉层级内最多一个 primary 按钮 */
  'button-primary-unique': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      // 按「按钮组容器」分组：以按钮的直接父节点为一个视觉层级
      const groups = new Map()
      for (const btn of findAll(root, /^(el-button|AiButton)$/)) {
        const t = btn.attrs.type || btn.attrs[':type']
        if (t !== 'primary') continue
        // 弹窗 footer / 抽屉 footer 各算独立层级
        const parent = btn.parent
        if (!groups.has(parent)) groups.set(parent, [])
        groups.get(parent).push(btn)
      }
      for (const [, btns] of groups) {
        // ⚠️ v-if / v-else-if / v-else 是互斥分支，运行时只渲染一个——
        //    不能只数标签（曾把「下一步 / 提交」这对互斥按钮误判为两个主按钮）
        const always = btns.filter(
          (b) => !Object.keys(b.attrs).some((k) => /^v-(if|else-if|else|show)$/.test(k)),
        )
        const branched = btns.length - always.length
        // 无条件渲染的 >1 个，或「无条件的 + 至少一个分支」同时出现，才算泛滥
        const effective = always.length + (branched > 0 && always.length > 0 ? 1 : 0)
        if (effective <= 1) continue
        hits.push({
          line: btns[1].line + ctx.templateOffset,
          text: `同一容器内 ${effective} 个 primary 按钮同时可见`,
        })
      }
      return hits
    },
    hint: '同一视觉层级（页面/弹窗/卡片）内最多一个 Primary 按钮，主操作应唯一',
  },

  /** tooltip 内不得放可交互元素（鼠标移过去气泡就消失，够不着） */
  'tooltip-no-interactive': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const tip of findAll(root, /^el-tooltip$/)) {
        // #reference / 默认插槽里的触发器不算，只看 #content 插槽
        for (const child of tip.children) {
          const isContentSlot =
            child.tag === 'template' &&
            Object.keys(child.attrs).some((k) => /^#content$|^v-slot:content$/.test(k))
          if (!isContentSlot) continue
          if (hasDescendant(child, /^(el-button|el-input|el-select|el-checkbox|el-radio|el-switch|button|input|a)$/)) {
            hits.push({ line: child.line + ctx.templateOffset, text: 'tooltip #content 内含可交互元素' })
          }
        }
      }
      return hits
    },
    hint: '需要可交互浮层用 el-dropdown / el-popconfirm / el-dialog——tooltip 鼠标移过去就消失',
  },

  /** 弹窗内的表单不自带底部按钮，一律交给 #footer */
  'dialog-single-footer': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const dlg of findAll(root, /^(el-dialog|el-drawer)$/)) {
        // 弹窗内的 el-form 里若还有按钮，就是第二套操作区
        for (const form of findAll(dlg, /^el-form$/)) {
          // 排除 footer 插槽内的（那是合法位置）
          const inFooter = closest(form, /^template$/)
          if (inFooter && Object.keys(inFooter.attrs).some((k) => /footer/.test(k))) continue
          if (hasDescendant(form, /^(el-button|AiButton)$/)) {
            hits.push({ line: form.line + ctx.templateOffset, text: '弹窗内表单自带按钮，与 #footer 重复' })
          }
        }
      }
      return hits
    },
    hint: '弹窗内表单不放底部按钮，提交/取消一律交给 #footer（主按钮在右）',
  },

  /** 表单一律单列，禁多列 Z 字动线 */
  'form-single-column': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const form of findAll(root, /^el-form$/)) {
        // inline 表单是筛选条，不受单列约束
        if (form.attrs.inline || form.attrs[':inline']) continue
        // 表单内出现栅格分栏 / 多列容器 → 多列表单
        for (const col of findAll(form, /^(el-col|el-row)$/)) {
          hits.push({ line: col.line + ctx.templateOffset, text: `表单内用 <${col.tag}> 分栏` })
          break
        }
        const gridCols = findAll(form, /^div$/).filter((d) =>
          /grid__col-/.test(String(d.attrs.class || '')),
        )
        if (gridCols.length > 1) {
          hits.push({
            line: gridCols[1].line + ctx.templateOffset,
            text: `表单内 ${gridCols.length} 个栅格列，构成多列表单`,
          })
        }
      }
      return hits
    },
    hint: '表单一律单列（多列 Z 字动线易遗漏）；字段多先分组/分步，仍装不下改抽屉',
  },

  /** 错误提示放输入域下方，禁汇总到表单顶部 */
  'form-error-below-field': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      for (const form of findAll(root, /^el-form$/)) {
        // 表单第一个子元素若是 alert（且含「错误/校验」语义），多半是顶部汇总
        const first = form.children.find((c) => /^el-alert$/.test(c.tag))
        if (!first) continue
        const type = String(first.attrs.type || first.attrs[':type'] || '')
        if (/error|danger/.test(type)) {
          hits.push({ line: first.line + ctx.templateOffset, text: '表单顶部汇总错误提示' })
        }
      }
      return hits
    },
    hint: '错误提示放对应输入域下方（el-form-item 默认位置），禁汇总到表单顶部',
  },

  /** 工具栏元素顺序：标题→组件级tab→下拉→搜索→次按钮→主按钮 */
  'toolbar-order': {
    custom: (ctx) => {
      if (!ctx.template) return []
      const root = parseTemplate(ctx.template)
      const hits = []
      const ORDER = ['title', 'tabs', 'select', 'search', 'button-default', 'button-primary']
      const classify = (n) => {
        const cls = String(n.attrs.class || '')
        if (/toolbar__title/.test(cls)) return 'title'
        if (n.tag === 'el-tabs') return 'tabs'
        if (/^(el-select|el-cascader|el-date-picker)$/.test(n.tag)) return 'select'
        if (n.tag === 'SearchMini' || /search/i.test(cls)) return 'search'
        if (/^(el-button|AiButton)$/.test(n.tag)) {
          const t = n.attrs.type || n.attrs[':type']
          return t === 'primary' ? 'button-primary' : 'button-default'
        }
        return null
      }
      for (const bar of findAll(root, /^(div|header|section)$/)) {
        const cls = String(bar.attrs.class || '')
        if (!/\btoolbar__(left|right)\b/.test(cls)) continue
        const seq = bar.children.map(classify).filter(Boolean)
        for (let i = 1; i < seq.length; i += 1) {
          if (ORDER.indexOf(seq[i]) < ORDER.indexOf(seq[i - 1])) {
            hits.push({
              line: bar.line + ctx.templateOffset,
              text: `顺序错位：${seq[i - 1]} 在 ${seq[i]} 之前`,
            })
            break
          }
        }
      }
      return hits
    },
    hint: '工具栏顺序固定为 标题→组件级tab→下拉→搜索→次按钮→主按钮',
  },

  // —— 接入方式 ——
  'integration-three-layers': {
    files: /main\.(ts|js)$/,
    custom: (ctx) => {
      const t = ctx.text
      const ep = t.search(/element-plus\/dist\/index\.css/)
      const token = t.search(/design-token\/index\.scss/)
      const theme = t.search(/el-theme\/index\.scss/)
      if (ep === -1 || token === -1 || theme === -1) {
        const missing = [
          ep === -1 && 'element-plus/dist/index.css',
          token === -1 && 'design-token/index.scss',
          theme === -1 && 'el-theme/index.scss',
        ].filter(Boolean)
        return [{ line: 1, text: `缺少样式层引入：${missing.join('、')}` }]
      }
      if (!(ep < token && token < theme)) {
        return [{ line: 1, text: '三层引入顺序错误（应为 EP 基础 → 令牌 → 组件覆盖层）' }]
      }
      return []
    },
    hint: '必须按固定顺序引入样式三层，顺序错了覆盖会失效',
  },

  /**
   * 时间双重格式化：DataTable 的 kind:'date' 列，其数据源又被 formatTime() 包了一次。
   *
   * ⚠️ 为什么必须查：双重格式化**不报错**。formatTime 本年省年份输出 '08-20 23:59'，
   *    该串再喂 new Date() 被解析到 2001 年 → 页面显示 '2001-08-20 23:59'。
   *    出问题的页面此前照样拿 100 分（真实翻车，接入方反馈发现）。
   *
   * 做法：先从 columns 定义里收集所有 kind:'date' 的 prop，
   *      再扫数据里 `<prop>: formatTime(` 形式的赋值。
   *      只查 script 段 —— 列定义与数据都在那里。
   */
  'time-no-double-format': {
    custom: (ctx) => {
      const body = ctx.script || ''
      if (!body || !body.includes('formatTime')) return []

      // 1) 收集 kind:'date' 列的 prop 名（对象字面量内 prop 与 kind 同现即可，不限顺序）
      const dateProps = new Set()
      for (const m of body.matchAll(/\{[^{}]*\}/g)) {
        const obj = m[0]
        if (!/kind\s*:\s*['"]date['"]/.test(obj)) continue
        const pm = obj.match(/prop\s*:\s*['"]([^'"]+)['"]/)
        if (pm) dateProps.add(pm[1])
      }
      if (!dateProps.size) return []

      // 2) 扫这些 prop 的赋值是否被 formatTime 包裹
      const hits = []
      body.split('\n').forEach((line, i) => {
        for (const prop of dateProps) {
          const re = new RegExp(`\\b${prop}\\s*:\\s*formatTime\\s*\\(`)
          if (re.test(line)) {
            hits.push({
              line: i + 1 + (ctx.scriptOffset || 0),
              text: `${prop} 已由 DataTable 内部格式化，数据层不应再调 formatTime`,
            })
          }
        }
      })
      return hits
    },
    hint: "DataTable 的 kind:'date' 列由组件内部调 formatTime；数据层传原始时间串即可。只到日期用列上的 timePrecision:'day'，见 copywriting/time.md §3",
  },

  /**
   * 点击行无联动却开了 highlight-current-row —— 留下无意义的常驻高亮。
   * 判据：模板里有 highlight-current-row，但同一个 el-table 上没有 @row-click / @current-change。
   * 只查 template 段。
   */
  'table-no-idle-current-row': {
    scope: 'template',
    custom: (ctx) => {
      const body = ctx.template || ''
      if (!body.includes('highlight-current-row')) return []
      // 有行级联动事件即视为合理用法（主从布局）
      if (/@row-click|@current-change|v-on:row-click/.test(body)) return []
      const hits = []
      body.split('\n').forEach((line, i) => {
        if (line.includes('highlight-current-row')) {
          hits.push({
            line: i + 1 + (ctx.templateOffset || 0),
            text: '开了 highlight-current-row 但无 @row-click / @current-change 联动',
          })
        }
      })
      return hits
    },
    hint: '点击行不产生业务联动时不要开 highlight-current-row（常驻高亮＝噪音）；做主从布局才开，并配 @row-click / @current-change。见 patterns/list-item-pattern.md §五.5',
  },
}

/** 有检测器且能真正执行的条目 id（find 为 null 表示暂未实现） */
export const IMPLEMENTED = new Set(
  Object.entries(DETECTORS)
    .filter(([, d]) => d.custom || d.find)
    .map(([id]) => id),
)
