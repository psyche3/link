# 快速部署指南

## 🚀 推荐方案：前端 Vercel + 后端 Railway

### 第一步：部署后端到 Railway

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置服务**
   - Railway 会自动检测到 `server/index.js`
   - 如果没检测到，手动设置：
     - Start Command: `node server/index.js`
     - Root Directory: `.`（根目录）

4. **设置环境变量**
   在 Railway 项目设置中添加：
   ```
   AWS_ACCESS_KEY_ID=你的AWS密钥
   AWS_SECRET_ACCESS_KEY=你的AWS密钥
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=你的S3存储桶名称
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
   ⚠️ **注意**：如果不使用 S3，可以留空，会使用本地文件存储（但 Railway 重启会丢失数据）

5. **获取后端地址**
   - 部署成功后，Railway 会提供一个 URL，例如：`https://your-app.railway.app`
   - 复制这个地址，后面配置前端需要用到

### 第二步：部署前端到 Vercel

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: **Next.js**
   - Root Directory: `.`（根目录）
   - Build Command: `npm run build`
   - Output Directory: `.next`（如果使用静态导出，改为 `out`）

4. **设置环境变量**
   在 "Environment Variables" 中添加：
   ```
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```
   ⚠️ **重要**：把 `https://your-app.railway.app` 替换为你的 Railway 后端地址

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（通常 2-3 分钟）

### 第三步：更新后端 CORS（如果需要）

如果前端部署后无法访问后端，更新 Railway 环境变量：
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```
把 `https://your-frontend.vercel.app` 替换为你的 Vercel 前端地址

### ✅ 完成！

部署完成后：
- 前端地址：`https://your-project.vercel.app`
- 后端地址：`https://your-app.railway.app`

---

## 📝 其他部署方案

### 方案二：全部部署到 Vercel（Serverless）

如果使用 Vercel Serverless Functions，需要修改代码结构。目前推荐使用方案一（Railway + Vercel）。

### 方案三：全部部署到 Railway

Railway 也可以部署前端（静态站点），但 Vercel 对 Next.js 的支持更好。

---

## 🔧 故障排查

### 前端无法连接后端
1. 检查 `NEXT_PUBLIC_API_URL` 是否正确设置
2. 检查后端 CORS 配置
3. 检查后端是否正常运行（访问 `https://your-backend.railway.app/api/health`）

### 数据丢失
1. 确保配置了 AWS S3
2. 检查 AWS 凭证是否正确
3. 检查 S3 存储桶权限

### 构建失败
1. 检查依赖是否正确安装
2. 查看构建日志中的错误信息
3. 确保 Node.js 版本兼容（建议 18+）

---

## 💡 提示

- **免费额度**：Railway 和 Vercel 都有免费额度，足够个人项目使用
- **自动部署**：推送代码到 GitHub 会自动触发部署
- **自定义域名**：两个平台都支持绑定自定义域名

