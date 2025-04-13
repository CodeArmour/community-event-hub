"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, X, Trash2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import type { Message } from "./ai-chat"

interface AiChatDialogProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
  error: string | null
  onClearConversation: () => void
}

export function AiChatDialog({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  error,
  onClearConversation,
}: AiChatDialogProps) {
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
          className="fixed bottom-0 right-0 z-50 w-full sm:bottom-24 sm:right-6 sm:w-[calc(100%-3rem)] md:w-[450px]"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="flex h-[100vh] flex-col overflow-hidden border-0 rounded-none sm:h-[500px] sm:max-h-[80vh] sm:border-2 sm:rounded-lg shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">EventBuddy</h3>
                  <p className="text-xs text-muted-foreground">AI-powered assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearConversation}
                  className="h-8 w-8 rounded-full"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full"
                  title="Close chat"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0" ref={containerRef}>
              <MessageList messages={messages} />

              {error && (
                <div className="mx-4 my-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
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
