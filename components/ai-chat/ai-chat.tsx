"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/toast"
import { AiChatButton } from "./ai-chat-button"
import { AiChatDialog } from "./ai-chat-dialog"
import { generateAIResponse } from "@/actions/ai-chat"

export type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

// Function to load messages from localStorage
const loadMessages = (): Message[] => {
  if (typeof window === "undefined") return []

  try {
    const saved = localStorage.getItem("ai-chat-messages")
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    }
  } catch (error) {
    console.error("Error loading messages:", error)
  }

  return [
    {
      id: "welcome",
      content: "Hello! I'm EventBuddy, your event assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load messages from localStorage on component mount
  useEffect(() => {
    setMessages(loadMessages())
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai-chat-messages", JSON.stringify(messages))
    }
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const addMessage = (content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    addMessage(content, "user")

    // Set loading state
    setIsLoading(true)
    setError(null)

    try {
      // Format messages for the API (excluding the welcome message if it's the first one)
      const messagesToSend = messages
        .filter((msg) => msg.id !== "welcome" || messages.length === 1)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Add the new user message
      messagesToSend.push({
        role: "user" as const,
        content,
      })

      // Call the AI API through our server action
      const response = await generateAIResponse(messagesToSend)

      if (response.success && response.data) {
        // Add AI response
        addMessage(response.data, "assistant")
      } else {
        throw new Error(response.error || "Failed to generate response")
      }
    } catch (error: any) {
      console.error("Error generating response:", error)
      setError(error.message || "Something went wrong. Please try again.")
      toast.error({
        title: "AI Chat Error",
        description: error.message || "Failed to generate a response. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    const newWelcomeMessage = {
      id: "welcome",
      content: "Hello! I'm EventBuddy, your event assistant. How can I help you today?",
      role: "assistant" as const,
      timestamp: new Date(),
    }
    setMessages([newWelcomeMessage])
    localStorage.setItem("ai-chat-messages", JSON.stringify([newWelcomeMessage]))
    toast.info({
      title: "Conversation Cleared",
      description: "Your chat history has been cleared.",
    })
  }

  return (
    <>
      <AiChatButton isOpen={isOpen} onClick={toggleChat} />
      <AiChatDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error}
        onClearConversation={clearConversation}
      />
    </>
  )
}
