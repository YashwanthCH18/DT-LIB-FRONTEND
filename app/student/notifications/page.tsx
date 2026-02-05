"use client"

import { useEffect, useState, useCallback } from "react"
import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, AlertTriangle, BookOpen, Megaphone, Bell, CheckCircle2, Search, Filter } from "lucide-react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Auto-mark notifications as read when page is viewed
  const markAllVisibleAsRead = useCallback(async (notifs: any[]) => {
    const unreadIds = notifs.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    // Mark each as read and update local state immediately
    for (const id of unreadIds) {
      try {
        await api.markNotificationRead(id)
        // Update local state to show as read
        setNotifications(prev => prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        ))
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.getStudentNotifications()
      if (response.notifications) {
        const mapped = response.notifications.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          is_read: n.is_read,
          timestamp: new Date(n.created_at).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
          }),
          sender: "Library Admin",
          icon: getIconForType(n.type),
          color: getColorForType(n.type)
        }))
        setNotifications(mapped)
        setFilteredNotifications(mapped)

        // Auto-mark as read after 1.5 seconds of viewing
        setTimeout(() => {
          markAllVisibleAsRead(mapped)
        }, 1500)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(n => n.type === typeFilter)
    }

    // Status filter
    if (statusFilter === "unread") {
      filtered = filtered.filter(n => !n.is_read)
    } else if (statusFilter === "read") {
      filtered = filtered.filter(n => n.is_read)
    }

    setFilteredNotifications(filtered)
  }, [searchQuery, typeFilter, statusFilter, notifications])

  const getIconForType = (type: string) => {
    switch (type) {
      case "overdue": return AlertTriangle
      case "due_soon": return Clock
      case "available": return BookOpen
      case "announcement": return Megaphone
      default: return Bell
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case "overdue": return "text-destructive"
      case "due_soon": return "text-amber-500"
      case "available": return "text-emerald-500"
      case "announcement": return "text-blue-500"
      default: return "text-primary"
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Notifications</h1>
              <p className="text-muted-foreground mt-1">Stay updated with your library activity</p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {unreadCount} Unread
              </Badge>
            )}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="announcement">Announcements</SelectItem>
                      <SelectItem value="due_soon">Due Soon</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-white/10 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>Announcements and reminders</CardDescription>
                  </div>
                  {filteredNotifications.length > 0 && <Badge variant="outline" className="bg-primary/10 text-primary">{filteredNotifications.length} Total</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 ${notification.is_read ? "bg-card/30 border-white/5 opacity-80 hover:opacity-100" : "bg-gradient-to-r from-primary/5 to-transparent border-primary/20 shadow-sm"}`}
                        >
                          <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center bg-secondary/50 border border-white/10 ${notification.color}`}>
                            <notification.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className={`font-semibold text-base leading-none ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>{notification.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">From: {notification.sender}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {!notification.is_read && <Badge className="bg-primary h-5 px-1.5 text-[10px]">NEW</Badge>}
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notification.timestamp}</span>
                              </div>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{notification.message}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3"
                      >
                        <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 opacity-20" />
                        </div>
                        <p>No notifications matching your filters.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
