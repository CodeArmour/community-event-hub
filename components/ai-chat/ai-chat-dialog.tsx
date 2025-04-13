"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import type { Message } from "./ai-chat"

interface AiChatDialogProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
}

export function AiChatDialog({ isOpen, onClose, messages, onSendMessage, isLoading }: AiChatDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [messages, isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-24 right-6 z-50 w-full max-w-md"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="flex h-[500px] max-h-[80vh] flex-col overflow-hidden border-2 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Event Assistant</h3>
                  <p className="text-xs text-muted-foreground">AI-powered help</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0" ref={containerRef}>
              <MessageList messages={messages} />
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-3">
              <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
