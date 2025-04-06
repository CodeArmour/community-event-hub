"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
}

export default function QRCode({ value, size = 200, bgColor = "#FFFFFF", fgColor = "#000000" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Simple QR code generation for demo purposes
    // In a real app, you would use a proper QR code library
    const drawQRCode = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)

      // Draw a fake QR code pattern
      ctx.fillStyle = fgColor

      // Draw positioning squares (corners)
      // Top-left
      ctx.fillRect(10, 10, 30, 30)
      ctx.fillStyle = bgColor
      ctx.fillRect(15, 15, 20, 20)
      ctx.fillStyle = fgColor
      ctx.fillRect(20, 20, 10, 10)

      // Top-right
      ctx.fillRect(size - 40, 10, 30, 30)
      ctx.fillStyle = bgColor
      ctx.fillRect(size - 35, 15, 20, 20)
      ctx.fillStyle = fgColor
      ctx.fillRect(size - 30, 20, 10, 10)

      // Bottom-left
      ctx.fillRect(10, size - 40, 30, 30)
      ctx.fillStyle = bgColor
      ctx.fillRect(15, size - 35, 20, 20)
      ctx.fillStyle = fgColor
      ctx.fillRect(20, size - 30, 10, 10)

      // Draw random dots to simulate QR code
      const cellSize = 5
      const margin = 50 // Leave space for the positioning squares

      // Use the value string to create a deterministic pattern
      const hash = hashCode(value)
      const seededRandom = seedRandom(hash)

      for (let y = margin; y < size - margin; y += cellSize) {
        for (let x = margin; x < size - margin; x += cellSize) {
          if (seededRandom() > 0.65) {
            ctx.fillRect(x, y, cellSize, cellSize)
          }
        }
      }

      // Add a border around the QR code
      ctx.strokeStyle = fgColor
      ctx.lineWidth = 2
      ctx.strokeRect(5, 5, size - 10, size - 10)
    }

    drawQRCode()
  }, [value, size, bgColor, fgColor])

  return (
    <div className="qr-code-container">
      <canvas ref={canvasRef} width={size} height={size} className="rounded-md" />
    </div>
  )
}

// Helper functions for generating deterministic QR code pattern
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

function seedRandom(seed: number) {
  return () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }
}

