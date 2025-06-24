"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-start"
    >
      <div className="flex items-start space-x-3 max-w-[85%]">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <div className="ml-3">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl px-5 py-4 shadow-xl">
            <div className="flex space-x-1">
              <motion.div
                className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
              />
              <motion.div
                className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
              />
              <motion.div
                className="w-2.5 h-2.5 bg-gradient-to-r from-pink-400 to-red-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
