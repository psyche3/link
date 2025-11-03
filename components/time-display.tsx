"use client"

import { useState, useEffect } from "react"

export default function TimeDisplay() {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, "0")
      const minutes = String(now.getMinutes()).padStart(2, "0")
      setTime(`${hours}:${minutes}`)

      const formatter = new Intl.DateTimeFormat("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "long",
      })
      setDate(formatter.format(now))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="text-center">
      <div className="text-6xl font-light text-white mb-2 tracking-tight">{time}</div>
      <div className="text-lg text-white/70">{date}</div>
    </div>
  )
}
