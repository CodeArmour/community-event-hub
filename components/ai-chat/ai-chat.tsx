"use client"

import { useState } from "react"
import { AiChatButton } from "./ai-chat-button"
import { AiChatDialog } from "./ai-chat-dialog"

export type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your event assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

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

    try {
      // Simulate AI response delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a response based on the user's message
      let response = ""

      if (content.toLowerCase().includes("event")) {
        response =
          "I can help you find events, create events, or answer questions about existing events. What specifically would you like to know?"
      } else if (content.toLowerCase().includes("register") || content.toLowerCase().includes("sign up")) {
        response =
          "To register for an event, navigate to the event page and click the 'Register' button. You'll need to be signed in to complete registration."
      } else if (content.toLowerCase().includes("create") || content.toLowerCase().includes("new event")) {
        response =
          "To create a new event, go to the Admin Dashboard and click 'Create New Event'. You'll need admin privileges to do this."
      } else if (content.toLowerCase().includes("hello") || content.toLowerCase().includes("hi")) {
        response = "Hello there! How can I assist you with community events today?"
      } else {
        response =
          "I'm here to help with anything related to community events. You can ask about finding events, event details, registration, or creating new events."
      }

      // Add AI response
      addMessage(response, "assistant")
    } catch (error) {
      console.error("Error generating response:", error)
      addMessage("I'm sorry, I encountered an error. Please try again later.", "assistant")
    } finally {
      setIsLoading(false)
    }
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
      />
    </>
  )
}
