"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import apiClient from "@/lib/api"

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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingProgrammatically = useRef(false)

  useEffect(() => {
    setMounted(true)

    const loadFromLocal = () => {
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
        { id: "1", name: "GitHub", url: "https://github.com", categoryId: "1", alias: "代码仓库" },
        { id: "2", name: "Stack Overflow", url: "https://stackoverflow.com", categoryId: "1", alias: "问答社区" },
        { id: "3", name: "Figma", url: "https://figma.com", categoryId: "2", alias: "设计工具" },
        { id: "4", name: "Slack", url: "https://slack.com", categoryId: "3", alias: "团队沟通" },
      ]

      const parsedCategories: Category[] = savedCategories ? JSON.parse(savedCategories) : defaultCategories
      let parsedLinks: Link[] = savedLinks ? JSON.parse(savedLinks) : defaultLinks

      parsedLinks = parsedLinks.map((link) => {
        if (link.iconType) {
          const validIcon = getValidIcon(link.iconType, "Link")
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
    }

    ;(async () => {
      try {
        const data = await apiClient.getState()
        const { categories = [], links = [] } = data || {}

        const sanitizedLinks: Link[] = (links as Link[]).map((link) => {
          if (link.iconType) {
            const validIcon = getValidIcon(link.iconType, "Link")
            if (validIcon !== link.iconType) return { ...link, iconType: undefined }
          }
          return link
        })

        setCategories(categories)
        setLinks(sanitizedLinks)
        const savedBackground = localStorage.getItem("backgroundImage")
        const savedBgColor = localStorage.getItem("backgroundColor") || ""
        setBackgroundImage(savedBackground || "")
        setBackgroundColor(savedBgColor)
        if (categories.length > 0) setSelectedCategory(categories[0].id)
      } catch (e) {
        loadFromLocal()
      }
    })()
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("categories", JSON.stringify(categories))
      localStorage.setItem("links", JSON.stringify(links))
      localStorage.setItem("backgroundImage", backgroundImage)
      localStorage.setItem("backgroundColor", backgroundColor)
    }
  }, [categories, links, backgroundImage, backgroundColor, mounted])

  useEffect(() => {
    if (!mounted) return
    const t = setTimeout(() => {
      apiClient.updateState({ categories, links }).catch(() => {})
    }, 400)
    return () => clearTimeout(t)
  }, [categories, links, mounted])


  const handleDeleteCategory = async (id: string) => {
    try {
      await apiClient.deleteCategory(id)
    } catch (e) {
      // 忽略错误，继续本地删除以保持连贯性
    } finally {
      setCategories(categories.filter((c) => c.id !== id))
      setLinks(links.filter((l) => l.categoryId !== id))
      if (selectedCategory === id && categories.length > 0) {
        setSelectedCategory(categories[0].id)
      }
    }
  }

  const handleReorderCategories = async (newCategories: Category[]) => {
    setCategories(newCategories)
    try {
      await apiClient.updateState({ categories: newCategories, links })
    } catch (e) {}
  }

  const handleUpdateCategories = async (updatedCategories: Category[]) => {
    setCategories(updatedCategories)
    const remainingCategoryIds = new Set(updatedCategories.map((cat) => cat.id))
    const newLinks = links.filter((link) => remainingCategoryIds.has(link.categoryId))
    setLinks(newLinks)
    if (!remainingCategoryIds.has(selectedCategory) && updatedCategories.length > 0) {
      setSelectedCategory(updatedCategories[0].id)
    }
    try {
      await apiClient.updateState({ categories: updatedCategories, links: newLinks })
    } catch (e) {}
  }

  const handleBatchAddLinks = (newLinks: Omit<Link, "id">[]) => {
    const linksWithIds = newLinks.map((link, index) => ({
      ...link,
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    }))
    setLinks([...links, ...linksWithIds])
    setShowBatchAddLinksModal(false)
  }

  const handleAddLink = async (link: Omit<Link, "id">) => {
    try {
      if (editingLink) {
        const updated = await apiClient.updateLink(editingLink.id, link)
        setLinks(links.map((l) => (l.id === editingLink.id ? updated : l)))
        setEditingLink(null)
      } else {
        const created = await apiClient.createLink(link)
        setLinks([...links, created])
      }
    } catch (e) {
      // 回退到本地更新，避免操作丢失
      if (editingLink) {
        setLinks(links.map((l) => (l.id === editingLink.id ? { ...link, id: editingLink.id } : l)))
        setEditingLink(null)
      } else {
        setLinks([...links, { ...link, id: Date.now().toString() }])
      }
    } finally {
      setShowAddLinkModal(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      await apiClient.deleteLink(id)
      setLinks(links.filter((l) => l.id !== id))
    } catch (e) {
      // 本地回退删除
      setLinks(links.filter((l) => l.id !== id))
    }
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

  // 按分类分组所有链接
  const linksByCategory = categories.map((category) => ({
    category,
    links: links.filter((link) => link.categoryId === category.id),
  }))

  // 始终显示所有分类（不再根据 selectedCategory 过滤）
  // 应用搜索过滤
  const filteredLinksByCategoryWithSearch = linksByCategory.map((item) => ({
    ...item,
    links: item.links.filter((link) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        link.name.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        (link.alias && link.alias.toLowerCase().includes(query))
      )
    }),
  })).filter((item) => item.links.length > 0) // 只显示有链接的分类

  // 用于滚动定位的函数 - 将分类滚动到视口中心
  const scrollToCategory = (categoryId: string) => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current

    if (!categoryId) {
      // 如果选择"全部"，滚动到顶部
      container.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    // 滚动到指定分类，将分类区域中心对齐到视口中心
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      
      // 计算元素中心位置
      const elementCenter = elementRect.top + elementRect.height / 2
      // 计算视口中心位置
      const viewportCenter = containerRect.top + containerRect.height / 2
      // 计算需要滚动的距离，使元素中心对齐到视口中心
      const scrollOffset = elementCenter - viewportCenter
      const scrollTop = container.scrollTop + scrollOffset
      
      container.scrollTo({ top: scrollTop, behavior: 'smooth' })
    }
  }

  // 修改 onSelectCategory 以支持滚动定位
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // 延迟一下确保 DOM 更新
    isScrollingProgrammatically.current = true
    setTimeout(() => {
      scrollToCategory(categoryId)
      // 滚动完成后重置标志
      setTimeout(() => {
        isScrollingProgrammatically.current = false
      }, 500)
    }, 100)
  }

  // 监听滚动，实现双向同步 - 基于视口中心位置判断
  useEffect(() => {
    if (!mounted || viewMode !== "links" || !scrollContainerRef.current) return

    const container = scrollContainerRef.current
    let scrollTimeout: NodeJS.Timeout | null = null
    
    const handleScroll = () => {
      // 如果正在程序化滚动，不更新选中状态
      if (isScrollingProgrammatically.current) return

      // 使用节流，减少频繁更新
      if (scrollTimeout) return
      
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null
        
        // 检查是否滚动到顶部
        if (container.scrollTop < 50) {
          if (selectedCategory !== "") {
            setSelectedCategory("")
          }
          return
        }

        // 找到所有分类区域
        const sections = filteredLinksByCategoryWithSearch
          .map(({ category }) => ({
            category,
            element: document.getElementById(`category-${category.id}`),
          }))
          .filter(({ element }) => element !== null)

        if (sections.length === 0) return

        const containerRect = container.getBoundingClientRect()
        // 计算视口中心位置（相对于容器）
        const viewportCenter = containerRect.top + containerRect.height / 2
        
        let bestCategory: { category: Category; element: HTMLElement } | null = null
        let minDistance = Infinity

        // 遍历所有分类区域，找到最接近视口中心的那个
        for (const { category, element } of sections) {
          if (!element) continue
          
          const elementRect = element.getBoundingClientRect()
          // 计算分类区域的中心位置
          const elementCenter = elementRect.top + elementRect.height / 2
          // 计算分类中心与视口中心的距离
          const distance = Math.abs(elementCenter - viewportCenter)
          
          // 检查分类是否在视口中（至少部分可见）
          const isVisible = elementRect.top < containerRect.bottom && elementRect.bottom > containerRect.top
          
          if (isVisible && distance < minDistance) {
            minDistance = distance
            bestCategory = { category, element }
          }
        }

        // 如果找到最接近视口中心的分类，更新选中状态
        if (bestCategory && bestCategory.category.id !== selectedCategory) {
          setSelectedCategory(bestCategory.category.id)
        }
      }, 100) // 100ms 节流
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    
    // 初始检查一次
    handleScroll()

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      container.removeEventListener("scroll", handleScroll)
    }
  }, [mounted, viewMode, filteredLinksByCategoryWithSearch, selectedCategory])

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
        onViewModeChange={(mode: string) => setViewMode(mode as any)}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-2 sm:py-3 glass-card text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm sm:text-base"
              />
            </div>
          )}
        </div>


        {showSettings && (
          <>
            <input id={importInputId} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <input id={backgroundInputId} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
          </>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-2 sm:pt-4"
        >
          {viewMode === "links" && (
            <>
              {filteredLinksByCategoryWithSearch.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4 opacity-50">🔗</div>
                  <p className="text-lg text-white/70 mb-2">未找到链接</p>
                  <p className="text-sm text-white/50">{searchQuery ? "调整搜索词试试" : "添加第一个链接来开始"}</p>
                </div>
              ) : (
                <div className="space-y-8 sm:space-y-10 md:space-y-12">
                  {filteredLinksByCategoryWithSearch.map(({ category, links }) => (
                    <section
                      key={category.id}
                      id={`category-${category.id}`}
                      className="scroll-mt-4"
                    >
                      <div className="mb-4 sm:mb-6 flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                          {category.name}
                        </h2>
                        <span className="text-sm sm:text-base text-white/60">
                          ({links.length})
                        </span>
                      </div>
                      <div className="cards-grid">
                        {links.map((link) => (
                          <LinkCard key={link.id} link={link} onEdit={handleEditLink} onDelete={handleDeleteLink} />
                        ))}
                      </div>
                    </section>
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

              <div className="border-t border-white/10 pt-4">
                <label className="block text-sm text-white/80 mb-3">背景设置</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">背景颜色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor || "#4f46e5"}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded border-0 bg-transparent p-0 cursor-pointer"
                      />
                      <button
                        onClick={() => setBackgroundColor("")}
                        className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white border-0 text-sm"
                      >
                        还原默认渐变
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setBackgroundImage("")}
                      className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                    >
                      清除背景图片
                    </button>
                    <button
                      onClick={() => document.getElementById(backgroundInputId)?.click()}
                      className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                    >
                      设置背景图片
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <label className="block text-sm text-white/80 mb-3">数据管理</label>
                <div className="space-y-2">
                  <button
                    onClick={handleExport}
                    className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                  >
                    导出数据
                  </button>
                  <button
                    onClick={() => document.getElementById(importInputId)?.click()}
                    className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                  >
                    导入数据
                  </button>
                </div>
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
