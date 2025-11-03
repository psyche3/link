"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Link } from "@/app/page"
import { findIconParkIcon } from "@/lib/icon-mapper"

interface AddLinkModalProps {
  categories: Array<{ id: string; name: string }>
  onAdd: (link: Omit<Link, "id">) => void
  onClose: () => void
  editingLink?: Link | null
  selectedCategory: string
}

export default function AddLinkModal({ categories, onAdd, onClose, editingLink, selectedCategory }: AddLinkModalProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [categoryId, setCategoryId] = useState(selectedCategory)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingLink) {
      setName(editingLink.name)
      setUrl(editingLink.url)
      setAlias(editingLink.alias || "")
      setCategoryId(editingLink.categoryId)
    } else {
      setName("")
      setUrl("")
      setAlias("")
      setCategoryId(selectedCategory)
    }
  }, [editingLink, selectedCategory])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "网站名称不能为空"
    if (!url.trim()) newErrors.url = "网址不能为空"
    if (!categoryId) newErrors.categoryId = "请选择分类"

    try {
      new URL(url)
    } catch {
      newErrors.url = "无效的网址格式"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // 智能匹配图标类型
    let iconType: string
    if (editingLink && editingLink.url === url && editingLink.iconType) {
      // 如果是编辑模式且 URL 未改变，保留原有图标类型
      iconType = editingLink.iconType
    } else {
      // 根据 URL 和名称智能匹配图标
      iconType = findIconParkIcon(url, name)
    }

    onAdd({
      name,
      url,
      alias,
      categoryId,
      iconType,
    })

    setName("")
    setUrl("")
    setAlias("")
    setCategoryId(selectedCategory)
    setErrors({})
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="glass-card-sm border-white/20 shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">{editingLink ? "编辑链接" : "添加新链接"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X size={20} className="text-white/50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">网站名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：GitHub"
              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            {errors.name && <p className="text-sm text-red-300 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">网址 *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            {errors.url && <p className="text-sm text-red-300 mt-1">{errors.url}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">别名 (可选)</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="例如：代码仓库"
              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">分类 *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="" className="bg-gray-900">
                选择分类
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-gray-900">
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-sm text-red-300 mt-1">{errors.categoryId}</p>}
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
              {editingLink ? "更新链接" : "添加链接"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
