import type React from "react";
import "@/app/globals.css";
import { getUserSession } from "@/lib/auth";
import { SessionProvider } from 'next-auth/react';
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Community Event Hub",
  description: "Discover and join community events",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession();
  const user = session?.user || null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <Navbar user={user}/>
              <main className="flex-1">{children}</main>
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
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}