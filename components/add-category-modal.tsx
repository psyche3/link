"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface AddCategoryModalProps {
  onAdd: (name: string) => void
  onClose: () => void
}

export default function AddCategoryModal({ onAdd, onClose }: AddCategoryModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("分类名称不能为空")
      return
    }

    onAdd(name)
    setName("")
    setError("")
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="glass-card-sm border-white/20 shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">添加新分类</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X size={20} className="text-white/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">分类名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：开发工具"
              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            {error && <p className="text-sm text-red-300 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium border border-white/30"
            >
              添加分类
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
