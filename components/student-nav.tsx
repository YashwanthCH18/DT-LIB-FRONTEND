"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BookOpen, User, Bell, Menu, LayoutDashboard, Search, Book, FileBox, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function StudentNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.getStudentNotifications()
        if (response.unread_count !== undefined) {
          setUnreadCount(response.unread_count)
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error)
      }
    }
    fetchUnreadCount()
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/books", label: "My Books", icon: Book },
    { href: "/student/search", label: "Search Books", icon: Search },
    { href: "/student/resources", label: "Resources", icon: FileBox },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass border-b border-white/10 dark:border-white/5">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] glass border-r border-white/10">
                <SheetHeader className="mb-6 text-left px-1">
                  <SheetTitle className="flex items-center gap-3">
                    <img src="/logo.jpeg" alt="SMART LIB" className="h-8 w-auto rounded" />
                    <span className="font-bold text-xl">SMART LIB</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href}>
                        <span className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}>
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                  <Link href="/student/notifications">
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all font-medium group">
                      <Bell className="h-5 w-5 group-hover:text-primary transition-colors" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full flex items-center justify-center text-[10px] p-0">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/student/dashboard" className="flex items-center gap-2 group">
              <img src="/logo.jpeg" alt="SMART LIB" className="h-10 w-auto rounded" />
              <span className="font-bold text-xl tracking-tight">SMART LIB</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-full border border-white/10">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive ? "bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-muted-foreground hover:text-foreground hover:bg-white/10"}`}>
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/student/notifications" className="hidden md:flex">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 rounded-full w-10 h-10 transition-all">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full p-0 flex items-center justify-center text-[8px] border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all p-0 overflow-hidden">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "ST"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass border-white/10 p-2">
                <div className="flex items-center justify-start gap-3 p-2 bg-secondary/30 rounded-lg mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-semibold text-sm">{user?.name || "Student"}</p>
                    <p className="text-[10px] text-muted-foreground truncate w-[140px]">{user?.email}</p>
                  </div>
                </div>

                <DropdownMenuItem className="cursor-pointer rounded-md py-2" onClick={() => setIsProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md py-2" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <ProfileEditDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  )
}
