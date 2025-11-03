"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import Sidebar from "@/components/sidebar"
import LinkCard from "@/components/link-card"
import AddLinkModal from "@/components/add-link-modal"
import AddCategoryModal from "@/components/add-category-modal"
import TimeDisplay from "@/components/time-display"
import JsonEditor from "@/components/json-editor"
import PasswordGenerator from "@/components/password-generator"
import ToolsDrawer from "@/components/tools-drawer"
import { getValidIcon } from "@/lib/valid-icons"

export interface Link {
  id: string
  name: string
  url: string
  alias?: string
  categoryId: string
  favicon?: string
  iconType?: string // IconPark 图标类型
}

export interface Category {
  id: string
  name: string
}

type ViewMode = "links" | "json-editor" | "password-generator"

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [mounted, setMounted] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("links")

  useEffect(() => {
    setMounted(true)
    const savedCategories = localStorage.getItem("categories")
    const savedLinks = localStorage.getItem("links")
    const savedBackground = localStorage.getItem("backgroundImage")

    const defaultCategories: Category[] = [
      { id: "1", name: "开发工具" },
      { id: "2", name: "设计工具" },
      { id: "3", name: "通讯工具" },
    ]

    const defaultLinks: Link[] = [
      {
        id: "1",
        name: "GitHub",
        url: "https://github.com",
        categoryId: "1",
        alias: "代码仓库",
      },
      {
        id: "2",
        name: "Stack Overflow",
        url: "https://stackoverflow.com",
        categoryId: "1",
        alias: "问答社区",
      },
      {
        id: "3",
        name: "Figma",
        url: "https://figma.com",
        categoryId: "2",
        alias: "设计工具",
      },
      {
        id: "4",
        name: "Slack",
        url: "https://slack.com",
        categoryId: "3",
        alias: "团队沟通",
      },
    ]

    const parsedCategories: Category[] = savedCategories ? JSON.parse(savedCategories) : defaultCategories
    let parsedLinks: Link[] = savedLinks ? JSON.parse(savedLinks) : defaultLinks

    // 清理无效的图标类型，确保所有链接都使用有效的图标
    parsedLinks = parsedLinks.map((link) => {
      if (link.iconType) {
        const validIcon = getValidIcon(link.iconType, "Link")
        // 如果图标无效，清除它，让组件重新生成
        if (validIcon !== link.iconType) {
          return { ...link, iconType: undefined }
        }
      }
      return link
    })

    setCategories(parsedCategories)
    setLinks(parsedLinks)
    setBackgroundImage(savedBackground || "")
    if (parsedCategories.length > 0) {
      setSelectedCategory(parsedCategories[0].id)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("categories", JSON.stringify(categories))
      localStorage.setItem("links", JSON.stringify(links))
      localStorage.setItem("backgroundImage", backgroundImage)
    }
  }, [categories, links, backgroundImage, mounted])

  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    }
    setCategories([...categories, newCategory])
    setShowAddCategoryModal(false)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
    setLinks(links.filter((l) => l.categoryId !== id))
    if (selectedCategory === id && categories.length > 0) {
      setSelectedCategory(categories[0].id)
    }
  }

  const handleAddLink = (link: Omit<Link, "id">) => {
    if (editingLink) {
      setLinks(links.map((l) => (l.id === editingLink.id ? { ...link, id: editingLink.id } : l)))
      setEditingLink(null)
    } else {
      setLinks([...links, { ...link, id: Date.now().toString() }])
    }
    setShowAddLinkModal(false)
  }

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id))
  }

  const handleEditLink = (link: Link) => {
    setEditingLink(link)
    setShowAddLinkModal(true)
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setBackgroundImage(result)
    }
    reader.readAsDataURL(file)
  }

  const handleExport = () => {
    const data = {
      categories,
      links,
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "links-backup.json"
    link.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        setCategories(data.categories || [])
        setLinks(data.links || [])
      } catch {
        alert("文件格式无效")
      }
    }
    reader.readAsText(file)
  }

  const filteredLinks = links
    .filter((link) => link.categoryId === selectedCategory)
    .filter((link) => {
      const query = searchQuery.toLowerCase()
      return (
        link.name.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        (link.alias && link.alias.toLowerCase().includes(query))
      )
    })

  if (!mounted) return null

  return (
    <main className="flex h-screen overflow-hidden relative">
      <div
        className="absolute inset-0 z-0"
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
                backgroundSize: "400% 400%",
                animation: "gradient 8s ease infinite",
              }
        }
      >
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/30 dark:bg-black/40" />
      </div>

      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={() => setShowAddCategoryModal(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="px-8 pt-8 pb-4">
          <div className="mb-8">
            <TimeDisplay />
          </div>

          {viewMode === "links" && (
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                placeholder="输入链接内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 glass-card text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
            </div>
          )}
        </div>

        {viewMode === "links" && (
          <ToolsDrawer
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExport={handleExport}
            onImport={handleImport}
            onBackgroundUpload={handleBackgroundUpload}
            onAddLink={() => {
              setEditingLink(null)
              setShowAddLinkModal(true)
            }}
            onToggleSettings={() => setShowSettings(!showSettings)}
            showSettings={showSettings}
          />
        )}

        {showSettings && (
          <div className="px-8 pb-4 glass-card-sm p-4 mx-0 mb-2 flex-shrink-0">
            <h3 className="text-white font-semibold mb-3">设置</h3>
            <button
              onClick={() => setBackgroundImage("")}
              className="block w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
            >
              重置为默认背景
            </button>
          </div>
        )}

        <div className="flex-1 overflow-visible px-8 pb-8 pt-4">
          {viewMode === "links" && (
            <>
              {filteredLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4 opacity-50">🔗</div>
                  <p className="text-lg text-white/70 mb-2">未找到链接</p>
                  <p className="text-sm text-white/50">{searchQuery ? "调整搜索词试试" : "添加第一个链接来开始"}</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {filteredLinks.map((link) => (
                    <LinkCard key={link.id} link={link} onEdit={handleEditLink} onDelete={handleDeleteLink} />
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === "json-editor" && (
            <JsonEditor
              categories={categories}
              links={links}
              onUpdate={(c, l) => {
                setCategories(c)
                setLinks(l)
              }}
            />
          )}

          {viewMode === "password-generator" && <PasswordGenerator />}
        </div>
      </div>

      {showAddLinkModal && (
        <AddLinkModal
          categories={categories}
          onAdd={handleAddLink}
          onClose={() => {
            setShowAddLinkModal(false)
            setEditingLink(null)
          }}
          editingLink={editingLink}
          selectedCategory={selectedCategory}
        />
      )}

      {showAddCategoryModal && (
        <AddCategoryModal onAdd={handleAddCategory} onClose={() => setShowAddCategoryModal(false)} />
      )}

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </main>
  )
}
