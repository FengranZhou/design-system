#!/bin/sh
# 安装本仓库的 git hooks（把 .githooks/ 下的钩子软链进 .git/hooks/）
#
# 为什么不用 core.hooksPath：那会让 git 只认 .githooks/ 一处，
# 绕过 .git/hooks/pre-commit（公司文件服务钩子）。软链只加不覆盖，两者共存。

cd "$(dirname "$0")/.." || exit 1
for hook in .githooks/*; do
  name=$(basename "$hook")
  [ "$name" = "install.sh" ] && continue
  if [ -e ".git/hooks/$name" ] && [ ! -L ".git/hooks/$name" ]; then
    echo "⚠ .git/hooks/$name 已存在且不是软链，跳过（手动合并）"
    continue
  fi
  ln -sf "../../.githooks/$name" ".git/hooks/$name"
  echo "✓ $name"
done
