"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

type ViewMode = "links" | "json-editor" | "password-generator"

interface ToolsDrawerProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onAddLink: () => void
}

const tools = [
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
  onAddLink,
}: ToolsDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
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
    <div className="px-4 sm:px-6 md:px-8 pb-3 sm:pb-4">
      {/* Toolbar with collapse button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider">工具栏</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
        >
          {isExpanded ? <ChevronUp size={14} className="sm:w-4 sm:h-4" /> : <ChevronDown size={14} className="sm:w-4 sm:h-4" />}
        </button>
      </div>

      {/* Tools grid - scrollable */}
      {isExpanded && (
        <div className="flex justify-center">
          <div className="glass-card-sm p-2 sm:p-3 rounded-lg w-fit max-w-full">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md transition-colors duration-200 flex-shrink-0 ${
                  (tool.id === "json-editor" || tool.id === "password-generator") && viewMode === tool.id
                    ? "bg-white/25 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
                title={tool.name}
              >
                  <span className="scale-90 sm:scale-100">{tool.icon}</span>
                  <span className="text-[10px] sm:text-xs whitespace-nowrap">{tool.name}</span>
              </button>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* no hidden inputs here; moved to Settings modal */}
    </div>
  )
}
