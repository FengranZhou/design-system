import React from 'react'
import {
  MessageCircleMore,
  Presentation,
  Headset,
  BookOpenCheck,
  Link,
  Tablet,
  Zap,
} from 'lucide-react'

import './token-demo.less'

/**
 * Icon 图标四层级示例 —— 与 demo/src/components/token/IconDemo.vue 对位。
 *
 * 一~三级是本地切图，源在 demo-antd3/src/assets/icons/level1~3/，由 import.meta.glob
 * 自动收录，增删图片无需改本文件。
 * 四级按规范「统一调用 lucide 库」，直接渲染 lucide-react 组件而非切图，
 * 展示的即下游真实调用方式。本模块仅做示例展示，不涉及令牌定义。
 */

const modules = import.meta.glob<string>('../assets/icons/level*/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})

/**
 * 展示用中文名映射，按层级分组（一级、二级的源文件名都是纯数字，必须分组才不撞 key）。
 * key = 该层级目录下的文件名（已去掉扩展名与 @10x / -2 等切图后缀）。
 * 未在此列出的文件名（如三级）直接用文件名本身展示。
 */
const zhNames: Record<number, Record<string, string>> = {
  1: {
    '1': '定位签到',
    '2': '一键签到',
    '3': '签到码签到',
    '4': '打包生成中',
  },
  2: {
    '1': 'AI 四角星',
    '2': '文件夹',
    '3': '智慧课件',
    '4': '作业',
    '5': '测验',
    '6': '任务团子',
  },
}

/** 三级里的题型类，统一排到该级末尾（按此数组顺序） */
const questionTypes = ['单选题', '多选题', '判断题', '填空题', '简答题', '排序题', '匹配题']

/** 从路径取文件名，去掉 @10x / -2 等切图后缀；有中文映射则换成中文 */
function iconName(path: string, level: number): string {
  const file = path.split('/').pop() ?? ''
  const raw = file
    .replace(/\.png$/i, '')
    .replace(/@\d+x/i, '')
    .replace(/-\d+$/, '')
    .trim()
  return zhNames[level]?.[raw] ?? raw
}

function pick(level: number): { src: string; name: string }[] {
  const list = Object.entries(modules)
    .filter(([path]) => path.includes(`/level${level}/`))
    .sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
    .map(([path, src]) => ({ src: src as string, name: iconName(path, level) }))

  if (level !== 3) return list

  // 题型类置尾，其余保持原顺序
  const rank = (n: string) => questionTypes.indexOf(n)
  return [
    ...list.filter((i) => rank(i.name) === -1),
    ...list.filter((i) => rank(i.name) !== -1).sort((a, b) => rank(a.name) - rank(b.name)),
  ]
}

const imageLevels = [
  { key: 'l1', label: '一级图标 —— 空状态 / 引导 / 加载类大插画，2.5D', box: 120, size: 112, icons: pick(1) },
  { key: 'l2', label: '二级图标 —— 强功能入口 / 强点缀，融入玻璃质感', box: 40, size: 24, icons: pick(2) },
  { key: 'l3', label: '三级图标 —— 常规类型识别图标，扁平融白', box: 36, size: 20, icons: pick(3) },
]

const lucideLevel = {
  label: '四级图标 —— 最弱表现力，不抢焦，纯线性图标，统一调用 lucide 库',
  box: 32,
  size: 16,
  icons: [
    { name: '讨论', Comp: MessageCircleMore },
    { name: 'PPT', Comp: Presentation },
    { name: '客服', Comp: Headset },
    { name: '多媒体教材', Comp: BookOpenCheck },
    { name: '链接', Comp: Link },
    { name: '移动端', Comp: Tablet },
    { name: '自适应练习', Comp: Zap },
  ],
}

export default function IconDemo() {
  return (
    <section className="demo-section demo-plain">
      <h2 className="demo-section__title">Icon 图标</h2>

      {/* 一~三级：本地切图 */}
      {imageLevels.map((lvl) => (
        <div key={lvl.key} className="demo-block">
          <p className="demo-label">{lvl.label}</p>
          <div className={`token-icon-grid token-icon-grid--${lvl.key}`}>
            {lvl.icons.map((icon) => (
              <div key={icon.src} className="token-icon-item">
                <span className="token-icon-thumb" style={{ height: lvl.box }}>
                  <img
                    src={icon.src}
                    alt={icon.name}
                    style={{ maxHeight: lvl.size, maxWidth: lvl.size }}
                  />
                </span>
                {icon.name && <span className="token-desc token-icon-name">{icon.name}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 四级：内联 SVG，展示的即下游真实调用的 lucide 图标 */}
      <div className="demo-block">
        <p className="demo-label">{lucideLevel.label}</p>
        <div className="token-icon-grid token-icon-grid--l4">
          {lucideLevel.icons.map(({ name, Comp }) => (
            <div key={name} className="token-icon-item">
              <span className="token-icon-thumb" style={{ height: lucideLevel.box }}>
                <Comp size={lucideLevel.size} />
              </span>
              <span className="token-desc token-icon-name">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
