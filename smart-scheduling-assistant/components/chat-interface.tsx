"use client"

import { useChat } from "@/contexts/chat-context"
import { MessageBubble } from "@/components/message-bubble"
import { ChatInput } from "@/components/chat-input"
import { TypingIndicator } from "@/components/typing-indicator"
import { SpeechSettings } from "@/components/speech-settings"
import { Button } from "@/components/ui/button"
import { Calendar, Sparkles, RotateCcw, Settings } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface ChatInterfaceProps {
  onToggleCalendar: () => void
}

export function ChatInterface({ onToggleCalendar }: ChatInterfaceProps) {
  const { state, startNewSession } = useChat()
  const { speak } = useTextToSpeech()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSpeechSettings, setShowSpeechSettings] = useState(false)
  const lastProcessedMessageId = useRef<string | null>(null)
  const autoSpeakTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [state.messages, state.isLoading])

  // Auto-speak with proper cleanup and debouncing
  useEffect(() => {
    // Clear any existing timeout
    if (autoSpeakTimeoutRef.current) {
      clearTimeout(autoSpeakTimeoutRef.current)
    }

    const autoSpeak = localStorage.getItem("autoSpeak") === "true"
    const enableTTS = localStorage.getItem("enableTTS") !== "false"

    if (!autoSpeak || !enableTTS || state.messages.length === 0) {
      return
    }

    const lastMessage = state.messages[state.messages.length - 1]

    // Only process new assistant messages that we haven't processed before
    if (lastMessage.type === "assistant" && lastMessage.id !== lastProcessedMessageId.current) {
      lastProcessedMessageId.current = lastMessage.id

      // Clean the message before speaking
      const cleanMessage = lastMessage.content
        .replace(/```json[\s\S]*?```/g, "")
        .replace(/\{[\s\S]*?\}/g, "")
        .replace(/Meeting scheduled:.*$/s, "")
        .replace(/\n\s*\n/g, " ")
        .trim()

      if (cleanMessage) {
        // Use timeout to prevent immediate execution
        autoSpeakTimeoutRef.current = setTimeout(() => {
          speak(cleanMessage)
        }, 1000)
      }
    }

    // Cleanup function
    return () => {
      if (autoSpeakTimeoutRef.current) {
        clearTimeout(autoSpeakTimeoutRef.current)
      }
    }
  }, [state.messages.length, speak]) // Only depend on message count, not the entire messages array

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSpeakTimeoutRef.current) {
        clearTimeout(autoSpeakTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/50 backdrop-blur-xl px-6 py-5 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Smart Scheduling Assistant
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600 font-medium">Your AI-powered calendar companion</p>
              {state.sessionId && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Session: {state.sessionId.slice(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpeechSettings(true)}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">Speech</span>
            </Button>
          </motion.div>
          {state.messages.length > 0 && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={startNewSession}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">New Chat</span>
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleCalendar}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Calendar</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        {state.messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center py-16 px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4"
            >
              Welcome to your Smart Assistant
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed"
            >
              I can help you schedule meetings, check your availability, and manage your calendar using natural language
              or voice commands.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-left shadow-lg"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800 font-semibold">Try saying:</p>
                </div>
                <p className="text-sm text-blue-700 font-medium">"Schedule a meeting for tomorrow at 2pm"</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 text-left shadow-lg"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-purple-800 font-semibold">Or ask:</p>
                </div>
                <p className="text-sm text-purple-700 font-medium">"What's my availability this week?"</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {state.messages.map((message, index) => (
          <MessageBubble key={message.id} message={message} index={index} />
        ))}

        {state.isLoading && <TypingIndicator />}

        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          >
            {state.error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <ChatInput />
      </div>

      {/* Speech Settings Modal */}
      <SpeechSettings isOpen={showSpeechSettings} onClose={() => setShowSpeechSettings(false)} />
    </div>
  )
}
