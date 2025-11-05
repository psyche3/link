const fs = require('fs')
const path = require('path')

// 创建最小的 routes-manifest.json 文件以满足 Vercel 的要求
const routesManifest = {
  version: 3,
  pages404: false,
  basePath: '',
  redirects: [],
  rewrites: [],
  headers: []
}

const outDir = path.join(process.cwd(), 'out')
const manifestPath = path.join(outDir, 'routes-manifest.json')

// 确保 out 目录存在
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// 写入 routes-manifest.json
fs.writeFileSync(manifestPath, JSON.stringify(routesManifest, null, 2))
console.log('✓ Created routes-manifest.json for Vercel static export')

