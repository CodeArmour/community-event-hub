"use client"

import { Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface AiChatButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function AiChatButton({ isOpen, onClick }: AiChatButtonProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={onClick}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary hover:shadow-xl"
          aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        >
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </motion.div>
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}
