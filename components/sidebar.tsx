"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreVertical } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface SidebarProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  onDeleteCategory: (id: string) => void
  onReorderCategories: (categories: Category[]) => void
  onUpdateCategories: (categories: Category[]) => void
  onShowCategoryManager: () => void
  viewMode: string
  onViewModeChange: (mode: string) => void
}

interface SortableCategoryItemProps {
  category: Category
  selectedCategory: string
  onSelect: (id: string) => void
}

function SortableCategoryItem({
  category,
  selectedCategory,
  onSelect,
}: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isSelected = selectedCategory === category.id

  return (
    <div ref={setNodeRef} style={style} className="relative mx-1 sm:mx-2">
      <button
        onClick={() => onSelect(category.id)}
        className={`group relative w-full px-3 sm:px-4 pl-4 sm:pl-5 py-2.5 sm:py-3 rounded-md text-xs sm:text-sm font-normal transition-all duration-200 flex items-center gap-2 ${
          isSelected
            ? "bg-white/20 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title={category.name}
      >
        {/* Win11 风格左侧指示条 */}
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 sm:h-6 bg-white rounded-r-full" />
        )}
        
        {/* 拖拽手柄 */}
        <span
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-3 h-3 text-white/40 hover:text-white/60 cursor-move touch-none select-none transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="拖拽排序"
        >
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="12" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="9" cy="8" r="1" />
            <circle cx="15" cy="8" r="1" />
            <circle cx="9" cy="16" r="1" />
            <circle cx="15" cy="16" r="1" />
          </svg>
        </span>
        
        {/* 分类名称 */}
        <span className="flex-1 text-left break-words">{category.name}</span>
      </button>
    </div>
  )
}

export default function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onDeleteCategory,
  onReorderCategories,
  onUpdateCategories,
  onShowCategoryManager,
}: SidebarProps) {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id)
      const newIndex = categories.findIndex((cat) => cat.id === over.id)

      const newCategories = arrayMove(categories, oldIndex, newIndex)
      onReorderCategories(newCategories)
    }
  }

  return (
    <aside className="w-28 sm:w-36 md:w-44 border-r border-white/10 glass-card-sm flex flex-col py-2 sm:py-3 gap-2 relative z-20">
      {/* "全部"按钮 - 显示所有分类 */}
      <div className="px-2 sm:px-3 mb-1">
        <button 
          onClick={() => onSelectCategory("")}
          className={`group relative w-full px-3 sm:px-4 pl-4 sm:pl-5 py-2.5 sm:py-3 rounded-md text-xs sm:text-sm font-normal transition-all duration-200 flex items-center gap-2 ${
            selectedCategory === ""
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          title="显示全部"
        >
          {selectedCategory === "" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 sm:h-6 bg-white rounded-r-full" />
          )}
          <span className="flex-1 text-left">全部</span>
        </button>
      </div>

      {/* Categories - draggable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2 sm:px-3 py-2">
          <SortableContext items={categories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
            {categories.map((category) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                selectedCategory={selectedCategory}
                onSelect={onSelectCategory}
              />
            ))}
          </SortableContext>
        </nav>
      </DndContext>

      {/* Action buttons */}
      <div className="px-2 sm:px-3 mt-auto pt-2">
        <button
          onClick={onShowCategoryManager}
          className="group relative w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center"
          title="分类管理"
        >
          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </aside>
  )
}
