"use client"

import { Menu, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "My Events", href: "/my-events" },
  { name: "Profile", href: "/profile" },
]

const adminNavigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Manage Events", href: "/admin/events" },
]

export default function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  // Toggle sign in status for demo purposes
  const toggleSignIn = () => {
    setIsSignedIn(!isSignedIn)
  }

  // Toggle admin status for demo purposes
  const toggleAdmin = () => {
    setIsAdmin(!isAdmin)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center text-xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EventHub</span>
          </Link>
          <nav className="hidden md:block">
            <ul className="flex gap-6">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={isSignedIn ? item.href : "/auth/signin"}
                    className={cn(
                      "nav-link",
                      pathname === item.href ? "nav-link-active" : "",
                      !isSignedIn && item.href !== "/" ? "opacity-50" : "",
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {isAdmin &&
                adminNavigation.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={cn("nav-link", pathname === item.href ? "nav-link-active" : "")}>
                      {item.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Demo controls */}
          <div className="hidden items-center gap-2 rounded-full border p-1 md:flex">
            <Button variant="ghost" size="sm" onClick={toggleSignIn} className="h-7 rounded-full text-xs">
              {isSignedIn ? "Sign Out (Demo)" : "Sign In (Demo)"}
            </Button>
            {isSignedIn && (
              <Button variant="ghost" size="sm" onClick={toggleAdmin} className="h-7 rounded-full text-xs">
                {isAdmin ? "User Mode (Demo)" : "Admin Mode (Demo)"}
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  EventHub
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={isSignedIn ? item.href : "/auth/signin"}
                    className={cn(
                      "rounded-lg px-3 py-2 transition-colors hover:bg-muted",
                      pathname === item.href ? "bg-primary/10 font-medium text-primary" : "text-foreground/60",
                      !isSignedIn && item.href !== "/" ? "opacity-50" : "",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                {isAdmin &&
                  adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-2 transition-colors hover:bg-muted",
                        pathname === item.href ? "bg-primary/10 font-medium text-primary" : "text-foreground/60",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" onClick={toggleSignIn} className="w-full">
                    {isSignedIn ? "Sign Out (Demo)" : "Sign In (Demo)"}
                  </Button>
                  {isSignedIn && (
                    <Button variant="outline" size="sm" onClick={toggleAdmin} className="w-full">
                      {isAdmin ? "User Mode (Demo)" : "Admin Mode (Demo)"}
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

