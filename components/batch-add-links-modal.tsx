"use client"

import type React from "react"
import { useState } from "react"
import type { Link } from "@/app/page"
import { findIconParkIcon } from "@/lib/icon-mapper"
import Modal from "./modal"

interface BatchAddLinksModalProps {
  categories: Array<{ id: string; name: string }>
  onAdd: (links: Omit<Link, "id">[]) => void
  onClose: () => void
  selectedCategory: string
}

/**
 * 解析批量 URL 文本
 * 支持多种格式：
 * - 每行一个 URL
 * - URL 后跟名称（空格或制表符分隔）
 * - Markdown 链接格式 [name](url)
 */
function parseBatchUrls(text: string): Array<{ url: string; name?: string }> {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
  const results: Array<{ url: string; name?: string }> = []

  for (const line of lines) {
    // 尝试解析 Markdown 链接格式 [name](url)
    const markdownMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (markdownMatch) {
      results.push({
        url: markdownMatch[2],
        name: markdownMatch[1],
      })
      continue
    }

    // 尝试解析 "name url" 或 "url name" 格式
    const parts = line.split(/\s+/)
    if (parts.length >= 2) {
      // 判断哪个部分是 URL（以 http:// 或 https:// 开头）
      const urlIndex = parts.findIndex((part) => part.startsWith("http://") || part.startsWith("https://"))
      if (urlIndex >= 0) {
        const url = parts[urlIndex]
        const name = urlIndex === 0 ? parts.slice(1).join(" ") : parts.slice(0, urlIndex).join(" ")
        results.push({ url, name: name || undefined })
        continue
      }
    }

    // 如果整行看起来像 URL，直接使用
    if (line.startsWith("http://") || line.startsWith("https://")) {
      results.push({ url: line })
      continue
    }

    // 跳过无法解析的行
  }

  return results
}

/**
 * 从 URL 提取网站名称
 */
function extractNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    let hostname = urlObj.hostname.replace(/^www\./, "")
    // 移除顶级域名，只保留主域名
    const parts = hostname.split(".")
    if (parts.length > 1) {
      hostname = parts[parts.length - 2]
    }
    // 首字母大写
    return hostname.charAt(0).toUpperCase() + hostname.slice(1)
  } catch {
    return "新链接"
  }
}

export default function BatchAddLinksModal({ categories, onAdd, onClose, selectedCategory }: BatchAddLinksModalProps) {
  const [text, setText] = useState("")
  const [categoryId, setCategoryId] = useState(selectedCategory)
  const [previewLinks, setPreviewLinks] = useState<Array<{ url: string; name: string }>>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleTextChange = (value: string) => {
    setText(value)
    const parsed = parseBatchUrls(value)
    const links: Array<{ url: string; name: string }> = []
    const newErrors: string[] = []

    parsed.forEach((item, index) => {
      try {
        // 验证 URL
        new URL(item.url)
        links.push({
          url: item.url,
          name: item.name || extractNameFromUrl(item.url),
        })
      } catch {
        newErrors.push(`第 ${index + 1} 行: 无效的 URL 格式`)
      }
    })

    setPreviewLinks(links)
    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (previewLinks.length === 0) {
      setErrors(["请至少添加一个有效的链接"])
      return
    }

    if (!categoryId) {
      setErrors(["请选择分类"])
      return
    }

    // 生成链接对象
    const links: Omit<Link, "id">[] = previewLinks.map((item) => ({
      name: item.name,
      url: item.url,
      categoryId,
      iconType: findIconParkIcon(item.url, item.name),
    }))

    onAdd(links)
    setText("")
    setPreviewLinks([])
    setErrors([])
    onClose()
  }

  return (
    <Modal title="批量添加链接" onClose={onClose} maxWidth="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full -mx-4 sm:-mx-6">
          <div className="px-4 sm:px-6 space-y-4 flex-1 overflow-hidden flex flex-col">
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
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-sm font-medium text-white mb-2">
                批量输入链接（每行一个，支持 URL 或 "名称 URL" 格式）
              </label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`示例：&#10;https://github.com&#10;https://stackoverflow.com Stack Overflow&#10;[Figma](https://figma.com)&#10;https://www.google.com Google 搜索`}
                className="flex-1 min-h-[200px] px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 font-mono text-sm resize-none"
              />
            </div>

            {errors.length > 0 && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-200 font-medium mb-1">错误：</p>
                <ul className="text-xs text-red-200 list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {previewLinks.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-xs text-white/70 mb-2">预览 ({previewLinks.length} 个链接)：</p>
                <div className="space-y-1">
                  {previewLinks.slice(0, 10).map((link, index) => (
                    <div key={index} className="text-xs text-white/80 truncate">
                      {link.name} - <span className="text-white/60">{link.url}</span>
                    </div>
                  ))}
                  {previewLinks.length > 10 && (
                    <div className="text-xs text-white/60">... 还有 {previewLinks.length - 10} 个链接</div>
                  )}
                </div>
              </div>
            )}
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
              disabled={previewLinks.length === 0 || !categoryId}
              className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium border border-white/30"
            >
              添加 {previewLinks.length > 0 ? `${previewLinks.length} 个` : ""}链接
            </button>
          </div>
      </form>
    </Modal>
  )
}

