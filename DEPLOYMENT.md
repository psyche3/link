# 🚀 完整部署指南

> **快速开始**：查看 `DEPLOY_QUICK.md` 获取最简部署步骤

## 📋 部署方案对比

| 方案 | 优点 | 适合场景 |
|------|------|----------|
| **Railway 前后端分离** | 简单、免费额度充足、统一管理 | ✅ **推荐** |
| **Vercel（前端）+ Railway（后端）** | Vercel 对 Next.js 优化好 | 需要更好的前端性能 |
| **全部 Vercel** | 一个平台管理 | 小型项目 |

## 🎯 推荐方案：Railway 部署（最简单）

### 方案一：Railway 前后端分离部署（推荐）

**优点**：
- Next.js 官方推荐平台
- 免费额度充足
- 自动 HTTPS
- 全球 CDN
- 自动部署（GitHub 推送即部署）

**步骤**：

1. **准备部署文件**
   - 创建 `vercel.json` 配置（已创建）
   - 确保 `server/index.js` 已准备好

2. **部署到 Vercel**
   ```bash
   # 安装 Vercel CLI（如果没有）
   npm i -g vercel
   
   # 登录 Vercel
   vercel login
   
   # 部署
   vercel
   ```

3. **设置环境变量**
   - 在 Vercel 控制台设置环境变量：
     - `NEXT_PUBLIC_API_URL`: 你的 API 地址（如果后端单独部署）
   - AWS S3 配置（如果使用 S3）：
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION`
     - `AWS_S3_BUCKET`

### 方案二：前端 Vercel + 后端 Railway/Render

**后端部署到 Railway**：

1. 访问 [Railway.app](https://railway.app)
2. 用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库
5. 设置启动命令：`node server/index.js`
6. 设置端口：`PORT` 环境变量会自动设置
7. 添加环境变量（S3 配置）

**后端部署到 Render**：

1. 访问 [Render.com](https://render.com)
2. 用 GitHub 登录
3. 点击 "New" → "Web Service"
4. 连接 GitHub 仓库
5. 设置：
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
   - Environment: `Node`
6. 添加环境变量

### 方案三：全部部署到 Railway/Render

**Railway**：
- 可以同时运行前后端
- 或者使用两个服务（前端静态 + 后端 API）

**Render**：
- 类似 Railway，可以选择静态站点（前端）+ Web Service（后端）

## 环境变量配置

### 前端环境变量
在部署平台设置：
- `NEXT_PUBLIC_API_URL`: 后端 API 地址（例如：`https://your-backend.railway.app`）

### 后端环境变量
在部署平台设置：
- `PORT`: 端口（Railway/Render 会自动设置）
- `AWS_ACCESS_KEY_ID`: AWS Access Key（如果使用 S3）
- `AWS_SECRET_ACCESS_KEY`: AWS Secret Key（如果使用 S3）
- `AWS_REGION`: AWS 区域（例如：`us-east-1`）
- `AWS_S3_BUCKET`: S3 存储桶名称

## 部署前检查清单

- [ ] 确保 `lib/api.ts` 使用环境变量 `NEXT_PUBLIC_API_URL`
- [ ] 确保后端 CORS 配置允许前端域名
- [ ] 确保 S3 配置正确（如果使用 S3）
- [ ] 确保所有依赖都已安装
- [ ] 测试本地构建：`npm run build`

## 部署步骤（Vercel 示例）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **访问 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 用 GitHub 登录
   - 点击 "Add New Project"
   - 导入你的 GitHub 仓库

3. **配置项目**
   - Framework Preset: Next.js
   - Root Directory: `.`（根目录）
   - Build Command: `npm run build`
   - Output Directory: `out`（如果使用静态导出）

4. **设置环境变量**
   - 在项目设置中添加环境变量

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

## 注意事项

1. **后端 CORS**：确保后端允许前端域名访问
2. **API 地址**：前端需要知道后端地址，通过环境变量配置
3. **S3 配置**：如果使用 S3，确保在部署平台配置了 AWS 凭证
4. **静态导出**：当前配置是静态导出，如果需要 SSR，需要修改 `next.config.js`

## 故障排查

### 前端无法连接后端
- 检查 `NEXT_PUBLIC_API_URL` 环境变量是否正确
- 检查后端 CORS 配置
- 检查后端是否正常运行

### 数据丢失
- 确保 S3 配置正确
- 检查 AWS 凭证是否有效
- 检查 S3 存储桶权限

### 构建失败
- 检查 `package.json` 依赖是否正确
- 检查 Node.js 版本是否兼容
- 查看构建日志中的错误信息

