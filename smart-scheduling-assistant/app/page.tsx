"use client"

import { ChatProvider } from "@/contexts/chat-context"
import { ChatInterface } from "@/components/chat-interface"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { useState } from "react"

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false)

  return (
    <ChatProvider>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/50">
        <div className={`flex-1 transition-all duration-300 ${showCalendar ? "mr-80" : ""}`}>
          <ChatInterface onToggleCalendar={() => setShowCalendar(!showCalendar)} />
        </div>
        {showCalendar && <CalendarSidebar onClose={() => setShowCalendar(false)} />}
      </div>
    </ChatProvider>
  )
}
