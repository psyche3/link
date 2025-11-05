# Vercel 构建错误修复

## 问题

Vercel 构建失败，错误信息：
```
ERR_PNPM_OUTDATED_LOCKFILE 无法使用"frozen-lockfile"进行安装，因为 pnpm-lock.yaml 与 package.json 不同步。
```

## 原因

1. **pnpm-lock.yaml 不同步**：锁定文件中包含已删除的依赖（如 `@aws-sdk/client-s3`, `axios`, `express` 等）
2. **vercel.json 配置错误**：引用了已删除的 `server/index.js` 后端文件
3. **输出目录配置错误**：静态导出应该使用 `out` 目录，而不是 `.next`

## 已完成的修复

### 1. 同步 pnpm-lock.yaml
- 删除旧的 `pnpm-lock.yaml`
- 重新运行 `pnpm install` 生成新的锁定文件
- 新锁定文件与 `package.json` 完全同步

### 2. 更新 vercel.json
**之前（错误）：**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [...]
}
```

**现在（正确）：**
```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "outputDirectory": "out",
  "framework": "nextjs",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. 清理未使用的文件
- 删除 `lib/api.ts`（代码中不再使用）

## 当前状态

✅ `pnpm-lock.yaml` 已与 `package.json` 同步  
✅ `vercel.json` 已更新为正确的静态导出配置  
✅ 未使用的文件已清理  
✅ 代码已推送到 GitHub

## 下一步

Vercel 应该能够成功构建了。如果还有问题，请检查：

1. **构建命令**：确保使用 `pnpm build`
2. **输出目录**：确保使用 `out`（静态导出）
3. **依赖版本**：确保所有依赖版本兼容

## 注意事项

由于项目使用 `output: 'export'` 进行静态导出，Vercel 将：
- 运行 `pnpm build`
- 从 `out` 目录部署静态文件
- 不支持 SSR/API Routes（这是预期的，因为这是静态站点）

如果需要 SSR 功能，需要：
1. 移除 `next.config.js` 中的 `output: 'export'`
2. 更新 `vercel.json` 使用默认的 Next.js 配置

