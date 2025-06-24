"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode, useEffect, useRef } from "react"

export interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatState {
  messages: Message[]
  sessionId: string | null
  isLoading: boolean
  error: string | null
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SESSION_ID"; payload: string }
  | { type: "LOAD_MESSAGES"; payload: Message[] }
  | { type: "CLEAR_SESSION"; payload: null }

const initialState: ChatState = {
  messages: [],
  sessionId: null,
  isLoading: false,
  error: null,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      }
    case "SET_SESSION_ID":
      return {
        ...state,
        sessionId: action.payload,
      }
    case "LOAD_MESSAGES":
      return {
        ...state,
        messages: action.payload,
      }
    case "CLEAR_SESSION":
      return {
        ...state,
        sessionId: null,
        messages: [],
      }
    default:
      return state
  }
}

const ChatContext = createContext<{
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  sendMessage: (message: string) => Promise<void>
  startNewSession: () => void
} | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const sessionIdRef = useRef<string | null>(null)
  const isInitialized = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    sessionIdRef.current = state.sessionId
  }, [state.sessionId])

  // Load from localStorage only once on mount
  useEffect(() => {
    if (isInitialized.current) return

    console.log("🚀 Initializing chat context...")

    const savedMessages = localStorage.getItem("chat-messages")
    const savedSessionId = localStorage.getItem("session-id")

    console.log("📂 Loading from localStorage:")
    console.log("- Messages:", savedMessages ? "Found" : "None")
    console.log("- Session ID:", savedSessionId || "None")

    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        dispatch({ type: "LOAD_MESSAGES", payload: messages })
      } catch (error) {
        console.error("❌ Failed to load messages:", error)
      }
    }

    if (savedSessionId) {
      console.log("✅ Restoring session ID:", savedSessionId)
      dispatch({ type: "SET_SESSION_ID", payload: savedSessionId })
      sessionIdRef.current = savedSessionId
    }

    isInitialized.current = true
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized.current) return

    if (state.messages.length > 0) {
      localStorage.setItem("chat-messages", JSON.stringify(state.messages))
    }
  }, [state.messages])

  useEffect(() => {
    if (!isInitialized.current) return

    if (state.sessionId) {
      console.log("💾 Saving session ID:", state.sessionId)
      localStorage.setItem("session-id", state.sessionId)
    } else {
      localStorage.removeItem("session-id")
    }
  }, [state.sessionId])

  const startNewSession = () => {
    console.log("🆕 Starting new session")
    dispatch({ type: "CLEAR_SESSION", payload: null })
    sessionIdRef.current = null
    localStorage.removeItem("chat-messages")
    localStorage.removeItem("session-id")
  }

  const sendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    dispatch({ type: "ADD_MESSAGE", payload: userMessage })
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      // Get the current session ID from ref
      const currentSessionId = sessionIdRef.current

      console.log("🚀 === SENDING MESSAGE ===")
      console.log("📝 Message:", message)
      console.log("🔑 Current session ID:", currentSessionId)

      // Build request body - only include session_id if we have one
      const requestBody: { message: string; session_id?: string } = { message }
      if (currentSessionId) {
        requestBody.session_id = currentSessionId
      }

      console.log("📤 Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Response error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to send message")
      }

      const data = await response.json()
      console.log("📦 Response data:", JSON.stringify(data, null, 2))

      // CRITICAL: Always update session ID to whatever backend returns
      if (data.session_id) {
        console.log("🔄 Updating session ID from backend:", data.session_id)
        console.log("🔄 Previous session ID was:", currentSessionId)
        dispatch({ type: "SET_SESSION_ID", payload: data.session_id })
        sessionIdRef.current = data.session_id
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      dispatch({ type: "ADD_MESSAGE", payload: assistantMessage })
    } catch (error) {
      console.error("❌ Send error:", error)
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Failed to send message" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  return (
    <ChatContext.Provider value={{ state, dispatch, sendMessage, startNewSession }}>{children}</ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
