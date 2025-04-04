import type React from "react"
import "@/app/globals.css"

import { Inter } from "next/font/google"

import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Community Event Hub",
  description: "Discover and join community events",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6">
              <div className="container mx-auto px-4 text-center">
                <div className="mb-4 flex items-center justify-center space-x-6">
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    About
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Privacy
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Terms
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Contact
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Community Event Hub. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'