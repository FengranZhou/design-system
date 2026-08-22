#!/usr/bin/env node
/**
 * build-tokens.mjs
 *
 * 从设计令牌 SCSS 文件提取四类令牌，生成 JSON 供扩展使用：
 *   1. 语义色板（semantic colors）
 *   2. 语义字阶（font scale）
 *   3. 间距（spacing）
 *   4. 圆角（radius）
 *
 * 生成物：scripts/design-tokens.json
 * 消费方：扩展的「调整」面板，实时从 GitHub raw URL 拉取
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(__dirname, 'design-tokens.json')

const SEMANTIC_FILE = join(ROOT, 'design-spec/design-token/css/semantic.scss')
const FONT_FILE = join(ROOT, 'design-spec/design-token/css/font.scss')
const SPACING_FILE = join(ROOT, 'design-spec/design-token/css/spacing.scss')

/**
 * 从 SCSS 文件提取 Sass 变量定义（$var-name: value;）
 *
 * @param {string} filePath - SCSS 文件路径
 * @returns {Map<string, string>} - 变量名 → 值的映射
 */
function extractSassVars(filePath) {
  if (!existsSync(filePath)) return new Map()
  const content = readFileSync(filePath, 'utf8')
  const vars = new Map()
  // 匹配 $var-name: value;
  const pattern = /\$([a-zA-Z0-9_-]+):\s*([^;]+);/g
  let match
  while ((match = pattern.exec(content)) !== null) {
    const name = match[1]
    let value = match[2].trim()
    // 清理行尾注释
    value = value.replace(/\/\*.*?\*\/\s*$/, '').trim()
    vars.set(name, value)
  }
  return vars
}

/**
 * 替换字符串中的 Sass 变量引用和插值
 *
 * @param {string} value - 待处理的值
 * @param {Map<string, string>} sassVars - Sass 变量映射
 * @returns {string} - 替换后的值
 */
function resolveSassRefs(value, sassVars) {
  // 替换 #{$var-name} 插值
  value = value.replace(/#\{\$([a-zA-Z0-9_-]+)\}/g, (_, varName) => {
    return sassVars.get(varName) || `$${varName}`
  })
  // 替换嵌套的字符串插值 #{'...'} 或 #{"..."}
  value = value.replace(/#\{(['"])(.+?)\1\}/g, '$2')
  // 替换直接的 $var-name 引用（如果前后是空白或运算符）
  value = value.replace(/(?:^|[\s,(/])\$([a-zA-Z0-9_-]+)(?=[\s,)/]|$)/g, (full, varName) => {
    const resolved = sassVars.get(varName)
    return resolved ? full.replace(`$${varName}`, resolved) : full
  })
  return value
}

/**
 * 从 SCSS 文件提取 CSS 变量定义（--iflyv-xxx: value;）
 *
 * @param {string} filePath - SCSS 文件路径
 * @param {RegExp} pattern - 匹配模式，捕获 name 和 value
 * @param {Map<string, string>} sassVars - Sass 变量映射（用于解析引用）
 * @returns {Array<{name: string, value: string, comment?: string}>}
 */
function extractCSSVars(filePath, pattern, sassVars = new Map()) {
  if (!existsSync(filePath)) return []
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const vars = []
  let pendingComment = null

  for (const line of lines) {
    // 捕获行尾注释：/* 主题色 Brand */
    const commentMatch = line.match(/\/\*\s*(.+?)\s*\*\//)
    if (commentMatch) {
      const comment = commentMatch[1]
      // 如果注释在变量定义行内，立即使用；否则暂存给下一行
      if (line.includes('--iflyv-')) {
        pendingComment = comment
      } else if (line.trim().startsWith('/*')) {
        // 独占一行的注释（分类标题），不挂到变量上
        pendingComment = null
      }
    }

    const match = line.match(pattern)
    if (match) {
      let value = match[2].trim()
      // 清理末尾分号和行尾注释（分号可能在注释前）
      value = value.replace(/\s*\/\*.*?\*\/\s*$/, '').replace(/;+$/, '').trim()
      // 解析 Sass 变量引用
      if (sassVars.size > 0) {
        value = resolveSassRefs(value, sassVars)
      }

      const entry = { name: match[1], value }

      // 使用行内注释或之前暂存的注释
      if (pendingComment) {
        entry.comment = pendingComment
        pendingComment = null
      }
      vars.push(entry)
    }
  }
  return vars
}

/**
 * 提取语义色板
 *
 * 范围：
 *   - Brand: brand-primary/hover/pressed/disabled/bg/text
 *   - Success/Danger/Warning/Info: *-primary/hover/pressed/disabled/bg
 *   - Background: bg-page/panel/inset/card/...
 *   - Text: text-1/2/3/4/on-dark
 *   - Border: border-1/2/3
 *   - Fill: fill-1/2/3/4
 *   - Mask: mask
 *
 * 排除 AI 渐变（复杂值，调整面板用不上）和组件桥接变量（input-focus-ring 等）
 */
function extractSemanticColors() {
  const all = extractCSSVars(SEMANTIC_FILE, /--iflyv-([\w-]+):\s*(.+)/)

  // 只取语义色板，排除 AI 渐变和组件桥接变量
  const semantic = all.filter(v => {
    const n = v.name
    // 排除：ai-gradient*、input-*、avatar-*
    if (n.startsWith('ai-') || n.startsWith('input-') || n.startsWith('avatar-')) return false
    // 只保留：brand*/success*/danger*/warning*/info*/bg-*/text-*/border-*/fill-*/mask
    return /^(brand|success|danger|warning|info|bg|text|border|fill|mask)-/.test(n)
  })

  // 分组：按前缀（brand/success/...）
  const groups = {}
  for (const v of semantic) {
    const prefix = v.name.split('-')[0]
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(v)
  }

  return { groups, all: semantic }
}

/**
 * 提取语义字阶
 *
 * 范围：
 *   - 组合字体（--iflyv-font-xxx: size/line-height family）
 *     如 font-body-primary: 16px/24px base
 *   - 单项（--iflyv-font-size-12, --iflyv-line-height-18）
 *
 * 策略：
 *   - 只取 CSS 变量（--iflyv-），不取 Sass 变量（$font-weight-regular）
 *   - 组合字体变量名模式：font-xxx（不含 size/family/weight）
 *   - 解析 Sass 变量引用（#{$font-family-base} → 实际字体族）
 */
function extractFontScale() {
  const content = readFileSync(FONT_FILE, 'utf8')
  // 先提取 Sass 变量
  const sassVars = extractSassVars(FONT_FILE)
  const vars = []

  // 提取所有 --iflyv-font-* CSS 变量
  const fontPattern = /--iflyv-(font-[\w-]+):\s*([^;]+);/g
  let match
  while ((match = fontPattern.exec(content)) !== null) {
    const name = match[1]
    let value = match[2].trim()

    // 清理行尾注释
    value = value.replace(/\/\*.*?\*\/\s*$/, '').trim()
    // 解析 Sass 变量引用
    value = resolveSassRefs(value, sassVars)

    vars.push({ name, value })
  }

  return vars
}

/**
 * 提取间距
 */
function extractSpacing() {
  return extractCSSVars(SPACING_FILE, /--iflyv-(spacing-[\w_]+):\s*(.+)/)
}

/**
 * 提取圆角
 */
function extractRadius() {
  return extractCSSVars(SPACING_FILE, /--iflyv-(radius-[\w]+):\s*(.+)/)
}

export function buildTokens() {
  const semanticColors = extractSemanticColors()
  const fontScale = extractFontScale()
  const spacing = extractSpacing()
  const radius = extractRadius()

  return {
    version: 1,
    generatedFrom: 'FengranZhou/design-system',
    semanticColors: semanticColors.all,
    semanticColorGroups: semanticColors.groups,
    fontScale,
    spacing,
    radius,
    _stats: {
      semanticColors: semanticColors.all.length,
      fontScale: fontScale.length,
      spacing: spacing.length,
      radius: radius.length,
    },
  }
}

// ── CLI ────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && process.argv[1].endsWith('build-tokens.mjs')
if (isMain) {
  const tokens = buildTokens()
  const stats = tokens._stats
  delete tokens._stats
  const json = JSON.stringify(tokens, null, 2) + '\n'

  if (process.argv.includes('--check')) {
    const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
    if (prev !== json) {
      console.error('✗ design-tokens.json 与当前设计令牌不一致')
      console.error('  跑一次：node scripts/build-tokens.mjs   然后提交生成物')
      process.exit(1)
    }
    console.log(`✓ design-tokens.json 是最新的`)
    console.log(`  语义色板 ${stats.semanticColors} 个、字阶 ${stats.fontScale} 个、间距 ${stats.spacing} 个、圆角 ${stats.radius} 个`)
  } else {
    writeFileSync(OUT, json)
    console.log(`✓ 已生成 scripts/design-tokens.json`)
    console.log(`  语义色板 ${stats.semanticColors} 个、字阶 ${stats.fontScale} 个、间距 ${stats.spacing} 个、圆角 ${stats.radius} 个`)
  }
}
