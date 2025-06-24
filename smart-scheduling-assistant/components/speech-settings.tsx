"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Volume2, Mic } from "lucide-react"
import { motion } from "framer-motion"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface SpeechSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function SpeechSettings({ isOpen, onClose }: SpeechSettingsProps) {
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [enableTTS, setEnableTTS] = useState(true)
  const [enableSTT, setEnableSTT] = useState(true)
  const { voices, selectedVoice, setSelectedVoice, speak } = useTextToSpeech()

  // Load settings from localStorage
  useEffect(() => {
    const savedAutoSpeak = localStorage.getItem("autoSpeak") === "true"
    const savedEnableTTS = localStorage.getItem("enableTTS") !== "false" // Default true
    const savedEnableSTT = localStorage.getItem("enableSTT") !== "false" // Default true
    const savedVoice = localStorage.getItem("selectedVoice")

    setAutoSpeak(savedAutoSpeak)
    setEnableTTS(savedEnableTTS)
    setEnableSTT(savedEnableSTT)

    if (savedVoice && voices.length > 0) {
      const voice = voices.find((v) => v.name === savedVoice)
      if (voice) setSelectedVoice(voice)
    }
  }, [voices, setSelectedVoice])

  const handleAutoSpeakChange = (checked: boolean) => {
    setAutoSpeak(checked)
    localStorage.setItem("autoSpeak", checked.toString())
  }

  const handleEnableTTSChange = (checked: boolean) => {
    setEnableTTS(checked)
    localStorage.setItem("enableTTS", checked.toString())
  }

  const handleEnableSTTChange = (checked: boolean) => {
    setEnableSTT(checked)
    localStorage.setItem("enableSTT", checked.toString())
  }

  const handleVoiceChange = (voiceName: string) => {
    const voice = voices.find((v) => v.name === voiceName)
    if (voice) {
      setSelectedVoice(voice)
      localStorage.setItem("selectedVoice", voiceName)
      // Test the voice
      speak("Hello! This is how I sound.")
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="bg-white shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <CardTitle>Speech Settings</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text-to-Speech Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Text-to-Speech</span>
                </div>
                <Switch checked={enableTTS} onCheckedChange={handleEnableTTSChange} />
              </div>

              {enableTTS && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auto-speak responses</span>
                    <Switch checked={autoSpeak} onCheckedChange={handleAutoSpeakChange} />
                  </div>

                  {voices.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Voice</label>
                      <Select value={selectedVoice?.name || ""} onValueChange={handleVoiceChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Speech-to-Text Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Speech-to-Text</span>
                </div>
                <Switch checked={enableSTT} onCheckedChange={handleEnableSTTChange} />
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Keyboard Shortcuts</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Alt + M: Start/stop voice input</div>
                <div>Alt + S: Speak last response</div>
                <div>Alt + Enter: Send message</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
