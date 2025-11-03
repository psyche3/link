"use client"

import { useState } from "react"

interface Category {
  id: string
  name: string
}

interface SidebarProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  onDeleteCategory: (id: string) => void
  onAddCategory: () => void
  viewMode: string
  onViewModeChange: (mode: string) => void
}

export default function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onDeleteCategory,
  onAddCategory,
}: SidebarProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <aside className="w-24 border-r border-white/10 glass-card-sm flex flex-col py-6 gap-4 relative z-20">
      {/* Home button */}
      <div className="px-4 text-center">
        <button className="icon-btn text-white hover:bg-white/20 w-full" title="首页">
          <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>

      {/* Categories - text labels */}
      <nav className="flex-1 flex flex-col gap-2 px-2 overflow-y-auto">
        {categories.map((category) => (
          <div
            key={category.id}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
            className="relative group"
          >
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${
                selectedCategory === category.id
                  ? "bg-white/25 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              }`}
              title={category.name}
            >
              {category.name}
            </button>

            {/* Delete button on hover */}
            {hoveredCategory === category.id && (
              <button
                onClick={() => onDeleteCategory(category.id)}
                className="absolute -top-2 -right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600 z-50 flex items-center justify-center"
                title="删除分类"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Add category button */}
      <button
        onClick={onAddCategory}
        className="icon-btn text-white bg-white/10 hover:bg-white/20 mx-2 flex items-center justify-center"
        title="添加分类"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </aside>
  )
}
