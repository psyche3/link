"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ToolsDrawerProps {
  viewMode: string
  onViewModeChange: (mode: string) => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddLink: () => void
  onToggleSettings: () => void
  showSettings: boolean
}

const tools = [
  {
    id: "settings",
    name: "设置",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
      </svg>
    ),
  },
  {
    id: "export",
    name: "导出",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    id: "import",
    name: "导入",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: "background",
    name: "背景",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    id: "json-editor",
    name: "JSON编辑",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <line x1="9" y1="9" x2="9" y2="15" />
        <line x1="15" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    id: "password-generator",
    name: "密码生成",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
  {
    id: "add-link",
    name: "添加链接",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
]

export default function ToolsDrawer({
  viewMode,
  onViewModeChange,
  onExport,
  onImport,
  onBackgroundUpload,
  onAddLink,
  onToggleSettings,
  showSettings,
}: ToolsDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case "settings":
        onToggleSettings()
        break
      case "export":
        onExport()
        break
      case "import":
        document.getElementById("import")?.click()
        break
      case "background":
        document.getElementById("background")?.click()
        break
      case "json-editor":
      case "password-generator":
        onViewModeChange(viewMode === toolId ? "links" : toolId)
        break
      case "add-link":
        onAddLink()
        break
    }
  }

  return (
    <div className="px-8 pb-4">
      {/* Toolbar with collapse button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">工具栏</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Tools grid - scrollable */}
      {isExpanded && (
        <div className="glass-card-sm p-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all hover:scale-105 flex-shrink-0 ${
                  (tool.id === "json-editor" || tool.id === "password-generator") && viewMode === tool.id
                    ? "bg-white/25 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
                title={tool.name}
              >
                {tool.icon}
                <span className="text-xs whitespace-nowrap">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden inputs */}
      <input id="import" type="file" accept=".json" onChange={onImport} className="hidden" />
      <input id="background" type="file" accept="image/*" onChange={onBackgroundUpload} className="hidden" />
    </div>
  )
}
