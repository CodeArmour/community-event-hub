"use client";

import {
  Menu,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: "Home", href: "/" },
  { name: "My Events", href: "/my-events" },
];

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
  },
  { name: "Manage Events", href: "/admin/events" },
];

interface User {
  name?: string;
  email?: string;
  role?: "ADMIN" | "USER";
}

export default function Navbar({ user }: { user: User }) {
  const session = useSession();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const isSignedIn = !!user;
  const isAdmin = user?.role === "ADMIN";
  const profilePath = isAdmin ? "/admin/profile" : "/profile";

  // Handle sign out using Auth.js v5
  const handleSignOut = async () => {
    try {
      // Add a callbackUrl to specify where to redirect after signout
      await signOut({
        redirect: true, // Prevent automatic redirect
        callbackUrl: "/", // or any path you want to redirect to
      });
      // Note: No need for router.refresh() if using redirect: true
    } catch (error) {
      console.error("Logout failed:", error);
      // Consider adding fallback behavior here
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center text-xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EventHub
            </span>
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
                      !isSignedIn && item.href !== "/" ? "opacity-50" : ""
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {isAdmin &&
                adminNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "nav-link flex items-center",
                        pathname === item.href ? "nav-link-active" : ""
                      )}
                    >
                      {item.icon && item.icon}
                      {item.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
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
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User authentication */}
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name ? (
                        user.name[0].toUpperCase()
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user.name || user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={profilePath}
                    className="flex w-full cursor-pointer items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {/* Only show Settings for admin users */}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/settings"
                      className="flex w-full cursor-pointer items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-sm font-medium">Admin</div>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="flex w-full cursor-pointer items-center"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full md:hidden"
              >
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
                      pathname === item.href
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground/60",
                      !isSignedIn && item.href !== "/" ? "opacity-50" : ""
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
                        "rounded-lg px-3 py-2 transition-colors hover:bg-muted flex items-center",
                        pathname === item.href
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground/60"
                      )}
                    >
                      {item.icon && item.icon}
                      {item.name}
                    </Link>
                  ))}

                {!isSignedIn ? (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild className="w-full">
                      <Link href="/auth/signup">Register</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <Link
                      href={profilePath}
                      className="flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    {/* Only show Settings for admin users in mobile menu */}
                    {isAdmin && (
                      <Link
                        href="/admin/settings"
                        className="flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      Log Out
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
