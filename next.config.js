/** @type {import('next').NextConfig} */
const isPages = !!process.env.BASE_PATH

const nextConfig = {
  // 启用静态导出，便于部署到 GitHub Pages
  output: 'export',
  // 关闭 next/image 优化（静态导出不支持 Image Optimization）
  images: { unoptimized: true },
  // GitHub Pages 二级路径支持：/用户名.github.io/仓库名
  basePath: isPages ? process.env.BASE_PATH : '',
  assetPrefix: isPages ? process.env.BASE_PATH : '',
}

module.exports = nextConfig
