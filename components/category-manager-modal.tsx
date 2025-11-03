"use client"

import type React from "react"
import { useState } from "react"
import { Edit2, Trash2, Plus } from "lucide-react"
import Modal from "./modal"

interface Category {
  id: string
  name: string
}

interface CategoryManagerModalProps {
  categories: Category[]
  onUpdate: (categories: Category[]) => void
  onClose: () => void
}

export default function CategoryManagerModal({ categories, onUpdate, onClose }: CategoryManagerModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [showAddForm, setShowAddForm] = useState(true) // 默认显示添加表单
  const [newCategoryName, setNewCategoryName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setErrors({})
  }

  const handleSaveEdit = (id: string) => {
    const trimmedName = editName.trim()
    if (!trimmedName) {
      setErrors({ [id]: "分类名称不能为空" })
      return
    }

    if (categories.some((cat) => cat.id !== id && cat.name === trimmedName)) {
      setErrors({ [id]: "分类名称已存在" })
      return
    }

    const updated = categories.map((cat) => (cat.id === id ? { ...cat, name: trimmedName } : cat))
    onUpdate(updated)
    setEditingId(null)
    setEditName("")
    setErrors({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setErrors({})
  }

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除这个分类吗？删除后该分类下的所有链接也会被删除。")) {
      const updated = categories.filter((cat) => cat.id !== id)
      onUpdate(updated)
    }
  }

  const handleAdd = () => {
    const trimmedName = newCategoryName.trim()
    if (!trimmedName) {
      setErrors({ new: "分类名称不能为空" })
      return
    }

    if (categories.some((cat) => cat.name === trimmedName)) {
      setErrors({ new: "分类名称已存在" })
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: trimmedName,
    }

    onUpdate([...categories, newCategory])
    setNewCategoryName("")
    setShowAddForm(false)
    setErrors({})
  }

  return (
    <Modal title="分类管理" onClose={onClose} maxWidth="2xl">
      <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="glass-card-sm p-4 sm:p-5 rounded-lg border border-white/10 space-y-3"
            >
              {editingId === category.id ? (
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value)
                        setErrors({})
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(category.id)
                        } else if (e.key === "Escape") {
                          handleCancelEdit()
                        }
                      }}
                      className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-base"
                      autoFocus
                    />
                    {errors[category.id] && <p className="text-sm text-red-300 mt-2">{errors[category.id]}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEdit(category.id)}
                      className="flex-1 px-4 py-3 bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 rounded-lg transition-colors text-base font-medium"
                    >
                      保存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-base font-medium"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="flex-1 text-white text-base sm:text-lg truncate font-medium">{category.name}</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors flex items-center justify-center"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddForm ? (
            <div className="glass-card-sm p-4 sm:p-5 rounded-lg border border-white/10 space-y-3">
              <div>
                <label className="block text-sm font-medium text-white mb-2">分类名称</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value)
                    setErrors({})
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAdd()
                    } else if (e.key === "Escape") {
                      setShowAddForm(false)
                      setNewCategoryName("")
                      setErrors({})
                    }
                  }}
                  placeholder="输入分类名称"
                  className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-base"
                  autoFocus
                />
                {errors.new && <p className="text-sm text-red-300 mt-2">{errors.new}</p>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-3 bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 rounded-lg transition-colors text-base font-medium"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewCategoryName("")
                    setErrors({})
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-base font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 sm:p-5 glass-card-sm rounded-lg border border-white/10 border-dashed flex items-center justify-center gap-2 text-white/70 hover:text-white hover:border-white/30 transition-colors bg-white/5"
            >
              <Plus size={20} />
              <span className="text-base sm:text-lg">添加新分类</span>
            </button>
          )}
      </div>
    </Modal>
  )
}

