"use client"

import { Edit2, Trash2, ExternalLink } from "lucide-react"
import type { Link } from "@/app/page"
import { findIconParkIcon } from "@/lib/icon-mapper"
import { getValidIcon } from "@/lib/valid-icons"
import Icon, { IconType } from "@icon-park/react/es/all"

interface LinkCardProps {
  link: Link
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
  highlight?: string
  onVisit?: (link: Link) => void
}

export default function LinkCard({ link, onEdit, onDelete, highlight, onVisit }: LinkCardProps) {
  // 获取图标类型，优先使用保存的，否则智能匹配
  // 直接计算，不使用 useState，避免 hydration 问题
  const rawIconType = link.iconType || findIconParkIcon(link.url, link.name) || "Link"
  const iconType = getValidIcon(rawIconType, "Link") as IconType

  const renderHighlight = (text: string) => {
    if (!highlight) return text
    const term = highlight.trim()
    if (!term) return text
    // 转义正则特殊字符
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(${escaped})`, "ig")
    const parts = text.split(regex)
    return (
      <>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <mark key={idx} className="bg-yellow-400/40 text-white rounded px-0.5">{part}</mark>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </>
    )
  }

  return (
    <div className="group relative glass-card-sm p-3 shadow-md hover:shadow-lg transition-colors duration-200 flex flex-col h-full z-10">
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/10 border border-white/30 flex items-center justify-center overflow-hidden shadow-sm">
          <Icon
            type={iconType}
            theme="filled"
            size={20}
            fill="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 drop-shadow-sm"
          />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={() => onEdit(link)}
            className="p-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            title="编辑链接"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded transition-colors"
            title="删除链接"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-white text-sm mb-1 truncate">{renderHighlight(link.name)}</h3>
      {link.alias && <p className="text-xs text-white/60 mb-1 truncate">{renderHighlight(link.alias)}</p>}
      {Array.isArray(link.tags) && link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {link.tags.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white/70 border border-white/15">
              {renderHighlight(t)}
            </span>
          ))}
        </div>
      )}
      {highlight && (
        <p className="text-[11px] text-white/40 mb-2 truncate">{renderHighlight(link.url)}</p>
      )}

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white py-1.5 rounded-lg transition-colors text-xs font-medium border border-white/20"
        onClick={() => onVisit?.(link)}
        aria-label={`打开链接：${link.name}`}
      >
        <ExternalLink size={14} />
        访问
      </a>
    </div>
  )
}
