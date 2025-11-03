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
}

export default function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  // 获取图标类型，优先使用保存的，否则智能匹配
  // 直接计算，不使用 useState，避免 hydration 问题
  const rawIconType = link.iconType || findIconParkIcon(link.url, link.name) || "Link"
  const iconType = getValidIcon(rawIconType, "Link") as IconType

  return (
    <div className="group relative glass-card-sm p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-2 flex flex-col z-10 hover:z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 border border-white/30 flex items-center justify-center overflow-hidden shadow-sm">
          <Icon
            type={iconType}
            theme="filled"
            size={26}
            fill="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 drop-shadow-sm"
          />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <button
            onClick={() => onEdit(link)}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            title="编辑链接"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded transition-colors"
            title="删除链接"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-white mb-1 truncate">{link.name}</h3>
      {link.alias && <p className="text-xs text-white/60 mb-3 truncate">{link.alias}</p>}

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white py-2 rounded-lg transition-all text-sm font-medium border border-white/20"
      >
        <ExternalLink size={16} />
        访问
      </a>
    </div>
  )
}
