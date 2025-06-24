"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface TextToSpeechHook {
  speak: (text: string) => void
  isSpeaking: boolean
  stop: () => void
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void
}

export function useTextToSpeech(): TextToSpeechHook {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const isInitialized = useRef(false)

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window

  // Load voices - stable function that doesn't cause re-renders
  useEffect(() => {
    if (!isSupported || isInitialized.current) return

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      if (availableVoices.length > 0) {
        setVoices(availableVoices)

        // Set default voice only once
        if (!selectedVoice) {
          const englishVoice = availableVoices.find((v) => v.lang.startsWith("en"))
          setSelectedVoice(englishVoice || availableVoices[0])
        }

        isInitialized.current = true
        // Remove listener once voices are loaded
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    }

    // Try to load voices immediately
    loadVoices()

    // If no voices yet, wait for the event
    if (!isInitialized.current) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
    }

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [isSupported]) // Only depend on isSupported

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      // Stop any current speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [isSupported, selectedVoice],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const handleSetSelectedVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice)
  }, [])

  return {
    speak,
    isSpeaking,
    stop,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice: handleSetSelectedVoice,
  }
}
