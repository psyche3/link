# 快速部署步骤

## Railway 部署（推荐）

### 1. 部署后端

1. 访问 https://railway.app，用 GitHub 登录
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的仓库
4. 设置环境变量：
   - `NODE_ENV=production`
   - （可选）S3 配置：`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
5. 复制后端 URL（例如：`https://xxx.up.railway.app`）

### 2. 部署前端

1. 在 Railway 中新建项目，选择同一个仓库
2. 设置环境变量：
   - `NEXT_PUBLIC_API_URL=https://你的后端URL`
   - `NODE_ENV=production`
3. 设置构建命令：`npm install && npm run build`
4. 设置启动命令：`npm start`
5. 复制前端 URL

### 3. 更新后端 CORS

在后端项目的环境变量中添加：
```
ALLOWED_ORIGINS=https://你的前端URL
```

完成！现在你可以通过前端 URL 访问应用了。

## 使用 S3 存储（推荐）

如果想确保数据持久化，建议配置 AWS S3：

1. 在 AWS 控制台创建 S3 存储桶
2. 创建 IAM 用户并获取 Access Key
3. 在后端环境变量中配置 S3 相关变量
4. 重启后端服务

详细步骤见 `AWS_CREDENTIALS_GUIDE.md`


