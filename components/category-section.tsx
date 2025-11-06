"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import LinkCard from "@/components/link-card"
import type { Link } from "@/app/page"

interface CategorySectionProps {
  catId: string
  title: string
  links: Link[]
  highlight: string
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
  onVisit: (link: Link) => void
  scrollContainer: () => HTMLElement | null
}

// 虚拟化分区内的卡片：按行进行虚拟化，行内用 flex-wrap 固定列数
export default function CategorySection({
  catId,
  title,
  links,
  highlight,
  onEdit,
  onDelete,
  onVisit,
  scrollContainer,
}: CategorySectionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth)
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // 估算每张卡片的最小宽度，算出列数
  const minCardWidth = 220 // 与现有卡片样式相匹配的近似值
  const columns = Math.max(1, Math.floor(containerWidth / minCardWidth))
  const totalRows = Math.ceil(links.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: scrollContainer,
    estimateSize: () => 140, // 每行高度估算（卡片高度+间距）
    overscan: 6,
  })

  const percentWidth = `${100 / columns}%`

  return (
    <section
      id={`section-${catId}`}
      className="scroll-mt-24"
      role="region"
      aria-labelledby={`heading-${catId}`}
      ref={wrapperRef}
    >
      <h2 id={`heading-${catId}`} className="text-white/90 text-base font-semibold mb-1">
        {title}
      </h2>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((v) => {
          const start = v.index * columns
          const rowItems = links.slice(start, start + columns)
          return (
            <div
              key={v.index}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${v.start}px)` }}
            >
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {rowItems.map((link) => (
                  <div key={link.id} className="min-h-[140px]">
                    <LinkCard
                      link={link}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onVisit={onVisit}
                      highlight={highlight}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}


