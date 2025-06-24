"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { motion } from "framer-motion"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useEffect } from "react"

interface SpeechControlsProps {
  onTranscript: (text: string) => void
  lastAssistantMessage?: string
  className?: string
}

export function SpeechControls({ onTranscript, lastAssistantMessage, className = "" }: SpeechControlsProps) {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: sttSupported,
    error,
    clearTranscript,
  } = useSpeechRecognition()
  const { speak, isSpeaking, stop, isSupported: ttsSupported } = useTextToSpeech()

  // Handle transcript changes - only call onTranscript when we have a new transcript
  useEffect(() => {
    if (transcript && transcript.trim()) {
      onTranscript(transcript)
      // Clear the transcript after passing it to parent
      clearTranscript()
    }
  }, [transcript, onTranscript, clearTranscript])

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleSpeakClick = () => {
    if (isSpeaking) {
      stop()
    } else if (lastAssistantMessage) {
      // Clean the message before speaking (remove any JSON or technical content)
      const cleanMessage = lastAssistantMessage
        .replace(/```json[\s\S]*?```/g, "")
        .replace(/\{[\s\S]*?\}/g, "")
        .replace(/Meeting scheduled:.*$/s, "")
        .replace(/\n\s*\n/g, " ")
        .trim()

      speak(cleanMessage || "I've processed your request successfully!")
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Speech-to-Text Button */}
      {sttSupported && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMicClick}
            className={`relative ${
              isListening
                ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                : "bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
            }`}
            title={isListening ? "Stop listening" : "Start voice input (Alt+M)"}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                <MicOff className="w-4 h-4" />
              </motion.div>
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isListening && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              />
            )}
          </Button>
        </motion.div>
      )}

      {/* Text-to-Speech Button */}
      {ttsSupported && lastAssistantMessage && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeakClick}
            className={`${
              isSpeaking
                ? "bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                : "bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
            }`}
            title={isSpeaking ? "Stop speaking" : "Speak response (Alt+S)"}
          >
            {isSpeaking ? (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <VolumeX className="w-4 h-4" />
              </motion.div>
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </motion.div>
      )}

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}
