#!/bin/zsh
# 双击启动 antd3 适配层预览：起 dev server 并自动打开浏览器
# 端口 5174，与 EP 版预览（5173）错开，两者可同时打开对比
cd "$(dirname "$0")/demo-antd3"

# 首次使用自动装依赖（antd3 demo 的 node_modules 不随仓库分发）
if [ ! -d node_modules ]; then
  echo "首次使用，正在安装依赖（约 2 分钟）..."
  pnpm install || { echo "安装失败，请手动执行：cd demo-antd3 && pnpm install"; read; exit 1; }
fi

(sleep 3 && open http://localhost:5174/) &
pnpm dev
