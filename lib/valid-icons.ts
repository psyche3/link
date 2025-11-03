/**
 * IconPark 有效图标名称列表
 * 这些是确保存在的通用图标
 */
// 只使用确定存在的 IconPark 图标
// 这些是最基础和最常用的图标，确保在 IconPark 中存在
export const VALID_ICONS: string[] = [
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
  "Github",
  "Twitter",
  "Facebook",
  "Instagram",
]

/**
 * 验证图标名称是否有效
 */
export function isValidIcon(iconName: string | undefined): boolean {
  if (!iconName) return false
  return VALID_ICONS.includes(iconName)
}

/**
 * 获取有效的图标名称，如果无效则返回默认图标
 */
export function getValidIcon(iconName: string | undefined, defaultIcon: string = "Link"): string {
  if (isValidIcon(iconName)) {
    return iconName
  }
  return defaultIcon
}

