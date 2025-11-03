"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Copy, Download, Upload, Wand2, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import type { Link, Category } from "@/app/page"

interface JsonEditorProps {
  categories: Category[]
  links: Link[]
  onUpdate: (categories: Category[], links: Link[]) => void
  onBack?: () => void
}

export default function JsonEditor({ categories, links, onUpdate, onBack }: JsonEditorProps) {
  const [jsonContent, setJsonContent] = useState(JSON.stringify({ categories, links }, null, 2))
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 当 categories 或 links 变化时更新 JSON 内容
  useEffect(() => {
    setJsonContent(JSON.stringify({ categories, links }, null, 2))
  }, [categories, links])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonContent)
      if (!parsed.categories || !parsed.links) {
        setError("JSON 必须包含 categories 和 links 字段")
        return
      }
      onUpdate(parsed.categories, parsed.links)
      setError("")
      alert("数据已成功保存")
    } catch {
      setError("JSON 格式无效")
    }
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonContent)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonContent(formatted)
      setError("")
    } catch {
      setError("JSON 格式无效，无法格式化")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    a.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        JSON.parse(content)
        setJsonContent(content)
        setError("")
      } catch {
        setError("文件格式无效")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 头部：返回按钮和展开/折叠 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors"
              title="返回"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">返回</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors"
            title={isExpanded ? "折叠" : "展开"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="hidden sm:inline">{isExpanded ? "折叠" : "展开"}</span>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleFormat}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors text-sm"
            title="格式化JSON"
          >
            <Wand2 size={16} />
            <span className="hidden sm:inline">格式化</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors text-sm"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">{copied ? "已复制" : "复制"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">下载</span>
          </button>
          <label
            htmlFor="json-import"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer text-sm"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">导入</span>
          </label>
          <input id="json-import" type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 rounded-lg transition-colors font-medium text-sm"
          >
            <span className="hidden sm:inline">保存</span>
            <span className="sm:hidden">✓</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>
      )}

      {isExpanded && (
        <textarea
          ref={textareaRef}
          value={jsonContent}
          onChange={(e) => {
            setJsonContent(e.target.value)
            setError("")
          }}
          className="flex-1 p-4 font-mono text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none min-h-[200px]"
          placeholder="编辑 JSON 数据..."
        />
      )}

      {!isExpanded && (
        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 text-sm">
          已折叠。点击"展开"按钮查看和编辑 JSON 数据。
        </div>
      )}
    </div>
  )
}
