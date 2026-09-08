#!/usr/bin/env node
/**
 * 生成 fif-style-root → iflyv 令牌桥接表
 *
 * 用途：为使用 fif-style-root 的项目生成桥接层，让历史 fif 令牌名引用无需改动即可接入设计系统。
 * 输出：完整的 design-system-bridge.scss 内容（贴进项目使用）
 *
 * 运行：node scripts/gen-token-bridge.mjs > /path/to/project/src/style/design-system-bridge.scss
 */

// 桥接映射表（基于 reports/design-spec-extract/README.md 第二节的同源证据）
const TOKEN_MAPPINGS = {
  // ===== 色板：同名直接映射 =====
  palette: {
    // 10 阶灰
    'gray-0': 'gray-0',
    'gray-1': 'gray-1',
    'gray-2': 'gray-2',
    'gray-3': 'gray-3',
    'gray-4': 'gray-4',
    'gray-5': 'gray-5',
    'gray-6': 'gray-6',
    'gray-7': 'gray-7',
    'gray-8': 'gray-8',
    'gray-9': 'gray-9',
    'gray-10': 'gray-10',

    // 5 色各 10 阶（green/red/orange/blue/geekblue）
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((acc, i) => {
      ['green', 'red', 'orange', 'blue', 'geekblue'].forEach(color => {
        acc[`${color}-${i}`] = `${color}-${i}`;
      });
      return acc;
    }, {}),
  },

  // ===== 语义层：同名直接映射 =====
  semantic: {
    // 品牌色 5 态
    'brand-primary': 'brand-primary',
    'brand-hover': 'brand-hover',
    'brand-pressed': 'brand-pressed',
    'brand-disabled': 'brand-disabled',
    'brand-bg': 'brand-bg',
    'brand-text': 'brand-text',

    // 成功/危险/警告/信息 × 5 态（同名）
    ...[
      'success-primary', 'success-hover', 'success-pressed', 'success-disabled', 'success-bg',
      'danger-primary', 'danger-hover', 'danger-pressed', 'danger-disabled', 'danger-bg',
      'warning-primary', 'warning-hover', 'warning-pressed', 'warning-disabled', 'warning-bg',
      'info-primary', 'info-hover', 'info-pressed', 'info-disabled', 'info-bg',
    ].reduce((acc, name) => {
      acc[name] = name;
      return acc;
    }, {}),

    // 文本/图标 4 档
    'text-1': 'text-1',
    'text-2': 'text-2',
    'text-3': 'text-3',
    'text-4': 'text-4',
    'icon-1': 'icon-1',
    'icon-2': 'icon-2',
    'icon-3': 'icon-3',
    'icon-4': 'icon-4',

    // 背景
    'bg-page': 'bg-page',
    'bg-page-white': 'bg-page-white',
    'bg-panel': 'bg-panel',
    'bg-inset': 'bg-inset',

    // 边框
    'border-1': 'border-1',
    'border-2': 'border-2',
    'border-3': 'border-3',

    // 阴影
    'shadow-hover': 'shadow-hover',
    'shadow-related': 'shadow-related',
    'shadow-independent': 'shadow-independent',
  },

  // ===== 圆角：命名差异，值一一对应 =====
  radius: {
    'radius-min': 'radius-xs',           // 4px
    'radius-smallmodule': 'radius-sm',   // 8px
    'radius-largemodule': 'radius-md',   // 10px
    'radius-page': 'radius-lg',          // 12px
    'radius-full': 'radius-full',        // 999px
  },

  // ===== 间距：1-6 同名，7 对应 10 =====
  spacing: {
    'spacing-1': 'spacing-1',   // 4px
    'spacing-2': 'spacing-2',   // 8px
    'spacing-3': 'spacing-3',   // 12px
    'spacing-4': 'spacing-4',   // 16px
    'spacing-5': 'spacing-5',   // 20px
    'spacing-6': 'spacing-6',   // 24px
    'spacing-7': 'spacing-10',  // 40px（名不同，值相同）
  },

  // ===== 字体系统 =====
  font: {
    // 字体档位（整档取用）
    'font-body-primary': 'font-body-primary',
    'font-body-sub': 'font-body-sub',
    'font-body-min': 'font-body-min',
    'font-family-number': 'font-family-number',
    'font-weight-semibold': 'font-weight-semibold',

    // 单独的字号/行高（按需映射）
    'font-size-16': 'font-size-16',
    'line-height-24': 'line-height-24',

    // 简写形式
    'font': 'font-body-primary',
    'font-a': 'font-body-sub',
  },

  // ===== 背景扩展 =====
  backgroundExt: {
    'bg-card': 'bg-card',
    'bg-white': 'bg-page-white',       // 白色背景
    'bg-gray': 'gray-1',               // 浅灰背景
    'bg-app': 'bg-page',               // 应用背景
    'bg-2': 'gray-1',                  // 次级背景
    'bg-color': 'bg-panel',            // 通用背景色
    'bg-color1': 'bg-inset',           // 内嵌区背景
    'card-bg': 'bg-card',              // 卡片背景
  },

  // ===== 边框扩展 =====
  borderExt: {
    'border-primary': 'border-default',
    'border-primar': 'border-default', // 拼写错误，统一到正确名称
    'border-info': 'info-primary',     // 信息色边框
  },

  // ===== 填充 =====
  fill: {
    'fill-quaternary': 'gray-2',       // 四级填充
    'fill-quinary': 'gray-1',          // 五级填充
  },

  // ===== 色彩简写（单色语义） =====
  colorShorthand: {
    'primary': 'brand-primary',
    'danger': 'danger-primary',
    'warning-color': 'warning-primary',
  },

  // ===== 色调（暗色主题相关） =====
  tone: {
    'tone-bg': 'bg-inset',             // 色调背景
    'tone-strong': 'text-1',           // 强色调文本
    'text-darkbg': 'text-on-dark',     // 深色背景上的文字
  },

  // ===== 遮罩 =====
  mask: {
    'mask-primary': 'mask-primary',
  },

  // ===== 项目特有组件令牌 =====
  projectSpecific: {
    // AI 助手浮动按钮（launcher 组件）
    'launcher-size': 'spacing-10',            // 40px
    'launcher-radius': 'radius-full',         // 全圆角
    'launcher-border': 'border-default',
    'launcher-hover-border': 'brand-hover',
    'launcher-shadow': 'shadow-hover',
    'launcher-icon-size': 'spacing-6',        // 24px

    // 智能匹配对话框
    'sm-header-bg': 'bg-panel',

    // 品牌色第二入口
    'fif-color-409': 'brand-primary',  // #23B283，品牌绿的重复入口
  },
};

/**
 * 生成桥接 CSS
 */
function generateBridge() {
  const lines = [];

  lines.push(`/**`);
  lines.push(` * 令牌桥接层 —— 把项目历史使用的 fif 令牌名，重定向到设计系统源头`);
  lines.push(` *`);
  lines.push(` * 为什么需要：项目有 2139 处 var(--gray-0) 这类 fif 名引用。`);
  lines.push(` * 桥接后它们的值来自设计系统，改源头即全站生效，而老代码一行不用改。`);
  lines.push(` *`);
  lines.push(` * ⚠️ 这不是"拷贝令牌"——右侧全部是 var(--iflyv-*) 引用，值仍在源头。`);
  lines.push(` * ⚠️ 本文件是过渡设施。新代码请直接用 --iflyv-*，本文件随迁移进度逐步缩小。`);
  lines.push(` *`);
  lines.push(` * 生成工具：packages/xy-design-system/scripts/gen-token-bridge.mjs`);
  lines.push(` * 生成时间：${new Date().toISOString()}`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`html:root {  /* 提高优先级，避免被普通 :root 覆盖 */`);

  // 色板
  lines.push(`  /* ==================== 色板：10 阶灰 + 五色 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.palette).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 语义层
  lines.push(`  /* ==================== 语义层 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.semantic).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 圆角
  lines.push(`  /* ==================== 圆角：命名不同、值一一对应 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.radius).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 间距
  lines.push(`  /* ==================== 间距 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.spacing).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 字体系统
  lines.push(`  /* ==================== 字体系统 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.font).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 背景扩展
  lines.push(`  /* ==================== 背景扩展 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.backgroundExt).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 边框扩展
  lines.push(`  /* ==================== 边框扩展 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.borderExt).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 填充
  lines.push(`  /* ==================== 填充 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.fill).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 色彩简写
  lines.push(`  /* ==================== 色彩简写 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.colorShorthand).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 色调
  lines.push(`  /* ==================== 色调（暗色主题相关） ==================== */`);
  Object.entries(TOKEN_MAPPINGS.tone).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 遮罩
  lines.push(`  /* ==================== 遮罩 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.mask).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });
  lines.push(``);

  // 项目特有组件
  lines.push(`  /* ==================== 项目特有组件令牌 ==================== */`);
  Object.entries(TOKEN_MAPPINGS.projectSpecific).forEach(([fif, iflyv]) => {
    lines.push(`  --${fif}: var(--iflyv-${iflyv});`);
  });

  lines.push(`}`);
  lines.push(``);

  return lines.join('\n');
}

// 统计输出
function printStats() {
  const total = Object.values(TOKEN_MAPPINGS).reduce(
    (sum, group) => sum + Object.keys(group).length,
    0
  );

  console.error(`✅ 已生成 ${total} 个令牌桥接映射`);
  console.error(`   - 色板：${Object.keys(TOKEN_MAPPINGS.palette).length} 个`);
  console.error(`   - 语义层：${Object.keys(TOKEN_MAPPINGS.semantic).length} 个`);
  console.error(`   - 圆角：${Object.keys(TOKEN_MAPPINGS.radius).length} 个`);
  console.error(`   - 间距：${Object.keys(TOKEN_MAPPINGS.spacing).length} 个`);
  console.error(`   - 字体系统：${Object.keys(TOKEN_MAPPINGS.font).length} 个`);
  console.error(`   - 背景扩展：${Object.keys(TOKEN_MAPPINGS.backgroundExt).length} 个`);
  console.error(`   - 边框扩展：${Object.keys(TOKEN_MAPPINGS.borderExt).length} 个`);
  console.error(`   - 填充：${Object.keys(TOKEN_MAPPINGS.fill).length} 个`);
  console.error(`   - 色彩简写：${Object.keys(TOKEN_MAPPINGS.colorShorthand).length} 个`);
  console.error(`   - 色调：${Object.keys(TOKEN_MAPPINGS.tone).length} 个`);
  console.error(`   - 遮罩：${Object.keys(TOKEN_MAPPINGS.mask).length} 个`);
  console.error(`   - 项目特有：${Object.keys(TOKEN_MAPPINGS.projectSpecific).length} 个`);
  console.error(``);
  console.error(`使用方式：将输出内容保存为项目的 src/style/design-system-bridge.scss`);
}

// 执行
printStats();
console.log(generateBridge());
