"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import Pinyin from "tiny-pinyin"
import { Search } from "lucide-react"
import Sidebar from "@/components/sidebar"
import LinkCard from "@/components/link-card"
import AddLinkModal from "@/components/add-link-modal"
import CategoryManagerModal from "@/components/category-manager-modal"
import TimeDisplay from "@/components/time-display"
import JsonEditor from "@/components/json-editor"
import PasswordGenerator from "@/components/password-generator"
import BatchAddModal from "@/components/batch-add-modal"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
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
  const [showBatchAddLinksModal, setShowBatchAddLinksModal] = useState(false)
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [mounted, setMounted] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string>("")
  const [backgroundColor, setBackgroundColor] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)
  const importInputId = "import-file-input"
  const backgroundInputId = "background-file-input"
  const [viewMode, setViewMode] = useState<ViewMode>("links")
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  // 搜索字段开关与键盘选择
  const [includeName, setIncludeName] = useState(true)
  const [includeAlias, setIncludeAlias] = useState(true)
  const [includeUrl, setIncludeUrl] = useState(true)
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1)

  useEffect(() => {
    setMounted(true)
    const savedCategories = localStorage.getItem("categories")
    const savedLinks = localStorage.getItem("links")
    const savedBackground = localStorage.getItem("backgroundImage")
    const savedBgColor = localStorage.getItem("backgroundColor") || ""

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
    setBackgroundColor(savedBgColor)
    if (parsedCategories.length > 0) {
      setSelectedCategory(parsedCategories[0].id)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("categories", JSON.stringify(categories))
      localStorage.setItem("links", JSON.stringify(links))
      localStorage.setItem("backgroundImage", backgroundImage)
      localStorage.setItem("backgroundColor", backgroundColor)
    }
  }, [categories, links, backgroundImage, backgroundColor, mounted])


  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
    setLinks(links.filter((l) => l.categoryId !== id))
    if (selectedCategory === id && categories.length > 0) {
      setSelectedCategory(categories[0].id)
    }
  }

  const handleReorderCategories = (newCategories: Category[]) => {
    setCategories(newCategories)
  }

  const handleUpdateCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories)
    // 如果删除的分类包含链接，同时删除这些链接
    const remainingCategoryIds = new Set(updatedCategories.map((cat) => cat.id))
    setLinks(links.filter((link) => remainingCategoryIds.has(link.categoryId)))
    // 如果当前选中的分类被删除，选择第一个分类
    if (!remainingCategoryIds.has(selectedCategory) && updatedCategories.length > 0) {
      setSelectedCategory(updatedCategories[0].id)
    }
  }

  const handleBatchAddLinks = (newLinks: Omit<Link, "id">[]) => {
    const linksWithIds = newLinks.map((link, index) => ({
      ...link,
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    }))
    setLinks([...links, ...linksWithIds])
    setShowBatchAddLinksModal(false)
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
        const importedCategories = Array.isArray(data?.categories) ? data.categories : []
        const importedLinks = Array.isArray(data?.links) ? data.links : []

        const validCategories: Category[] = importedCategories
          .filter((c: any) => c && typeof c.id === "string" && typeof c.name === "string")
          .map((c: any) => ({ id: c.id, name: c.name }))

        const isValidUrl = (u: string) => {
          try {
            const parsed = new URL(u)
            return parsed.protocol === "http:" || parsed.protocol === "https:"
          } catch {
            return false
          }
        }
        const validLinks: Link[] = importedLinks
          .filter(
            (l: any) =>
              l && typeof l.name === "string" && typeof l.url === "string" && typeof l.categoryId === "string" && isValidUrl(l.url)
          )
          .map((l: any, idx: number) => ({
            id: typeof l.id === "string" ? l.id : `${Date.now()}-${idx}`,
            name: l.name,
            url: l.url,
            alias: typeof l.alias === "string" ? l.alias : undefined,
            categoryId: l.categoryId,
            iconType: typeof l.iconType === "string" ? l.iconType : undefined,
          }))

        if (validCategories.length === 0 && validLinks.length === 0) {
          alert("导入内容为空或格式无效")
          return
        }

        setCategories(validCategories)
        setLinks(validLinks)
      } catch {
        alert("文件格式无效")
      }
    }
    reader.readAsText(file)
  }

  // 右侧展示全部分类分区；按搜索词与字段选择过滤每个分区内的链接
  const filteredLinksByCategory = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const queryPinyin = Pinyin.isSupported() ? Pinyin.convertToPinyin(searchQuery, "", true).toLowerCase() : ""
    const matchText = (text?: string) => {
      if (!text) return false
      const lower = text.toLowerCase()
      if (lower.includes(query)) return true
      if (query && Pinyin.isSupported()) {
        const py = Pinyin.convertToPinyin(text, "", true).toLowerCase()
        if (py.includes(queryPinyin)) return true
      }
      return false
    }
    const byCategory: Record<string, Link[]> = {}
    for (const category of categories) {
      byCategory[category.id] = []
    }
    for (const link of links) {
      const matchName = includeName && matchText(link.name)
      const matchAlias = includeAlias && matchText(link.alias)
      const matchUrl = includeUrl && matchText(link.url)
      const match = matchName || matchAlias || matchUrl
      if (match) {
        if (!byCategory[link.categoryId]) byCategory[link.categoryId] = []
        byCategory[link.categoryId].push(link)
      }
    }
    return byCategory
  }, [categories, links, searchQuery, includeName, includeAlias, includeUrl])

  // 扁平化匹配结果用于键盘导航（按分类顺序）
  const flatMatchedLinks = useMemo(() => {
    const result: { link: Link; categoryIndex: number }[] = []
    const categoryIndexMap = new Map<string, number>()
    categories.forEach((c, i) => categoryIndexMap.set(c.id, i))
    for (const cat of categories) {
      const arr = filteredLinksByCategory[cat.id] || []
      for (const l of arr) {
        result.push({ link: l, categoryIndex: categoryIndexMap.get(cat.id) || 0 })
      }
    }
    return result
  }, [categories, filteredLinksByCategory])

  // 分区滚动与同步
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const isScrollingProgrammatically = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToCategory = (categoryId: string) => {
    const container = scrollContainerRef.current
    if (!container) return
    if (categoryId === "") {
      isScrollingProgrammatically.current = true
      container.scrollTo({ top: 0, behavior: "smooth" })
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingProgrammatically.current = false
      }, 400)
      return
    }
    const el = sectionRefs.current[categoryId]
    if (!el) return
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const currentScrollTop = container.scrollTop
    const offset = elRect.top - containerRect.top
    const targetTop = currentScrollTop + offset - containerRect.height / 2 + elRect.height / 2
    isScrollingProgrammatically.current = true
    container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" })
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingProgrammatically.current = false
    }, 500)
  }

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id)
    scrollToCategory(id)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    let ticking = false
    const onScroll = () => {
      if (isScrollingProgrammatically.current) return
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const containerRect = container.getBoundingClientRect()
        const containerCenterY = containerRect.top + containerRect.height / 2
        let closestId = ""
        let closestDistance = Infinity
        for (const category of categories) {
          const el = sectionRefs.current[category.id]
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const sectionCenter = rect.top + rect.height / 2
          const distance = Math.abs(sectionCenter - containerCenterY)
          if (distance < closestDistance) {
            closestDistance = distance
            closestId = category.id
          }
        }
        if (closestId && closestId !== selectedCategory) {
          setSelectedCategory(closestId)
        } else if (!closestId && selectedCategory !== "") {
          setSelectedCategory("")
        }
      })
    }
    container.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      container.removeEventListener("scroll", onScroll)
    }
  }, [categories, selectedCategory])

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 在输入框/文本域/选择框/可编辑区域内不触发全局快捷键，且输入法组合中不触发
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        const isFormField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
        if (isFormField || target.isContentEditable || (e as any).isComposing) {
          return
        }
      }
      // 聚焦搜索：'/' 或 Ctrl/Cmd+K
      if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }
      // 打开设置：s
      if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "s") {
        setShowSettings(true)
        return
      }
      // 添加链接：a
      if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "a") {
        setEditingLink(null)
        setShowAddLinkModal(true)
        return
      }
      // 章节导航：j/k 在分类间跳转
      if (!e.ctrlKey && !e.metaKey && (e.key.toLowerCase() === "j" || e.key.toLowerCase() === "k")) {
        if (categories.length === 0) return
        const idx = categories.findIndex((c) => c.id === selectedCategory)
        if (idx === -1) return
        const delta = e.key.toLowerCase() === "j" ? 1 : -1
        const nextIdx = Math.min(categories.length - 1, Math.max(0, idx + delta))
        const nextId = categories[nextIdx].id
        handleSelectCategory(nextId)
        return
      }
      // 关闭设置/对话框：Esc
      if (e.key === "Escape") {
        setShowSettings(false)
        setShowAddLinkModal(false)
        setShowBatchAddLinksModal(false)
        setShowCategoryManagerModal(false)
        return
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [categories, selectedCategory])

  if (!mounted) return null

  return (
    <main className="flex h-screen overflow-hidden relative">
      <div
        className="absolute inset-0 z-0"
        style={
          backgroundColor
            ? { background: backgroundColor }
            : backgroundImage
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
        onSelectCategory={handleSelectCategory}
        onDeleteCategory={handleDeleteCategory}
        onReorderCategories={handleReorderCategories}
        onUpdateCategories={handleUpdateCategories}
        onShowCategoryManager={() => setShowCategoryManagerModal(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4">
          <div className="mb-4 sm:mb-6 md:mb-8 relative">
            <TimeDisplay />
            <button
              onClick={() => setShowSettings(true)}
              className="absolute right-0 top-0 px-3 py-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="设置"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
              </svg>
            </button>
          </div>

          {viewMode === "links" && (
            <div className="relative mb-3 sm:mb-4">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input
                type="text"
                placeholder="输入链接内容..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSearchSelectedIndex(-1)
                }}
                onKeyDown={(e) => {
                  if (flatMatchedLinks.length === 0) return
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setSearchSelectedIndex((prev) => {
                      const next = prev + 1
                      return next >= flatMatchedLinks.length ? flatMatchedLinks.length - 1 : next
                    })
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setSearchSelectedIndex((prev) => {
                      const next = prev - 1
                      return next < 0 ? 0 : next
                    })
                  } else if (e.key === "Enter") {
                    e.preventDefault()
                    const idx = searchSelectedIndex >= 0 ? searchSelectedIndex : 0
                    const target = flatMatchedLinks[idx]?.link
                    if (target) window.open(target.url, "_blank", "noopener,noreferrer")
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    setSearchQuery("")
                    setSearchSelectedIndex(-1)
                  }
                }}
                ref={(el) => (searchInputRef.current = el)}
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-2 sm:py-3 glass-card text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm sm:text-base"
              />
            </div>
          )}
        </div>

        {/* 工具集成到设置抽屉，不再在页面中单独展示 */}

        {showSettings && (
          <>
            <input id={importInputId} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <input id={backgroundInputId} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
          </>
        )}

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-2 sm:pt-4">
          {viewMode === "links" && (
            <div className="space-y-6">
              {(() => {
                // 简易虚拟窗口：仅渲染选中分类附近的若干分区（且有结果的）
                const nonEmptyOrdered = categories.filter((c) => (filteredLinksByCategory[c.id] || []).length > 0)
                const centerId = selectedCategory
                const centerIndex = nonEmptyOrdered.findIndex((c) => c.id === centerId)
                const BEFORE = 2
                const AFTER = 2
                let visibleIds = new Set<string>()
                if (nonEmptyOrdered.length > 0) {
                  const start = centerIndex >= 0 ? Math.max(0, centerIndex - BEFORE) : 0
                  const end = centerIndex >= 0 ? Math.min(nonEmptyOrdered.length, centerIndex + AFTER + 1) : Math.min(nonEmptyOrdered.length, BEFORE + AFTER + 1)
                  for (const c of nonEmptyOrdered.slice(start, end)) visibleIds.add(c.id)
                }

                return categories.map((cat) => {
                const linksInCat = filteredLinksByCategory[cat.id] || []
                  if (linksInCat.length === 0) return null
                  if (visibleIds.size > 0 && !visibleIds.has(cat.id)) return null
                return (
                  <section
                    key={cat.id}
                    id={`section-${cat.id}`}
                    ref={(el) => (sectionRefs.current[cat.id] = el)}
                    className="scroll-mt-24"
                  >
                    <h2 className="text-white/90 text-base font-semibold mb-2">{cat.name}</h2>
                    <div className="cards-grid">
                      {linksInCat.map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          onEdit={handleEditLink}
                          onDelete={handleDeleteLink}
                          highlight={searchQuery}
                        />
                      ))}
                    </div>
                  </section>
                )
                })
              })()}
            </div>
          )}

          {viewMode === "json-editor" && (
            <JsonEditor
              categories={categories}
              links={links}
              onUpdate={(c, l) => {
                setCategories(c)
                setLinks(l)
              }}
              onBack={() => setViewMode("links")}
            />
          )}

          {viewMode === "password-generator" && <PasswordGenerator onBack={() => setViewMode("links")} />}
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
          onOpenBatchAdd={() => {
            setShowAddLinkModal(false)
            setShowBatchAddLinksModal(true)
          }}
        />
      )}

      {showBatchAddLinksModal && (
        <BatchAddModal
          categories={categories}
          onAdd={handleBatchAddLinks}
          onClose={() => setShowBatchAddLinksModal(false)}
          selectedCategory={selectedCategory}
        />
      )}

      {showCategoryManagerModal && (
        <CategoryManagerModal
          categories={categories}
          onUpdate={(updatedCategories) => {
            handleUpdateCategories(updatedCategories)
            // 如果当前选中的分类被删除，选择第一个分类
            if (!updatedCategories.find((cat) => cat.id === selectedCategory) && updatedCategories.length > 0) {
              setSelectedCategory(updatedCategories[0].id)
            }
          }}
          onClose={() => setShowCategoryManagerModal(false)}
        />
      )}

      <Drawer direction="right" open={showSettings} onOpenChange={setShowSettings}>
        <DrawerContent className="bg-transparent">
          <div className="glass-card-sm h-full sm:max-w-sm w-[75vw] ml-auto flex flex-col">
            <DrawerHeader className="border-b border-white/10">
              <DrawerTitle className="text-white">设置</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* 工具栏 */}
              <div>
                <label className="block text-sm text-white/80 mb-3">工具栏</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setViewMode(viewMode === "json-editor" ? "links" : "json-editor")
                      setShowSettings(false)
                    }}
                    className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors ${
                      viewMode === "json-editor"
                        ? "bg-white/25 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                    }`}
                    title="JSON编辑"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                      <line x1="9" y1="9" x2="9" y2="15" />
                      <line x1="15" y1="9" x2="15" y2="15" />
                    </svg>
                    <span className="text-xs">JSON编辑</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewMode(viewMode === "password-generator" ? "links" : "password-generator")
                      setShowSettings(false)
                    }}
                    className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors ${
                      viewMode === "password-generator"
                        ? "bg-white/25 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                    }`}
                    title="密码生成"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                      <circle cx="12" cy="16" r="1" />
                    </svg>
                    <span className="text-xs">密码生成</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingLink(null)
                      setShowAddLinkModal(true)
                      setShowSettings(false)
                    }}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                    title="添加链接"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="text-xs">添加链接</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-1">背景颜色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor || "#4f46e5"}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded border border-white/20 bg-transparent p-0"
                  />
                  <button
                    onClick={() => setBackgroundColor("")}
                    className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    还原默认渐变
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div>
                  <label className="block text-sm text-white/80 mb-2">搜索字段</label>
                  <div className="flex items-center gap-4 text-white/80">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={includeName}
                        onChange={(e) => setIncludeName(e.target.checked)}
                      />
                      名称
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={includeAlias}
                        onChange={(e) => setIncludeAlias(e.target.checked)}
                      />
                      别名
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={includeUrl}
                        onChange={(e) => setIncludeUrl(e.target.checked)}
                      />
                      URL
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  导出数据
                </button>
                <button
                  onClick={() => document.getElementById(importInputId)?.click()}
                  className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  导入数据
                </button>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <button
                  onClick={() => setBackgroundImage("")}
                  className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  清除背景图片
                </button>
                <button
                  onClick={() => document.getElementById(backgroundInputId)?.click()}
                  className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  设置背景图片
                </button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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
