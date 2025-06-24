"use client"

import type { Message } from "@/contexts/chat-context"
import { motion } from "framer-motion"
import { User, Sparkles, CheckCircle, Clock } from "lucide-react"

interface MessageBubbleProps {
  message: Message
  index: number
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.type === "user"

  // Clean the assistant message content
  const cleanContent = (content: string) => {
    if (isUser) return content

    // Remove JSON blocks
    let cleaned = content.replace(/```json[\s\S]*?```/g, "")

    // Remove standalone JSON objects
    cleaned = cleaned.replace(/\{[\s\S]*?\}/g, "")

    // Remove "Meeting scheduled:" and technical details
    cleaned = cleaned.replace(/Meeting scheduled:.*$/s, "")

    // Clean up extra whitespace and newlines
    cleaned = cleaned.replace(/\n\s*\n/g, "\n").trim()

    // If the message indicates a successful scheduling, add a success indicator
    if (content.includes("Meeting scheduled:") || content.includes('"status": "success"')) {
      cleaned += "\n\n✅ Meeting successfully scheduled!"
    }

    return cleaned || "I've processed your request successfully!"
  }

  const processedContent = cleanContent(message.content)
  const isSuccessMessage =
    message.content.includes("Meeting scheduled:") || message.content.includes('"status": "success"')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start space-x-3`}>
        {/* Enhanced Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 400 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isUser
              ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white"
              : "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white"
          }`}
        >
          {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </motion.div>

        {/* Enhanced Message Content */}
        <div className={`${isUser ? "mr-3" : "ml-3"}`}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className={`rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm ${
              isUser
                ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white"
                : isSuccessMessage
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-gray-900"
                  : "bg-gradient-to-br from-white to-gray-50 border border-gray-200 text-gray-900 shadow-xl"
            }`}
          >
            {isSuccessMessage && (
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Success</span>
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{processedContent}</p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className={`text-xs text-gray-500 mt-2 flex items-center space-x-1 ${isUser ? "justify-end" : "justify-start"}`}
          >
            <Clock className="w-3 h-3" />
            <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
