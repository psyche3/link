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

