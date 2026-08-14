/**
 * 间距令牌 → 应用场景（单一数据源）
 *
 * ⛔ 这是间距「用途语义」的唯一定义处。令牌的**值**在 css/spacing.scss，
 *    「该用哪个」的**语义**只在本文件——两处各司其职，都不要另存副本。
 *
 * 使用方：
 *   - demo `SpacingDemo.vue` —— import 本文件渲染场景 chip（设计师可视化查阅）
 *   - `references/foundations.md` 间距速查表 —— 指向本文件，不再手抄一份
 *
 * 新增 / 修改场景时：**只改本文件**，两边自动一致。
 * （曾因 demo 与 foundations 两份手工副本不同步而选错档位，故收敛至此。）
 */

export interface SpacingUsage {
  /** 令牌名（完整 CSS 变量名） */
  name: string
  /** 值（px），与 css/spacing.scss 一致，供文档生成用 */
  px: number
  /** 应用场景清单；空数组表示暂未指定专属场景 */
  scenes: string[]
}

export const SPACING_USAGE: SpacingUsage[] = [
  { name: '--iflyv-spacing-0_5', px: 2, scenes: ['紧贴元素微调（图标与其紧邻文字的视觉对齐补偿）'] },
  { name: '--iflyv-spacing-1', px: 4, scenes: ['图标与文字间距', '标签内文字与图标间距'] },
  { name: '--iflyv-spacing-1_5', px: 6, scenes: ['Tag / Badge 等小控件的左右内边距'] },
  { name: '--iflyv-spacing-2', px: 8, scenes: ['列表项内子元素间距（标题与其描述、主信息与副信息）', '一组紧凑图标之间'] },
  { name: '--iflyv-spacing-3', px: 12, scenes: ['模块级标题与其下方内容之间', '按钮之间（水平）'] },
  {
    name: '--iflyv-spacing-4',
    px: 16,
    scenes: [
      '页面级标题与其下方内容之间',
      '页面级标题与页面顶部之间',
      '卡片之间（同级卡片常规间距）',
      '栅格列间水槽',
      '小卡片内边距（内容与卡片四周）',
    ],
  },
  { name: '--iflyv-spacing-5', px: 20, scenes: ['大卡片内边距（内容与卡片四周）'] },
  { name: '--iflyv-spacing-6', px: 24, scenes: ['表单项之间（label+控件为一组，组与组）', '页面内容距页面左右内边距', '面板内边距（内容与底板四周）'] },
  { name: '--iflyv-spacing-8', px: 32, scenes: ['模块之间（垂直，区块与区块）'] },
  { name: '--iflyv-spacing-10', px: 40, scenes: ['页面级 Section 之间（展示型页面的大留白）'] },
]
