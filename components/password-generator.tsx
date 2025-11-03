"use client"

import { useState } from "react"
import { Copy } from "lucide-react"

export default function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    avoidSimilar: true,
  })
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    let chars = ""

    if (options.uppercase) {
      chars += options.avoidSimilar ? "ABCDEFGHJKMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    }
    if (options.lowercase) {
      chars += options.avoidSimilar ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz"
    }
    if (options.numbers) {
      chars += options.avoidSimilar ? "23456789" : "0123456789"
    }
    if (options.symbols) {
      chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    }

    if (!chars) return

    let newPassword = ""
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    setPassword(newPassword)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="h-full flex flex-col gap-6 max-w-md mx-auto justify-center">
      <div className="space-y-4">
        {/* 长度设置 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">密码长度: {length}</label>
          <input
            type="range"
            min="4"
            max="128"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex gap-2">
            {[8, 12, 16, 24, 32].map((len) => (
              <button
                key={len}
                onClick={() => setLength(len)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  length === len ? "bg-white/25 text-white" : "bg-white/10 hover:bg-white/15 text-white/70"
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        {/* 选项复选框 */}
        <div className="space-y-2">
          {[
            { key: "uppercase", label: "大写字母 (A-Z)" },
            { key: "lowercase", label: "小写字母 (a-z)" },
            { key: "numbers", label: "数字 (0-9)" },
            { key: "symbols", label: "符号 (!@#$...)" },
            { key: "avoidSimilar", label: "避免相似字符 (0/O, 1/I/L, 等)" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={options[key as keyof typeof options]}
                onChange={() => toggleOption(key as keyof typeof options)}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-white text-sm">{label}</span>
            </label>
          ))}
        </div>

        {/* 生成按钮 */}
        <button
          onClick={generatePassword}
          className="w-full px-4 py-3 bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 rounded-lg transition-colors font-medium border border-blue-500/30"
        >
          生成密码
        </button>

        {/* 密码显示 */}
        {password && (
          <div className="space-y-2">
            <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
              <p className="text-white font-mono text-center break-all select-all">{password}</p>
            </div>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors"
            >
              <Copy size={16} />
              {copied ? "已复制到剪贴板" : "复制密码"}
            </button>
          </div>
        )}
      </div>

      {/* 强度指示 */}
      {password && (
        <div className="space-y-2">
          <p className="text-sm text-white/70">强度: {calculateStrength(password, options)}</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getStrengthColor(calculateStrength(password, options))}`}
              style={{ width: `${getStrengthPercentage(calculateStrength(password, options))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function calculateStrength(password: string, options: Record<string, boolean>): string {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score++

  if (score <= 2) return "弱"
  if (score <= 4) return "中"
  if (score <= 6) return "强"
  return "非常强"
}

function getStrengthColor(strength: string): string {
  switch (strength) {
    case "弱":
      return "bg-red-500"
    case "中":
      return "bg-yellow-500"
    case "强":
      return "bg-blue-500"
    case "非常强":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

function getStrengthPercentage(strength: string): number {
  switch (strength) {
    case "弱":
      return 25
    case "中":
      return 50
    case "强":
      return 75
    case "非常强":
      return 100
    default:
      return 0
  }
}
