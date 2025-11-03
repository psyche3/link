"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import type { Link } from "@/app/page"
import { findIconParkIcon } from "@/lib/icon-mapper"
import Modal from "./modal"

interface BatchAddModalProps {
  categories: Array<{ id: string; name: string }>
  onAdd: (links: Omit<Link, "id">[]) => void
  onClose: () => void
  selectedCategory: string
}

interface LinkInput {
  name: string
  url: string
  alias?: string
}

export default function BatchAddModal({ categories, onAdd, onClose, selectedCategory }: BatchAddModalProps) {
  const [categoryId, setCategoryId] = useState(selectedCategory)
  const [linkInputs, setLinkInputs] = useState<LinkInput[]>([{ name: "", url: "" }])
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({})

  const addLinkRow = () => {
    setLinkInputs([...linkInputs, { name: "", url: "" }])
  }

  const removeLinkRow = (index: number) => {
    const newInputs = linkInputs.filter((_, i) => index !== i)
    setLinkInputs(newInputs)
    const newErrors = { ...errors }
    delete newErrors[index]
    setErrors(newErrors)
  }

  const updateLinkRow = (index: number, field: keyof LinkInput, value: string) => {
    const newInputs = [...linkInputs]
    newInputs[index] = { ...newInputs[index], [field]: value }
    setLinkInputs(newInputs)

    // 清除该行的错误
    if (errors[index]) {
      const newErrors = { ...errors }
      delete newErrors[index][field]
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index]
      }
      setErrors(newErrors)
    }
  }

  const validateRow = (index: number, link: LinkInput): Record<string, string> => {
    const rowErrors: Record<string, string> = {}
    if (!link.name.trim()) rowErrors.name = "网站名称不能为空"
    if (!link.url.trim()) {
      rowErrors.url = "网址不能为空"
    } else {
      try {
        new URL(link.url)
      } catch {
        rowErrors.url = "无效的网址格式"
      }
    }
    return rowErrors
  }

  const validateForm = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {}
    let isValid = true

    linkInputs.forEach((link, index) => {
      const rowErrors = validateRow(index, link)
      if (Object.keys(rowErrors).length > 0) {
        newErrors[index] = rowErrors
        isValid = false
      }
    })

    if (!categoryId) {
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // 过滤掉空行
    const validLinks = linkInputs.filter((link) => link.name.trim() && link.url.trim())

    // 转换为 Link 格式
    const newLinks: Omit<Link, "id">[] = validLinks.map((link) => ({
      name: link.name.trim(),
      url: link.url.trim(),
      alias: link.alias?.trim() || undefined,
      categoryId,
      iconType: findIconParkIcon(link.url.trim(), link.name.trim()),
    }))

    onAdd(newLinks)
    onClose()
  }

  const handlePasteUrls = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text")
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length > 0) {
      const newInputs: LinkInput[] = lines.map((line) => {
        // 尝试解析格式：名称|URL 或 URL
        const parts = line.split("|").map((p) => p.trim())
        if (parts.length === 2) {
          return { name: parts[0], url: parts[1] }
        } else {
          // 如果只有 URL，尝试从 URL 提取名称
          try {
            const url = new URL(parts[0])
            const name = url.hostname.replace(/^www\./, "").split(".")[0]
            return { name: name.charAt(0).toUpperCase() + name.slice(1), url: parts[0] }
          } catch {
            return { name: "", url: parts[0] }
          }
        }
      })

      setLinkInputs([...linkInputs.filter((l) => l.name || l.url), ...newInputs])
    }
  }

  return (
    <Modal title="批量添加链接" onClose={onClose} maxWidth="lg">
      <form onSubmit={handleSubmit} className="flex flex-col h-full -mx-4 sm:-mx-6">
          <div className="px-4 sm:px-6 overflow-y-auto flex-1 space-y-4">
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
              {!categoryId && <p className="text-sm text-red-300 mt-1">请选择分类</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">批量粘贴 (每行一个URL，或使用"名称|URL"格式)</label>
              <textarea
                onPaste={handlePasteUrls}
                placeholder="每行一个URL，例如：&#10;GitHub|https://github.com&#10;https://stackoverflow.com&#10;Figma|https://figma.com"
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-24 resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">链接列表</label>
                <button
                  type="button"
                  onClick={addLinkRow}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={16} />
                  添加一行
                </button>
              </div>

              {linkInputs.map((link, index) => (
                <div key={index} className="glass-card-sm p-4 border border-white/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <div>
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateLinkRow(index, "name", e.target.value)}
                          placeholder="网站名称"
                          className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                        />
                        {errors[index]?.name && <p className="text-xs text-red-300 mt-1">{errors[index].name}</p>}
                      </div>
                      <div>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLinkRow(index, "url", e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                        />
                        {errors[index]?.url && <p className="text-xs text-red-300 mt-1">{errors[index].url}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={link.alias || ""}
                          onChange={(e) => updateLinkRow(index, "alias", e.target.value)}
                          placeholder="别名 (可选)"
                          className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                        />
                      </div>
                    </div>
                    {linkInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkRow(index)}
                        className="p-2 hover:bg-red-500/20 text-red-200 rounded transition-colors flex-shrink-0"
                        title="删除此行"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/20 flex-shrink-0 mt-4 px-4 sm:px-6">
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
              批量添加 ({linkInputs.filter((l) => l.name && l.url).length} 个链接)
            </button>
          </div>
      </form>
    </Modal>
  )
}

