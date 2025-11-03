"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Copy, Download, Upload, Wand2 } from "lucide-react"
import type { Link, Category } from "@/app/page"

interface JsonEditorProps {
  categories: Category[]
  links: Link[]
  onUpdate: (categories: Category[], links: Link[]) => void
}

export default function JsonEditor({ categories, links, onUpdate }: JsonEditorProps) {
  const [jsonContent, setJsonContent] = useState(JSON.stringify({ categories, links }, null, 2))
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleFormat}
          className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors"
          title="格式化JSON"
        >
          <Wand2 size={16} />
          格式化
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors"
        >
          <Copy size={16} />
          {copied ? "已复制" : "复制"}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors"
        >
          <Download size={16} />
          下载
        </button>
        <label
          htmlFor="json-import"
          className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Upload size={16} />
          导入
        </label>
        <input id="json-import" type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 rounded-lg transition-colors ml-auto font-medium"
        >
          保存更改
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>
      )}

      <textarea
        ref={textareaRef}
        value={jsonContent}
        onChange={(e) => {
          setJsonContent(e.target.value)
          setError("")
        }}
        className="flex-1 p-4 font-mono text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
        placeholder="编辑 JSON 数据..."
      />
    </div>
  )
}
