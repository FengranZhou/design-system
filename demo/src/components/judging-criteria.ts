// 评判标准两个展示页的共用逻辑（分级文案/取色、规范名映射）

export const levelCards = [
  { level: 'MUST', desc: '违反即不合规。名单外的用法、脱离设计系统源头，必须修。' },
  { level: 'SHOULD', desc: '偏离标准做法但功能正常，需要说明理由。' },
  { level: 'MAY', desc: '优化建议，记录即可，不阻断验收。' },
]

export const levelText = (l: string) =>
  ({ MUST: '必须', SHOULD: '应该', MAY: '建议' })[l] ?? l

// 分级用色对号入座：MUST 违反要补救→danger；SHOULD 需留意→warning；MAY 中性事实→info
export const levelTagType = (l: string) =>
  ({ MUST: 'danger', SHOULD: 'warning', MAY: 'info' })[l] ?? 'info'

// 规范文件 → 人读得懂的规范名。要的是「去哪份规范查」，
// 文件路径与行号是给脚本用的，不上页面。
const SPEC_NAMES: Record<string, string> = {
  'foundations.md': '基础规范',
  'efficiency-guide.md': '效率型页面指南',
  'display-guide.md': '展示型页面指南',
  'component-interaction.md': '组件交互规范',
  'judging-criteria.md': '评判标准',
  'form-pattern.md': '表单模式',
  'list-item-pattern.md': '列表条目模式',
  'toolbar-pattern.md': '工具栏模式',
  'dialog-pattern.md': '弹窗模式',
  'select-pattern.md': '选择器模式',
  'search-pattern.md': '搜索模式',
  'time.md': '时间文案规范',
}

export const specName = (source: string) => {
  const file = source.split('/').pop() ?? source
  return SPEC_NAMES[file] ?? file.replace(/\.md$/, '')
}
