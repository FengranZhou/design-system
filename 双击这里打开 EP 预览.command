#!/bin/zsh
# 双击启动组件预览：起 dev server 并自动打开浏览器
cd "$(dirname "$0")/demo"
(sleep 3 && open http://localhost:5173/) &
pnpm dev
