#!/usr/bin/env node
/**
 * 检查桥接层覆盖率 —— 扫描项目中使用的 fif 令牌名，确认是否都在桥接表中
 *
 * 用途：确认何时可以安全删除 fif-style-root
 * 运行：node scripts/check-bridge-coverage.mjs <项目路径>
 *
 * 示例：node scripts/check-bridge-coverage.mjs ../../projects/xy-zk-manage-pc
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 桥接表中的令牌名（与 gen-token-bridge.mjs 保持一致）
const BRIDGED_TOKENS = new Set([
  // 色板
  'gray-0', 'gray-1', 'gray-2', 'gray-3', 'gray-4', 'gray-5',
  'gray-6', 'gray-7', 'gray-8', 'gray-9', 'gray-10',
  ...Array.from({length: 10}, (_, i) => i + 1).flatMap(i =>
    ['green', 'red', 'orange', 'blue', 'geekblue'].map(color => `${color}-${i}`)
  ),

  // 语义层
  'brand-primary', 'brand-hover', 'brand-pressed', 'brand-disabled', 'brand-bg', 'brand-text',
  'success-primary', 'success-hover', 'success-pressed', 'success-disabled', 'success-bg',
  'danger-primary', 'danger-hover', 'danger-pressed', 'danger-disabled', 'danger-bg',
  'warning-primary', 'warning-hover', 'warning-pressed', 'warning-disabled', 'warning-bg',
  'info-primary', 'info-hover', 'info-pressed', 'info-disabled', 'info-bg',
  'text-1', 'text-2', 'text-3', 'text-4',
  'icon-1', 'icon-2', 'icon-3', 'icon-4',
  'bg-page', 'bg-page-white', 'bg-panel', 'bg-inset',
  'border-1', 'border-2', 'border-3',
  'shadow-hover', 'shadow-related', 'shadow-independent',

  // 圆角
  'radius-min', 'radius-smallmodule', 'radius-largemodule', 'radius-page', 'radius-full',

  // 间距
  'spacing-1', 'spacing-2', 'spacing-3', 'spacing-4', 'spacing-5', 'spacing-6', 'spacing-7',

  // 字体系统
  'font-body-primary', 'font-body-sub', 'font-body-min',
  'font-family-number', 'font-weight-semibold',
  'font-size-16', 'line-height-24',
  'font', 'font-a',

  // 背景扩展
  'bg-card', 'bg-white', 'bg-gray', 'bg-app', 'bg-2',
  'bg-color', 'bg-color1', 'card-bg',

  // 边框扩展
  'border-primary', 'border-primar', 'border-info',

  // 填充
  'fill-quaternary', 'fill-quinary',

  // 色彩简写
  'primary', 'danger', 'warning-color',

  // 色调
  'tone-bg', 'tone-strong', 'text-darkbg',

  // 遮罩
  'mask-primary',

  // 项目特有
  'fif-color-409',
  'launcher-size', 'launcher-radius', 'launcher-border',
  'launcher-hover-border', 'launcher-shadow', 'launcher-icon-size',
  'sm-header-bg',
]);

/**
 * 递归扫描目录中的所有文件
 */
function* walkFiles(dir, exts = ['.vue', '.scss', '.css', '.ts', '.tsx', '.js', '.jsx']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
        continue;
      }
      yield* walkFiles(fullPath, exts);
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      yield fullPath;
    }
  }
}

/**
 * 提取文件中的 CSS 变量引用
 */
function extractCssVars(content) {
  const regex = /var\(\s*--([\w-]+)\s*(?:,\s*[^)]+)?\)/g;
  const vars = new Set();
  let match;

  while ((match = regex.exec(content)) !== null) {
    vars.add(match[1]);
  }

  return vars;
}

/**
 * 主函数
 */
function main() {
  const projectPath = process.argv[2];

  if (!projectPath) {
    console.error('用法: node check-bridge-coverage.mjs <项目路径>');
    console.error('示例: node check-bridge-coverage.mjs ../../projects/xy-zk-manage-pc');
    process.exit(1);
  }

  const srcPath = path.join(projectPath, 'src');

  if (!fs.existsSync(srcPath)) {
    console.error(`错误: 找不到源码目录 ${srcPath}`);
    process.exit(1);
  }

  console.log(`📊 扫描项目: ${projectPath}`);
  console.log(`📁 源码目录: ${srcPath}\n`);

  const allVars = new Set();
  const fileUsage = new Map();
  let fileCount = 0;

  // 扫描所有文件
  for (const filePath of walkFiles(srcPath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const vars = extractCssVars(content);

    if (vars.size > 0) {
      fileCount++;
      const relPath = path.relative(projectPath, filePath);
      fileUsage.set(relPath, vars);

      for (const v of vars) {
        allVars.add(v);
      }
    }
  }

  console.log(`✅ 已扫描 ${fileCount} 个文件，发现 ${allVars.size} 个不同的 CSS 变量引用\n`);

  // 筛选出 fif 风格的令牌名（不含 iflyv/el/fif 前缀的）
  const fifTokens = new Set();
  const otherTokens = new Set();
  const runtimeVars = new Set(); // 运行时变量，不需要桥接

  // 运行时变量模式（项目动态注入的配置变量）
  const runtimePatterns = [
    /^oss-/,           // OSS 相关配置
    /^runtime-/,       // 运行时配置
    /^dynamic-/,       // 动态配置
    /-override$/,      // 覆盖变量
  ];

  for (const v of allVars) {
    if (v.startsWith('iflyv-') || v.startsWith('el-') || v.startsWith('fif-')) {
      otherTokens.add(v);
    } else if (runtimePatterns.some(pattern => pattern.test(v))) {
      runtimeVars.add(v);
    } else {
      fifTokens.add(v);
    }
  }

  console.log(`📋 Fif 风格令牌: ${fifTokens.size} 个`);
  console.log(`📋 运行时变量（无需桥接）: ${runtimeVars.size} 个`);
  console.log(`📋 其他令牌 (--iflyv-*, --el-*, --fif-*): ${otherTokens.size} 个\n`);

  // 检查未覆盖的令牌
  const uncovered = new Set();
  for (const token of fifTokens) {
    if (!BRIDGED_TOKENS.has(token)) {
      uncovered.add(token);
    }
  }

  if (uncovered.size === 0) {
    console.log('✅ 桥接层已覆盖所有使用的 fif 令牌！');
    console.log('✅ 可以安全删除 fif-style-root 了\n');

    console.log('删除步骤：');
    console.log('1. 在 src/style/index.scss 中删除:');
    console.log('   @import "fif-style-root";');
    console.log('   @import "fif-style-root/sass-var";');
    console.log('2. 运行 pnpm remove fif-style-root');
    console.log('3. 验证页面仍正常显示');
  } else {
    console.log(`⚠️  发现 ${uncovered.size} 个未桥接的 fif 令牌:\n`);

    const sortedUncovered = Array.from(uncovered).sort();
    sortedUncovered.forEach(token => {
      console.log(`  --${token}`);

      // 显示使用该令牌的文件（最多 3 个）
      const files = [];
      for (const [file, vars] of fileUsage) {
        if (vars.has(token)) {
          files.push(file);
          if (files.length >= 3) break;
        }
      }
      console.log(`    使用文件: ${files.join(', ')}${files.length >= 3 ? ' ...' : ''}`);
    });

    console.log('\n⚠️  需要将这些令牌添加到桥接表后才能删除 fif-style-root');
  }

  // 统计信息
  console.log(`\n📊 统计信息:`);
  console.log(`  总文件数: ${fileCount}`);
  console.log(`  总令牌数: ${allVars.size}`);
  console.log(`  Fif 令牌: ${fifTokens.size}`);
  console.log(`  已桥接: ${fifTokens.size - uncovered.size}`);
  console.log(`  未桥接: ${uncovered.size}`);
  console.log(`  覆盖率: ${((1 - uncovered.size / fifTokens.size) * 100).toFixed(1)}%`);
}

main();
