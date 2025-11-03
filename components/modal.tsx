"use client"

import type React from "react"
import { X } from "lucide-react"

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
  className?: string
}

export default function Modal({ title, children, onClose, maxWidth = "md", className = "" }: ModalProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    full: "max-w-full",
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-3 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className={`glass-card-sm border-white/20 shadow-xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors flex-shrink-0 z-10"
            title="关闭"
          >
            <X size={20} className="text-white hover:text-white/80" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}

