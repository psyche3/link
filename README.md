# 部署指南

## Vercel（推荐）
1. 将本项目推送到 GitHub 仓库。
2. 登录 Vercel，Import 该仓库。
3. Framework 选择 Next.js，保持默认构建（Build: `next build`）。
4. 点击 Deploy，之后每次推送到 `main` 自动更新。

## GitHub Pages（静态导出）
本仓库已配置：
- `next.config.js` 启用 `output: 'export'` 并支持二级路径。
- GitHub Actions 工作流 `.github/workflows/gh-pages.yml` 自动构建 `out/` 并发布到 Pages。

步骤：
1. 在 GitHub 仓库 Settings → Pages，将 Source 设为 “GitHub Actions”。
2. 推送到 `main` 分支后，Actions 自动构建并发布。
3. 访问地址为 `https://<你的用户名>.github.io/<仓库名>/`。

本地静态导出：
```bash
pnpm install
pnpm export
# 生成的静态站点在 out/
```

注意：使用 GitHub Pages 时不支持 SSR/Next Image 优化，本项目已关闭 image 优化并适配前端渲染。


## 本地后端（可选）
本地开发时，如果你希望把数据存到一个简单的本地后端（而不是浏览器本地），本项目提供了一个基于 Express 的轻量 API，使用 JSON 文件持久化：

运行：
```bash
pnpm install
pnpm server
# 启动后接口地址：http://localhost:4000
```

可用接口（示例）：
- GET `http://localhost:4000/api/health` 健康检查
- GET `http://localhost:4000/api/state` 获取全部数据 `{ categories, links }`
- PUT `http://localhost:4000/api/state` 覆盖全部数据
- GET `http://localhost:4000/api/categories` 列出分类
- POST `http://localhost:4000/api/categories` 新增分类 `{ name }`
- PUT `http://localhost:4000/api/categories/:id` 更新分类 `{ name? }`
- DELETE `http://localhost:4000/api/categories/:id` 删除分类（会同时删除该分类下链接）
- GET `http://localhost:4000/api/links?categoryId=<可选>` 列出链接
- POST `http://localhost:4000/api/links` 新增链接 `{ name, url, categoryId, iconType? }`
- PUT `http://localhost:4000/api/links/:id` 更新链接
- DELETE `http://localhost:4000/api/links/:id` 删除链接

数据文件：`data/db.json`。

### 配置 AWS S3 存储（可选）

如果你想将数据存储到 AWS S3 而不是本地文件：

1. **获取 AWS 凭证**（详见 `AWS_CREDENTIALS_GUIDE.md`）：
   - 在 AWS IAM 控制台创建访问密钥
   - 或使用环境变量：`AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`

2. **配置 S3**：
   ```bash
   # 复制配置文件
   copy server\s3-config.example.js server\s3-config.js
   ```
   
   编辑 `server/s3-config.js`，填入你的凭证：
   ```javascript
   module.exports = {
     enabled: true,  // 启用 S3
     bucket: 'ceshi19484781',  // 你的 S3 存储桶名称
     region: 'ap-east-1',  // 区域：亚太地区(香港)
     key: 'db.json',  // S3 中的文件名
     credentials: {
       accessKeyId: '你的访问密钥ID',
       secretAccessKey: '你的私有访问密钥',
     },
   };
   ```

3. **启动服务器**：
   ```bash
   pnpm server
   ```

   如果看到 `S3 存储已启用: ceshi19484781/db.json`，说明配置成功。

**提示**：
- 如果未配置 S3 或 `enabled: false`，将使用本地文件存储（`data/db.json`）
- 数据会同时备份到本地和 S3（如果启用）
- 如果 S3 写入失败，数据仍会保存到本地

提示：GitHub Pages 为纯静态托管，线上不提供 Node 运行环境；该后端仅用于本地或你自有服务器环境。

