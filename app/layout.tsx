import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { getUserSession } from "@/lib/auth";
import { ToastProvider } from "@/components/toast-provider"
import { SessionProvider } from "next-auth/react";
import { AiChat } from "@/components/ai-chat/ai-chat"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Community Event Hub",
  description: "Discover and join community events",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // We'll still get the session for the initial server render
  const session = await getUserSession();
  const user = session?.user || null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <Navbar user={user}/>
              <main className="flex-1">
                <SessionProvider>
                {children}
                </SessionProvider>
                </main>
              <footer className="border-t py-6">
                <div className="container mx-auto px-4 text-center">
                  <div className="mb-4 flex items-center justify-center space-x-6">
                    <a href="/about" className="text-muted-foreground hover:text-primary">About</a>
                    <a href="/privacy" className="text-muted-foreground hover:text-primary">Privacy</a>
                    <a href="/terms" className="text-muted-foreground hover:text-primary">Terms</a>
                    <a href="/contact" className="text-muted-foreground hover:text-primary">Contact</a>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Community Event Hub. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
            <ToastProvider />
            <AiChat />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}