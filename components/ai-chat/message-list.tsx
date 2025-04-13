"use client"

import { motion } from "framer-motion"
import { Bot, User } from "lucide-react"
import type { Message } from "./ai-chat"

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          className={`flex gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          {message.role === "assistant" && (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary">
              <Bot className="h-4 w-4 text-white" />
            </div>
          )}
          <div
            className={`rounded-2xl px-4 py-2 max-w-[80%] ${
              message.role === "assistant"
                ? "bg-muted text-foreground"
                : "bg-gradient-to-r from-primary to-secondary text-white"
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p className="mt-1 text-right text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {message.role === "user" && (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
