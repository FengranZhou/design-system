# 设计系统包发布指南

## 前置条件

1. **确认 package.json 配置正确**
   - ✅ 已配置 `publishConfig.registry`：`https://depend.iflytek.com/artifactory/api/npm/npm-repo/`
   - ✅ 已配置 `files` 字段，只发布必要文件
   - ✅ 版本号符合语义化版本规范（当前：1.0.0）

2. **确认 npm 认证**
   ```bash
   # 查看当前 registry 配置
   npm config get registry
   
   # 设置内网 registry（如果未设置）
   npm config set registry https://depend.iflytek.com/artifactory/api/npm/npm-repo/
   
   # 登录内网 npm（需要内网账号）
   npm login --registry=https://depend.iflytek.com/artifactory/api/npm/npm-repo/
   ```

## 发布流程

### 1. 本地构建检查（可选）
```bash
cd packages/xy-design-system

# 检查将要发布的文件列表
npm pack --dry-run

# 预览发布内容（会生成 .tgz 文件）
npm pack
tar -tzf xiaoya-design-system-1.0.0.tgz
rm xiaoya-design-system-1.0.0.tgz
```

### 2. 发布到内网 npm
```bash
cd packages/xy-design-system

# 发布（首次发布）
npm publish

# 如果需要更新版本再发布
npm version patch  # 1.0.0 -> 1.0.1（bug 修复）
# npm version minor  # 1.0.0 -> 1.1.0（新功能）
# npm version major  # 1.0.0 -> 2.0.0（破坏性变更）
npm publish
```

### 3. 验证发布成功
```bash
# 搜索包
npm search @xiaoya/design-system

# 查看包信息
npm view @xiaoya/design-system

# 查看所有版本
npm view @xiaoya/design-system versions
```

## 项目切换到已发布的包

发布成功后，在 `xy-zk-manage-pc` 项目中：

### 方式 1：直接修改 package.json
```json
{
  "dependencies": {
    "@xiaoya/design-system": "^1.0.0"  // 改为版本号
  },
  "pnpm": {
    "overrides": {
      // 删除 overrides 配置
    }
  }
}
```

然后运行：
```bash
cd projects/xy-zk-manage-pc
pnpm install
```

### 方式 2：使用 pnpm 命令
```bash
cd projects/xy-zk-manage-pc

# 移除本地 link
pnpm remove @xiaoya/design-system

# 安装已发布的版本
pnpm add @xiaoya/design-system@^1.0.0
```

## 本地开发 vs 使用已发布包

### 继续本地开发（当前状态）
```json
"dependencies": {
  "@xiaoya/design-system": "link:../../packages/xy-design-system"
},
"pnpm": {
  "overrides": {
    "@xiaoya/design-system": "link:../../packages/xy-design-system"
  }
}
```
**优点：** 修改设计系统源码立即生效，适合快速迭代
**缺点：** 不适合 CI/CD（CI 环境没有本地目录）

### 使用已发布包（生产模式）
```json
"dependencies": {
  "@xiaoya/design-system": "^1.0.0"
}
```
**优点：** CI/CD 可正常安装，版本稳定可控
**缺点：** 每次修改需要重新发布

## 推荐工作流

1. **本地开发阶段：** 使用 `link:`，快速迭代
2. **提交前验证：** 切换到已发布包，确保 CI 能通过
3. **发布新版本：** 
   - 设计系统有更新 → 发布新版本
   - 业务项目更新 package.json 版本号
   - CI 自动使用新版本

## 常见问题

### Q: 发布失败：401 Unauthorized
A: 需要重新登录内网 npm：
```bash
npm login --registry=https://depend.iflytek.com/artifactory/api/npm/npm-repo/
```

### Q: 发布失败：403 Forbidden
A: 检查账号是否有发布权限，联系管理员添加权限

### Q: 本地 link 和已发布包冲突
A: 删除 `pnpm.overrides` 配置，pnpm 会优先使用 dependencies 中的版本

### Q: CI 构建失败找不到包
A: 确认 CI 环境的 npm registry 配置正确，且网络可访问内网 npm
