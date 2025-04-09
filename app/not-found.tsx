"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Calendar, Home, Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  // Handle mounting for animations
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would redirect to search results
    window.location.href = `/?search=${encodeURIComponent(searchQuery)}`
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div className="max-w-2xl" initial="hidden" animate="visible" variants={containerVariants}>
        {/* 404 Graphic */}
        <motion.div
          className="mb-8 flex justify-center"
          variants={itemVariants}
          initial="initial"
          animate="animate"
        >
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/10 dark:bg-primary/20" />
            <div className="absolute -bottom-8 -right-8 h-16 w-16 rounded-full bg-secondary/10 dark:bg-secondary/20" />
            <div className="relative z-10 text-[10rem] font-bold leading-none tracking-tighter text-primary">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</span>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl" variants={itemVariants}>
          Page Not Found
        </motion.h1>

        <motion.p className="mb-8 text-lg text-muted-foreground" variants={itemVariants}>
          Oops! The event you're looking for seems to have ended or never existed.
        </motion.p>

        {/* Search Form */}
        <motion.div className="mb-8" variants={itemVariants}>
          <form onSubmit={handleSearch} className="flex w-full max-w-md mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for events..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="button-gradient">
              Search
            </Button>
          </form>
        </motion.div>

        {/* Navigation Options */}
        <motion.div className="grid gap-4 sm:grid-cols-3" variants={itemVariants}>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full gap-2 rounded-lg border-primary/20 hover:bg-primary/5">
              <Home className="h-4 w-4" />
              Home Page
            </Button>
          </Link>
          <Link href="/my-events" className="w-full">
            <Button variant="outline" className="w-full gap-2 rounded-lg border-primary/20 hover:bg-primary/5">
              <Calendar className="h-4 w-4" />
              My Events
            </Button>
          </Link>
          <Link href="/auth/signin" className="w-full">
            <Button className="button-gradient w-full gap-2 rounded-lg">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div className="mt-16 flex justify-center gap-2" variants={itemVariants}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
