"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { SpeechControls } from "@/components/speech-controls"

export function ChatInput() {
  const [input, setInput] = useState("")
  const { state, sendMessage } = useChat()

  // Get the last assistant message for TTS
  const lastAssistantMessage = state.messages.filter((msg) => msg.type === "assistant").pop()?.content

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || state.isLoading) return

    const message = input.trim()
    setInput("")
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // FIXED: Only set the transcript, don't auto-submit
  const handleTranscript = useCallback((transcript: string) => {
    setInput(transcript)
    // Removed auto-submit - user needs to manually send
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Enter") {
        // Alt+Enter to submit
        e.preventDefault()
        if (input.trim()) {
          handleSubmit(e as any)
        }
      }
    }

    document.addEventListener("keydown", handleKeyboardShortcuts)
    return () => document.removeEventListener("keydown", handleKeyboardShortcuts)
  }, [input])

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex flex-col space-y-3"
    >
      {/* Speech Controls */}
      <div className="flex justify-between items-center">
        <SpeechControls onTranscript={handleTranscript} lastAssistantMessage={lastAssistantMessage} />
        <div className="text-xs text-gray-400">Alt+M: Voice input • Alt+S: Speak response • Enter: Send</div>
      </div>

      {/* Input Area */}
      <div className="flex items-end space-x-4">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or use voice input... (e.g., 'Schedule a meeting for tomorrow at 2pm')"
            className="min-h-[52px] max-h-32 resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm font-medium placeholder:text-gray-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-200"
            disabled={state.isLoading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">Press Enter to send</div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={!input.trim() || state.isLoading}
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white px-6 py-3 h-[52px] rounded-2xl shadow-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </motion.div>
      </div>
    </motion.form>
  )
}
