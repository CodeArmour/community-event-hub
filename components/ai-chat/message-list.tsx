"use client"

import { motion } from "framer-motion"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
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
            className={`rounded-2xl px-3 py-2 sm:px-4 max-w-[85%] sm:max-w-[80%] ${
              message.role === "assistant"
                ? "bg-muted text-foreground"
                : "bg-gradient-to-r from-primary to-secondary text-white"
            }`}
          >
            {message.role === "assistant" ? (
              <div className="chat-message-content">
                <ReactMarkdown
                  components={{
                    span: ({ node, ...props }) => <span className="text-xs sm:text-sm" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({ node, ...props }) => <li className="my-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-md font-bold my-2" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-sm font-bold my-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full border-collapse" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-muted/50" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="divide-y divide-muted" {...props} />,
                    tr: ({ node, ...props }) => <tr className="hover:bg-muted/30" {...props} />,
                    th: ({ node, ...props }) => (
                      <th className="px-2 py-1 text-left text-xs font-medium text-muted-foreground" {...props} />
                    ),
                    td: ({ node, ...props }) => <td className="px-2 py-1 text-sm" {...props} />,
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code className="rounded bg-muted/70 px-1 py-0.5 text-xs font-mono" {...props} />
                      ) : (
                        <code
                          className="block bg-muted/70 p-2 rounded text-xs font-mono my-2 overflow-x-auto"
                          {...props}
                        />
                      ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground my-2"
                        {...props}
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
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
