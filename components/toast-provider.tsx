"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "var(--toast-shadow, 0 4px 12px rgba(0, 0, 0, 0.08))",
        },
        className: "sonner-toast",
        descriptionClassName: "sonner-toast-description",
        actionClassName: "sonner-toast-action",
      }}
      theme={theme as "light" | "dark" | "system"}
      closeButton
      richColors
      expand={false}
      duration={4000}
    />
  )
}
