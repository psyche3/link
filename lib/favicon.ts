/**
 * 获取网站 favicon 的多种方法
 * 支持多个备选服务，确保获取到高质量的图标
 */

export interface FaviconOptions {
  domain: string
  size?: number
}

/**
 * 从 URL 中提取域名
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

/**
 * 生成基于首字母的 SVG favicon
 * 当无法获取真实 favicon 时使用
 */
export function generateLetterIcon(name: string, domain: string): string {
  const letter = name.charAt(0).toUpperCase() || domain.charAt(0).toUpperCase()
  
  // 根据字母生成不同的渐变色
  const colors = [
    { start: "#667eea", end: "#764ba2" },
    { start: "#f093fb", end: "#4facfe" },
    { start: "#4facfe", end: "#00f2fe" },
    { start: "#fa709a", end: "#fee140" },
    { start: "#30cfd0", end: "#330867" },
    { start: "#a8edea", end: "#fed6e3" },
    { start: "#ff9a9e", end: "#fecfef" },
    { start: "#ffecd2", end: "#fcb69f" },
  ]
  
  const colorIndex = letter.charCodeAt(0) % colors.length
  const color = colors[colorIndex]
  
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${letter}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.end};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="url(#grad-${letter})"/>
      <text x="32" y="42" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${letter}</text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

/**
 * 获取 favicon 的多个备选 URL
 * 按优先级排序
 */
export function getFaviconUrls(domain: string, size: number = 128): string[] {
  // 移除协议前缀以确保兼容性
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "")
  
  return [
    // Icon Horse - 高质量图标服务（推荐）
    `https://icon.horse/icon/${cleanDomain}`,
    // Google Favicon API - 高分辨率，兼容性好
    `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size}`,
    // Favicon.io API - 备用
    `https://favicon.io/favicon?url=${cleanDomain}&size=${size}`,
    // DuckDuckGo favicon - 备用
    `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`,
    // 直接访问 favicon - 最后备选
    `https://${cleanDomain}/favicon.ico`,
  ]
}

/**
 * 异步获取可用的 favicon
 * 优先使用高质量服务，如果失败则降级
 */
export async function getFavicon(url: string, name?: string): Promise<string> {
  const domain = extractDomain(url)
  if (!domain) {
    return generateLetterIcon(name || "?", url)
  }

  // Icon Horse 可能需要完整 URL，尝试使用原始 URL
  // 优先使用 Icon Horse（高质量）
  const iconHorseUrl = `https://icon.horse/icon/${url}`
  
  // 如果 Icon Horse 失败，使用 Google Favicon API（更可靠）
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  
  // 返回优先使用 Icon Horse，如果失败则由浏览器 onError 降级
  return iconHorseUrl
}

/**
 * 同步版本：返回最佳猜测的 favicon URL
 * 用于立即显示，不进行网络检查
 */
export function getFaviconSync(url: string, name?: string): string {
  const domain = extractDomain(url)
  if (!domain) {
    return generateLetterIcon(name || "?", url)
  }

  // 优先使用 Icon Horse（高质量图标）
  // 如果失败，浏览器会触发 onError，然后降级到字母图标
  return `https://icon.horse/icon/${url}`
}

