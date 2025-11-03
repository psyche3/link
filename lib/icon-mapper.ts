/**
 * 将网站名称/URL映射到 IconPark 图标
 * 根据网站名称或域名智能匹配最合适的图标
 */

// 常见的网站到图标的映射
// 只使用 IconPark 中确实存在的通用图标
const iconMap: Record<string, string> = {
  // 开发工具
  github: "Github",
  "stack overflow": "Code", // 问答网站使用 Code 图标
  stackoverflow: "Code",
  gitlab: "Github", // GitLab 使用 Github 图标
  bitbucket: "Code",
  vscode: "Code",
  "visual studio": "Code",
  
  // 设计工具
  figma: "Picture",
  adobe: "Picture",
  photoshop: "Picture",
  illustrator: "Picture",
  sketch: "Picture",
  
  // 社交平台
  facebook: "Facebook",
  twitter: "Twitter",
  x: "Twitter",
  instagram: "Picture",
  linkedin: "Link",
  youtube: "Video",
  tiktok: "Video",
  discord: "Message",
  
  // 通讯工具
  slack: "Message",
  telegram: "Message",
  wechat: "Message",
  whatsapp: "Message",
  
  // 云服务
  aws: "Cloud",
  google: "Search",
  microsoft: "Setting",
  apple: "Home",
  docker: "Code",
  kubernetes: "Setting",
  
  // 购物
  amazon: "Shopping",
  alibaba: "Shopping",
  taobao: "Shopping",
  
  // 视频
  netflix: "Video",
  bilibili: "Video",
  
  // 其他常见服务
  gmail: "Email",
  outlook: "Email",
  dropbox: "Folder",
  drive: "Folder",
  notion: "FileText",
  trello: "Folder",
  jira: "Setting",
}

/**
 * 从 URL 中提取关键词
 */
function extractKeywords(url: string, name: string): string[] {
  const keywords: string[] = []
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    const domain = hostname.replace(/^www\./, "")
    const parts = domain.split(".")
    
    // 添加主域名（不含顶级域名）
    if (parts.length > 1) {
      keywords.push(parts[0])
      keywords.push(domain.replace(/\.(com|cn|net|org|io|co|dev)$/, ""))
    }
    
    keywords.push(domain)
    keywords.push(hostname)
  } catch {
    // 如果 URL 解析失败，使用原始字符串
    keywords.push(url.toLowerCase())
  }
  
  // 添加名称关键词
  keywords.push(name.toLowerCase())
  
  return keywords
}

/**
 * 根据 URL 和名称查找最匹配的图标
 */
export function findIconParkIcon(url: string, name: string): string {
  const keywords = extractKeywords(url, name)
  
  // 按优先级匹配
  for (const keyword of keywords) {
    // 直接匹配
    if (iconMap[keyword]) {
      return iconMap[keyword]
    }
    
    // 部分匹配
    for (const [key, icon] of Object.entries(iconMap)) {
      if (keyword.includes(key) || key.includes(keyword)) {
        return icon
      }
    }
  }
  
  // 根据关键词智能推断
  const lowerName = name.toLowerCase()
  const lowerUrl = url.toLowerCase()
  
  // 代码/开发相关
  if (keywords.some(k => k.includes("code") || k.includes("dev") || k.includes("git"))) {
    return "Code"
  }
  
  // 设计相关
  if (keywords.some(k => k.includes("design") || k.includes("ui") || k.includes("figma"))) {
    return "Picture"
  }
  
  // 文档/笔记相关
  if (keywords.some(k => k.includes("doc") || k.includes("note") || k.includes("wiki"))) {
    return "FileText"
  }
  
  // 视频相关
  if (keywords.some(k => k.includes("video") || k.includes("youtube") || k.includes("bilibili"))) {
    return "Video"
  }
  
  // 社交相关
  if (keywords.some(k => k.includes("social") || k.includes("chat") || k.includes("message"))) {
    return "Message"
  }
  
  // 购物相关
  if (keywords.some(k => k.includes("shop") || k.includes("buy") || k.includes("mall"))) {
    return "Shopping"
  }
  
  // 音乐相关
  if (keywords.some(k => k.includes("music") || k.includes("audio") || k.includes("sound"))) {
    return "Music"
  }
  
  // 默认返回链接图标（确保是有效图标）
  return "Link"
}

// 导入有效图标验证（避免循环依赖，使用内联列表）
const SAFE_ICONS = ["Home", "Link", "Code", "FileText", "Folder", "Video", "Music", "Picture", "Message", "Email", "Shopping", "Calendar", "Setting", "Search", "Star", "Github", "Twitter", "Facebook", "Instagram"]

/**
 * 安全的图标查找函数，确保返回的图标在有效列表中
 */
export function findIconParkIconSafe(url: string, name: string): string {
  const icon = findIconParkIcon(url, name)
  // 如果返回的图标不在安全列表中，使用默认图标
  if (!SAFE_ICONS.includes(icon)) {
    return "Link"
  }
  return icon
}

/**
 * 获取常用图标列表（用于选择器）
 */
export function getCommonIcons(): string[] {
  return [
    "Home",
    "Link",
    "Code",
    "FileText",
    "Folder",
    "Video",
    "Music",
    "Picture",
    "Message",
    "Email",
    "Shopping",
    "Calendar",
    "Setting",
    "Search",
    "Star",
    "Heart",
    "Like",
    "Share",
    "Download",
    "Upload",
    "Cloud",
    "Lock",
    "Unlock",
    "User",
    "Team",
    "Phone",
    "Location",
    "Map",
    "Fire",
    "Trend",
    "Chart",
  ]
}

